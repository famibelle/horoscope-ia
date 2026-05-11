import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { MARYSE_SYSTEM, buildHoroscopeUserPrompt } from '@/private/maryse-prompt';
import {
  getMedicinalPlant,
  getResistancePratique,
  getResistanceObjet,
  getSignFaune,
  getSignFlore,
  getSignLieu,
  getHistoricalResonance,
} from '@/lib/cultural-context';
import { detectEdition, todayGuadeloupe } from '@/lib/edition';
import type { Edition } from '@/private/maryse-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';

const HOROSCOPE_API = 'https://freehoroscopeapi.com/api/v1/get-horoscope/daily';
const MISTRAL_URL   = 'https://api.mistral.ai/v1/chat/completions';

const SIGN_EN: Record<string, string> = {
  belier: 'aries', taureau: 'taurus', gemeaux: 'gemini',
  cancer: 'cancer', lion: 'leo', vierge: 'virgo',
  balance: 'libra', scorpion: 'scorpio', sagittaire: 'sagittarius',
  capricorne: 'capricorn', verseau: 'aquarius', poissons: 'pisces',
};

/* ── Netlify Blobs helpers ─────────────────────────────────────────────────── */

async function getCached(key: string): Promise<HoroscopeResponse | null> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('horoscopes');
    return await store.get(key, { type: 'json' });
  } catch {
    return null;
  }
}

async function setCached(key: string, data: HoroscopeResponse): Promise<void> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('horoscopes');
    await store.set(key, JSON.stringify(data));
  } catch {
    // silently fail in local dev
  }
}

/* ── External fetches ──────────────────────────────────────────────────────── */

async function fetchRawHoroscope(signEn: string): Promise<string> {
  const res = await fetch(`${HOROSCOPE_API}?sign=${signEn}`, {
    headers: { 'User-Agent': 'HoroscopeKarukera/1.0' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`horoscope API ${res.status}`);
  const data = await res.json();
  return data.horoscope || data?.data?.horoscope || data.description || '';
}

async function fetchWeather(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max' +
        '&timezone=America%2FGuadeloupe&forecast_days=1',
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return '';
    const data = await res.json();
    const d = data.daily;
    if (!d?.time?.length) return '';
    const tmax  = Math.round(d.temperature_2m_max[0]);
    const tmin  = Math.round(d.temperature_2m_min[0]);
    const rain  = d.precipitation_sum[0] as number;
    const wind  = Math.round(d.windspeed_10m_max[0]);
    const rainLabel =
      rain === 0 ? 'pas de pluie'
      : rain < 5  ? 'légère pluie'
      : rain < 20 ? 'pluie modérée'
      : 'fortes pluies';
    const windLabel = wind < 20 ? 'vent faible' : wind < 40 ? 'vent modéré' : 'vent fort';
    return `${tmin}–${tmax}°C, ${rainLabel}, ${windLabel} (${wind} km/h)`;
  } catch {
    return '';
  }
}

async function generateTeaser(
  signName: string,
  structured: Record<string, string>,
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return '';
  const fullText = [
    structured.ouverture, structured.amour, structured.travail,
    structured.argent, structured.amitie, structured.prediction,
  ].filter(Boolean).join(' ');

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.8,
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content: `Tu es Maryse CondAI. Rédige une accroche de 2 phrases maximum à partir de l'horoscope du ${signName}, en voix directe et sensuelle, qui donne envie de lire la suite sans tout révéler. Pas de titre, pas de ponctuation finale superflue.`,
        },
        { role: 'user', content: fullText },
      ],
    }),
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function rewriteWithMistral(
  signId: string,
  rawText: string,
  weather: string,
  edition: Edition,
  medicinal?: { nomCreole: string; nomFr: string; usage: string },
  pratique?: { nomCreole: string; nomFr: string; dimension: string },
  objet?: { nomCreole: string; nomFr: string; dimension: string },
  faune?: { nomCreole: string; nomFr: string; culture: string },
  flore?: { nomCreole: string; nomFr: string; culture: string },
  lieu?: { nomCreole: string; nomFr: string; culture: string },
  historicalResonance?: string,
): Promise<Record<string, string> | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;
  const sign = signs.find((s) => s.id === signId);
  if (!sign) return null;

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.75,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user',   content: buildHoroscopeUserPrompt(
          sign, rawText, weather, edition,
          medicinal, pratique, objet,
          faune, flore, lieu,
          historicalResonance,
        ) },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  try { return JSON.parse(content); } catch { return null; }
}

/* ── Route ─────────────────────────────────────────────────────────────────── */

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sign: string }> },
) {
  const { sign: signId } = await context.params;
  const signEn = SIGN_EN[signId];
  const sign   = signs.find((s) => s.id === signId);

  if (!signEn || !sign) {
    return NextResponse.json({ error: 'Signe inconnu' }, { status: 404 });
  }

  const editionParam = req.nextUrl.searchParams.get('edition') as Edition | null;
  const edition: Edition =
    editionParam === 'matin' || editionParam === 'midi' || editionParam === 'soir'
      ? editionParam
      : detectEdition();

  // Check Blobs cache first
  const blobKey = `${todayGuadeloupe()}|${signId}|${edition}`;
  const cached = await getCached(blobKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    });
  }

  try {
    const today             = todayGuadeloupe();
    const medicinal         = getMedicinalPlant(signId, today);
    const pratique          = getResistancePratique(signId, today);
    const objet             = getResistanceObjet(signId, today);
    const faune             = getSignFaune(signId, today);
    const flore             = getSignFlore(signId, today);
    const lieu              = getSignLieu(signId, today);
    const historicalResonance = getHistoricalResonance(today);
    const [rawText, weather] = await Promise.all([fetchRawHoroscope(signEn), fetchWeather()]);

    if (!rawText) {
      return NextResponse.json(
        { error: 'Horoscope indisponible depuis la source externe.' },
        { status: 503 },
      );
    }

    const structured = await rewriteWithMistral(
      signId, rawText, weather, edition,
      medicinal, pratique, objet,
      faune, flore, lieu,
      historicalResonance ?? undefined,
    );

    if (structured?.ouverture && structured?.amour && structured?.travail) {
      const teaser = await generateTeaser(sign.name, structured as Record<string, string>);
      const response: HoroscopeResponse = {
        ouverture:  structured.ouverture,
        amour:      structured.amour,
        travail:    structured.travail,
        argent:     structured.argent ?? '',
        amitie:     structured.amitie ?? '',
        sante:      structured.sante ?? '',
        prediction: structured.prediction ?? '',
        signFr:     sign.name,
        weather,
        edition,
        teaser:     teaser || undefined,
        source:     'mistral',
      };
      await setCached(blobKey, response);
      return NextResponse.json(response, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
      });
    }

    return NextResponse.json(
      { ouverture: rawText, amour: '', travail: '', argent: '', amitie: '', prediction: '',
        signFr: sign.name, weather, edition, source: 'raw' },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } },
    );
  } catch (err) {
    console.error('Horoscope route error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
