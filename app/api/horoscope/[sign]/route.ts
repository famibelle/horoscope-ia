import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { MARYSE_SYSTEM, buildHoroscopeUserPrompt } from '@/lib/private/maryse-prompt';
import {
  getMedicinalPlant,
  getResistancePratique,
  getResistanceObjet,
  getSignFaune,
  getSignFlore,
  getSignLieu,
  getHistoricalResonance,
} from '@/lib/cultural-context';
import { detectEdition, detectEditionWithNight, todayGuadeloupe } from '@/lib/edition';
import type { Edition } from '@/lib/private/maryse-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';

const HOROSCOPE_API = 'https://freehoroscopeapi.com/api/v1/get-horoscope/daily';
const MISTRAL_URL   = 'https://api.mistral.ai/v1/chat/completions';

const SIGN_EN: Record<string, string> = {
  belier: 'aries', taureau: 'taurus', gemeaux: 'gemini',
  cancer: 'cancer', lion: 'leo', vierge: 'virgo',
  balance: 'libra', scorpion: 'scorpio', sagittaire: 'sagittarius',
  capricorne: 'capricorn', verseau: 'aquarius', poissons: 'pisces',
};

/* ── Retry helper with exponential backoff ──────────────────────────────────── */

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 4,
  initialDelay: number = 4000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`⏳ Mistral tentative ${attempt + 1}/${maxRetries + 1} échouée, retry dans ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error('All retry attempts failed');
}

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
    next: { revalidate: 28800 },
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
      { next: { revalidate: 28800 } },
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
  date?: string,
  hour?: string,
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
          sign, rawText, weather, edition, date, hour,
        ) },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  try { return JSON.parse(content); } catch { return null; }
}

/* ── Local file helpers ──────────────────────────────────────────────────── */

async function getFromLocalFile(date: string, signId: string, edition: Edition): Promise<HoroscopeResponse | null> {
  try {
    // Essayer fs d'abord (pour local)
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Chemin absolu vers le fichier dans public/
    const filePath = path.join(process.cwd(), 'public', 'data', 'horoscopes', `${date}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const allHoroscopes = JSON.parse(content);
    const key = `${date}|${signId}|${edition}`;
    return allHoroscopes[key] || null;
  } catch (fsError) {
    // Si fs échoue (ex: Netlify Edge Functions), essayer via fetch
    try {
      // Chemin relatif - fonctionne pour les fichiers dans public/
      const response = await fetch(`/data/horoscopes/${date}.json`);
      if (!response.ok) return null;
      const allHoroscopes = await response.json();
      const key = `${date}|${signId}|${edition}`;
      return allHoroscopes[key] || null;
    } catch {
      return null;
    }
  }
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
  const userDate = req.nextUrl.searchParams.get('userDate');
  const userHour = req.nextUrl.searchParams.get('userHour');
  const edition: Edition =
    editionParam === 'matin' || editionParam === 'midi' || editionParam === 'soir' || editionParam === 'nuit'
      ? editionParam
      : detectEditionWithNight();

  const date = userDate || todayGuadeloupe();
  const blobKey = `${date}|${signId}|${edition}`;

  // 1. Check local file first (fastest)
  const localData = await getFromLocalFile(date, signId, edition);
  if (localData) {
    return NextResponse.json(localData, {
      headers: { 'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' },
    });
  }

  // 2. Check Blobs cache
  const cached = await getCached(blobKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' },
    });
  }

  // === DONNÉES CULTURELLES ENRICHIES (depuis signs-data.ts) ===
  const signData = signs.find(s => s.id === signId)!;

  try {
    const today = todayGuadeloupe();
    const historicalResonance = getHistoricalResonance(today);
    const [rawText, weather] = await Promise.all([fetchRawHoroscope(signEn), fetchWeather()]);

    if (!rawText) {
      return NextResponse.json(
        { error: 'Horoscope indisponible depuis la source externe.' },
        { status: 503 },
      );
    }

    let structured: Record<string, string> | null = null;
    try {
      structured = await retryWithBackoff(
        () => rewriteWithMistral(
          signId, rawText, weather, edition,
          undefined, undefined, undefined,
          undefined, undefined, undefined,
          historicalResonance ?? undefined,
          userDate ?? undefined,
          userHour ?? undefined,
        ),
        4,
        4000,
      );
    } catch (retryErr) {
      console.error('❌ Toutes les tentatives Mistral ont échoué:', retryErr);
      structured = null; // Forcer le fallback
    }

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
        // === NOUVELLES DONNÉES CULTURELLES ===
        culturalData: {
          faune: signData.faune,
          flore: signData.flore,
          lieuDetails: signData.lieuDetails,
          element: signData.element,
          spirituel: signData.spirituel,
          animal: signData.animal,
          nomKreyol: signData.nomKreyol,
          plante: signData.plante,
          arbre: signData.arbre,
          lieu: signData.lieu,
          rawHoroscope: rawText,
        },
      };
      await setCached(blobKey, response);
      return NextResponse.json(response, {
        headers: { 'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' },
      });
    }

    // === Fallback en FRANÇAIS si Mistral échoue après toutes les tentatives ===
    console.error('❌ Toutes les tentatives Mistral ont échoué pour', signId, edition);
    
    const fallbackFr: HoroscopeResponse = {
      ouverture: `⚠️ Les esprits de Karukera sont temporairement voilés pour ${sign.name}...`,
      amour: 'Prenez ce temps pour écouter votre cœur et vos intuitions.',
      travail: 'Votre sagesse intérieure est votre meilleure conseillère aujourd’hui.',
      argent: 'Une période de réflexion avant toute décision financière.',
      amitie: 'Vos proches comptent sur votre présence, même silencieuse.',
      prediction: 'La clarté reviendra bientôt.',
      sante: '',
      signFr: sign.name,
      weather,
      edition,
      source: 'fallback',
      culturalData: {
        faune: signData.faune,
        flore: signData.flore,
        lieuDetails: signData.lieuDetails,
        element: signData.element,
        spirituel: signData.spirituel,
        animal: signData.animal,
        nomKreyol: signData.nomKreyol,
        plante: signData.plante,
        arbre: signData.arbre,
        lieu: signData.lieu,
        rawHoroscope: rawText,
      },
    };

    // Cache court pour le fallback (5 minutes) - sera régénéré rapidement
    await setCached(blobKey, fallbackFr);
    
    return NextResponse.json(fallbackFr, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    console.error('Horoscope route error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
