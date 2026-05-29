import fs from 'fs';
import path from 'path';
import { upsertRest } from '@/lib/supabase-rest';

async function main() {
  const filePath = path.join(process.cwd(), 'lib', 'private', 'glossaire.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const glossary: Record<string, any> = JSON.parse(raw);

  const rows = Object.entries(glossary).map(([terme, v]) => ({
    terme,
    definition: v.definition ?? null,
    category: v.category ?? 'à_classer',
    first_seen: v.firstSeen ?? null,
    count: v.count ?? 0,
    sources: v.sources ?? [],
    synonyms: v.synonyms ?? null,
    vaudou: v.vaudou ?? false,
  }));

  console.log(`Migration de ${rows.length} termes...`);
  await upsertRest('glossaire', rows, 'terme');
  console.log('✅ Glossaire migré dans Supabase.');
}

main().catch(err => { console.error(err); process.exit(1); });
