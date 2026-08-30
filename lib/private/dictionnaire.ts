/**
 * Dictionnaire faune/flore vivant — Système de suivi d'usage
 *
 * Stratégie Supabase : cache mémoire par run (même pattern que glossaire.ts).
 *   1. initDictionnaireCache()    — charge tout en une requête au début du run
 *   2. recordUsage()              — incrémente les compteurs en mémoire
 *   3. flushDictionnaireToSupabase() — envoie tous les changements à la fin
 *   4. getDictionnaire()          — expose le cache pour l'API route
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export interface DictEntry {
  id: string;
  type: 'faune' | 'flore';
  nomCreole: string;
  nomFrancais?: string;
  nomScientifique?: string;
  categorie?: string;
  dimensionCulturelle?: string;
  sacreSymbolique?: string;
  isResistanceSymbol?: boolean;
  tags?: string[];
  usageCount: number;
  firstCited?: string;
  lastCited?: string;
  signes: string[];
}

// Cache indexé par id, plus une map nomCreole → id pour le lookup rapide
let _cache: Record<string, DictEntry> = {};
let _creoleIndex: Map<string, string> = new Map(); // nomCreole (lower) → id
let _dirty = false;

function buildCreoleIndex(): void {
  _creoleIndex = new Map();
  for (const entry of Object.values(_cache)) {
    // Un nomCreole peut être "Fwou-fwou / Kolibri" — on indexe chaque segment
    for (const segment of entry.nomCreole.split('/').map(s => s.trim().toLowerCase())) {
      if (segment) _creoleIndex.set(segment, entry.id);
    }
    _creoleIndex.set(entry.nomCreole.toLowerCase(), entry.id);
  }
}

/**
 * À appeler une fois au début du script de génération.
 * Charge toutes les entrées depuis Supabase dans le cache mémoire.
 */
export async function initDictionnaireCache(): Promise<void> {
  let rows: any[];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/dictionnaire?select=*`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    });
    if (!res.ok) {
      console.warn('[DICTIONNAIRE] Impossible de charger depuis Supabase, cache vide.');
      return;
    }
    rows = await res.json();
  } catch (err) {
    // Enrichissement optionnel : une panne réseau/DNS Supabase ne doit pas
    // interrompre la génération avant le moindre appel Mistral.
    console.warn('[DICTIONNAIRE] ⚠️ Supabase injoignable — cache vide, la génération continue :',
      err instanceof Error ? err.message : err);
    return;
  }
  _cache = {};
  for (const row of rows) {
    _cache[row.id] = {
      id: row.id,
      type: row.type,
      nomCreole: row.nom_creole,
      nomFrancais: row.nom_francais ?? undefined,
      nomScientifique: row.nom_scientifique ?? undefined,
      categorie: row.categorie ?? undefined,
      dimensionCulturelle: row.dimension_culturelle ?? undefined,
      sacreSymbolique: row.sacre_symbolique ?? undefined,
      isResistanceSymbol: row.is_resistance_symbol ?? false,
      tags: row.tags ?? [],
      usageCount: row.usage_count ?? 0,
      firstCited: row.first_cited ?? undefined,
      lastCited: row.last_cited ?? undefined,
      signes: row.signes ?? [],
    };
  }
  buildCreoleIndex();
  console.log(`[DICTIONNAIRE] 📖 ${rows.length} entrées chargées depuis Supabase`);
}

/**
 * Enregistre l'usage d'une liste de noms créoles (faune_enrichies + flore_enrichies)
 * pour un signe donné à une date donnée. Mutation en mémoire uniquement.
 */
export function recordUsage(nomCreoles: string[], signId: string, date: string): void {
  for (const raw of nomCreoles) {
    const key = raw.toLowerCase();
    const id = _creoleIndex.get(key)
      // Fallback : cherche un segment si le nom complet n'est pas trouvé
      ?? _creoleIndex.get(raw.split('/')[0].trim().toLowerCase());
    if (!id || !_cache[id]) continue;

    const entry = _cache[id];
    entry.usageCount += 1;
    entry.lastCited = date;
    if (!entry.firstCited) entry.firstCited = date;
    if (!entry.signes.includes(signId)) entry.signes.push(signId);
    _dirty = true;
  }
}

/**
 * Envoie tous les changements du cache vers Supabase (batch upsert).
 * À appeler une fois à la fin du script de génération.
 */
export async function flushDictionnaireToSupabase(): Promise<void> {
  if (!_dirty) return;
  const dirty = Object.values(_cache).filter(e => e.usageCount > 0 || e.firstCited);
  if (dirty.length === 0) return;

  const rows = dirty.map(e => ({
    id: e.id,
    type: e.type,
    nom_creole: e.nomCreole,
    nom_francais: e.nomFrancais ?? null,
    nom_scientifique: e.nomScientifique ?? null,
    categorie: e.categorie ?? null,
    dimension_culturelle: e.dimensionCulturelle ?? null,
    sacre_symbolique: e.sacreSymbolique ?? null,
    is_resistance_symbol: e.isResistanceSymbol ?? false,
    tags: e.tags ?? [],
    usage_count: e.usageCount,
    first_cited: e.firstCited ?? null,
    last_cited: e.lastCited ?? null,
    signes: e.signes,
    updated_at: new Date().toISOString(),
  }));

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/dictionnaire?on_conflict=id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[DICTIONNAIRE] ❌ Erreur flush Supabase: ${res.status} ${text}`);
    } else {
      console.log(`[DICTIONNAIRE] ✅ ${rows.length} entrées mises à jour dans Supabase`);
      _dirty = false;
    }
  } catch (err) {
    // Appelé en fin de run : perdre les compteurs d'usage ne doit pas
    // invalider des horoscopes déjà générés et sauvegardés.
    console.error('[DICTIONNAIRE] ❌ Flush Supabase impossible, compteurs perdus :',
      err instanceof Error ? err.message : err);
  }
}

/**
 * Expose le cache pour l'API route (lecture seule).
 * Retourne une map nomCreole → { definition courte, nomFrancais, type, sacreSymbolique }
 * pour alimenter les tooltips hover du frontend.
 */
export function getDictionnaire(): Record<string, {
  definition: string;
  nomFrancais?: string;
  nomScientifique?: string;
  type: 'faune' | 'flore';
  sacreSymbolique?: string;
}> {
  const result: Record<string, { definition: string; nomFrancais?: string; nomScientifique?: string; type: 'faune' | 'flore'; sacreSymbolique?: string }> = {};
  for (const entry of Object.values(_cache)) {
    // Première phrase de dimension_culturelle seulement (tooltip concis)
    const definition = entry.dimensionCulturelle
      ? entry.dimensionCulturelle.split(/[.!?]/)[0].trim() + '.'
      : '';
    result[entry.nomCreole] = {
      definition,
      nomFrancais: entry.nomFrancais,
      nomScientifique: entry.nomScientifique,
      type: entry.type,
      sacreSymbolique: entry.sacreSymbolique,
    };
    // Indexe aussi chaque segment du nomCreole (ex. "Fwou-fwou" et "Kolibri" séparément)
    for (const segment of entry.nomCreole.split('/').map(s => s.trim())) {
      if (segment && segment !== entry.nomCreole) {
        result[segment] = result[entry.nomCreole];
      }
    }
  }
  return result;
}
