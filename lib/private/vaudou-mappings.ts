/**
 * Mappings entre le système astrologique et le système vaudou guadeloupéen
 * Ce fichier centralise toutes les correspondances pour une intégration cohérente
 */

import {
  loasData,
  animauxData,
  plantesData,
  objetsData,
  rituelsData,
  lieuxData,
  datesData,
  getLoaByNom,
  LoaEntry,
  AnimalEntry,
  PlanteEntry,
  ObjetEntry,
  RituelEntry
} from './vaudou-data';

// ============================================
// 1. MAPPING SIGNES ZODIACAUX → LOAS PRINCIPAUX
// ============================================
// Chaque signe est associé à un loa qui représente son énergie dominante

export const SIGN_TO_LOA: Record<string, string> = {
  belier: 'Ogoun',          // Dieu de la guerre, travail, justice → énergie combative du Bélier
  taureau: 'Azaka',         // Loa de l'agriculture, récoltes, stabilité → patience du Taureau
  gemeaux: 'Legba',         // Gardien des carrefours, communication → dualité des Gémeaux
  cancer: 'Mami Dlo',       // Esprit des eaux douces, maternité → émotion du Cancer
  lion: 'Ezili Freda',      // Déesse de l'amour, beauté, prospérité → passion du Lion
  vierge: 'Simbi',          // Esprit des sources, guérison, divination → analyse de la Vierge
  balance: 'Adja',          // Loa de la justice, équilibre → harmonie de la Balance
  scorpion: 'Baron Samedi', // Esprit de la mort, résurrection, transformation → intensité du Scorpion
  sagittaire: 'Gran Bwa',   // Esprit des forêts, arbres sacrés → aventure du Sagittaire
  capricorne: 'Kafou',       // Esprit des carrefours, voyages → ambition du Capricorne
  verseau: 'La Sirène',     // Esprit des eaux, séduction, mystère → originalité du Verseau
  poissons: 'Marinette'     // Esprit de la mer, tempêtes, protection → intuition des Poissons
};

// ============================================
// 2. MAPPING SIGNES → FAMILLES VAUDOU
// ============================================
// Les familles (Rada, Petro, Congo) ont des énergies différentes

export const SIGN_TO_FAMILLE: Record<string, 'Rada' | 'Petro' | 'Congo'> = {
  belier: 'Rada',      // Énergie positive, constructive
  taureau: 'Congo',    // Énergie ancestraire, terre
  gemeaux: 'Rada',     // Énergie de communication
  cancer: 'Rada',     // Énergie de protection, eau
  lion: 'Rada',       // Énergie de création, passion
  vierge: 'Petro',     // Énergie de transformation, analyse
  balance: 'Rada',     // Énergie d'équilibre
  scorpion: 'Petro',   // Énergie de puissance, transformation
  sagittaire: 'Rada',  // Énergie d'aventure
  capricorne: 'Petro', // Énergie de structure, ambition
  verseau: 'Rada',     // Énergie d'innovation
  poissons: 'Petro'    // Énergie d'intuition, mystère
};

// ============================================
// 3. CONTEXTE VAUDOU COMPLET PAR SIGNE
// ============================================
// Pour chaque signe : loa, couleurs, plante, animal, objet, lieu, rituel, emoji

