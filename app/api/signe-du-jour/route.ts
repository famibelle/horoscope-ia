import { NextRequest, NextResponse } from 'next/server';
import { MARYSE_SYSTEM, buildSigneDuJourUserPrompt } from '@/lib/private/maryse-prompt';
import { detectEdition, todayGuadeloupe, getGuadeloupeHour } from '@/lib/edition';
import type { Edition } from '@/lib/private/maryse-prompt';
import signeData from '@/lib/private/signe-du-jour-data.json';
import { loadSigneDuJourData } from '@/lib/private/horoscope-file-cache';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

/* ── Local file helper with enhanced logging ──────────────────────────────── */

/**
 * Récupère le signe du jour depuis le fichier JSON local via fetch HTTP
 * Utilisé comme fallback si le cache filesystem n'est pas disponible
 */
async function getFromLocalFile(date: string, req: NextRequest): Promise<any | null> {
  try {
    // Construire l'URL avec l'origine du domaine
    const baseUrl = process.env.VERCEL_URL || process.env.NETLIFY_URL || req.nextUrl.origin;
    const url = new URL(`/data/signe-du-jour/${date}.json`, baseUrl);
    
    console.log(`[SIGNE-DU-JOUR FETCH] Attempting: ${url.toString()}`); // LOG DIAGNOSTIC
    
    const response = await fetch(url.toString(), { next: { revalidate: 28800 } });
    
    console.log(`[SIGNE-DU-JOUR FETCH] Response: ${response.status} ${response.statusText}`); // LOG DIAGNOSTIC
    
    if (!response.ok) {
      console.warn(`[SIGNE-DU-JOUR FETCH] Failed: ${response.status}`); // LOG DIAGNOSTIC
      return null;
    }
    
    const data = await response.json();
    console.log(`[SIGNE-DU-JOUR FETCH] Loaded data with ${Object.keys(data).length} keys`); // LOG DIAGNOSTIC
    return data;
  } catch (err) {
    console.error(`[SIGNE-DU-JOUR FETCH] Error:`, err instanceof Error ? err.message : err); // LOG DIAGNOSTIC
    return null;
  }
}

interface SigneEntry {
  nom_creole: string;
  nom_commun: string;
  famille?: string;
  conditions: string[];
  editions: string[];
  savoir: string;
}

interface SigneData {
  flora: SigneEntry[];
  faune: SigneEntry[];
}

function weatherToConditions(weatherSummary: string): string[] {
  const w = weatherSummary.toLowerCase();
  const tags: string[] = [];
  if (w.includes('pluie') || w.includes('rain')) tags.push('pluie');
  if (w.includes('nuageux') || w.includes('couvert')) tags.push('nuageux');
  if (w.includes('vent fort') || w.includes('venteux')) tags.push('vent');
  if (w.includes('orage') || w.includes('thunder')) tags.push('orage');
  if (w.includes('soleil') || w.includes('dégagé') || w.includes('clear')) tags.push('ensoleillé');
  return tags;
}

function pickEntry(
  pool: SigneEntry[],
  weatherTags: string[],
  edition: Edition,
): SigneEntry | null {
  // Fallback pour 'midi' qui n'existe pas dans les données (seulement matin/soir)
  const effectiveEdition = edition === 'midi' ? 'matin' : edition;
  
  const matching = pool.filter((e) => {
    const editionOk = e.editions.length === 0 || e.editions.includes(effectiveEdition);
    const condOk =
      e.conditions.length === 0 ||
      e.conditions.some((c) => weatherTags.includes(c));
    return editionOk && condOk;
  });
  const source = matching.length > 0 ? matching : pool.filter((e) =>
    e.editions.length === 0 || e.editions.includes(effectiveEdition),
  );
  if (source.length === 0) return null;
  return source[Math.floor(Math.random() * source.length)];
}

async function fetchWeatherSummary(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=precipitation_sum,windspeed_10m_max,weathercode' +
        '&timezone=America%2FGuadeloupe&forecast_days=1',
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return '';
    const data = await res.json();
    const d = data.daily;
    if (!d?.time?.length) return '';
    const rain = d.precipitation_sum[0] as number;
    const wind = Math.round(d.windspeed_10m_max[0]);
    const parts: string[] = [];
    if (rain > 10) parts.push('pluie');
    else if (rain > 2) parts.push('légère pluie');
    if (wind > 40) parts.push('vent fort');
    else if (wind > 20) parts.push('vent modéré');
    if (parts.length === 0) parts.push('ensoleillé');
    return parts.join(', ');
  } catch {
    return '';
  }
}

async function generatePhrase(
  type: 'flore' | 'faune',
  entry: SigneEntry,
  weather: string,
  edition: Edition,
): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.8,
      max_tokens: 80,
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        {
          role: 'user',
          content: buildSigneDuJourUserPrompt(
            type,
            entry.nom_commun,
            entry.nom_creole,
            entry.savoir,
            weather,
            edition,
          ),
        },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  return content.trim() || null;
}

export async function GET(req: NextRequest) {
  const edition = detectEdition();
  const today = todayGuadeloupe();
  const typedData = signeData as SigneData;

  // LOG DIAGNOSTIC
  console.log(`[SIGNE-DU-JOUR API] Request: date=${today}, edition=${edition}`);

  // 0. Check in-memory cache first (filesystem based)
  await loadDateCache(today);
  const cachedData = getFromCache(today, 'signe-du-jour', edition);
  if (cachedData) {
    console.log(`[SIGNE-DU-JOUR CACHE HIT] ${today}|signe-du-jour|${edition}`);
    return NextResponse.json(cachedData, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  }

  // 1. Fallback: Check local file via HTTP fetch
  const localData = await getFromLocalFile(today, req);
  if (localData) {
    console.log(`[SIGNE-DU-JOUR FILE HIT] ${today}`);
    return NextResponse.json(localData, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  }

  // LOG DIAGNOSTIC: Si on arrive ici, le fichier n'existe pas
  console.warn(`[SIGNE-DU-JOUR] File not found for ${today}, falling back to dynamic generation`);

  // 2. Fallback: generate dynamically (if file doesn't exist yet)
  const weather = await fetchWeatherSummary();
  const weatherTags = weatherToConditions(weather);

  // Alternate flora/faune daily (odd/even day)
  const todayDate = new Date();
  const useFlora = todayDate.getDate() % 2 === 0;
  const type: 'flore' | 'faune' = useFlora ? 'flore' : 'faune';
  const pool = useFlora ? typedData.flora : typedData.faune;

  const entry = pickEntry(pool, weatherTags, edition);
  if (!entry) {
    return NextResponse.json({ error: 'Aucun signe disponible' }, { status: 404 });
  }

  const phrase = await generatePhrase(type, entry, weather, edition);

  return NextResponse.json(
    {
      type,
      nomCreole: entry.nom_creole,
      nomCommun: entry.nom_commun,
      phrase: phrase ?? `Si tu croises ${entry.nom_creole} aujourd'hui, écoute ce que la terre te dit.`,
      edition,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
      },
    },
  );
}
