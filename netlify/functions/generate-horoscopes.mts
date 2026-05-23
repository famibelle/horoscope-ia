import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { signs } from '../../lib/signs-data';
import {
  MARYSE_SYSTEM,
  buildHoroscopeUserPrompt,
  EDITION_CONFIGS,
  type Edition,
} from '../../lib/private/maryse-prompt';
import {
  getMedicinalPlant,
  getResistancePratique,
  getResistanceObjet,
  getSignFaune,
  getSignFlore,
  getSignLieu,
  getHistoricalResonance,
} from '../../lib/cultural-context';
import { todayGuadeloupe } from '../../lib/edition';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const HOROSCOPE_API = 'https://freehoroscopeapi.com/api/v1/get-horoscope/daily';

const SIGN_EN: Record<string, string> = {
  belier: 'aries',
  taureau: 'taurus',
  gemeaux: 'gemini',
  cancer: 'cancer',
  lion: 'leo',
  vierge: 'virgo',
  balance: 'libra',
  scorpion: 'scorpio',
  sagittaire: 'sagittarius',
  capricorne: 'capricorn',
  verseau: 'aquarius',
  poissons: 'pisces',
};

const editions: Edition[] = ['matin', 'midi', 'soir'];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRawHoroscope(signEn: string): Promise<string> {
  const res = await fetch(`${HOROSCOPE_API}?sign=${signEn}`, {
    headers: { 'User-Agent': 'HoroscopeKarukera/1.0' },
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data.horoscope || data?.data?.horoscope || '';
}

async function fetchWeather(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max' +
        '&timezone=America%2FGuadeloupe&forecast_days=1'
    );
    if (!res.ok) return '';
    const data = await res.json();
    const d = data.daily;
    if (!d?.time?.length) return '';
    const tmax = Math.round(d.temperature_2m_max[0]);
    const tmin = Math.round(d.temperature_2m_min[0]);
    const rain = d.precipitation_sum[0] as number;
    const wind = Math.round(d.windspeed_10m_max[0]);
    const rainLabel =
      rain === 0
        ? 'pas de pluie'
        : rain < 5
          ? 'légère pluie'
          : rain < 20
            ? 'pluie modérée'
            : 'fortes pluies';
    const windLabel = wind < 20 ? 'vent faible' : wind < 40 ? 'vent modéré' : 'vent fort';
    return `${tmin}–${tmax}°C, ${rainLabel}, ${windLabel} (${wind} km/h)`;
  } catch {
    return '';
  }
}

async function callMistral(
  signId: string,
  rawText: string,
  weather: string,
  edition: Edition,
  apiKey: string
): Promise<Record<string, string> | null> {
  const sign = signs.find((s) => s.id === signId);
  if (!sign) return null;

  // Délai pour éviter le rate limit Mistral
  await delay(10000);

  const medicinal = getMedicinalPlant(signId, todayGuadeloupe());
  const pratique = getResistancePratique(signId, todayGuadeloupe());
  const objet = getResistanceObjet(signId, todayGuadeloupe());
  const faune = getSignFaune(signId, todayGuadeloupe());
  const flore = getSignFlore(signId, todayGuadeloupe());
  const lieu = getSignLieu(signId, todayGuadeloupe());
  const historicalResonance = getHistoricalResonance(todayGuadeloupe());

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
        { role: 'user', content: buildHoroscopeUserPrompt(sign, rawText, weather, edition, todayGuadeloupe(), undefined) },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`Mistral ${res.status} for ${signId}/${edition}`);
    return null;
  }

  const data = await res.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content ?? '');
  } catch {
    return null;
  }
}

async function generateTeaser(
  signName: string,
  structured: Record<string, string>,
  apiKey: string
): Promise<string> {
  // Délai pour éviter le rate limit Mistral
  await delay(5000);

  const fullText = [
    structured.ouverture,
    structured.amour,
    structured.travail,
    structured.argent,
    structured.amitie,
    structured.prediction,
  ]
    .filter(Boolean)
    .join(' ');

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
          content:
            `Tu es Maryse CondAI. Rédige une accroche de 2 phrases maximum à partir de l'horoscope du ${signName}, en voix directe et sensuelle, qui donne envie de lire la suite sans tout révéler. Pas de titre, pas de ponctuation finale superflue.`,
        },
        { role: 'user', content: fullText },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`Mistral small ${res.status} for ${signName}`);
    return '';
  }

  return (await res.json()).choices?.[0]?.message?.content?.trim() ?? '';
}

export default async function handler() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error('❌ MISTRAL_API_KEY manquant');
    return new Response(JSON.stringify({ error: 'MISTRAL_API_KEY manquant' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const store = getStore('horoscopes');
  const today = todayGuadeloupe();
  const weather = await fetchWeather();

  console.log(`🌟 Génération horoscopes du ${today} — météo : ${weather || 'inconnue'}`);

  let generated = 0;
  const total = signs.length * editions.length;

  for (const sign of signs) {
    const signEn = SIGN_EN[sign.id];
    if (!signEn) {
      console.warn(`⚠️ Pas de mapping anglais pour ${sign.id}`);
      continue;
    }

    const rawText = await fetchRawHoroscope(signEn);
    if (!rawText) {
      console.warn(`⚠️ Horoscope brut indisponible pour ${sign.id}`);
      continue;
    }

    for (const edition of editions) {
      const key = `${today}|${sign.id}|${edition}`;

      // Skip if already cached
      const existing = await store.get(key);
      if (existing) {
        console.log(`  ↩ ${sign.id}/${edition} déjà en cache`);
        continue;
      }

      const structured = await callMistral(sign.id, rawText, weather, edition, apiKey);
      if (!structured?.ouverture) {
        console.warn(`  ✗ ${sign.id}/${edition} — Mistral a échoué`);
        continue;
      }

      const teaser = await generateTeaser(sign.name, structured, apiKey);

      await store.set(
        key,
        JSON.stringify({
          ouverture: structured.ouverture,
          amour: structured.amour ?? '',
          travail: structured.travail ?? '',
          argent: structured.argent ?? '',
          amitie: structured.amitie ?? '',
          sante: structured.sante ?? '',
          prediction: structured.prediction ?? '',
          signFr: sign.name,
          weather,
          edition,
          teaser: teaser || undefined,
          source: 'mistral',
        }),
        { expirationTtl: 86400 * 2 } // 2 jours
      );

      console.log(`  ✅ ${sign.id}/${edition}`);
      generated++;
    }
  }

  console.log(`✨ ${generated}/${total} horoscopes générés et mis en cache`);
  return new Response(JSON.stringify({ generated, date: today, total }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config: Config = {
  // 9h UTC = 5h Guadeloupe (UTC-4) — génère les 36 horoscopes en début de journée
  schedule: '0 9 * * *',
};
