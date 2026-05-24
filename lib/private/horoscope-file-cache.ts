/**
 * Horoscope File Cache System - Version Robuste
 * 
 * Stratégie améliorée pour production Netlify :
 * 1. Fetch HTTP en PRIORITÉ (le filesystem ne fonctionne pas en serverless)
 * 2. Filesystem UNIQUEMENT en développement local
 * 3. Retry avec exponential backoff pour le fetch
 * 4. Logging détaillé pour le diagnostic
 * 
 * IMPORTANT : En production Netlify (serverless functions), 
 * le filesystem n'est PAS accessible. Toujours privilégier le fetch HTTP.
 * 
 * L'heure qui compte est celle du VISITEUR, pas de la Guadeloupe.
 * La date est passée en paramètre depuis l'API.
 */

import { promises as fs } from 'fs';
import path from 'path';

type CacheData = Record<string, any>;

// Cache en mémoire pour éviter les lectures répétées
const inMemoryCache: Record<string, CacheData> = {};

/**
 * Charge les données d'horoscope pour une date donnée depuis le filesystem
 * UNIQUEMENT pour développement local
 * 
 * @param date - Date au format YYYY-MM-DD
 * @returns Les données complètes pour cette date, ou null si non trouvé
 */
export async function loadDateCache(date: string): Promise<CacheData | null> {
  // Déjà en mémoire ?
  if (inMemoryCache[date]) {
    console.log(`[CACHE] In-memory hit for date: ${date}`);
    return inMemoryCache[date];
  }

  // Essayer de lire depuis le filesystem (public/data/horoscopes/)
  // UNIQUEMENT en développement
  if (process.env.NODE_ENV === 'development') {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'horoscopes', `${date}.json`);
      
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!fileExists) {
        console.log(`[CACHE] File not found: ${filePath}`);
        return null;
      }
      
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as CacheData;
      
      // Stocker en mémoire pour les prochaines requêtes
      inMemoryCache[date] = data;
      console.log(`[CACHE] Loaded ${Object.keys(data).length} horoscopes for ${date}`);
      
      return data;
    } catch (err) {
      console.error(`[CACHE] Error reading file ${date}:`, err instanceof Error ? err.message : err);
      return null;
    }
  } else {
    console.log(`[CACHE] Skipping filesystem in production for date: ${date}`);
    return null;
  }
}

/**
 * Récupère un horoscope spécifique depuis le cache
 * 
 * @param date - Date au format YYYY-MM-DD
 * @param signId - Identifiant du signe (ex: 'belier')
 * @param edition - Édition (matin, midi, soir, nuit)
 * @returns L'horoscope ou null si non trouvé
 */
export function getFromCache(date: string, signId: string, edition: string): any | null {
  const key = `${date}|${signId}|${edition}`;
  const data = inMemoryCache[date];
  
  if (!data) {
    console.log(`[CACHE] No data in cache for ${date}`);
    return null;
  }
  
  const result = data[key];
  if (result) {
    console.log(`[CACHE HIT] ${key}`);
  } else {
    console.warn(`[CACHE MISS] Key ${key} not found. Available keys:`, Object.keys(data).slice(0, 5));
  }
  
  return result || null;
}

/**
 * Force le rechargement du cache pour une date (utile après régénération)
 * 
 * @param date - Date au format YYYY-MM-DD
 */
export async function reloadDateCache(date: string): Promise<void> {
  delete inMemoryCache[date];
  await loadDateCache(date);
}

/**
 * Efface complètement le cache (pour tests ou redémarrage)
 */
export function clearCache(): void {
  Object.keys(inMemoryCache).forEach(key => delete inMemoryCache[key]);
  console.log(`[CACHE] Cache cleared (${Object.keys(inMemoryCache).length} entries)`);
}

/**
 * Charge les données d'horoscope pour une date donnée
 * Priorité au fetch HTTP (production), filesystem en fallback (dev seulement)
 * 
 * @param date - Date au format YYYY-MM-DD (date du visiteur, pas de la Guadeloupe)
 * @param signId - ID du signe (belier, taureau, etc.)
 * @param edition - Édition (nuit, matin, midi, soir)
 * @param req - Objet request pour extraire l'origine
 * @returns Données de l'horoscope ou null
 */
