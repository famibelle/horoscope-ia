import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { MARYSE_SYSTEM, buildHoroscopeUserPrompt } from '@/lib/maryse-prompt';

const HOROSCOPE_API = 'https://freehoroscopeapi.com/api/v1/get-horoscope/daily';
const MISTRAL_URL   = 'https://api.mistral.ai/v1/chat/completions';

const SIGN_EN: Record<string, string> = {
  belier: 'aries', taureau: 'taurus', gemeaux: 'gemini',
  cancer: 'cancer', lion: 'leo', vierge: 'virgo',
  balance: 'libra', scorpion: 'scorpio', sagittaire: 'sagittarius',
  capricorne: 'capricorn', verseau: 'aquarius', poissons: 'pisces',
};

async function fetchRawHoroscope(signEn: string): Promise<string> {
  const res = await fetch(`${HOROSCOPE_API}?sign=${signEn}`, {
    headers: { 'User-Agent': 'HoroscopeIA/1.0' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`horoscope API ${res.status}`);
  const data = await res.json();
  return (
    data.horoscope ||
    data?.data?.horoscope ||
    data.description ||
    ''
  );
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
    const windLabel =
      wind < 20 ? 'vent faible'
      : wind < 40 ? 'vent modéré'
      : 'vent fort';
    return `${tmin}–${tmax}°C, ${rainLabel}, ${windLabel} (${wind} km/h)`;
  } catch {
    return '';
  }
}

async function rewriteWithMistral(
  signId: string,
  rawText: string,
  weather: string,
): Promise<Record<string, string> | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  const sign = signs.find((s) => s.id === signId);
  if (!sign) return null;

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.75,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user',   content: buildHoroscopeUserPrompt(sign, rawText, weather) },
      ],
    }),
    // No cache here — the raw horoscope already has its own TTL
  });

  if (!res.ok) {
    console.error('Mistral error', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content) return null;

  try {
    return JSON.parse(content) as Record<string, string>;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sign: string }> },
) {
  const { sign: signId } = await context.params;
  const signEn = SIGN_EN[signId];
  const sign   = signs.find((s) => s.id === signId);

  if (!signEn || !sign) {
    return NextResponse.json({ error: 'Signe inconnu' }, { status: 404 });
  }

  try {
    const [rawText, weather] = await Promise.all([
      fetchRawHoroscope(signEn),
      fetchWeather(),
    ]);

    if (!rawText) {
      return NextResponse.json(
        { error: 'Horoscope indisponible depuis la source externe.' },
        { status: 503 },
      );
    }

    const structured = await rewriteWithMistral(signId, rawText, weather);

    if (
      structured &&
      structured.ouverture &&
      structured.amour &&
      structured.travail
    ) {
      return NextResponse.json(
        {
          ouverture:  structured.ouverture,
          amour:      structured.amour,
          travail:    structured.travail,
          argent:     structured.argent ?? '',
          amitie:     structured.amitie ?? '',
          prediction: structured.prediction ?? '',
          signFr:     sign.name,
          weather,
          source:     'mistral',
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
          },
        },
      );
    }

    // Fallback : texte brut en guise d'ouverture, sections vides
    return NextResponse.json(
      {
        ouverture:  rawText,
        amour:      '', travail:    '', argent:     '',
        amitie:     '', prediction: '',
        signFr: sign.name,
        weather,
        source: 'raw',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
        },
      },
    );
  } catch (err) {
    console.error('Horoscope route error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