export const SIGN_TO_VAUDOU_CONTEXT: Record<string, {
  loa: string;
  famille: 'Rada' | 'Petro' | 'Congo';
  couleurs: string[];
  plante: string;
  animal: string;
  objet: string;
  lieu: string;
  rituel: string;
  emoji: string;
  energie: string;
}> = {
  belier: {
    loa: 'Ogoun',
    famille: 'Rada',
    couleurs: ['vert', 'rouge'],
    plante: 'Fey zepin',
    animal: 'Kòk',
    objet: 'Mache',
    lieu: 'Kawoubouyé',
    rituel: 'Sacrifis',
    emoji: '⚔️',
    energie: 'Force, travail, justice'
  },
  taureau: {
    loa: 'Azaka',
    famille: 'Congo',
    couleurs: ['vert', 'jaune'],
    plante: 'Bwa bandé',
    animal: 'Kabrit',
    objet: 'Pwen blan',
    lieu: 'Kay zansèt',
    rituel: 'Mange loa',
    emoji: '🌾',
    energie: 'Stabilité, prospérité, agriculture'
  },
  gemeaux: {
    loa: 'Legba',
    famille: 'Rada',
    couleurs: ['rouge', 'noir'],
    plante: 'Piment bouc',
    animal: 'Pijòn',
    objet: 'Vèvè',
    lieu: 'Kawoubouyé',
    rituel: 'Chante Legba',
    emoji: '🔮',
    energie: 'Communication, choix, ouverture'
  },
  cancer: {
    loa: 'Mami Dlo',
    famille: 'Rada',
    couleurs: ['bleu', 'vert'],
    plante: 'Pwa dlo',
    animal: 'Lambi',
    objet: 'Pye dlo',
    lieu: 'Dlo',
    rituel: 'Banyè',
    emoji: '💧',
    energie: 'Émotion, intuition, protection'
  },
  lion: {
    loa: 'Ezili Freda',
    famille: 'Rada',
    couleurs: ['rose', 'blanc', 'bleu'],
    plante: 'Zéb omega',
    animal: 'Pijòn Zepòl',
    objet: 'Miroir',
    lieu: 'Peristil',
    rituel: 'Dans Ezili',
    emoji: '💖',
    energie: 'Amour, beauté, passion'
  },
  vierge: {
    loa: 'Simbi',
    famille: 'Petro',
    couleurs: ['bleu', 'vert'],
    plante: 'Fey siwo',
    animal: 'Chòval',
    objet: 'Pwen',
    lieu: 'Dlo',
    rituel: 'Desounen',
    emoji: '🌊',
    energie: 'Guérison, analyse, purification'
  },
  balance: {
    loa: 'Adja',
    famille: 'Rada',
    couleurs: ['blanc', 'jaune'],
    plante: 'Zerbenn',
    animal: 'Kòb',
    objet: 'Balance',
    lieu: 'Peristil',
    rituel: 'Mèsye',
    emoji: '⚖️',
    energie: 'Justice, équilibre, harmonie'
  },
  scorpion: {
    loa: 'Baron Samedi',
    famille: 'Petro',
    couleurs: ['noir', 'violet', 'blanc'],
    plante: 'Zerbenn maron',
    animal: 'Kochon',
    objet: 'Gede',
    lieu: 'Simityè',
    rituel: 'Vèyé',
    emoji: '☠️',
    energie: 'Transformation, mort, résurrection'
  },
  sagittaire: {
    loa: 'Gran Bwa',
    famille: 'Rada',
    couleurs: ['vert', 'marron'],
    plante: 'Mapou',
    animal: 'Chyen',
    objet: 'Bwa fè',
    lieu: 'Bwa lafòrè',
    rituel: 'Kanzo',
    emoji: '🌳',
    energie: 'Aventure, forêt, liberté'
  },
  capricorne: {
    loa: 'Kafou',
    famille: 'Petro',
    couleurs: ['rouge', 'noir'],
    plante: 'Bwa kachiman',
    animal: 'Rat',
    objet: 'Kòd',
    lieu: 'Kawoubouyé Gran Chemin',
    rituel: 'Gran Débara',
    emoji: '🗺️',
    energie: 'Voyage, carrefour, ambition'
  },
  verseau: {
    loa: 'La Sirène',
    famille: 'Rada',
    couleurs: ['vert', 'or'],
    plante: 'Zéb lavann',
    animal: 'Dorad',
    objet: 'Kòkòy',
    lieu: 'Dlo Lanmè',
    rituel: 'Chante La Sirène',
    emoji: '🧜',
    energie: 'Originalité, eau, mystère'
  },
  poissons: {
    loa: 'Marinette',
    famille: 'Petro',
    couleurs: ['bleu', 'blanc'],
    plante: 'Cerasee',
    animal: 'Matoutou',
    objet: 'Krab',
    lieu: 'Trou a Zimbis',
    rituel: 'Fumigasion',
    emoji: '🌊',
    energie: 'Intuition, mer, protection'
  }
};

