import { readFileSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import { signs } from '@/lib/signs-data';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import HoroscopeSignPage from '@/components/HoroscopeSignPage';

function todayGuadeloupe(): string {
  const now = new Date();
  const gp = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  return gp.toISOString().split('T')[0];
}

function currentEditionGuadeloupe(): string {
  const now = new Date();
  const hour = new Date(now.getTime() - 4 * 60 * 60 * 1000).getHours();
  if (hour >= 0 && hour < 6)  return 'nuit';
  if (hour >= 6 && hour < 12) return 'matin';
  if (hour >= 12 && hour < 18) return 'midi';
  return 'soir';
}

async function prefetchFromSupabase(signId: string, date: string, edition: string): Promise<HoroscopeResponse | null> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: row } = await supabase
      .from('horoscopes')
      .select('ouverture,amour,travail,argent,amitie,prediction,conseil,teaser,sign_fr,weather,edition,source')
      .eq('date', date)
      .eq('sign_id', signId)
      .eq('edition', edition)
      .maybeSingle();

    if (!row) return null;

    return {
      ouverture:  row.ouverture,
      amour:      row.amour,
      travail:    row.travail,
      argent:     row.argent   ?? '',
      amitie:     row.amitie   ?? '',
      prediction: row.prediction ?? '',
      conseil:    row.conseil  ?? '',
      teaser:     row.teaser   ?? undefined,
      signFr:     row.sign_fr,
      weather:    row.weather  ?? '',
      edition:    row.edition,
      source:     row.source,
    } as HoroscopeResponse;
  } catch {
    return null;
  }
}

function prefetchFromStaticFile(signId: string, date: string, edition: string): HoroscopeResponse | null {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'horoscopes', `${date}.json`);
    const raw = readFileSync(filePath, 'utf-8');
    const all = JSON.parse(raw) as Record<string, HoroscopeResponse>;
    return all[`${date}|${signId}|${edition}`] ?? all[`${date}|${signId}|matin`] ?? null;
  } catch {
    return null;
  }
}

async function prefetchSignHoroscope(signId: string): Promise<HoroscopeResponse | null> {
  const date    = todayGuadeloupe();
  const edition = currentEditionGuadeloupe();

  // 1. Supabase (source principale)
  const fromSupabase = await prefetchFromSupabase(signId, date, edition);
  if (fromSupabase) return fromSupabase;

  // 2. Fichier statique (fallback si Supabase vide ou indisponible)
  return prefetchFromStaticFile(signId, date, edition);
}

export default async function Page({ params }: { params: Promise<{ sign: string }> }) {
  const { sign: signId } = await params;
  if (!signs.find((s) => s.id === signId)) return notFound();

  const prefetchedHoroscope = await prefetchSignHoroscope(signId);

  return <HoroscopeSignPage signId={signId} prefetchedHoroscope={prefetchedHoroscope} />;
}
