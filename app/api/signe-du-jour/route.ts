import { NextResponse } from 'next/server';
import { MARYSE_SIGNE_SYSTEM, buildSigneDuJourUserPrompt } from '@/private/maryse-prompt';
import { detectEdition } from '@/lib/edition';
import type { Edition } from '@/private/maryse-prompt';
import signeData from '@/private/signe-du-jour-data.json';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

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
        { role: 'system', content: MARYSE_SIGNE_SYSTEM },
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

export async function GET() {
  const edition = detectEdition();
  const typedData = signeData as SigneData;

  const weather = await fetchWeatherSummary();
  const weatherTags = weatherToConditions(weather);

  // Alternate flora/faune daily (odd/even day)
  const today = new Date();
  const useFlora = today.getDate() % 2 === 0;
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
