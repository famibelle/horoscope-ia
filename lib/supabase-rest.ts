/**
 * PostgREST upsert sans SDK — aucun WebSocket, utilisable en CI Node.js.
 */
export async function upsertRest(
  table: string,
  rows: object | object[],
  onConflict: string,
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  const body = Array.isArray(rows) ? rows : [rows];

  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'apikey': key,
      'Prefer': `resolution=merge-duplicates,return=minimal`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert [${table}] ${res.status}: ${text}`);
  }
}
