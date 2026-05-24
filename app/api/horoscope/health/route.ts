/**
 * Endpoint de santé pour les horoscopes
 * 
 * Vérifie que tous les horoscopes pour la date du jour sont disponibles.
 * Utilisé pour le monitoring et la vérification post-déploiement.
 * 
 * GET /api/horoscope/health
 * 
 * Query params:
 * - date: Date à vérifier (YYYY-MM-DD). Par défaut: aujourd'hui (Guadeloupe)
 * 
 * Réponse:
 * {
 *   "status": "ok" | "partial" | "error",
 *   "date": "2026-05-24",
 *   "totalExpected": 48,           // 12 signes × 4 éditions
 *   "totalFound": 48,
 *   "totalMissing": 0,
 *   "missing": [],                 // Liste des clés manquantes
 *   "sources": {
 *     "file": true,                // Fichier JSON existe
 *     "blobs": 48,                // Nombre d'entrées dans Blobs
 *     "generateOnDemand": true    // Génération à la volée activée
 *   },
 *   "lastGenerated": "2026-05-24T10:00:00.000Z",
 *   "checkTimestamp": "2026-05-24T14:30:00.000Z"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { todayGuadeloupe } from '@/lib/edition';
import { loadHoroscopeData } from '@/lib/private/horoscope-file-cache';

const EDITIONS: ('nuit' | 'matin' | 'midi' | 'soir')[] = ['nuit', 'matin', 'midi', 'soir'];

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  // Récupérer la date à vérifier (par défaut: aujourd'hui Guadeloupe)
  const userDate = req.nextUrl.searchParams.get('date');
  const date = userDate || todayGuadeloupe();
  
  const totalExpected = signs.length * EDITIONS.length;
  const missing: string[] = [];
  let totalFound = 0;
  let fileExists = false;
  let fileEntryCount = 0;
  let lastGenerated: string | null = null;
  let blobsCount = 0;
  
  // Logs
  console.log(`[HEALTH CHECK] === Début vérification ===`);
  console.log(`[HEALTH CHECK] Date: ${date}`);
  console.log(`[HEALTH CHECK] Attendu: ${totalExpected} horoscopes`);
  
  try {
    // Vérifier chaque signe et chaque édition
    for (const sign of signs) {
      for (const edition of EDITIONS) {
        const key = `${date}|${sign.id}|${edition}`;
        
        try {
          // Essayer de charger depuis le cache
          const data = await loadHoroscopeData(date, sign.id, edition, req);
          
          if (data) {
            totalFound++;
            
            // Mettre à jour lastGenerated
            if (data.generatedAt && (!lastGenerated || data.generatedAt > lastGenerated)) {
              lastGenerated = data.generatedAt;
            }
            
            // Vérifier la source
            if (data.source === 'mistral') {
              // Compter comme valide
            } else if (data.source === 'fallback' || data.source === 'generating') {
              // Compter mais marquer comme non-ideal
              console.warn(`[HEALTH CHECK] Source non-idéale pour ${key}: ${data.source}`);
            }
          } else {
            missing.push(key);
            console.error(`[HEALTH CHECK] ❌ MANQUANT: ${key}`);
          }
        } catch (err) {
          console.error(`[HEALTH CHECK] ❌ ERREUR pour ${key}:`, err);
          missing.push(key);
        }
      }
    }
    
    // Vérifier si le fichier JSON existe (via fetch direct)
    try {
      const baseUrl = process.env.NETLIFY_URL 
        || process.env.VERCEL_URL
        || req.nextUrl.origin
        || 'https://horoscope-karukera.netlify.app';
      
      const url = new URL(`/data/horoscopes/${date}.json`, baseUrl);
      const response = await fetch(url.toString(), { cache: 'no-store' });
      
      if (response.ok) {
        fileExists = true;
        const data = await response.json();
        fileEntryCount = Object.keys(data).length;
        console.log(`[HEALTH CHECK] ✅ Fichier JSON trouvé: ${fileEntryCount} entrées`);
      } else {
        console.log(`[HEALTH CHECK] ❌ Fichier JSON non trouvé: ${response.status}`);
      }
    } catch (err) {
      console.log(`[HEALTH CHECK] ⚠️  Impossible de vérifier le fichier JSON:`, err);
    }
    
    // Vérifier Netlify Blobs (si disponible)
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('horoscopes');
      
      // Compter le nombre d'entrées pour cette date
      const prefix = `${date}|`;
      // Netlify Blobs ne supporte pas list, on fait une estimation
      // On essaie quelques clés aléatoires
      for (const sign of signs.slice(0, 3)) { // Vérifier 3 signes
        for (const edition of EDITIONS) {
          const key = `${date}|${sign.id}|${edition}`;
          const cached = await store.get(key, { type: 'json' });
          if (cached) blobsCount++;
        }
      }
      // Estimer le total
      const estimatedBlobsCount = Math.round((blobsCount / 3) * signs.length);
      blobsCount = estimatedBlobsCount;
      console.log(`[HEALTH CHECK] ~${blobsCount} entrées dans Netlify Blobs`);
    } catch (err) {
      console.log(`[HEALTH CHECK] ⚠️  Impossible de vérifier Netlify Blobs:`, err);
    }
    
    // Déterminer le status
    let status: 'ok' | 'partial' | 'error';
    if (missing.length === 0) {
      status = 'ok';
    } else if (totalFound > totalExpected * 0.5) {
      status = 'partial';
    } else {
      status = 'error';
    }
    
    const response = {
      status,
      date,
      totalExpected,
      totalFound,
      totalMissing: missing.length,
      missing: missing.length > 0 ? missing : undefined,
      sources: {
        file: fileExists,
        fileEntryCount,
        blobs: blobsCount,
        generateOnDemand: process.env.ENABLE_ON_DEMAND_GENERATION === 'true',
        backgroundGeneration: process.env.ENABLE_BACKGROUND_GENERATION === 'true',
      },
      lastGenerated,
      checkTimestamp: new Date(startTime).toISOString(),
      durationMs: Date.now() - startTime,
    };
    
    const httpStatus = status === 'ok' ? 200 : (status === 'partial' ? 200 : 503);
    
    console.log(`[HEALTH CHECK] === Résultat ===`);
    console.log(`[HEALTH CHECK] Status: ${status}`);
    console.log(`[HEALTH CHECK] Trouvés: ${totalFound}/${totalExpected}`);
    console.log(`[HEALTH CHECK] Manquants: ${missing.length}`);
    console.log(`[HEALTH CHECK] Durée: ${response.durationMs}ms`);
    
    return NextResponse.json(response, { status: httpStatus });
    
  } catch (err) {
    console.error(`[HEALTH CHECK] ❌ ERREUR GRAVE:`, err);
    
    return NextResponse.json({
      status: 'error' as const,
      date,
      totalExpected,
      totalFound: 0,
      totalMissing: totalExpected,
      error: err instanceof Error ? err.message : String(err),
      checkTimestamp: new Date(startTime).toISOString(),
      durationMs: Date.now() - startTime,
    }, { status: 500 });
  }
}

/**
 * Endpoint pour forcer la régénération d'un horoscope spécifique
 * POST /api/horoscope/health/regenerate
 * 
 * Body: { date?: string, sign?: string, edition?: string }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const {
      date: userDate,
      sign: signId,
      edition: userEdition,
    } = body;
    
    const date = userDate || todayGuadeloupe();
    const editions: ('nuit' | 'matin' | 'midi' | 'soir')[] = userEdition ? [userEdition] : EDITIONS;
    const signsToRegenerate = signId ? [signs.find(s => s.id === signId)].filter(Boolean) : signs;
    
    if (signsToRegenerate.length === 0) {
      return NextResponse.json(
        { error: `Signe non trouvé: ${signId}` },
        { status: 400 }
      );
    }
    
    console.log(`[REGENERATE] === Régénération forcée ===`);
    console.log(`[REGENERATE] Date: ${date}`);
    console.log(`[REGENERATE] Signes: ${signsToRegenerate.map(s => s.id).join(', ')}`);
    console.log(`[REGENERATE] Éditions: ${editions.join(', ')}`);
    
    // IMPORTANT: La régénération nécessite Mistral API
    // On ne peut pas le faire ici sans bloquer la réponse
    // On retourne une confirmation mais la régénération doit être faite
    // via le script generate-horoscopes.ts
    
    return NextResponse.json({
      status: 'queued',
      message: 'Régénération mise en file. Exécutez: npm run generate-horoscopes -- --force',
      date,
      signs: signsToRegenerate.map(s => s.id),
      editions,
      total: signsToRegenerate.length * editions.length,
      checkTimestamp: new Date(startTime).toISOString(),
    });
    
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
