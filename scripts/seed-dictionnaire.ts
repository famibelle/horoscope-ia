/**
 * Peuple la table `dictionnaire` depuis faune-data.ts et flore-data.ts.
 * À lancer une seule fois après création de la table SQL.
 *
 *   npx tsx scripts/seed-dictionnaire.ts
 */

import { fauneData } from '@/lib/private/faune-data';
import { floreData } from '@/lib/private/flore-data';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_KEY requis');
  process.exit(1);
}

async function upsert(rows: object[]): Promise<void> {
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
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
}

async function main() {
  console.log('🌿 Seed du dictionnaire faune/flore\n');

  const fauneRows = fauneData.map(e => ({
    id: e.id,
    type: 'faune',
    nom_creole: e.nomCreole,
    nom_francais: e.nomFrancais ?? null,
    nom_scientifique: e.nomScientifique ?? null,
    categorie: e.categorie ?? null,
    dimension_culturelle: e.dimensionCulturelle ?? null,
    sacre_symbolique: e.sacreSymbolique ?? null,
    is_resistance_symbol: e.isResistanceSymbol ?? false,
    tags: e.tags ?? [],
    usage_count: 0,
    first_cited: null,
    last_cited: null,
    signes: [],
  }));

  const floreRows = floreData.map(e => ({
    id: e.id,
    type: 'flore',
    nom_creole: e.nomCreole,
    nom_francais: e.nomFrancais ?? null,
    nom_scientifique: e.nomScientifique ?? null,
    categorie: e.categorie ?? null,
    dimension_culturelle: e.dimensionCulturelle ?? null,
    sacre_symbolique: e.sacreSymbolique ?? null,
    is_resistance_symbol: e.isResistanceSymbol ?? false,
    tags: e.tags ?? [],
    usage_count: 0,
    first_cited: null,
    last_cited: null,
    signes: [],
  }));

  console.log(`   Faune : ${fauneRows.length} entrées`);
  console.log(`   Flore : ${floreRows.length} entrées`);

  // Upsert en 2 batches (séparé pour faciliter le debug)
  await upsert(fauneRows);
  console.log(`✅ ${fauneRows.length} entrées faune insérées/mises à jour`);

  await upsert(floreRows);
  console.log(`✅ ${floreRows.length} entrées flore insérées/mises à jour`);

  console.log(`\n✨ Dictionnaire seedé : ${fauneRows.length + floreRows.length} entrées au total`);
}

main().catch(e => { console.error(e); process.exit(1); });
