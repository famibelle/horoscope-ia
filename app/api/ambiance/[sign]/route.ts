import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { detectEdition, todayGuadeloupe } from '@/lib/edition';
import { MARYSE_SYSTEM } from '@/lib/private/maryse-prompt';
import {
  getCulturalContext,
  getAmbianceBienetre,
  getAmbianceBeaute,
  getAmbianceEsprit,
  getAmbianceMaison,
  getAmbianceJardinage,
} from '@/lib/cultural-context';
import { computeScores } from '@/lib/scores';
import type { WeatherData } from '@/app/api/weather/route';
import type { Edition } from '@/lib/private/maryse-prompt';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

/* ── Local file helper ────────────────────────────────────────────────────── */
async function getFromLocalFile(date: string, signId: string, edition: Edition, req: NextRequest): Promise<any | null> {
  try {
    // Utiliser URL absolue via req.url pour fonctionner en production (Netlify)
    const url = new URL(`/data/ambiance/${date}.json`, req.url);
    const response = await fetch(url.toString(), { next: { revalidate: 28800 } });
    if (!response.ok) return null;
    const allAmbiances = await response.json();
    const key = `${date}|${signId}|${edition}`;
    return allAmbiances[key] || null;
  } catch {
    return null;
  }
}

/* ── Persistent cache using Netlify Blobs ───────────────────────────────── */
async function getAmbienceCache() {
  try {
    const { getStore } = await import('@netlify/blobs');
    return getStore('ambiance-cache');
  } catch {
    // Fallback to in-memory cache if Netlify Blobs is not available
    return null;
  }
}

/* ── Simple in-memory cache (fallback for local dev) ──────────────────────── */
const _inMemoryCache = new Map<string, { data: unknown; ts: number }>();
const TTL = 3_600_000; // 1 hour

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
    editionParam === 'matin' || editionParam === 'midi' || editionParam === 'soir' || editionParam === 'nuit'
      ? editionParam : detectEdition();

  const userDate = req.nextUrl.searchParams.get('userDate') || todayGuadeloupe();
  const cacheKey = `${userDate}|${signId}|${edition}`;
  const today = todayGuadeloupe();

  // 1. Check local file first (fastest - static files)
  const localData = await getFromLocalFile(userDate, signId, edition, req);
  if (localData) {
    return NextResponse.json(localData, {
      headers: { 'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' },
    });
  }

  // 2. Try Netlify Blobs cache (for backwards compatibility)
  const blobStore = await getAmbienceCache();
  if (blobStore) {
    try {
      const cached = await blobStore.get(cacheKey, { type: 'json' });
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
        });
      }
    } catch {
      // Fall through to in-memory cache
    }
  }
  
  // 3. Fallback to in-memory cache (for local dev)
  const hit = _inMemoryCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) {
    return NextResponse.json(hit.data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    });
  }

  const lunarPhase = lunarPhaseLabel();
  const otherSigns = signs.filter((s) => s.id !== signId).map((s) => s.id);
  const culturalContext = getCulturalContext(signId, today);

  const luneBienetre  = getAmbianceBienetre(signId, today);
  const luneBeaute    = getAmbianceBeaute(signId, today);
  const luneEsprit    = getAmbianceEsprit(signId, today);
  const luneMaison    = getAmbianceMaison(signId, today);
  const luneJardinage = getAmbianceJardinage(signId, today);

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
    "bienetre": "conseil bien-être ancré sur le rimèd razié du jour : ${luneBienetre.nomCreole} (${luneBienetre.nomFr}) — ${luneBienetre.usage}. Mentionne le nom créole et son usage pour le corps. 2 phrases.",
    "beaute": "conseil beauté/soin naturel ancré sur la plante du jour : ${luneBeaute.nomCreole} (${luneBeaute.nomFr}) — ${luneBeaute.culture}. Mentionne le nom créole et son usage beauté ou soin. 2 phrases.",
    "esprit": "conseil mental ou spirituel ancré sur l'objet ou lieu de résistance du jour : ${luneEsprit.nomCreole} (${luneEsprit.nomFr}) — ${luneEsprit.dimension}. Lié aussi à la ${lunarPhase}. 2 phrases.",
    "maison": "conseil maison/espace de vie créole ancré sur l'objet ou pratique du jour : ${luneMaison.nomCreole} (${luneMaison.nomFr}) — ${luneMaison.dimension}. 2 phrases.",
    "jardinage": "conseil jardinage créole ancré sur la plante du jour : ${luneJardinage.nomCreole} (${luneJardinage.nomFr}) — ${luneJardinage.culture}. Mentionne le nom créole et comment la cultiver ou l'utiliser selon la ${lunarPhase}. 2 phrases."
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
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'Mistral error' }, { status: 500 });

  const mistralData = await res.json();
  const content = mistralData.choices?.[0]?.message?.content ?? '{}';

  try {
    const data = { ...JSON.parse(content), scores };
    
    // Store in Netlify Blobs cache
    if (blobStore) {
      try {
        await blobStore.set(cacheKey, JSON.stringify(data));
      } catch {
        // Fall through to in-memory cache
      }
    }
    
    // Also store in in-memory cache (for local dev)
    _inMemoryCache.set(cacheKey, { data, ts: Date.now() });
    
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 500 });
  }
}