// ============================================
// 4. CONTEXTE VAUDOU PAR ÉDITION (matin/midi/soir/nuit)
// ============================================

export const EDITION_TO_VAUDOU_CONTEXT: Record<string, {
  loa: string;
  energie: string;
  conseil: string;
  emoji: string;
  couleur: string;
  plante: string;
  rituel: string;
}> = {
  matin: {
    loa: 'Legba',
    energie: 'Ouverture des chemins spirituels et des portes entre les mondes',
    conseil: 'Imagine une bougie allumée devant toi, symbole de lumière et de guidance spirituelle — laisse Legba ouvrir les chemins de ta journée.',
    emoji: '🌅',
    couleur: 'blanc',
    plante: 'Piment bouc',
    rituel: 'Chante Legba'
  },
  midi: {
    loa: 'Ogoun',
    energie: 'Force, travail et justice pour accomplir vos tâches',
    conseil: 'Symbolise la coupure des énergies négatives avec un geste de la main, comme une lame invisible guidée par Ogoun.',
    emoji: '☀️',
    couleur: 'vert',
    plante: 'Fey zepin',
    rituel: 'Sacrifis'
  },
  soir: {
    loa: 'Baron Samedi',
    energie: 'Transformation, réflexion et connexion avec les ancêtres',
    conseil: 'Contemple une flamme sacrée dans ton esprit, symbole de transformation et de purification — Baron Samedi veille sur tes passages.',
    emoji: '🌇',
    couleur: 'noir',
    plante: 'Zerbenn maron',
    rituel: 'Vèyé'
  },
  nuit: {
    loa: 'Gede',
    energie: 'Communication avec les esprits et les rêves',
    conseil: 'Invoque l\'énergie du rhum dans tes rituels (sans ingestion), symbole de joies partagées et de convivialité avec les esprits de Gede.',
    emoji: '🌙',
    couleur: 'violet',
    plante: 'Pwa dlo',
    rituel: 'Kanzo pou Gede'
  }
};

// ============================================
// 5. FONCTIONS UTILITAIRES PRINCIPALES
// ============================================

/**
 * Récupère le contexte vaudou complet pour un signe donné
 */
export function getVaudouContextForSign(signId: string) {
  const normalizedSignId = signId.toLowerCase();
  const loa = SIGN_TO_LOA[normalizedSignId];
  const famille = SIGN_TO_FAMILLE[normalizedSignId];
  const context = SIGN_TO_VAUDOU_CONTEXT[normalizedSignId];
  
  if (!loa || !famille || !context) {
    return {
      loa: 'Legba',
      loaData: getLoaByNom('Papa Legba'),
      famille: 'Rada',
      elements: SIGN_TO_VAUDOU_CONTEXT.belier
    };
  }

  return {
    loa,
    loaData: getLoaByNom(loa),
    famille,
    elements: context
  };
}

/**
 * Récupère un conseil vaudou personnalisé pour un signe et une édition
 */
export function getVaudouTipForSign(signId: string, edition: string) {
  const normalizedSignId = signId.toLowerCase();
  const normalizedEdition = edition.toLowerCase();
  
  const signContext = SIGN_TO_VAUDOU_CONTEXT[normalizedSignId];
  const editionContext = EDITION_TO_VAUDOU_CONTEXT[normalizedEdition];
  
  if (!signContext || !editionContext) {
    return {
      message: 'Les esprits de Karukera vous protègent aujourd\'hui.',
      conseil: 'Imagine une bougie allumée devant toi, symbole de lumière et de guidance spirituelle — laisse Legba ouvrir tes chemins.',
      emoji: '🕯️',
      loa: 'Legba',
      couleurs: ['blanc']
    };
  }

  return {
    message: `Aujourd'hui, ${signContext.loa} (${signContext.emoji}), loa de ${signContext.energie.toLowerCase()}, vous accompagne avec l'énergie de ${editionContext.energie.toLowerCase()}.`,
    conseil: editionContext.conseil,
    emoji: editionContext.emoji,
    loa: signContext.loa,
    couleurs: signContext.couleurs
  };
}

/**
 * Récupère un élément vaudou aléatoire d'un type donné
 */
