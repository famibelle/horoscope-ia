import { config } from 'dotenv';
config();

/**
 * Purge des MP3 du bucket Supabase Storage `tts-audio`.
 *
 * Contexte : la pré-génération TTS écrivait 48 MP3/jour (12 signes × 4 éditions)
 * sans aucune rétention — le bucket a fini par dépasser le quota du plan gratuit
 * (`exceed_storage_size_quota`), ce qui a coupé tout le projet Supabase.
 *
 * Arborescence du bucket : {YYYY-MM-DD}/{sign_id}/{edition}.mp3
 * On supprime tout objet dont `created_at` dépasse la rétention (48 h par défaut).
 *
 * Usage :
 *   npx tsx scripts/purge-tts-storage.ts [--dry-run] [--retention-hours=48] [--verbose]
 *
 * Exit 0 : purge effectuée (ou rien à purger).
 * Exit 1 : Supabase injoignable / refus d'accès — échec visible, pas de purge silencieuse.
 */

const BUCKET = 'tts-audio';
const LIST_LIMIT = 1000;
const DELETE_CHUNK = 100;

const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose'),
  retentionHours: Number(args.find(a => a.startsWith('--retention-hours='))?.split('=')[1] ?? 48),
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

type StorageEntry = {
  name: string;
  id: string | null;               // null => "dossier" (préfixe), pas un objet
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: { size?: number } | null;
};

type FileEntry = { path: string; size: number; createdAt: Date };

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY! };
}

/** Liste un niveau du bucket (pagination incluse). */
async function listLevel(prefix: string): Promise<StorageEntry[]> {
  const entries: StorageEntry[] = [];
  let offset = 0;

  for (;;) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prefix,
        limit: LIST_LIMIT,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Storage list "${prefix}" ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }

    const page: StorageEntry[] = await res.json();
    entries.push(...page);
    if (page.length < LIST_LIMIT) return entries;
    offset += page.length;
  }
}

/** Parcourt récursivement le bucket et retourne tous les objets réels. */
async function walk(prefix = ''): Promise<FileEntry[]> {
  const files: FileEntry[] = [];

  for (const entry of await listLevel(prefix)) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;

    // id === null => préfixe (dossier), on descend d'un niveau
    if (entry.id === null) {
      files.push(...await walk(path));
      continue;
    }

    const stamp = entry.created_at ?? entry.updated_at;
    if (!stamp) {
      console.warn(`⚠️  ${path} — sans horodatage, conservé par précaution`);
      continue;
    }

    files.push({ path, size: entry.metadata?.size ?? 0, createdAt: new Date(stamp) });
  }

  return files;
}

/** Suppression en masse : DELETE /object/{bucket} avec la liste des chemins complets. */
async function deleteFiles(paths: string[]): Promise<void> {
  for (let i = 0; i < paths.length; i += DELETE_CHUNK) {
    const chunk = paths.slice(i, i + DELETE_CHUNK);
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: chunk }),
    });

    if (!res.ok) {
      throw new Error(`Storage delete ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    console.log(`   🗑️  ${Math.min(i + DELETE_CHUNK, paths.length)}/${paths.length} supprimés`);
  }
}

function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_KEY manquants.');
    process.exit(1);
  }
  if (!Number.isFinite(options.retentionHours) || options.retentionHours <= 0) {
    console.error(`❌ --retention-hours invalide : ${options.retentionHours}`);
    process.exit(1);
  }

  const cutoff = new Date(Date.now() - options.retentionHours * 3600_000);
  console.log(`🧹 Purge ${BUCKET} — rétention ${options.retentionHours} h`);
  console.log(`   Seuil : tout objet antérieur à ${cutoff.toISOString()}`);
  if (options.dryRun) console.log('   Mode simulation (--dry-run) : aucune suppression.');

  const files = await walk();
  const stale = files.filter(f => f.createdAt < cutoff);
  const keptBytes = files.reduce((n, f) => n + f.size, 0) - stale.reduce((n, f) => n + f.size, 0);
  const freedBytes = stale.reduce((n, f) => n + f.size, 0);

  console.log(`\n📊 ${files.length} objets — ${stale.length} à purger (${formatMB(freedBytes)})`);
  console.log(`   Conservés : ${files.length - stale.length} objets (${formatMB(keptBytes)})`);

  if (options.verbose) {
    for (const f of stale) console.log(`   - ${f.path} (${f.createdAt.toISOString()})`);
  }

  if (stale.length === 0) {
    console.log('✅ Rien à purger.');
    return;
  }

  if (options.dryRun) {
    console.log('✅ Simulation terminée — relancer sans --dry-run pour supprimer.');
    return;
  }

  await deleteFiles(stale.map(f => f.path));
  console.log(`\n✅ Purge terminée — ${stale.length} MP3 supprimés, ${formatMB(freedBytes)} libérés.`);
}

main().catch(err => {
  console.error('❌ Purge TTS échouée :', err instanceof Error ? err.message : err);
  process.exit(1);
});
