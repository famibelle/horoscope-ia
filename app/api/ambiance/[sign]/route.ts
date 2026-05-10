import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { detectEdition, todayGuadeloupe } from '@/lib/edition';
import { getCulturalContext } from '@/lib/cultural-context';
import { computeScores } from '@/lib/scores';
import type { WeatherData } from '@/app/api/weather/route';
import type { Edition } from '@/private/maryse-prompt';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

/* ── Simple in-memory cache (local dev) ────────────────────────────────────── */
const _cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 3_600_000;

function lunarPhaseLabel(): string {
  const known = new Date('2000-01-06').getTime();
  const days = (Date.now() - known) / 86_400_000;
  const cycle = ((days % 29.53) + 29.53) % 29.53;
  const idx = Math.floor((cycle / 29.53) * 8) % 8;
  return [
    'Nouvelle lune', 'Croissant naissant', 'Premier quartier', 'Croissant gibbeuse',
    'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Croissant décroissant',
  ][idx];
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sign: string }> },
) {
  const { sign: signId } = await context.params;
  const sign = signs.find((s) => s.id === signId);
  if (!sign) return NextResponse.json({ error: 'Signe inconnu' }, { status: 404 });

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key manquante' }, { status: 500 });

  const editionParam = req.nextUrl.searchParams.get('edition') as Edition | null;
  const edition: Edition =
    editionParam === 'matin' || editionParam === 'midi' || editionParam === 'soir'
      ? editionParam : detectEdition();

  const cacheKey = `${todayGuadeloupe()}|${signId}|${edition}`;
  const hit = _cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) {
    return NextResponse.json(hit.data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    });
  }

  const lunarPhase = lunarPhaseLabel();
  const today = todayGuadeloupe();
  const otherSigns = signs.filter((s) => s.id !== signId).map((s) => s.id);
  const culturalContext = getCulturalContext(signId, today);

  // Récupère la météo de Pointe-à-Pitre pour le calcul des scores
  let weather: WeatherData;
  try {
    const wRes = await fetch(
      `${req.nextUrl.origin}/api/weather`,
      { next: { revalidate: 3600 } },
    );
    weather = wRes.ok ? await wRes.json() : { tmin: 24, tmax: 30, rain: 0, wind: 20, code: 1, label: 'Partiellement nuageux', summary: '' };
  } catch {
    weather = { tmin: 24, tmax: 30, rain: 0, wind: 20, code: 1, label: 'Partiellement nuageux', summary: '' };
  }

  const scores = computeScores(signId, today, weather);

  const prompt = `Tu es Maryse CondAI, voix astrologique de Karukera (Guadeloupe).
Génère l'ambiance astrale du jour pour le ${sign.name} (édition ${edition}).

Signe : ${sign.name} · Planète : ${sign.planet} · Élément : ${sign.element}
Phase lunaire : ${lunarPhase}
Météo à Pointe-à-Pitre : ${weather.summary}

${culturalContext}

Scores énergétiques du jour (FIXES — calculés depuis les cycles planétaires, la météo et le calendrier guadeloupéen) :
Amour ${scores.amour}% · Travail ${scores.travail}% · Bien-être ${scores.bienetre}% · Vie sociale ${scores.vieSociale}% · Finances ${scores.finances}%

Tiens compte de ces scores dans ton ambiance : commente brièvement les domaines forts (>75) et faibles (<50).

Réponds avec un objet JSON valide et ces clés exactes :
{
  "ambiance": "2-3 phrases sur l'énergie du jour, ancrées dans les références culturelles ci-dessus et cohérentes avec les scores",
  "chiffrePorteBonheur": <entier 1-99, de préférence un nombre premier (2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97)>,
  "compatibilite": ["<signId1>", "<signId2>"],
  "lune": {
    "bienetre": "conseil bien-être lié à la ${lunarPhase}, ancré Karukera, 2 phrases",
    "beaute": "conseil beauté/soin naturel caribéen, 2 phrases",
    "esprit": "conseil mental ou spirituel, lié à la phase lunaire, 2 phrases",
    "maison": "conseil maison/espace de vie créole, 2 phrases",
    "jardinage": "conseil jardinage créole (igname, christophine, balisier, canne…), 2 phrases"
  }
}

Pour "compatibilite" choisis exactement 2 valeurs parmi : ${otherSigns.join(', ')}.
Sans markdown dans les valeurs JSON.`;

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.8,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'Mistral error' }, { status: 500 });

  const mistralData = await res.json();
  const content = mistralData.choices?.[0]?.message?.content ?? '{}';

  try {
    const data = { ...JSON.parse(content), scores };
    _cache.set(cacheKey, { data, ts: Date.now() });
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 500 });
  }
}
