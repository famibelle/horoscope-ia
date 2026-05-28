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
import { detectEditionWithNight, todayGuadeloupe, getGuadeloupeHour } from '@/lib/edition';
import type { Edition } from '@/lib/private/maryse-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { loadHoroscopeData, saveSingleHoroscope } from '@/lib/private/horoscope-file-cache';
import { applySafetyFiltersToObject } from '@/lib/private/safety-filter';

const HOROSCOPE_API = 'https://freehoroscopeapi.com/api/v1/get-horoscope/daily';
const MISTRAL_URL   = 'https://api.mistral.ai/v1/chat/completions';

const SIGN_EN: Record<string, string> = {
  belier: 'aries', taureau: 'taurus', gemeaux: 'gemini',
  cancer: 'cancer', lion: 'leo', vierge: 'virgo',
  balance: 'libra', scorpion: 'scorpio', sagittaire: 'sagittarius',
  capricorne: 'capricorn', verseau: 'aquarius', poissons: 'pisces',
};

/* ── Configuration ──────────────────────────────────────────────────────── */

// Activation de la génération à la volée (pour production)
const ENABLE_ON_DEMAND_GENERATION = process.env.ENABLE_ON_DEMAND_GENERATION === 'true';
const ENABLE_BACKGROUND_GENERATION = process.env.ENABLE_BACKGROUND_GENERATION === 'true';

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

