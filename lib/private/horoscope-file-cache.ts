/**
 * Horoscope File Cache System
 * 
 * Système de cache multi-niveaux pour les horoscopes :
 * 1. Cache en mémoire (le plus rapide)
 * 2. Lecture directe depuis le filesystem (pour Netlify/Next.js)
 * 3. Fallback vers fetch HTTP
 * 
 * Ce module résout le problème récurrent où les fichiers JSON générés
 * n'étaient pas pris en compte par les API routes.
 */

import { promises as fs } from 'fs';
import path from 'path';

type CacheData = Record<string, any>;

// Cache en mémoire pour éviter les lectures disque répétées
const inMemoryCache: Record<string, CacheData> = {};

/**
 * Charge les données d'horoscope pour une date donnée depuis le filesystem
 * 
 * @param date - Date au format YYYY-MM-DD
 * @returns Les données complètes pour cette date, ou null si non trouvé
 */
export async function loadDateCache(date: string): Promise<CacheData | null> {
  // Déjà en mémoire ?
  if (inMemoryCache[date]) {
    return inMemoryCache[date];
  }

  // Essayer de lire depuis le filesystem (public/data/horoscopes/)
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'horoscopes', `${date}.json`);
    
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      console.log(`[CACHE] Fichier non trouvé: ${filePath}`);
      return null;
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as CacheData;
    
    // Stocker en mémoire pour les prochaines requêtes
    inMemoryCache[date] = data;
    console.log(`[CACHE] Chargé ${Object.keys(data).length} horoscopes pour ${date}`);
    
    return data;
  } catch (err) {
    console.error(`[CACHE] Erreur lecture fichier ${date}:`, err instanceof Error ? err.message : err);
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
    console.log(`[CACHE] Aucune donnée en cache pour ${date}`);
    return null;
  }
  
  const result = data[key];
  if (result) {
    console.log(`[CACHE HIT] ${key}`);
  } else {
    console.warn(`[CACHE MISS] Clé ${key} non trouvée. Clés disponibles:`, Object.keys(data).slice(0, 5));
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
  console.log(`[CACHE] Cache effacé (${Object.keys(inMemoryCache).length} entrées)`);
}

/**
 * Précharge le cache pour plusieurs dates
 * 
 * @param dates - Liste de dates au format YYYY-MM-DD
 */
export async function preloadCache(dates: string[]): Promise<void> {
  console.log(`[CACHE] Préchargement pour ${dates.length} dates...`);
  
  for (const date of dates) {
    await loadDateCache(date);
  }
  
  console.log(`[CACHE] Préchargement terminé. ${Object.keys(inMemoryCache).length} dates en cache.`);
}

/**
 * Obtient les statistiques du cache
 */
export function getCacheStats(): { dates: string[]; totalEntries: number } {
  const dates = Object.keys(inMemoryCache);
  const totalEntries = dates.reduce((sum, date) => sum + Object.keys(inMemoryCache[date] || {}).length, 0);
  return { dates, totalEntries };
}
