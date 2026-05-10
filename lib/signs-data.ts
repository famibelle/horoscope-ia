export type Element = 'Feu' | 'Terre' | 'Air' | 'Eau';

export interface Sign {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  dateRange: string;
  element: Element;
  planet: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  /* Données zodiak_kreyol_ref.md */
  animal: string;
  nomKreyol: string;
  plante: string;
  arbre: string;
  lieu: string;
  spirituel: string;
}

export const signs: Sign[] = [
  {
    id: 'belier',
    name: 'Bélier',
    emoji: '♈',
    tagline: 'courage & pionnière',
    dateRange: '21 mars – 19 avril',
    element: 'Feu',
    planet: 'Mars',
    gradientFrom: '#ef4444',
    gradientTo: '#f97316',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    animal: 'Iguane / Gwo Zandoli',
    nomKreyol: 'Gwo Zandoli',
    plante: 'Flamboyant',
    arbre: 'Flanbwayan',
    lieu: 'Pointe des Châteaux',
    spirituel:
      "Animal totem des Arawaks. « Zandoli sav si ki pyébwa i ka monté » — il sait sur quel arbre grimper. Fougue, ambition, résistance. Le flamboyant flamboie rouge au moment de son retour au printemps.",
  },
  {
    id: 'taureau',
    name: 'Taureau',
    emoji: '♉',
    tagline: 'sensualité & ancrage',
    dateRange: '20 avril – 20 mai',
    element: 'Terre',
    planet: 'Vénus',
    gradientFrom: '#22c55e',
    gradientTo: '#10b981',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    animal: 'Bœuf créole / Bèf a Bos',
    nomKreyol: 'Bèf a Bos',
    plante: 'Orchidée / Vanilier',
    arbre: 'Awokasié (Avocatier)',
    lieu: 'Fête des Grands-Fonds (Sainte-Anne)',
    spirituel:
      "Persévérance et travail. La course de bœufs de Sainte-Anne est son rituel annuel. La vanille — patience de la pollinisation manuelle — est sa plante de résistance économique.",
  },
  {
    id: 'gemeaux',
    name: 'Gémeaux',
    emoji: '♊',
    tagline: 'curiosité & vivacité',
    dateRange: '21 mai – 20 juin',
    element: 'Air',
    planet: 'Mercure',
    gradientFrom: '#f59e0b',
    gradientTo: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    animal: 'Colibri huppé / Foufou',
    nomKreyol: 'Foufou / Fwou-fwou',
    plante: 'Alpinia / Lavande rouge',
    arbre: 'Gommié blan (Gommier)',
    lieu: 'Jardin botanique de Deshaies',
    spirituel:
      "Dualité et rapidité. Le colibri est le seul oiseau qui vole en arrière — capacité à voir les deux côtés. Pollinisateur de tout le jardin créole. Son nom vient directement des Arawaks.",
  },
  {
    id: 'cancer',
    name: 'Cancer',
    emoji: '♋',
    tagline: 'intuition & tendresse',
    dateRange: '21 juin – 22 juillet',
    element: 'Eau',
    planet: 'Lune',
    gradientFrom: '#38bdf8',
    gradientTo: '#818cf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    animal: 'Crabe rouge / Touloulou',
    nomKreyol: 'Touloulou',
    plante: 'Dachine / Balisier',
    arbre: 'Palétuwyé (Palétuvier)',
    lieu: 'Grand Cul-de-Sac Marin / Mangrove',
    spirituel:
      "Animal kalinago par excellence — nom intact depuis les origines. Vit dans les eaux saumâtres entre terre et mer, comme le Cancer entre deux mondes. La mangrove est son territoire sacré.",
  },
  {
    id: 'lion',
    name: 'Lion',
    emoji: '♌',
    tagline: 'leadership & rayonnement',
    dateRange: '23 juillet – 22 août',
    element: 'Feu',
    planet: 'Soleil',
    gradientFrom: '#f59e0b',
    gradientTo: '#ef4444',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    animal: 'Pélican brun / Gran Pélikan',
    nomKreyol: 'Gran Pélikan',
    plante: 'Strelitzia / Balizié',
    arbre: 'Flanbwayan',
    lieu: 'Pointe de la Grande Vigie',
    spirituel:
      "Majesté et rayonnement. Le pélican plane au-dessus de tous. Totem des pêcheurs côtiers. Le flamboyant flamboie à son apogée en juillet-août — mois de son règne.",
  },
  {
    id: 'vierge',
    name: 'Vierge',
    emoji: '♍',
    tagline: 'précision & sagesse',
    dateRange: '23 août – 22 septembre',
    element: 'Terre',
    planet: 'Mercure',
    gradientFrom: '#14b8a6',
    gradientTo: '#22c55e',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    animal: 'Mangouste / Mango blan',
    nomKreyol: 'Mango blan',
    plante: "Panache d'officier / Plumet jaune",
    arbre: 'Manguié (Manguier)',
    lieu: 'Chutes du Carbet',
    spirituel:
      "Précision, discernement, sens du devoir. La mangouste observe avant d'agir. Le manguier donne ses fruits avec une rigueur saisonnière parfaite. Les Chutes du Carbet — eau pure et ordonnée — sont son sanctuaire.",
  },
  {
    id: 'balance',
    name: 'Balance',
    emoji: '♎',
    tagline: 'harmonie & élégance',
    dateRange: '23 septembre – 22 octobre',
    element: 'Air',
    planet: 'Vénus',
    gradientFrom: '#ec4899',
    gradientTo: '#f472b6',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    animal: 'Lamantin / Manman dlo',
    nomKreyol: 'Manman dlo',
    plante: 'Grangouzie / Hibiscus',
    arbre: 'Zanmann (Amandier plage)',
    lieu: 'Rivière Salée',
    spirituel:
      "Harmonie et passage. Le lamantin est l'être-frontière par excellence entre eau et terre — origine des légendes de sirènes. La Rivière Salée sépare et unit les deux îles de la Guadeloupe comme la Balance équilibre tout.",
  },
  {
    id: 'scorpion',
    name: 'Scorpion',
    emoji: '♏',
    tagline: 'profondeur & intensité',
    dateRange: '23 octobre – 21 novembre',
    element: 'Eau',
    planet: 'Pluton',
    gradientFrom: '#7c3aed',
    gradientTo: '#be123c',
    glowColor: 'rgba(124, 58, 237, 0.5)',
    animal: 'Scarabée Hercule / Hèrkil',
    nomKreyol: 'Hèrkil',
    plante: 'Aloès vera / Alowes',
    arbre: 'Kalbasi (Calebassier)',
    lieu: 'La Soufrière',
    spirituel:
      "Puissance cachée, transformation. Le scarabée Hercule est le plus grand insecte des Antilles — force immense sous une carapace. L'aloès guérit les brûlures comme la Soufrière brûle et régénère.",
  },
  {
    id: 'sagittaire',
    name: 'Sagittaire',
    emoji: '♐',
    tagline: 'liberté & aventure',
    dateRange: '22 novembre – 21 décembre',
    element: 'Feu',
    planet: 'Jupiter',
    gradientFrom: '#f97316',
    gradientTo: '#a855f7',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    animal: "Crevette d'eau douce / Wasou",
    nomKreyol: 'Wasou / Ouassou',
    plante: 'Marakoudja (Fruit de la passion)',
    arbre: 'Gommié (Gommier)',
    lieu: 'Forêt de Basse-Terre / mornes',
    spirituel:
      "Liberté et mouvement. L'ouassou remonte les rivières sacrées contre le courant — toujours vers l'amont, vers la source. La forêt des mornes est son espace infini. Le maracuja — fleur de la passion qui grimpe sans jamais s'arrêter.",
  },
  {
    id: 'capricorne',
    name: 'Capricorne',
    emoji: '♑',
    tagline: 'ambition & discipline',
    dateRange: '22 décembre – 19 janvier',
    element: 'Terre',
    planet: 'Saturne',
    gradientFrom: '#64748b',
    gradientTo: '#94a3b8',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    animal: 'Cabri des mornes / Kabrit',
    nomKreyol: 'Kabrit',
    plante: 'Chadon béni / Piman végétarien',
    arbre: 'Gros Tim (Thym créole)',
    lieu: 'Matouba / Fort Delgrès',
    spirituel:
      "Résistance et rigueur. Le cabri escalade les mornes que personne d'autre n'ose. Animal du sacrifice rituel du quimbois — lien direct avec les forces profondes. Matouba, lieu de l'immolation de Delgrès, est son lieu totem.",
  },
  {
    id: 'verseau',
    name: 'Verseau',
    emoji: '♒',
    tagline: 'originalité & vision',
    dateRange: '20 janvier – 18 février',
    element: 'Air',
    planet: 'Uranus',
    gradientFrom: '#3b82f6',
    gradientTo: '#06b6d4',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    animal: 'Lambi / Conque',
    nomKreyol: 'Lambi',
    plante: 'Sitwonèl (Citronnelle) / Brizée',
    arbre: 'Kokoye (Cocotier)',
    lieu: 'Pointe Allègre / Sources de Dolé',
    spirituel:
      "Vision, originalité, communication. Le lambi est l'instrument de communication des esclaves marrons — son souffle traversait les mornes pour transmettre les messages de révolte. Sa coquille spiralée est un symbole de l'infini.",
  },
  {
    id: 'poissons',
    name: 'Poissons',
    emoji: '♓',
    tagline: 'rêve & compassion',
    dateRange: '19 février – 20 mars',
    element: 'Eau',
    planet: 'Neptune',
    gradientFrom: '#8b5cf6',
    gradientTo: '#3b82f6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    animal: 'Tortue imbriquée / Tòti karé',
    nomKreyol: 'Karet',
    plante: 'Korosòl (Corossol) / Fleur de nuit',
    arbre: 'Palétuwyé (Palétuvier)',
    lieu: 'Plages du nord Grande-Terre (ponte des tortues)',
    spirituel:
      "Intuition et profondeur. La tortue karet vient de l'océan profond pondre sous les étoiles — acte de foi et de mémoire ancestrale. La fleur de corossol s'ouvre la nuit. Être des deux mondes — mer et terre, rêve et réalité.",
  },
];

export const elementEmoji: Record<Element, string> = {
  Feu: '🔥',
  Terre: '🌍',
  Air: '💨',
  Eau: '💧',
};