export function getRandomVaudouElement(type: 'loa' | 'plante' | 'animal' | 'objet' | 'rituel' | 'lieu') {
  const dataMap: Record<string, any[]> = {
    loa: loasData,
    plante: plantesData,
    animal: animauxData,
    objet: objetsData,
    rituel: rituelsData,
    lieu: lieuxData
  };
  
  const data = dataMap[type] || [];
  if (data.length === 0) return null;
  
  return data[Math.floor(Math.random() * data.length)];
}

/**
 * Récupère un élément vaudou par son nom créole ou français
 */
export function getVaudouElementByName(name: string, type: 'loa' | 'plante' | 'animal' | 'objet' | 'rituel' | 'lieu') {
  const dataMap: Record<string, any[]> = {
    loa: loasData,
    plante: plantesData,
    animal: animauxData,
    objet: objetsData,
    rituel: rituelsData,
    lieu: lieuxData
  };
  
  const data = dataMap[type] || [];
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return data.find(e =>
    e.nomCreole.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized) ||
    e.nomFrancais.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  ) || null;
}

/**
 * Récupère le contexte pour une date rituelle spécifique
 */
export function getRitualDateContext(date: string) {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1; // 1-12
  const day = dateObj.getDate(); // 1-31
  const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // Chercher dans les dates rituelles
  const dateRituelle = datesData.find(d => d.datePeriod.includes(monthDay));
  if (!dateRituelle) return null;
  
  return {
    ...dateRituelle
  };
}

// ============================================
// 6. EXPORT DES DATES RITUELLES (simplifié)
// ============================================
// Extraction des dates importantes pour les vérifier facilement

export const RITUAL_DATES = [
  { date: '11-01', name: 'Toussaint', loa: 'Baron Samedi', theme: 'Honneur aux morts' },
  { date: '11-02', name: 'Fête des Morts', loa: 'Gede', theme: 'Cérémonies pour les ancêtres' },
  { date: '02-15', name: "Fête d'Ezili", loa: 'Ezili Freda', theme: 'Amour et beauté' },
  { date: '03-01', name: "Fête de Damballa", loa: 'Damballa', theme: 'Sagesse et paix' },
  { date: '05-01', name: "Fête d'Ogoun", loa: 'Ogoun', theme: 'Travail et force' },
  { date: '12-25', name: 'Noël', loa: 'Damballa', theme: 'Paix familiale' },
  { date: '01-01', name: 'Nouvel An', loa: 'Legba', theme: 'Nouveaux débuts' },
  { date: '04-01', name: 'Poisson d\'avril', loa: 'Marinette', theme: 'Farces et joie' }
];

/**
 * Vérifie si une date est une date rituelle vaudou
 */
export function isRitualDate(date: string): boolean {
  const dateObj = new Date(date);
  const monthDay = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
  return RITUAL_DATES.some(d => d.date === monthDay);
}

/**
 * Récupère toutes les informations vaudou pour une date donnée
 */
export function getFullVaudouContext(date: string, signId: string, edition: string) {
  const signContext = getVaudouContextForSign(signId);
  const editionContext = EDITION_TO_VAUDOU_CONTEXT[edition];
  const ritualDate = getRitualDateContext(date);
  const isRitual = isRitualDate(date);

  return {
    sign: signId,
    date,
    edition,
    signVaudou: signContext,
    editionVaudou: editionContext,
    isRitualDate: isRitual,
    ritualDate: ritualDate ? {
      name: ritualDate.nomFrancais,
      creole: ritualDate.nomCreole,
      theme: ritualDate.dimensionCulturelle.split('.')[0],
      loa: ritualDate.famille
    } : null
  };
}

// ============================================
// 7. EXPORTS POUR COMPATIBILITÉ AVEC LE CODE EXISTANT
// ============================================

// Réexport des données principales
import { vaudouData } from './vaudou-data';
export { vaudouData };

// Export des fonctions de recherche
export {
  getLoaByNom
} from './vaudou-data';

// Export de tous les types
export type {
  LoaEntry,
  AnimalEntry,
  PlanteEntry,
  ObjetEntry,
  RituelEntry,
  LieuEntry
} from './vaudou-data';
