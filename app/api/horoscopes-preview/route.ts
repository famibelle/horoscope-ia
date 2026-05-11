import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { detectEdition, todayGuadeloupe } from '@/lib/edition';
import type { Edition } from '@/lib/private/maryse-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';

async function getCached(key: string): Promise<HoroscopeResponse | null> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('horoscopes');
    return await store.get(key, { type: 'json' });
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const editionParam = req.nextUrl.searchParams.get('edition') as Edition | null;
  const edition: Edition =
    editionParam === 'matin' || editionParam === 'midi' || editionParam === 'soir'
      ? editionParam
      : detectEdition();

  const today = todayGuadeloupe();

  const results = await Promise.all(
    signs.map(async (sign) => {
      const cached = await getCached(`${today}|${sign.id}|${edition}`);
      if (!cached?.ouverture) return null;
      return {
        signId: sign.id,
        name: sign.name,
        emoji: sign.emoji,
        ouverture: cached.teaser || cached.ouverture,
      };
    }),
  );

  const previews = results.filter(Boolean);

  return NextResponse.json(previews, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
  });
}
