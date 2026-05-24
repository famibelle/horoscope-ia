/**
 * 🛡️ Système de Garde-Fous pour Contenu Sécurisé
 * 
 * Ce module définit les règles de sécurité pour filtrer les instructions
 * potentiellement dangereuses dans les textes générés par Mistral.
 * 
 * Principes :
 * - Remplacer les actions physiques par des visualisations spirituelles
 * - Respecter la culture Vaudou tout en assurant la sécurité
 * - Priorité 0 = critique (doit être remplacé ABSOLUMENT)
 * - Priorité 1 = important (doit être remplacé si possible)
 * - Priorité 2 = conseillé (remplacement souhaitable)
 */

export type SafetyCategory = 
  | 'fire'              // Feu, bougies, encens
  | 'ingestion'         // Ingestion de plantes, aliments, boissons
  | 'physical'          // Actions physiques dangereuses
  | 'medical'           // Conseils médicaux non qualifiés
  | 'illegal'           // Activités illégales
  | 'dangerous_objects' // Objets tranchants, pointus, lourds
  | 'animal'            // Manipulation d'animaux
  | 'financial'         // Conseils financiers risqués
  | 'self_harm'         // Auto-mutilation, comportement à risque
  | 'superstition'      // Superstitions potentiellement nuisibles
;

/**
 * Définition d'une règle de sécurité
 */
export interface SafetyRule {
  id: string;
  category: SafetyCategory;
  patterns: RegExp[];
  replacement: string;
  examples: {
    before: string[];
    after: string[];
  };
  priority: number;
  context?: string;
}

/**
 * Base de règles de sécurité pour le contenu Vaudou
 */
