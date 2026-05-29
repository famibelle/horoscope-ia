import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;

// Lecture publique (routes API Netlify — SDK complet avec Realtime)
export const supabase = createClient(
  url,
  (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY)!,
);

/**
 * Upsert via l'API REST PostgREST — sans SDK, sans WebSocket.
 * Utilisé uniquement dans les scripts CI (GitHub Actions / Node.js).
 */
export async function upsertRest(
  table: string,
  rows: object | object[],
  onConflict: string,
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  const body = Array.isArray(rows) ? rows : [rows];

  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?on_conflict=${onConflict}`, {
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
