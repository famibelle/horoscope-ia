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
import { loadAmbianceData } from '@/lib/private/horoscope-file-cache';
import { applySafetyFiltersToObject } from '@/lib/private/safety-filter';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

/* ── Local file helper with enhanced logging ──────────────────────────────── */

/**
 * Récupère les ambiances depuis le fichier JSON local via fetch HTTP
 * Utilisé comme fallback si le cache filesystem n'est pas disponible
 */
async function getFromLocalFile(date: string, signId: string, edition: Edition, req: NextRequest): Promise<any | null> {
  const key = `${date}|${signId}|${edition}`;
  
  try {
    // Construire l'URL avec l'origine du domaine
    const baseUrl = process.env.VERCEL_URL || process.env.NETLIFY_URL || req.nextUrl.origin;
    const url = new URL(`/data/ambiance/${date}.json`, baseUrl);
    
    console.log(`[AMBIANCE FETCH] Attempting: ${url.toString()}`); // LOG DIAGNOSTIC
    
    const response = await fetch(url.toString(), { next: { revalidate: 28800 } });
    
    console.log(`[AMBIANCE FETCH] Response: ${response.status} ${response.statusText}`); // LOG DIAGNOSTIC
    
    if (!response.ok) {
      console.warn(`[AMBIANCE FETCH] Failed: ${response.status}`); // LOG DIAGNOSTIC
      return null;
    }
    
    const allAmbiances = await response.json();
    const found = !!allAmbiances[key];
    
    console.log(`[AMBIANCE FETCH] Key ${key} found: ${found}, available keys: ${Object.keys(allAmbiances).slice(0, 5).join(', ')}${Object.keys(allAmbiances).length > 5 ? '...' : ''}`); // LOG DIAGNOSTIC
    
    return allAmbiances[key] || null;
  } catch (err) {
    console.error(`[AMBIANCE FETCH] Error:`, err instanceof Error ? err.message : err); // LOG DIAGNOSTIC
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

  // LOG DIAGNOSTIC
  console.log(`[AMBIANCE API] Request: sign=${signId}, date=${userDate}, edition=${edition}`);

  // 0. Supabase (source principale)
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: row } = await supabase
      .from('ambiances')
      .select('*')
      .eq('date', userDate)
      .eq('sign_id', signId)
      .eq('edition', edition)
      .single();
    if (row) {
      console.log(`[AMBIANCE SUPABASE HIT] ${cacheKey}`);
      const payload = {
        ambiance: row.ambiance,
        chiffrePorteBonheur: row.chiffre_porte_bonheur,
        compatibilite: row.compatibilite,
        loa: row.loa,
        familleVaudou: row.famille_vaudou,
        couleursSacrees: row.couleurs_sacrees,
        lune: {
          bienetre: row.lune_bienetre,
          beaute: row.lune_beaute,
          esprit: row.lune_esprit,
          maison: row.lune_maison,
          jardinage: row.lune_jardinage,
        },
        scores: row.scores,
      };
      return NextResponse.json(payload, {
        headers: { 'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' },
      });
    }
  } catch (err) {
    console.error(`[AMBIANCE SUPABASE ERROR]`, err instanceof Error ? err.message : err);
  }

  // 1. Check local file via filesystem cache
  const cachedData = await loadAmbianceData(userDate, signId, edition, req);
  if (cachedData) {
    console.log(`[AMBIANCE CACHE HIT] ${cacheKey}`);
    return NextResponse.json(cachedData, {
      headers: { 'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' },
    });
  }

  // 1. Fallback: Check local file via HTTP fetch
  const localData = await getFromLocalFile(userDate, signId, edition, req);
  if (localData) {
    console.log(`[AMBIANCE FILE HIT] ${cacheKey}`);
    return NextResponse.json(localData, {
      headers: { 'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' },
    });
  }

  // LOG DIAGNOSTIC: Si on arrive ici, toutes les sources locales ont échoué
  console.warn(`[AMBIANCE] All local sources missed for ${cacheKey}. Trying Blobs...`);

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

RÈGLE ABSOLUE DE LANGUE : Rédige UNIQUEMENT en français. Tu peux citer un nom créole entre parenthèses, mais n'écris jamais une phrase entière en créole.

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
    "bienetre": "Rédige en français. Conseil bien-être ancré sur le rimèd razié du jour : cite le nom créole ${luneBienetre.nomCreole} entre parenthèses, puis explique en français son usage pour le corps (${luneBienetre.usage}). 2 phrases.",
    "beaute": "Rédige en français. Conseil beauté/soin naturel ancré sur la plante du jour : cite le nom créole ${luneBeaute.nomCreole} entre parenthèses, puis décris en français son usage beauté ou soin (${luneBeaute.culture}). 2 phrases.",
    "esprit": "Rédige en français. Conseil mental ou spirituel ancré sur l'objet ou lieu de résistance du jour : cite le nom créole ${luneEsprit.nomCreole} entre parenthèses, puis développe en français sa dimension spirituelle (${luneEsprit.dimension}). Lie aussi à la ${lunarPhase}. 2 phrases.",
    "maison": "Rédige en français. Conseil maison/espace de vie ancré sur l'objet ou pratique du jour : cite le nom créole ${luneMaison.nomCreole} entre parenthèses, puis explique en français sa dimension (${luneMaison.dimension}). 2 phrases.",
    "jardinage": "Rédige en français. Conseil jardinage ancré sur la plante du jour : cite le nom créole ${luneJardinage.nomCreole} entre parenthèses, puis explique en français comment la cultiver ou l'utiliser selon la ${lunarPhase} (${luneJardinage.culture}). 2 phrases."
  }
}

Pour "compatibilite" choisis exactement 2 valeurs parmi : ${otherSigns.join(', ')}.
Sans markdown dans les valeurs JSON.`;

  console.log(`\n🤖 [MISTRAL] Appel LLM — ambiance (mistral-small-latest) signe=${signId} date=${userDate} edition=${edition}`);
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

  if (!res.ok) { console.error(`🤖 [MISTRAL] ❌ Erreur ambiance: ${res.status}`); return NextResponse.json({ error: 'Mistral error' }, { status: 500 }); }

  const mistralData = await res.json();
  const content = mistralData.choices?.[0]?.message?.content ?? '{}';

  try {
    const raw = { ...JSON.parse(content), scores };
    const { filtered: data, warnings } = applySafetyFiltersToObject(raw, { logWarnings: false });
    if (warnings.length > 0) {
      console.warn(`🛡️ [SAFETY] ${warnings.length} remplacement(s) appliqué(s) sur ambiance ${signId}`);
    }
    console.log(`🤖 [MISTRAL] ✅ Ambiance générée pour ${signId}`);

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