export const SAFETY_RULES: SafetyRule[] = [
  // ========================================================================
  // 🔥 PRIORITÉ 0 - RÈGLES CRITIQUES
  // ========================================================================

  // --- FEU / BOUGIES / ENSENCENS ---
  {
    id: 'fire_candle_light_verb',
    category: 'fire',
    patterns: [
      /allume[s]?\s+(une?|la|des?|\w+\s+)?bougie/gi,
      /allume[s]?\s+(une?|l'?|des?)\s*candélabre/gi,
      /allume[s]?\s+(un|le|des?)\s*encens/gi,
      /allume[s]?\s+le\s+feu/gi,
      /mets?\s+le\s+feu\s+à/gi,
      /brûle[s]?\s+(une?|la|des?)\s*bougie/gi,
      /fais?\s+brûler\s+(une?|la|des?)\s*bougie/gi,
      /enflamme[s]?\s+(une?|la)\s*bougie/gi,
      /embrasse\s+la\s*flamme/gi,
    ],
    replacement: 'Imagine une bougie allumée devant toi, symbole de lumière et de guidance spirituelle',
    examples: {
      before: ['Allume une bougie', 'Allumez la bougie rouge', 'Brûle une bougie noire'],
      after: ['Imagine une bougie allumée devant toi...'],
    },
    priority: 0,
  },
  {
    id: 'fire_incense_burn',
    category: 'fire',
    patterns: [
      /fais?\s+brûler\s+(un|de\s+l'?|du)\s*encens/gi,
      /allume[s]?\s+(de\s+l'?|du)\s*encens/gi,
      /brûle[s]?\s+(de\s+l'?|du)\s*encens/gi,
      /fais?\s+fumer\s+(l'?|le)\s*encens/gi,
    ],
    replacement: 'Visualise une fumée d\'encens montant vers les Loas, porteuse de tes intentions',
    priority: 0,
  },
  {
    id: 'fire_open_flame',
    category: 'fire',
    patterns: [
      /ouvre[s]?\s+le\s+feu/gi,
      /active[s]?\s+la\s+flamme/gi,
      /créé[s]?\s+un\s+feu/gi,
      /allume[s]?\s+un\s+brasier/gi,
      /mets?\s+le\s+feu\s+à\s+\w+/gi,
    ],
    replacement: 'Contemple une flamme sacrée dans ton esprit, symbole de transformation et de purification',
    priority: 0,
  },

  // --- INGESTION ---
  {
    id: 'ingestion_poisonous_plants',
    category: 'ingestion',
    patterns: [
      /mange[s]?\s+(une?|la|des?|\w+\s+)?feuille/gi,
      /mange[s]?\s+(une?|la|des?|\w+\s+)?plante/gi,
      /mange[s]?\s+(une?|la|des?|\w+\s+)?herbe/gi,
      /mange[s]?\s+(une?|la|des?|\w+\s+)?racine/gi,
      /consomme[s]?\s+(une?|la|des?|\w+\s+)?plante\s+sacrée/gi,
      /consomme[s]?\s+(une?|la|des?|\w+\s+)?herbe\s+médicinale/gi,
      /aval[e]?\s+(une?|la|des?)\s*plante/gi,
      /ingère[s]?\s+(une?|la|des?)\s*plante/gi,
    ],
    replacement: 'Médite sur les propriétés spirituelles de cette plante, sans consommation physique',
    priority: 0,
  },
  {
    id: 'ingestion_alcohol_rhum',
    category: 'ingestion',
    patterns: [
      /bois?\s+(un|du|le)\s*rhum/gi,
      /consomme[s]?\s+(du|le)\s*rhum/gi,
      /prends?\s+(un|du)\s*rhum/gi,
      /mange[s]?\s+du\s*rhum/gi,
    ],
    replacement: 'Invoque l\'énergie du rhum dans tes rituels (sans ingestion), symbole de joies partagées et de convivialité',
    priority: 0,
  },
  {
    id: 'ingestion_unknown_substance',
    category: 'ingestion',
    patterns: [
      /bois?\s+(une?|la|\w+)\s+potion/gi,
      /consomme[s]?\s+(une?|la)\s*mixture/gi,
      /aval[e]?\s+(une?|la)\s*décoction/gi,
      /prends?\s+(une?|la)\s*infusion/gi,
      /bois?\s+(une?|la)\s*tisane\s+de/gi,
    ],
    replacement: 'Laisse-toi guider par les énergies bienveillantes, sans ingestion de substance non identifiée',
    priority: 0,
  },

  // --- OBJETS DANGEREUX ---
  {
    id: 'physical_knife_use',
    category: 'dangerous_objects',
    patterns: [
      /prends?\s+(un|le|\w+)\s*couteau/gi,
      /utilise[s]?\s+(un|le|\w+)\s*couteau\s+pour/gi,
      /coupe[s]?\s+avec\s+(un|le)\s*couteau/gi,
      /saisis?\s+(un|le)\s*couteau/gi,
      /manie[s]?\s+(un|le)\s*couteau/gi,
      /tranche[s]?\s+avec\s+(un|le)\s*couteau/gi,
    ],
    replacement: 'Symbolise la coupure des énergies négatives avec un geste de la main, comme une lame invisible',
    priority: 0,
  },
  {
    id: 'physical_needle_use',
    category: 'dangerous_objects',
    patterns: [
      /pique[s]?\s+toi\s+avec\s+(une?|la)\s*aiguille/gi,
      /pique[s]?\s+vous\s+avec\s+(une?|la)\s*aiguille/gi,
      /utilise[s]?\s+(une?|la)\s*aiguille\s+pour/gi,
      /perce[s]?\s+(ta|votre|la)\s*peau\s+avec/gi,
      /plante[s]?\s+(une?|la)\s*aiguille\s+dans/gi,
    ],
    replacement: 'Trace un cercle protecteur dans l\'air avec ton index, comme une aiguille invisible',
    priority: 0,
  },
  {
    id: 'physical_glass_break',
    category: 'dangerous_objects',
    patterns: [
      /casse[s]?\s+(un|le|des?|\w+)\s*verre/gi,
      /brise[s]?\s+(un|le|des?|\w+)\s*bouteille/gi,
      /frappe[s]?\s+(un|le)\s*verre\s+contre/gi,
      /lance[s]?\s+(un|le)\s*verre/gi,
    ],
    replacement: 'Visualise la lumière se brisant en mille éclats d\'énergie positive autour de toi',
    priority: 0,
  },

  // --- ANIMAUX ---
  {
    id: 'animal_sacrifice',
    category: 'animal',
    patterns: [
      /sacrifie[s]?\s+(un|le|des?|\w+)\s*animal/gi,
      /tue[s]?\s+(un|le|des?|\w+)\s*animal\s+pour/gi,
      /immole[s]?\s+(un|le|des?|\w+)\s*animal/gi,
    ],
    replacement: 'Honore l\'esprit de l\'animal sacré (ex: Damballa) par des offrandes symboliques comme des fleurs ou des fruits',
    priority: 0,
  },
  {
    id: 'animal_harm',
    category: 'animal',
    patterns: [
      /bats?\s+(un|le|des?|\w+)\s*animal/gi,
      /frappe[s]?\s+(un|le|des?|\w+)\s*animal/gi,
      /blesse[s]?\s+(un|le|des?|\w+)\s*animal/gi,
    ],
    replacement: 'Traite tous les êtres vivants avec respect et bienveillance',
    priority: 0,
  },

  // --- MÉDICAL ---
  {
    id: 'medical_self_treatment',
    category: 'medical',
    patterns: [
      /soigne[s]?\s+toi\s+avec/gi,
      /soigne[s]?\s+vous\s+avec/gi,
      /guéris?[s]?\s+(ta|tes?|votre|tes)\s+blessure/gi,
      /traite[s]?\s+(ta|votre|tes?)\s+maladie/gi,
      /arrête[s]?\s+tes?\s*médicaments/gi,
    ],
    replacement: 'Consulte un professionnel de santé pour tout traitement physique. Le Vaudou accompagne, mais ne remplace pas la médecine.',
    priority: 0,
  },
  {
    id: 'medical_diagnosis',
    category: 'medical',
    patterns: [
      /diagnostique[s]?\s+(ta|votre|une?)\s+maladie/gi,
      /détecte[s]?\s+(une?|la)\s+maladie/gi,
    ],
    replacement: 'Écoute ton corps et consulte un médecin pour tout symptôme persistant',
    priority: 0,
  },

  // --- ILLÉGAL ---
  {
    id: 'illegal_activity',
    category: 'illegal',
    patterns: [
      /vole[s]?\s+(un|le|des?|\w+)/gi,
      /dérobe[s]?\s+(un|le|des?|\w+)/gi,
      /fraude[s]?\s+/gi,
      /triche[s]?\s+/gi,
    ],
    replacement: 'Agis toujours avec intégrité et respect des lois',
    priority: 0,
  },
  {
    id: 'illegal_drugs',
    category: 'illegal',
    patterns: [
      /consomme[s]?\s+(de\s+la|de\s+la\s+|\w+)\s+drogue/gi,
      /prends?\s+(de\s+la|\w+)\s+drogue/gi,
      /fume[s]?\s+(de\s+la|\w+)\s+drogue/gi,
    ],
    replacement: 'Ton corps est un temple sacré. Prends soin de toi avec amour et respect.',
    priority: 0,
  },

  // --- SELF-HARM ---
  {
    id: 'self_harm_physical',
    category: 'self_harm',
    patterns: [
      /blesse[s]?\s+toi/gi,
      /fais?[s]?\s+toi\s+du\s+mal/gi,
      /coupe[s]?\s+toi/gi,
      /brûle[s]?\s+toi/gi,
    ],
    replacement: 'Tu es précieux(se) et digne d\'amour. Traite-toi avec la même bienveillance que tu offrirais à un être cher.',
    priority: 0,
  },

  // ========================================================================
  // ⚠️ PRIORITÉ 1 - RÈGLES IMPORTANTES
  // ========================================================================

  {
    id: 'ingestion_herbal_tea',
    category: 'ingestion',
    patterns: [
      /prépare[s]?\s+une\s+infusion/gi,
      /fais?[s]?\s+une\s+tisane/gi,
      /prépare[s]?\s+une\s+décoction/gi,
    ],
    replacement: 'Prépare toi une boisson chaude réconfortante (eau, thé classique) et médite sur ses bienfaits',
    priority: 1,
  },
  {
    id: 'superstition_bad_luck',
    category: 'superstition',
    patterns: [
      /porte[s]?\s+(la\s+)?poisse/gi,
      /attire[s]?\s+(la\s+)?malchance/gi,
    ],
    replacement: 'Libère-toi des énergies négatives par la visualisation de lumière blanche',
    priority: 1,
  },
  {
    id: 'superstition_evil_eye',
    category: 'superstition',
    patterns: [
      /mauvais\s+œil/gi,
      /jet[s]?\s+(un|le)\s+mauvais\s+sort/gi,
    ],
    replacement: 'Protège-toi par la visualisation d\'un bouclier de lumière dorée',
    priority: 1,
  },

  // ========================================================================
  // ℹ️ PRIORITÉ 2 - RÈGLES CONSEILLÉES
  // ========================================================================

  {
    id: 'financial_high_risk',
    category: 'financial',
    patterns: [
      /investis?[s]?\s+tout\s+ton\s+argent/gi,
      /mets?\s+tout\s+tes?\s+économies/gi,
    ],
    replacement: 'Investis avec sagesse, en diversifiant tes ressources',
    priority: 2,
  },
  {
    id: 'extreme_quit_everything',
    category: 'physical',
    patterns: [
      /quit[e]?\s+ton\s+travail\s+immédiatement/gi,
      /démissionne[s]?\s+sans\s+réfléchir/gi,
    ],
    replacement: 'Prends le temps de réfléchir à toutes les options avant toute décision importante',
    priority: 2,
  },
];

export const SAFETY_CATEGORIES: Record<SafetyCategory, { emoji: string; description: string }> = {
  fire: { emoji: '🔥', description: 'Feu, bougies, encens' },
  ingestion: { emoji: '🚫', description: 'Ingestion de substances' },
  physical: { emoji: '⚠️', description: 'Actions physiques dangereuses' },
  medical: { emoji: '🏥', description: 'Conseils médicaux' },
  illegal: { emoji: '🚨', description: 'Activités illégales' },
  dangerous_objects: { emoji: '✂️', description: 'Objets dangereux' },
  animal: { emoji: '🐍', description: 'Manipulation d\'animaux' },
  financial: { emoji: '💰', description: 'Conseils financiers risqués' },
  self_harm: { emoji: '🤲', description: 'Comportement auto-destructeur' },
  superstition: { emoji: '🔮', description: 'Superstitions nuisibles' },
};

export function getRulesByCategory(category: SafetyCategory): SafetyRule[] {
  return SAFETY_RULES.filter(rule => rule.category === category);
}

export function getRulesByPriority(): SafetyRule[] {
  return [...SAFETY_RULES].sort((a, b) => a.priority - b.priority);
}

export function getRuleById(id: string): SafetyRule | undefined {
  return SAFETY_RULES.find(rule => rule.id === id);
}