async function fetchWeather(date?: string): Promise<string> {
  try {
    // Si une date est fournie, utiliser cette date pour la météo
    // Sinon, utiliser la date du jour (Guadeloupe)
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

  console.log(`\n🤖 [MISTRAL] Appel LLM — generateTeaser (mistral-small-latest) pour ${signName}`);
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
  if (!res.ok) { console.error(`🤖 [MISTRAL] ❌ Erreur teaser: ${res.status}`); return ''; }
  const data = await res.json();
  console.log(`🤖 [MISTRAL] ✅ Teaser généré pour ${signName}`);
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/**
 * Génère un horoscope complet via Mistral
 * Utilisé pour la génération à la volée
 */
async function generateHoroscopeWithMistral(
  signId: string,
  date: string,
  edition: Edition,
): Promise<Record<string, string> | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error('❌ MISTRAL_API_KEY manquant');
    return null;
  }

  const sign = signs.find((s) => s.id === signId);
  if (!sign) {
    console.error(`❌ Signe non trouvé: ${signId}`);
    return null;
  }

  const signEn = SIGN_EN[signId];
  if (!signEn) {
    console.error(`❌ SIGN_EN non trouvé pour: ${signId}`);
    return null;
  }

  // Récupérer les données
  const weather = await fetchWeather(date);
  const historicalResonance = getHistoricalResonance(date, signId);
  
  // Récupérer l'horoscope brut
  let rawText: string;
  try {
    rawText = await fetchRawHoroscope(signEn);
    if (!rawText) {
      console.error(`❌ Pas de texte brut pour ${signId}`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Échec fetchRawHoroscope:`, err);
    return null;
  }

  // Appel à Mistral pour la réécriture
  let structured: Record<string, string> | null = null;
  const requiredFields = ['ouverture', 'amour', 'travail', 'argent', 'amitie', 'prediction', 'conseil'];
  
  try {
    structured = await retryWithBackoff(
      () => rewriteWithMistral(
        signId, rawText, weather, edition,
        undefined, undefined, undefined,
        undefined, undefined, undefined,
        historicalResonance ?? undefined,
        date, // Passer la date pour le contexte
        undefined,
      ),
      4,
      4000,
    );
  } catch (retryErr) {
    console.error('❌ Toutes les tentatives Mistral ont échoué:', retryErr);
    return null;
  }

  // Validation
  if (!structured) {
    console.error('❌ JSON incomplet - structured est null');
    return null;
  }

  const hasAllFields = requiredFields.every(field => structured[field] && structured[field].trim() !== '');
  if (!hasAllFields) {
    const missingFields = requiredFields.filter(f => !structured[f] || structured[f].trim() === '');
    console.error('❌ JSON incomplet - champs manquants:', missingFields.join(', '));
    return null;
  }

  return structured;
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

  console.log(`\n🤖 [MISTRAL] Appel LLM — rewriteWithMistral (mistral-large-latest) signe=${signId} edition=${edition} date=${date ?? 'N/A'}`);
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
  if (!res.ok) { console.error(`🤖 [MISTRAL] ❌ Erreur rewrite: ${res.status}`); return null; }
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  try {
    const parsed = JSON.parse(content);
    console.log(`🤖 [MISTRAL] ✅ Horoscope réécrit pour ${signId}`);
    const { filtered, warnings } = applySafetyFiltersToObject(parsed, { logWarnings: false });
    if (warnings.length > 0) {
      console.warn(`🛡️ [SAFETY] ${warnings.length} remplacement(s) appliqué(s) sur horoscope ${signId}`);
    }
    return filtered;
  } catch { return null; }
}

/**
 * Construit une réponse complète d'horoscope
 */
function buildResponse(
  sign: any,
  structured: Record<string, string>,
  weather: string,
  edition: Edition,
  teaser: string,
): HoroscopeResponse {
  return {
    ouverture:  structured.ouverture,
    amour:      structured.amour,
    travail:    structured.travail,
    argent:     structured.argent ?? '',
    amitie:     structured.amitie ?? '',
    sante:      structured.sante ?? '',
    prediction: structured.prediction ?? '',
    conseil:    structured.conseil ?? '',
    signFr:     sign.name,
    weather,
    edition,
    teaser:     teaser || undefined,
    source:     'mistral',
    culturalData: {
      faune: sign.faune,
      flore: sign.flore,
      lieuDetails: sign.lieuDetails,
      element: sign.element,
      spirituel: sign.spirituel,
      animal: sign.animal,
      nomKreyol: sign.nomKreyol,
      plante: sign.plante,
      arbre: sign.arbre,
      lieu: sign.lieu,
    },
  };
}

/**
 * Génère une réponse de fallback intelligente
 * Indique que la génération est en cours
 */
function buildGeneratingResponse(sign: any, date: string, edition: Edition, weather: string): HoroscopeResponse {
  return {
    ouverture: `⏳ Génération de l'horoscope en cours pour ${sign.name}...`,
    amour: 'Nous préparons votre horoscope personnalisé avec soin.',
    travail: 'Votre horoscope sera disponible dans quelques instants.',
    argent: 'Patience, les étoiles s\'alignent pour vous.',
    amitie: 'Le message complet arrive bientôt.',
    prediction: `Rafraîchissez la page dans 30 secondes pour voir l'horoscope du ${date}.`,
    conseil: `Votre horoscope pour le ${date} (${edition}) est en cours de génération.`,
    sante: '',
    signFr: sign.name,
    weather,
    edition,
    source: 'generating',
    isGenerating: true,
    retryAfter: 30,
    culturalData: {
      faune: sign.faune,
      flore: sign.flore,
      lieuDetails: sign.lieuDetails,
      element: sign.element,
      spirituel: sign.spirituel,
      animal: sign.animal,
      nomKreyol: sign.nomKreyol,
      plante: sign.plante,
      arbre: sign.arbre,
      lieu: sign.lieu,
    },
  };
}

/**
 * Génère une réponse de fallback statique (dernier recours)
 */
function buildFallbackResponse(sign: any, weather: string, edition: Edition): HoroscopeResponse {
  return {
    ouverture: `⚠️ Les esprits de Karukera sont temporairement voilés pour ${sign.name}...`,
    amour: 'Prenez ce temps pour écouter votre cœur et vos intuitions.',
    travail: 'Votre sagesse intérieure est votre meilleure conseillère aujourd’hui.',
    argent: 'Une période de réflexion avant toute décision financière.',
    amitie: 'Vos proches comptent sur votre présence, même silencieuse.',
    prediction: 'La clarté reviendra bientôt.',
    conseil: 'Prenez soin de vous et laissez le temps faire son œuvre.',
    sante: '',
    signFr: sign.name,
    weather,
    edition,
    source: 'fallback',
    culturalData: {
      faune: sign.faune,
      flore: sign.flore,
      lieuDetails: sign.lieuDetails,
      element: sign.element,
      spirituel: sign.spirituel,
      animal: sign.animal,
      nomKreyol: sign.nomKreyol,
      plante: sign.plante,
      arbre: sign.arbre,
      lieu: sign.lieu,
    },
  };
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

  // ============================================================
  // GESTION DE LA DATE : Priorité à la date du visiteur
  // ============================================================
  // Le frontend doit passer la date du visiteur dans les paramètres
  // Exemple: /api/horoscope/belier?date=2026-05-24&userHour=14
  
  const editionParam = req.nextUrl.searchParams.get('edition') as Edition | null;
  const userDate = req.nextUrl.searchParams.get('date') || req.nextUrl.searchParams.get('userDate');
  const userHour = req.nextUrl.searchParams.get('userHour');
  
  // 🔹 NOUVELLE LOGIQUE : 
  // 1. Si userDate est fourni → utiliser la date du visiteur
  // 2. Sinon → utiliser la date de Guadeloupe (fallback pour compatibilité)
  const date = userDate || todayGuadeloupe();
  
  // 🔹 Gestion de l'édition :
  // 1. Si editionParam est fourni → utiliser l'édition du visiteur
  // 2. Si userHour est fourni → calculer l'édition basée sur l'heure du visiteur
  // 3. Sinon → utiliser l'heure de Guadeloupe
  let hour: number;
  let edition: Edition;
  
  if (editionParam) {
    edition = editionParam;
    hour = getGuadeloupeHour(); // Default hour
  } else if (userHour) {
    hour = parseInt(userHour, 10);
    edition = (hour >= 0 && hour < 6 ? 'nuit' : 
               hour < 12 ? 'matin' : 
               hour < 18 ? 'midi' : 'soir');
  } else {
    hour = getGuadeloupeHour();
    edition = detectEditionWithNight();
  }

  const blobKey = `${date}|${signId}|${edition}`;

  // ============================================================
  // LOGGING DÉTAILLÉ
  // ============================================================
  console.log(`[API HOROSCOPE] === NOUVELLE REQUÊTE ===`);
  console.log(`[API HOROSCOPE] Signe: ${signId}`);
  console.log(`[API HOROSCOPE] Date: ${date} (userDate=${userDate || 'auto'})`);
  console.log(`[API HOROSCOPE] Édition: ${edition} (userHour=${userHour || 'auto'}, hour=${hour})`);
  console.log(`[API HOROSCOPE] Clé: ${blobKey}`);
  console.log(`[API HOROSCOPE] URL base: ${req.nextUrl.origin}`);
  console.log(`[API HOROSCOPE] Mode: ${process.env.NODE_ENV || 'production'}`);
  console.log(`[API HOROSCOPE] On-demand generation: ${ENABLE_ON_DEMAND_GENERATION}`);
  console.log(`[API HOROSCOPE] Background generation: ${ENABLE_BACKGROUND_GENERATION}`);

  // ============================================================
  // ÉTAPE 1: Essayer de charger depuis le cache (fetch HTTP)
  // ============================================================
  console.log(`\n[API HOROSCOPE] ÉTAPE 1/4: Chargement depuis le cache...`);
  
  try {
    const localData = await loadHoroscopeData(date, signId, edition, req);
    if (localData) {
      console.log(`[API HOROSCOPE] ✅ CACHE HIT: ${blobKey}`);
      return NextResponse.json(localData, {
        headers: { 
          'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' 
        },
      });
    }
  } catch (err) {
    console.error(`[API HOROSCOPE] ❌ CACHE ERROR:`, err instanceof Error ? err.message : err);
  }

  console.log(`[API HOROSCOPE] ❌ CACHE MISS: ${blobKey}`);

  // ============================================================
  // ÉTAPE 2: Essayer Netlify Blobs
  // ============================================================
  console.log(`\n[API HOROSCOPE] ÉTAPE 2/4: Netlify Blobs...`);
  
  try {
    const cached = await getCached(blobKey);
    if (cached) {
      console.log(`[API HOROSCOPE] ✅ BLOBS HIT: ${blobKey}`);
      return NextResponse.json(cached, {
        headers: { 
          'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' 
        },
      });
    }
  } catch (err) {
    console.error(`[API HOROSCOPE] ❌ BLOBS ERROR:`, err instanceof Error ? err.message : err);
  }

  console.log(`[API HOROSCOPE] ❌ BLOBS MISS: ${blobKey}`);

  // ============================================================
  // ÉTAPE 3: Génération à la volée (si activé)
  // ============================================================
  if (ENABLE_ON_DEMAND_GENERATION) {
    console.log(`\n[API HOROSCOPE] ÉTAPE 3/4: Génération à la volée...`);
    
    try {
      // Générer l'horoscope
      const structured = await generateHoroscopeWithMistral(signId, date, edition);
      
      if (structured) {
        // Générer le teaser
        const teaser = await generateTeaser(sign.name, structured);
        
        // Construire la réponse
        const response = buildResponse(sign, structured, await fetchWeather(date), edition, teaser);
        
        // Sauvegarder dans Netlify Blobs
        await setCached(blobKey, response);
        
        // Sauvegarder dans le fichier local (dev seulement)
        if (process.env.NODE_ENV === 'development') {
          await saveSingleHoroscope(date, signId, edition, response);
        }
        
        console.log(`[API HOROSCOPE] ✅ GÉNÉRATION RÉUSSIE: ${blobKey}`);
        console.log(`[API HOROSCOPE] Source: on-demand`);
        
        return NextResponse.json(response, {
          headers: { 
            'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=7200' 
          },
        });
      } else {
        console.error(`[API HOROSCOPE] ❌ GÉNÉRATION ÉCHOUÉE: Mistral n'a pas retourné de données valides`);
      }
    } catch (err) {
      console.error(`[API HOROSCOPE] ❌ GÉNÉRATION ERROR:`, err instanceof Error ? err.message : err);
    }
  } else {
    console.log(`[API HOROSCOPE] ⚠️  Génération à la volée désactivée (ENABLE_ON_DEMAND_GENERATION=false)`);
  }

  console.log(`[API HOROSCOPE] ❌ ÉTAPE 3 ÉCHOUÉE`);

  // ============================================================
  // ÉTAPE 4: Fallback
  // ============================================================
  console.log(`\n[API HOROSCOPE] ÉTAPE 4/4: Fallback`);
  
  const weather = await fetchWeather(date);
  
  // 🔹 Si la génération en arrière-plan est activée, lancer la génération
  // mais retourner une réponse immédiate
  if (ENABLE_BACKGROUND_GENERATION && ENABLE_ON_DEMAND_GENERATION) {
    console.log(`[API HOROSCOPE] 🔄 Lancement de la génération en arrière-plan...`);
    
    // Lancer la génération sans attendre (fire-and-forget)
    generateHoroscopeWithMistral(signId, date, edition)
      .then(async (structured) => {
        if (structured) {
          const teaser = await generateTeaser(sign.name, structured);
          const response = buildResponse(sign, structured, weather, edition, teaser);
          await setCached(blobKey, response);
          console.log(`[API HOROSCOPE] ✅ Génération en arrière-plan terminée: ${blobKey}`);
        }
      })
      .catch((err) => {
        console.error(`[API HOROSCOPE] ❌ Génération en arrière-plan échouée:`, err);
      });
    
    // Retourner une réponse de "génération en cours"
    const generatingResponse = buildGeneratingResponse(sign, date, edition, weather);
    
    console.log(`[API HOROSCOPE] ⏳ RETOUR: Génération en cours`);
    return NextResponse.json(generatingResponse, {
      headers: { 
        'Cache-Control': 'no-store, max-age=30' // Cache très court pour la régénération
      },
    });
  }

  // 🔹 Fallback statique (dernier recours)
  console.error(`[API HOROSCOPE] ❌ TOUTES LES ÉTAPES ÉCHOUÉES: ${blobKey}`);
  console.error(`[API HOROSCOPE] → Retour du fallback statique`);
  
  const fallbackResponse = buildFallbackResponse(sign, weather, edition);
  
  return NextResponse.json(fallbackResponse, {
    headers: { 
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' // Cache court pour le fallback
    },
  });
}
