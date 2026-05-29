/**
 * Migration des JSON locaux vers Supabase
 * Usage: npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

function readJsonFiles(dir: string): Array<{ file: string; data: Record<string, any> }> {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.endsWith('.bak'))
    .map(file => {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        return { file, data: JSON.parse(raw) };
      } catch {
        console.warn(`⚠️  Impossible de parser ${file}, ignoré.`);
        return null;
      }
    })
    .filter(Boolean) as Array<{ file: string; data: Record<string, any> }>;
}

async function migrateHoroscopes() {
  console.log('\n📅 Migration des horoscopes...');
  const dir = path.join(process.cwd(), 'public', 'data', 'horoscopes');
  const files = readJsonFiles(dir);

  let total = 0;
  let errors = 0;

  for (const { file, data } of files) {
    const rows = Object.entries(data).map(([key, v]: [string, any]) => {
      const [date, sign_id, edition] = key.split('|');
      return {
        date, sign_id, edition,
        ouverture: v.ouverture, amour: v.amour, travail: v.travail,
        argent: v.argent, amitie: v.amitie, prediction: v.prediction,
        conseil: v.conseil, teaser: v.teaser,
        sign_fr: v.signFr, weather: v.weather, source: v.source ?? 'json-migration',
      };
    }).filter(r => r.date && r.sign_id && r.edition);

    if (rows.length === 0) continue;

    const { error } = await supabase
      .from('horoscopes')
      .upsert(rows, { onConflict: 'date,sign_id,edition' });

    if (error) {
      console.error(`  ❌ ${file}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ ${file}: ${rows.length} lignes`);
      total += rows.length;
    }
  }

  console.log(`  → Total: ${total} horoscopes insérés, ${errors} erreur(s)`);
}

async function migrateAmbiances() {
  console.log('\n✨ Migration des ambiances...');
  const dir = path.join(process.cwd(), 'public', 'data', 'ambiance');
  const files = readJsonFiles(dir);

  let total = 0;
  let errors = 0;

  for (const { file, data } of files) {
    const rows = Object.entries(data).map(([key, v]: [string, any]) => {
      const [date, sign_id, edition] = key.split('|');
      return {
        date, sign_id, edition,
        ambiance: v.ambiance,
        chiffre_porte_bonheur: v.chiffrePorteBonheur,
        compatibilite: v.compatibilite,
        loa: v.loa,
        famille_vaudou: v.familleVaudou,
        couleurs_sacrees: v.couleursSacrees,
        lune_bienetre: v.lune?.bienetre,
        lune_beaute: v.lune?.beaute,
        lune_esprit: v.lune?.esprit,
        lune_maison: v.lune?.maison,
        lune_jardinage: v.lune?.jardinage,
        scores: v.scores,
      };
    }).filter(r => r.date && r.sign_id && r.edition);

    if (rows.length === 0) continue;

    const { error } = await supabase
      .from('ambiances')
      .upsert(rows, { onConflict: 'date,sign_id,edition' });

    if (error) {
      console.error(`  ❌ ${file}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ ${file}: ${rows.length} lignes`);
      total += rows.length;
    }
  }

  console.log(`  → Total: ${total} ambiances insérées, ${errors} erreur(s)`);
}

async function migratePresages() {
  console.log('\n🔮 Migration des présages du jour...');
  const dir = path.join(process.cwd(), 'public', 'data', 'presage-du-jour');
  const files = readJsonFiles(dir);

  let total = 0;
  let errors = 0;

  for (const { file, data } of files) {
    if (!data.date) {
      console.warn(`  ⚠️  ${file}: pas de champ "date", ignoré.`);
      continue;
    }

    const row = {
      date: data.date,
      type: data.type,
      nom_creole: data.nomCreole,
      nom_commun: data.nomCommun,
      presage_naturel: data.presageNaturel,
      interpretation: typeof data.interpretation === 'string'
        ? (() => { try { return JSON.parse(data.interpretation); } catch { return { texte: data.interpretation }; } })()
        : data.interpretation,
    };

    const { error } = await supabase
      .from('presages')
      .upsert(row, { onConflict: 'date' });

    if (error) {
      console.error(`  ❌ ${file}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ ${file}: présage du ${data.date}`);
      total++;
    }
  }

  console.log(`  → Total: ${total} présages insérés, ${errors} erreur(s)`);
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_KEY requis dans .env.local');
    process.exit(1);
  }

  console.log('🚀 Début de la migration vers Supabase...');
  console.log(`   URL: ${process.env.SUPABASE_URL}`);

  await migrateHoroscopes();
  await migrateAmbiances();
  await migratePresages();

  console.log('\n🎉 Migration terminée !');
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
