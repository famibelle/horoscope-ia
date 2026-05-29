import { createClient } from '@supabase/supabase-js';

async function main() {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const { data: h } = await sb.from('horoscopes').select('date,sign_id,edition').eq('date','2026-05-29').order('sign_id');
  console.log('horoscopes 2026-05-29:', h?.length ?? 0, 'lignes');
  console.log(h?.map(r => `${r.sign_id}/${r.edition}`).join(', ') || 'aucune');

  const { data: a } = await sb.from('ambiances').select('date,sign_id,edition').eq('date','2026-05-29').order('sign_id');
  console.log('ambiances  2026-05-29:', a?.length ?? 0, 'lignes');
  console.log(a?.map(r => `${r.sign_id}/${r.edition}`).join(', ') || 'aucune');
}
main();
