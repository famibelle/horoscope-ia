import { readFileSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { detectEditionWithNight, todayGuadeloupe } from '@/lib/edition';
import type { Edition } from '@/lib/private/maryse-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';

type Preview = { signId: string; name: string; emoji: string; ouverture: string };

/* ── Source 1 : fichier statique (sync, le plus rapide) ─────────────────── */

function fromStaticFile(date: string, edition: Edition): Preview[] | null {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'horoscopes', `${date}.json`);
    const all = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, HoroscopeResponse>;
    const results = signs.map((sign) => {
      const entry = all[`${date}|${sign.id}|${edition}`] ?? all[`${date}|${sign.id}|matin`];
      if (!entry?.ouverture) return null;
      return { signId: sign.id, name: sign.name, emoji: sign.emoji, ouverture: entry.teaser || entry.ouverture };
    }).filter(Boolean) as Preview[];
    return results.length === 12 ? results : null;
  } catch {
    return null;
  }
}

/* ── Source 2 : Supabase (une seule requête pour les 12 signes) ──────────── */

async function fromSupabase(date: string, edition: Edition): Promise<Preview[] | null> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: rows } = await supabase
      .from('horoscopes')
      .select('sign_id,ouverture,teaser')
      .eq('date', date)
      .eq('edition', edition);
    if (!rows || rows.length < 12) return null;
    const results = signs.map((sign) => {
      const row = rows.find((r) => r.sign_id === sign.id);
      if (!row?.ouverture) return null;
      return { signId: sign.id, name: sign.name, emoji: sign.emoji, ouverture: row.teaser || row.ouverture };
    }).filter(Boolean) as Preview[];
    return results.length === 12 ? results : null;
  } catch {
    return null;
  }
}

/* ── Source 3 : Netlify Blobs (12 requêtes parallèles, fallback) ─────────── */

async function fromBlobs(date: string, edition: Edition): Promise<Preview[] | null> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('horoscopes');
    const results = (await Promise.all(
      signs.map(async (sign) => {
        const cached = await store.get(`${date}|${sign.id}|${edition}`, { type: 'json' }) as HoroscopeResponse | null;
        if (!cached?.ouverture) return null;
        return { signId: sign.id, name: sign.name, emoji: sign.emoji, ouverture: cached.teaser || cached.ouverture };
      }),
    )).filter(Boolean) as Preview[];
    return results.length > 0 ? results : null;
  } catch {
    return null;
  }
}

/* ── Route ───────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const editionParam = req.nextUrl.searchParams.get('edition') as Edition | null;
  const edition: Edition = (['matin', 'midi', 'soir', 'nuit'] as const).includes(editionParam as Edition)
    ? editionParam as Edition
    : detectEditionWithNight();
  const today = todayGuadeloupe();

  const previews =
    fromStaticFile(today, edition) ??
    (await fromSupabase(today, edition)) ??
    (await fromBlobs(today, edition)) ??
    [];

  return NextResponse.json(previews, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
  });
}
