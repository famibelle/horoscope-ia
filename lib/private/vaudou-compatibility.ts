/**
 * Système de compatibilité vaudou entre signes zodiacaux
 * Basé sur les affinités entre loas
 */

import { SIGN_TO_LOA } from './vaudou-mappings';
import { LoaEntry, getLoaByNom } from './vaudou-data';

// ============================================
// AFINITÉS ENTRE LOAS
// ============================================
// Ces affinités sont basées sur les traditions vaudou guadeloupéennes
// et les relations entre les différents esprits (loas)

const LOA_COMPATIBILITY: Record<string, { love: string[]; friendship: string[]; conflict: string[] }> = {
  // Rada (loas bénins)
  'Papa Legba': {
    love: ['Ezili Freda', 'Ezili Je Wouj'],
    friendship: ['Damballa', 'Ogoun', 'Loko', 'Agassou'],
    conflict: ['Kalfu', 'Bossou'] // Legba n'aime pas les esprits malicieux
  },
  'Damballa': {
    love: ['Mami Dlo', 'Ayizan'],
    friendship: ['Legba', 'Loko', 'Agassou', 'Mawu'],
    conflict: ['Baron Samedi', 'Kalfu', 'Marinette'] // Conflit eau/terre vs mort
  },
  'Ogoun': {
    love: ['Ezili Freda', 'Ezili Je Wouj', 'Azaka'],
    friendship: ['Legba', 'Gran Bwa', 'Adja'],
    conflict: ['Marinette', 'Simbi', 'Kalfu'] // Conflit feu vs eau
  },
  'Ezili Freda': {
    love: ['Ogoun', 'Agwe', 'La Sirène'],
    friendship: ['Damballa', 'Legba', 'Azaka', 'Maman Brigitte'],
    conflict: ['Baron Samedi', 'Kalfu', 'Bossou', 'Gede'] // Amour vs mort
  },
  'Ayizan': {
    love: ['Damballa', 'Mawu'],
    friendship: ['Legba', 'Loko', 'Azaka'],
    conflict: ['Baron Samedi', 'Kalfu']
  },
  'Loko': {
    love: ['Mami Dlo'],
    friendship: ['Legba', 'Damballa', 'Gran Bwa', 'Agassou'],
    conflict: ['Baron Samedi', 'Marinette']
  },
  'Mawu': {
    love: ['Damballa', 'Legba'],
    friendship: ['Loko', 'Agassou', 'Ayizan'],
    conflict: ['Kalfu', 'Bossou']
  },
  'Agassou': {
    love: ['Mawu', 'Damballa'],
    friendship: ['Legba', 'Loko', 'Ogoun'],
    conflict: ['Baron Samedi', 'Kalfu']
  },
  'Agwe': {
    love: ['Ezili Freda', 'Marinette', 'La Sirène'],
    friendship: ['Legba', 'Damballa', 'Ogoun'],
    conflict: ['Baron Samedi', 'Gede']
  },
  'La Sirène': {
    love: ['Agwe', 'Ezili Freda'],
    friendship: ['Damballa', 'Marinette', 'Legba'],
    conflict: ['Ogoun', 'Baron Samedi']
  },
  'Adja': {
    love: ['Ogoun'],
    friendship: ['Legba', 'Damballa', 'Azaka'],
    conflict: ['Kalfu', 'Bossou']
  },
  'Azaka': {
    love: ['Ogoun'],
    friendship: ['Legba', 'Damballa', 'Adja', 'Ayizan'],
    conflict: ['Kalfu', 'Marinette']
  },

  // Petro (loas violents/puissants)
  'Baron Samedi': {
    love: ['Maman Brigitte'],
    friendship: ['Gede', 'Kafou', 'Kalfu', 'Bossou'],
    conflict: ['Damballa', 'Ezili Freda', 'Mami Dlo', 'Agwe', 'La Sirène']
  },
  'Kalfu': {
    love: [],
    friendship: ['Baron Samedi', 'Bossou', 'Kafou', 'Kriminal'],
    conflict: ['Legba', 'Damballa', 'Ogoun', 'Ezili Freda', 'Ayizan', 'Mawu', 'Agassou', 'Agwe']
  },
  'Marinette': {
    love: ['Agwe'],
    friendship: ['Simbi', 'Damballa', 'La Sirène'],
    conflict: ['Ogoun', 'Baron Samedi', 'Gede', 'Loko']
  },
  'Simbi': {
    love: ['Mami Dlo'],
    friendship: ['Damballa', 'Marinette', 'Simbi Andezo'],
    conflict: ['Ogoun', 'Baron Samedi', 'Kalfu']
  },
  'Simbi Andezo': {
    love: ['Simbi'],
    friendship: ['Marinette', 'Damballa'],
    conflict: ['Ogoun', 'Baron Samedi']
  },
  'Erzulie Dantor': {
    love: ['Ogoun'],
    friendship: ['Ezili Freda', 'Baron Samedi'],
    conflict: ['Damballa', 'Legba']
  },
  'Bossou': {
    love: [],
    friendship: ['Baron Samedi', 'Kalfu', 'Kafou'],
    conflict: ['Legba', 'Damballa', 'Mawu', 'Agassou']
  },
  'Gran Bwa': {
    love: [],
    friendship: ['Ogoun', 'Legba', 'Loko'],
    conflict: ['Baron Samedi', 'Kalfu']
  },
  'Kafou': {
    love: [],
    friendship: ['Baron Samedi', 'Kalfu', 'Bossou'],
    conflict: ['Legba', 'Damballa', 'Mawu']
  },
  'Sanpwel': {
    love: [],
    friendship: ['Baron Samedi', 'Maman Brigitte'],
    conflict: ['Damballa', 'Legba']
  },
  'Ti Jean': {
    love: [],
    friendship: ['Legba', 'Kalfu'],
    conflict: ['Baron Samedi', 'Gede']
  },
  'Maman Brigitte': {
    love: ['Baron Samedi'],
    friendship: ['Gede', 'Sanpwel', 'Ezili Freda'],
    conflict: ['Damballa', 'Ogoun']
  },
  'Gede': {
    love: [],
    friendship: ['Baron Samedi', 'Maman Brigitte', 'Kafou'],
    conflict: ['Ezili Freda', 'Damballa', 'Legba']
  },
  'Gede Nibo': {
    love: [],
    friendship: ['Baron Samedi', 'Gede'],
    conflict: ['Damballa', 'Ezili Freda']
  },

  // Congo (loas ancestraux)
  'Zaka': {
    love: ['Ogoun'],
    friendship: ['Legba', 'Damballa', 'Adja', 'Ayizan'],
    conflict: ['Kalfu', 'Marinette', 'Simbi']
  },
  'La Balenn': {
    love: [],
    friendship: ['Agwe', 'Marinette'],
    conflict: ['Ogoun', 'Baron Samedi']
  },
  'Bokor': {
    love: [],
    friendship: ['Kalfu', 'Baron Samedi'],
    conflict: ['Legba', 'Damballa', 'Mawu']
  },
  'Kriminal': {
    love: [],
    friendship: ['Kalfu', 'Bossou'],
    conflict: ['Legba', 'Damballa', 'Ogoun']
  }
};