export async function loadHoroscopeData(
  date: string,
  signId: string,
  edition: string,
  req?: any
): Promise<any | null> {
  const key = `${date}|${signId}|${edition}`;
  const cacheKey = `${date}`;

  // LOG : Début de la récupération
  console.log(`[CACHE] === Début récupération === date=${date}, sign=${signId}, edition=${edition}`);
  console.log(`[CACHE] Clé recherchée: ${key}`);

  // ===== ÉTAPE 1 : Fetch HTTP (priorité ABSOLUE, surtout en production) =====
  // En production Netlify, c'est la SEULE méthode qui fonctionne
  if (req) {
    const baseUrl = process.env.NETLIFY_URL 
      || process.env.VERCEL_URL
      || req.nextUrl?.origin
      || 'https://horoscope-karukera.netlify.app';
    
    const url = new URL(`/data/horoscopes/${date}.json`, baseUrl);
    console.log(`[CACHE] Étape 1/2: Fetch HTTP - URL: ${url.toString()}`);
    
    // Retry avec exponential backoff (3 tentatives)
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // NE PAS utiliser next: { revalidate } car ça peut causer des problèmes en serverless
        // Utiliser cache: 'no-store' pour éviter le cache
        const response = await fetch(url.toString(), { 
          cache: 'no-store',
          // Timeout de 5 secondes
          // Note: fetch ne supporte pas directement timeout, mais on peut wrapper
        });
        
        console.log(`[CACHE] Fetch HTTP: Status=${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const allData = await response.json() as CacheData;
          const allKeys = Object.keys(allData);
          console.log(`[CACHE] Fetch HTTP: ${allKeys.length} entrées chargées`);
          console.log(`[CACHE] Clés disponibles (5 premières):`, allKeys.slice(0, 5));
          
          if (allData[key]) {
            console.log(`[CACHE] ✅ FETCH HIT: ${key}`);
            return allData[key];
          } else {
            // La clé n'existe pas dans le fichier
            console.warn(`[CACHE] ⚠️  FETCH: Clé ${key} NON TROUVÉE dans le fichier`);
            console.warn(`[CACHE] Clés disponibles dans ${date}.json:`, allKeys.slice(0, 10));
            
            // Vérifier si le fichier contient des données pour une autre date
            const dateKeys = allKeys.filter(k => k.startsWith(date));
            console.warn(`[CACHE] Nombre de clés pour la date ${date}: ${dateKeys.length}`);
            
            return null;
          }
        } else if (response.status === 404) {
          console.error(`[CACHE] ❌ FETCH: Fichier non trouvé - 404`);
          lastError = new Error(`Fichier ${date}.json non trouvé`);
        } else {
          console.error(`[CACHE] ❌ FETCH: Erreur HTTP - ${response.status}`);
          lastError = new Error(`HTTP ${response.status}`);
        }
        
        // Attendre avant le retry (exponential backoff)
        if (attempt < 2) {
          const delay = 1000 * Math.pow(2, attempt); // 1s, 2s
          console.log(`[CACHE] ⏳ Retry ${attempt + 1}/3 dans ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        }
        
      } catch (err) {
        lastError = err as Error;
        console.error(`[CACHE] ❌ FETCH: Erreur réseau (attempt ${attempt + 1}/3):`, err);
        
        if (attempt < 2) {
          const delay = 1000 * Math.pow(2, attempt);
          console.log(`[CACHE] ⏳ Retry ${attempt + 1}/3 dans ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    
    console.error(`[CACHE] ❌ TOUTES LES TENTATIVES FETCH ÉCHOUÉES pour ${key}`);
    if (lastError) {
      console.error(`[CACHE] Dernière erreur:`, lastError.message);
    }
  } else {
    console.log(`[CACHE] ⚠️  Pas de requête fournie, impossible de faire le fetch HTTP`);
  }

  // ===== ÉTAPE 2 : Filesystem (UNIQUEMENT pour développement local) =====
  // En production Netlify, cette étape sera IGNORÉE
  if (process.env.NODE_ENV === 'development' || !process.env.NETLIFY_URL) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'horoscopes', `${date}.json`);
      console.log(`[CACHE] Étape 2/2: Filesystem (dev) - Chemin: ${filePath}`);
      
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (fileExists) {
        console.log(`[CACHE] Filesystem: Fichier trouvé`);
        const content = await fs.readFile(filePath, 'utf-8');
        const allData = JSON.parse(content) as CacheData;
        const allKeys = Object.keys(allData);
        
        console.log(`[CACHE] Filesystem: ${allKeys.length} entrées chargées`);
        
        if (allData[key]) {
          console.log(`[CACHE] ✅ FILESYSTEM HIT: ${key}`);
          return allData[key];
        } else {
          console.warn(`[CACHE] Filesystem: Clé ${key} NON TROUVÉE`);
          console.warn(`[CACHE] Clés disponibles:`, allKeys.slice(0, 5));
        }
      } else {
        console.log(`[CACHE] Filesystem: Fichier NON TROUVÉ`);
      }
    } catch (err) {
      console.error(`[CACHE] Filesystem: ERREUR -`, err instanceof Error ? err.message : err);
    }
  } else {
    console.log(`[CACHE] ⚠️  Mode production: saut du filesystem (non disponible)`);
  }

  // ===== ÉTAPE 3 : Retourner null (fallback vers Mistral) =====
  console.error(`[CACHE] ❌ TOUTES LES SOURCES ÉCHOUÉES pour ${key}`);
  console.error(`[CACHE] → Passage à Netlify Blobs ou Mistral`);
  return null;
}

/**
 * Version simplifiée pour signe-du-jour (fichier différent)
 * Utilise la même logique : HTTP d'abord, filesystem en dev
 */
export async function loadSigneDuJourData(date: string, req?: any): Promise<any | null> {
  console.log(`[SIGNE-DU-JOUR] === Début récupération === date=${date}`);

  // Étape 1: Fetch HTTP (priorité)
  if (req) {
    const baseUrl = process.env.NETLIFY_URL 
      || process.env.VERCEL_URL
      || req.nextUrl?.origin
      || 'https://horoscope-karukera.netlify.app';
    
    const url = new URL(`/data/signe-du-jour/${date}.json`, baseUrl);
    console.log(`[SIGNE-DU-JOUR] Fetch HTTP: ${url.toString()}`);
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url.toString(), { cache: 'no-store' });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[SIGNE-DU-JOUR] ✅ FETCH HIT: ${date}`);
          return data;
        } else if (response.status !== 404) {
          console.error(`[SIGNE-DU-JOUR] Fetch HTTP: ÉCHEC - Status: ${response.status}`);
        }
        
        if (attempt < 2) {
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      } catch (err) {
        if (attempt < 2) {
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
  }

  // Étape 2: Filesystem (dev seulement)
  if (process.env.NODE_ENV === 'development') {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'signe-du-jour', `${date}.json`);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (fileExists) {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        console.log(`[SIGNE-DU-JOUR] ✅ FILESYSTEM HIT: ${date}`);
        return data;
      }
    } catch (err) {
      console.error(`[SIGNE-DU-JOUR] Filesystem:`, err instanceof Error ? err.message : err);
    }
  }

  console.error(`[SIGNE-DU-JOUR] ❌ TOUTES LES SOURCES ÉCHOUÉES pour ${date}`);
  return null;
}

