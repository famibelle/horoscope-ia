/**
 * Stockage des newsletters dans Supabase (table `newsletters`)
 * Remplace le stockage filesystem (éphémère en CI et sur Netlify)
 * Interface identique — aucun changement requis dans les appelants.
 *
 * Prérequis : exécuter supabase/newsletters.sql dans l'éditeur Supabase.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredNewsletter {
  id: string;
  date: string;
  subject: string;
  preview: string;
  htmlContent: string;
  text: string;
  sign?: string;
  subscriberEmail?: string;
}

// ── Helpers REST ──────────────────────────────────────────────────────────────

function getCredentials(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function headers(key: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

// Mappe une ligne Supabase → StoredNewsletter
function rowToNewsletter(row: Record<string, any>): StoredNewsletter {
  return {
    id:              row.id,
    date:            row.date,
    subject:         row.subject,
    preview:         row.preview ?? '',
    htmlContent:     row.html_content,
    text:            row.text_content ?? '',
    sign:            row.sign ?? undefined,
    subscriberEmail: row.subscriber_email ?? undefined,
  };
}

// Mappe StoredNewsletter → ligne Supabase
function newsletterToRow(n: Omit<StoredNewsletter, 'id' | 'date'> & { id: string; date: string }) {
  return {
    id:               n.id,
    date:             n.date,
    subject:          n.subject,
    preview:          n.preview,
    html_content:     n.htmlContent,
    text_content:     n.text,
    sign:             n.sign ?? null,
    subscriber_email: n.subscriberEmail ?? null,
  };
}

function generateId(): string {
  return `newsletter-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ── API publique ──────────────────────────────────────────────────────────────

export async function saveNewsletter(
  newsletter: Omit<StoredNewsletter, 'id' | 'date'>,
): Promise<StoredNewsletter> {
  const stored: StoredNewsletter = {
    ...newsletter,
    id:   generateId(),
    date: new Date().toISOString(),
  };

  const creds = getCredentials();
  if (!creds) {
    console.warn('⚠️  Supabase non configuré — newsletter non persistée');
    return stored;
  }

  const row = newsletterToRow(stored);
  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?on_conflict=id`,
    {
      method: 'POST',
      headers: { ...headers(creds.key), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase saveNewsletter ${res.status}: ${text}`);
  }

  return stored;
}

export async function getNewsletter(id: string): Promise<StoredNewsletter | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: headers(creds.key) },
  );

  if (!res.ok) return null;
  const rows: Record<string, any>[] = await res.json();
  return rows[0] ? rowToNewsletter(rows[0]) : null;
}

export async function getAllNewsletters(): Promise<StoredNewsletter[]> {
  const creds = getCredentials();
  if (!creds) return [];

  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?order=date.desc&limit=50`,
    { headers: headers(creds.key) },
  );

  if (!res.ok) return [];
  const rows: Record<string, any>[] = await res.json();
  return rows.map(rowToNewsletter);
}

export async function getTodaysNewsletter(): Promise<StoredNewsletter | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?date=gte.${today.toISOString()}&date=lt.${tomorrow.toISOString()}&order=date.desc&limit=1`,
    { headers: headers(creds.key) },
  );

  if (!res.ok) return null;
  const rows: Record<string, any>[] = await res.json();
  return rows[0] ? rowToNewsletter(rows[0]) : null;
}

export async function updateNewsletter(
  id: string,
  updates: Partial<StoredNewsletter>,
): Promise<StoredNewsletter | null> {
  const existing = await getNewsletter(id);
  if (!existing) return null;

  const creds = getCredentials();
  if (!creds) return null;

  const merged = { ...existing, ...updates };
  const row = newsletterToRow(merged);

  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { ...headers(creds.key), Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    },
  );

  if (!res.ok) return null;
  return merged;
}

export async function deleteNewsletter(id: string): Promise<boolean> {
  const creds = getCredentials();
  if (!creds) return false;

  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: headers(creds.key) },
  );

  return res.ok;
}

export async function getNewslettersByDate(date: Date): Promise<StoredNewsletter[]> {
  const creds = getCredentials();
  if (!creds) return [];

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?date=gte.${start.toISOString()}&date=lt.${end.toISOString()}&order=date.desc`,
    { headers: headers(creds.key) },
  );

  if (!res.ok) return [];
  const rows: Record<string, any>[] = await res.json();
  return rows.map(rowToNewsletter);
}

export async function countNewsletters(): Promise<number> {
  const creds = getCredentials();
  if (!creds) return 0;

  const res = await fetch(
    `${creds.url}/rest/v1/newsletters?select=id`,
    { headers: { ...headers(creds.key), Prefer: 'count=exact', Range: '0-0' } },
  );

  const contentRange = res.headers.get('content-range');
  if (!contentRange) return 0;
  const total = contentRange.split('/')[1];
  return total ? parseInt(total, 10) : 0;
}

export async function clearAllNewsletters(): Promise<void> {
  const creds = getCredentials();
  if (!creds) return;

  await fetch(
    `${creds.url}/rest/v1/newsletters?id=neq.''`,
    { method: 'DELETE', headers: headers(creds.key) },
  );
}