// ============================================
// MAPPING SIGNES → LOAS (pour référence)
// ============================================

// Inverser le mapping pour trouver le signe à partir du loa
function getSignFromLoa(loa: string): string | undefined {
  const entries = Object.entries(SIGN_TO_LOA);
  return entries.find(([sign, l]) => l === loa)?.[0];
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Récupère la compatibilité vaudou pour un signe donné
 * @param signId - L'ID du signe zodiacal (ex: 'belier', 'lion')
 * @returns La compatibilité amoureuse, amicale et de conflit basée sur les loas
 */
export function getVaudouCompatibility(signId: string): { love: string[]; friendship: string[]; conflict: string[] } {
  const loa = SIGN_TO_LOA[signId];
  
  if (!loa) {
    console.warn(`⚠️ Loa non trouvé pour le signe ${signId}`);
    return { love: [], friendship: [], conflict: [] };
  }

  const compat = LOA_COMPATIBILITY[loa];
  if (!compat) {
    console.warn(`⚠️ Aucune compatibilité définie pour le loa ${loa}`);
    return { love: [], friendship: [], conflict: [] };
  }

  return {
    love: compat.love.map(l => getSignFromLoa(l) || '').filter(Boolean),
    friendship: compat.friendship.map(l => getSignFromLoa(l) || '').filter(Boolean),
    conflict: compat.conflict.map(l => getSignFromLoa(l) || '').filter(Boolean)
  };
}

/**
 * Fusionne la compatibilité astrologique avec la compatibilité vaudou
 * @param signId - Le signe zodiacal
 * @param astroCompat - La compatibilité astrologique existante
 * @returns La compatibilité fusionnée
 */
export function mergeCompatibilities(signId: string, astroCompat: { love: string[]; friendship: string[]; conflict: string[] }): { love: string[]; friendship: string[]; conflict: string[] } {
  const vaudouCompat = getVaudouCompatibility(signId);

  return {
    love: Array.from(new Set([...astroCompat.love, ...vaudouCompat.love])),
    friendship: Array.from(new Set([...astroCompat.friendship, ...vaudouCompat.friendship])),
    conflict: Array.from(new Set([...astroCompat.conflict, ...vaudouCompat.conflict]))
  };
}

/**
 * Vérifie si deux signes sont compatibles selon le vaudou
 * @param sign1 - Premier signe
 * @param sign2 - Deuxième signe
 * @returns True si les signes sont compatibles (amour ou amitié), false sinon
 */
export function areVaudouCompatible(sign1: string, sign2: string): boolean {
  const compat = getVaudouCompatibility(sign1);
  return compat.love.includes(sign2) || compat.friendship.includes(sign2);
}

/**
 * Vérifie si deux signes sont en conflit selon le vaudou
 * @param sign1 - Premier signe
 * @param sign2 - Deuxième signe
 * @returns True si les signes sont en conflit, false sinon
 */
export function areVaudouInConflict(sign1: string, sign2: string): boolean {
  const compat = getVaudouCompatibility(sign1);
  return compat.conflict.includes(sign2);
}

// ============================================
// EXPORTS UTILITAIRES
// ============================================

export { SIGN_TO_LOA };
export type { LoaEntry };