/**
 * Version simplifiée pour ambiance (fichier différent)
 */
export async function loadAmbianceData(
  date: string,
  signId: string,
  edition: string,
  req?: any
): Promise<any | null> {
  const key = `${date}|${signId}|${edition}`;
  console.log(`[AMBIANCE] === Début récupération === date=${date}, sign=${signId}, edition=${edition}`);

  // Étape 1: Fetch HTTP (priorité)
  if (req) {
    const baseUrl = process.env.NETLIFY_URL 
      || process.env.VERCEL_URL
      || req.nextUrl?.origin
      || 'https://horoscope-karukera.netlify.app';
    
    const url = new URL(`/data/ambiance/${date}.json`, baseUrl);
    console.log(`[AMBIANCE] Fetch HTTP: ${url.toString()}`);
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url.toString(), { cache: 'no-store' });
        
        if (response.ok) {
          const allData = await response.json();
          if (allData[key]) {
            console.log(`[AMBIANCE] ✅ FETCH HIT: ${key}`);
            return allData[key];
          }
        }
        
        if (attempt < 2) {
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      } catch (err) {
        if (attempt < 2) {
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
  }

  // Étape 2: Filesystem (dev seulement)
  if (process.env.NODE_ENV === 'development') {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'ambiance', `${date}.json`);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (fileExists) {
        const content = await fs.readFile(filePath, 'utf-8');
        const allData = JSON.parse(content);
        
        if (allData[key]) {
          console.log(`[AMBIANCE] ✅ FILESYSTEM HIT: ${key}`);
          return allData[key];
        }
      }
    } catch (err) {
      console.error(`[AMBIANCE] Filesystem:`, err instanceof Error ? err.message : err);
    }
  }

  console.error(`[AMBIANCE] ❌ TOUTES LES SOURCES ÉCHOUÉES pour ${key}`);
  return null;
}

/**
 * Sauvegarde un horoscope individuel dans le fichier local (dev seulement)
 * Utilisé pour la génération à la volée
 */
export async function saveSingleHoroscope(
  date: string,
  signId: string,
  edition: string,
  data: any
): Promise<boolean> {
  if (process.env.NODE_ENV !== 'development') {
    console.log(`[SAVE] Ignoré en production (filesystem non disponible)`);
    return false;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'horoscopes', `${date}.json`);
    const dir = path.dirname(filePath);
    
    // Créer le dossier si nécessaire
    await fs.mkdir(dir, { recursive: true });
    
    // Charger le fichier existant ou créer un nouveau
    let allData: CacheData = {};
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      allData = JSON.parse(content);
    } catch {
      // Fichier n'existe pas, on part de vide
    }
    
    // Ajouter la nouvelle entrée
    const key = `${date}|${signId}|${edition}`;
    allData[key] = data;
    
    // Sauvegarder
    await fs.writeFile(filePath, JSON.stringify(allData, null, 2));
    console.log(`[SAVE] ✅ Sauvegardé: ${key} dans ${filePath}`);
    return true;
  } catch (err) {
    console.error(`[SAVE] ❌ Erreur:`, err instanceof Error ? err.message : err);
    return false;
  }
}
