export type Element = 'Feu' | 'Terre' | 'Air' | 'Eau';

export interface FauneData {
  nom_creole: string;
  nom_commun: string;
  famille: string;
  conditions: string[];
  editions: string[];
  savoir: string;
  sacreSymbolique?: string;
  typeResistance?: string;
}

export interface FloraData {
  nom_creole: string;
  nom_commun: string;
  famille: string;
  conditions: string[];
  editions: string[];
  savoir: string;
  sacreSymbolique?: string;
  typeResistance?: string;
}

export interface LieuDetails {
  description: string;
  symbolique: string;
  localisation: string;
  categorie: string;
  sacreSymbolique: string;
}

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
  // === NOUVELLES COLONNES (depuis signe-du-jour-data.json) ===
  faune?: FauneData;
  flore?: FloraData;
  lieuDetails?: LieuDetails;
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
      "Gwo Zandoli, l’ancêtre qui veille sous les feuilles, t’a choisi comme enfant du feu et de l’attente. Ton souffle est celui des Kalinagos quand ils soufflaient dans les conques pour appeler les esprits de la terre. Flanbwayan, ton arbre-sang, porte les cicatrices des chaînes brisées—ses fleurs sont des braises de la mémoire. Marche droit, mais souviens-toi : même l’iguane se fait pierre avant de bondir.",
    faune: {
      nom_creole: 'igwann vè',
      nom_commun: 'Iguane vert / Iguana iguana',
      famille: 'reptiles',
      conditions: ['soleil', 'chaleur'],
      editions: ['matin'],
      savoir: "Animal totem des Arawaks, gardien de Petite-Terre. Les marrons s'en inspiraient : immobile et invisible dans la végétation, il voit tout sans être vu, sait attendre des heures avant d'agir. Les anciens disaient qu'observer un iguane, c'est apprendre la patience qui permet de survivre quand l'ennemi est plus fort.",
      sacreSymbolique: '⭐⭐⭐ SACRÉ',
      typeResistance: 'Reptile / Résistance'
    },
    flore: {
      nom_creole: 'flamboyant',
      nom_commun: 'Flamboyant',
      famille: 'arbres',
      conditions: ['soleil', 'chaleur'],
      editions: ['matin', 'soir'],
      savoir: "Il fleurit en plein cœur de la saison sèche, quand tout se dessèche — rouge et orange au-dessus du vide. Aucune utilité médicinale décisive, juste la beauté têtue. Signe que l'éclat ne demande pas la permission de venir."
    },
    lieuDetails: {
      description: 'Point le plus à l\'est de la Grande-Terre, où la terre rencontre l\'océan Atlantique',
      symbolique: 'Premier lieu à voir le soleil se lever, porte d\'entrée des vents alizés, symbole de nouveau départ',
      localisation: 'Grand Terre, à l\'extrême est',
      categorie: 'Pointe',
      sacreSymbolique: '⭐⭐ Symbolique'
    }
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
      "Bèf a Bos porte la terre des ancêtres dans ses sabots, lourd de la sueur des champs et des chants kalinagos. Vanilier, liane rebelle, enseigne l’art de fleurir sans maître—chaque gousse est un secret volé aux colons. Sous l’Awokasié, les mains des aïeux murmurent la pollinisation comme un quimbois de survie. Ta force est dans le silence des Grands-Fonds, où la résistance se cultive grain par grain.",
    faune: {
      nom_creole: 'kabribo',
      nom_commun: 'Cabrit-bois / Capra aegagrus hircus',
      famille: 'mammifères',
      conditions: [],
      editions: ['matin', 'soir'],
      savoir: "Caprin sauvage des mornes, agile et résistant. Symbole de l'adaptation à un terrain difficile. Les anciens chassaient le kabribo pour sa viande, mais respectaient sa capacité à survivre dans les zones les plus escarpées.",
      sacreSymbolique: '⭐⭐⭐ SACRÉ NOCTURNE',
      typeResistance: 'Animal / Résistance économique'
    },
    flore: {
      nom_creole: 'fromager',
      nom_commun: 'Fromager / Kapokier',
      famille: 'arbres',
      conditions: [],
      editions: ['matin', 'soir'],
      savoir: "Arbre sacré dans toute la Caraïbe — les anciens croyaient qu'il abritait les esprits des ancêtres. Son kapok garnissait les matelas et les gilets de sauvetage. On ne l'abat pas sans demander permission."
    },
    lieuDetails: {
      description: 'Course traditionnelle de bœufs lors des fêtes patronales de Sainte-Anne',
      symbolique: 'Célébration de la force laborieuse et de la communauté rurale, héritage des traditions agricoles',
      localisation: 'Sainte-Anne, Grande-Terre',
      categorie: 'Événement culturel',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
      "Foufou, z'oiseau des Arawaks, danse entre deux souffles sans jamais choisir — seul oiseau à tenir l'invisible entre ses ailes. Gommié blan garde la mémoire des Kalinagos dans sa sève, bois sacré des pirogues qui traversaient l'invisible. Lavande rouge borde les cases comme une prière qui attire les esprits bienveillants et chasse les mauvais sorts du quimbois.",
    faune: {
      nom_creole: 'fwou-fwou',
      nom_commun: 'Colibri huppé / Orthorhyncus cristatus',
      famille: 'oiseaux',
      conditions: ['soleil', 'chaleur'],
      editions: ['matin'],
      savoir: "Son nom vient directement des Arawaks — le souffle de l'air à travers ses ailes. Il bat des ailes jusqu'à soixante fois par seconde, suspendu immobile devant la fleur. Les anciens disaient que le voir au lever du soleil annonce une journée qui ira vite, mais où il faut savoir s'arrêter sur ce qui compte.",
      sacreSymbolique: '⭐⭐⭐ SACRÉ',
      typeResistance: 'Animal / Résistance culturelle'
    },
    flore: {
      nom_creole: 'gommier',
      nom_commun: 'Gommier blanc',
      famille: 'arbres',
      conditions: ['soleil', 'vent'],
      editions: ['matin'],
      savoir: "C'est de lui qu'on taillait les pirogues de pêche — son bois léger et sa résine imperméable en faisaient le compagnon idéal de la mer. Les Amérindiens l'utilisaient aussi comme torche naturelle. Signe du voyage, de ce qu'on construit pour traverser.",
      sacreSymbolique: '⭐⭐⭐ RÉSISTANCE AMÉRINDIENNE',
      typeResistance: 'Plante / Résistance amérindienne'
    },
    lieuDetails: {
      description: 'Jardin botanique historique créé au 17ème siècle par le gouverneur Houël',
      symbolique: 'Sanctuaire de la biodiversité guadeloupéenne, lieu de découverte et d\'émerveillement',
      localisation: 'Deshaies, côte sous le vent',
      categorie: 'Jardin botanique',
      sacreSymbolique: '⭐⭐ Emblématique'
    }
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
      "Touloulou, crabe rouge des Kalinagos, marche entre les racines du palétuvyé comme l’âme glisse entre les mondes. Sa carapace porte la mémoire des femmes masquées, celles qui dansent la résistance sous la lune. Le balisier rouge veille, fleur-sentinelle du jardin créole, tandis que la dachine nourrit les corps et les esprits—racine de survie, tubercule des ancêtres. Dans la mangrove, les eaux murmurent les noms oubliés.",
    faune: {
      nom_creole: 'touloulou',
      nom_commun: 'Crabe touloulou / Gecarcinus lateralis',
      famille: 'crustacés',
      conditions: ['vent', 'nuageux'],
      editions: ['matin', 'soir'],
      savoir: "Son nom est hérité direct des Kalinagos, intact depuis des siècles. Il a donné son nom aux femmes masquées du carnaval de Guadeloupe — les touloulous qui choisissent leurs cavaliers et ne se découvrent jamais. Signe de ce qui se cache pour être plus libre, qui préserve son mystère pour garder le pouvoir de choisir.",
      sacreSymbolique: '⭐⭐⭐ SACRÉ CULTUREL',
      typeResistance: 'Animal / Résistance alimentaire'
    },
    flore: {
      nom_creole: 'palétuwyé',
      nom_commun: 'Palétuvier / Mangrove rouge',
      famille: 'arbres',
      conditions: ['nuageux', 'pluie'],
      editions: ['soir'],
      savoir: "Arbre fondateur de la mangrove, berceau de la vie marine. Ses racines aériennes créent un labyrinthe sous-marin où les alevins grandissent à l'abri. Les anciens disaient que couper un palétuvier, c'est menacer tout l'écosystème."
    },
    lieuDetails: {
      description: 'Réserve naturelle de mangrove classée au patrimoine mondial de l\'UNESCO',
      symbolique: 'Zone de transition entre terre et mer, symbole de protection et de nourriture',
      localisation: 'Entre Basse-Terre et Grande-Terre',
      categorie: 'Mangrove / Lagune',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
      "Gran Pélikan t'ouvre les ailes au-dessus des vagues sacrées, là où les Arawaks lisaient le souffle des ancêtres dans l'écume. Balizié, fleur-épée, trace la frontière entre les mondes : son rouge est sang des Kalinagos résistants, sa tige une lance plantée dans la terre volée. Sous le Flanbwayan, les quimboiseurs murmurent tes secrets de feu — tu portes la braise des révoltes sans fin, celle qui couve sous les rochers de la Grande Vigie.",
    faune: {
      nom_creole: 'pélikan',
      nom_commun: 'Pélican brun / Pelecanus occidentalis',
      famille: 'oiseaux',
      conditions: ['soleil', 'vent'],
      editions: ['matin', 'soir'],
      savoir: "Animal totem des pêcheurs — quand les pélicans plongent en masse, le banc de poissons est là. Leur présence groupée annonce le beau temps et la bonne prise. Les anciens disaient qu'ils lisaient la mer mieux que n'importe quelle boussole. Signe de ce qui sait, sans avoir appris dans les livres.",
      sacreSymbolique: '⭐ Symbolique'
    },
    flore: {
      nom_creole: 'flamboyant',
      nom_commun: 'Flamboyant',
      famille: 'arbres',
      conditions: ['soleil', 'chaleur'],
      editions: ['matin', 'soir'],
      savoir: "Il fleurit en plein cœur de la saison sèche, quand tout se dessèche — rouge et orange au-dessus du vide. Aucune utilité médicinale décisive, juste la beauté têtue. Signe que l'éclat ne demande pas la permission de venir."
    },
    lieuDetails: {
      description: 'Cap rocheux offrant une vue panoramique sur l\'océan Atlantique',
      symbolique: 'Point de vue le plus haut, symbole de vision globale et de domination',
      localisation: 'Grande-Terre, nord-ouest',
      categorie: 'Pointe',
      sacreSymbolique: '⭐⭐ Symbolique'
    }
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
    plante: 'Panache d\'officier / Plumet jaune',
    arbre: 'Manguié (Manguier)',
    lieu: 'Chutes du Carbet',
    spirituel:
      "Sous le regard des Arawaks, la Vierge guadeloupéenne affine son âme comme manguié sous le pilon. Son esprit, précis tel la mangouste traçant son chemin, cherche l'équilibre entre les racines et les chutes du Carbet, murmures des Kalinagos. Les quimbois lui rappellent : la pureté naît dans l'action, jamais dans l'attente. Mango blan mûrit en silence, tout comme elle.",
    faune: {
      nom_creole: 'koures',
      nom_commun: 'Couresse / Alsophis antillensis',
      famille: 'reptiles',
      conditions: ['nuageux'],
      editions: ['matin'],
      savoir: "Couleuvre inoffensive, endémique des Antilles — elle ne mord que si on la provoque. Gardienne silencieuse des jardins et des réserves à grain, elle mange les rats et les fourmis. Les anciens disaient qu'une couresse installée sous la case, c'est une chance. Signe de ce qui effraie sans raison, et protège sans bruit.",
      sacreSymbolique: '⭐⭐ Symbolique'
    },
    flore: {
      nom_creole: 'manguier',
      nom_commun: 'Manguier',
      famille: 'arbres',
      conditions: ['soleil', 'chaleur'],
      editions: ['matin', 'soir'],
      savoir: "L'arbre de la générosité — il donne à tous sans distinction. Son ombre a abrité des palabres, des siestes, des naissances. Ses feuilles séchées calmaient la fièvre. On dit que là où pousse un manguier, la maison ne manque jamais."
    },
    lieuDetails: {
      description: 'Cascade emblématique de 115 mètres de haut, parmi les plus hautes des Petites Antilles',
      symbolique: 'Pureté de l\'eau, puissance de la nature, lieu de purification et de renaissance',
      localisation: 'Basse-Terre, parc national',
      categorie: 'Cascade',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
      "Manman dlo glisse entre les mondes comme l’âme entre deux souffles. Son chant appelle les ancêtres kalinagos à danser sur les berges de la Rivière Salée, là où l’eau douce et salée se mêlent sans se combattre. Grangouzie, tes pétales rouges boivent le soleil pour nourrir les veines des vivants — équilibre des humeurs, équilibre des cœurs. Zanmann étend ses branches comme une balance de justice, ses amandes gardiennes des secrets échangés sous son ombre.",
    faune: {
      nom_creole: 'manman dlo',
      nom_commun: 'Lamantin des Caraïbes / Trichechus manatus',
      famille: 'marins',
      conditions: ['nuageux', 'pluie'],
      editions: ['soir'],
      savoir: "Les premiers marins ont pris le lamantin pour une sirène — à l'origine des légendes de la Manman Dlo caribéenne. Il allaite ses petits comme une femme, flotte entre deux eaux, appartient aux deux mondes. Espèce aujourd'hui en grand danger. Signe de ce qui nage entre deux mondes sans appartenir à aucun des deux.",
      sacreSymbolique: '⭐⭐⭐ SACRÉ MYTHIQUE'
    },
    flore: {
      nom_creole: 'acajou pays',
      nom_commun: 'Acajou des Antilles',
      famille: 'arbres',
      conditions: [],
      editions: ['matin', 'soir'],
      savoir: "Bois noble utilisé pour la fabrication de meubles de luxe. Sa couleur rougeâtre profond et son grain fin en font un matériau très prisé. Symbole de durabilité et d'élégance naturelle."
    },
    lieuDetails: {
      description: 'Bras de mer séparant la Basse-Terre de la Grande-Terre',
      symbolique: 'Frontière naturelle entre deux territoires, symbole d\'équilibre et de connexion',
      localisation: 'Entre Basse-Terre et Grande-Terre',
      categorie: 'Bras de mer',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
      "Hèrkil, scarabée des mornes, porte le poids des secrets sous sa carapace noire. Alowès, sang vert des ancêtres, panse les plaies que l’esclavage a gravées dans la chair. Kalbasi murmure aux esprits des Kalinagos quand le vent froisse ses feuilles — sa calebasse recueille les larmes des résistants. La Soufrière fume ta colère sacrée, enfant des cendres et des renaissances.",
    faune: {
      nom_creole: 'myg',
      nom_commun: 'Mygale de la Soufrière',
      famille: 'arachnides',
      conditions: [],
      editions: ['soir'],
      savoir: "Araignée imposante vivante dans les zones volcaniques de la Soufrière. Malgré son apparence effrayante, elle est inoffensive et joue un rôle clé dans l'écosystème. Symbole de ce qui impressionne mais ne cause pas de mal.",
      sacreSymbolique: '⭐⭐⭐ SACRÉ ENDÉMIQUE'
    },
    flore: {
      nom_creole: 'calebassier',
      nom_commun: 'Calebassier',
      famille: 'arbres',
      conditions: ['nuageux', 'pluie'],
      editions: ['soir'],
      savoir: "Sa calebasse était le premier récipient — bol, louche, gourde, instrument de musique. Les quimboiseurs l'utilisaient pour les cérémonies de purification. Trouver un calebassier rappelle que l'utile peut être beau.",
      sacreSymbolique: '⭐⭐⭐ RÉSISTANCE SPIRITUELLE',
      typeResistance: 'Plante / Résistance spirituelle'
    },
    lieuDetails: {
      description: 'Volcan actif culminant à 1467 mètres, point le plus haut des Petites Antilles',
      symbolique: 'Symbole de puissance tellurique, de destruction et de renaissance, cœur spirituel de la Guadeloupe',
      localisation: 'Basse-Terre, parc national',
      categorie: 'Volcan',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
    animal: 'Crevette d\'eau douce / Wasou',
    nomKreyol: 'Wasou / Ouassou',
    plante: 'Marakoudja (Fruit de la passion)',
    arbre: 'Gommié (Gommier)',
    lieu: 'Forêt de Basse-Terre / mornes',
    spirituel:
      "Wasou, la crevette des eaux vives, porte l’âme des Kalinagos qui remontaient les rivières pour échapper aux chaînes. Son corps transparent cache la force des ancêtres — ceux qui ont choisi la montagne plutôt que l’esclavage. Marakoudja, ton fruit brûle et apaise : comme le quimbois qui guérit ou maudit, selon la main qui le cueille. Gommié, ton bois résonne encore des tambours interdits, ceux qui appelaient à la révolte sous les mornes.",
    faune: {
      nom_creole: 'wasou',
      nom_commun: 'Ouassou / Macrobrachium carcinus',
      famille: 'marins',
      conditions: ['pluie', 'nuageux'],
      editions: ['matin'],
      savoir: "Crevette géante des rivières de Basse-Terre — elle remonte les courants jusqu'aux sources les plus hautes des mornes. Elle vivait dans les rivières que les anciens considéraient comme sacrées. Signe de ce qui prospère dans les eaux claires, profondes, et qu'on n'atteint qu'en ayant le courage de remonter à contre-courant.",
      sacreSymbolique: '⭐⭐ Culturel'
    },
    flore: {
      nom_creole: 'coco',
      nom_commun: 'Cocotier',
      famille: 'arbres',
      conditions: ['soleil', 'vent'],
      editions: ['matin', 'soir'],
      savoir: "Arbre de vie par excellence — chaque partie a son utilité : eau, chair, coquille, fibre. Symbole d'abondance et de polyvalence. Les anciens disaient qu'un cocotier bien planté assure la prospérité de la famille."
    },
    lieuDetails: {
      description: 'Forêt tropicale humide couvrant les contreforts de la Soufrière',
      symbolique: 'Territoire sauvage et préservé, symbole de liberté et d\'exploration',
      localisation: 'Basse-Terre, sud-est',
      categorie: 'Forêt / Réserve',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
      "Kabrit des mornes porte l’âme des mornes rebelles. Ses sabots tracent les chemins de résistance où les ancêtres kalinagos ont fui l’esclavage. Piman végétarien, doux comme la ruse des anciens, protège les cases contre les mauvais sorts. Gros tim, thym des guerriers, parfume les offrandes à Delgrès—son feu veille encore dans les grottes de Matouba.",
    faune: {
      nom_creole: 'kabribo',
      nom_commun: 'Cabrit-bois / Capra aegagrus hircus',
      famille: 'mammifères',
      conditions: [],
      editions: ['matin', 'soir'],
      savoir: "Caprin sauvage des mornes, agile et résistant. Symbole de l'adaptation à un terrain difficile. Les anciens chassaient le kabribo pour sa viande, mais respectaient sa capacité à survivre dans les zones les plus escarpées.",
      sacreSymbolique: '⭐⭐⭐ SACRÉ NOCTURNE',
      typeResistance: 'Animal / Résistance économique'
    },
    flore: {
      nom_creole: 'courbaril',
      nom_commun: 'Courbaril / Locust tree',
      famille: 'arbres',
      conditions: ['soleil', 'chaleur'],
      editions: ['matin', 'soir'],
      savoir: "Sa résine dorée — le copal — était récoltée par les guérisseurs pour calmer les douleurs articulaires et purifier l'espace. Bois imputrescible, il résiste aux siècles et aux termites. Symbole de ce qui tient quand tout cède."
    },
    lieuDetails: {
      description: 'Site historique du combat de Louis Delgrès contre les troupes napoléoniennes en 1802',
      symbolique: 'Symbole de la résistance à l\'oppression et du sacrifice pour la liberté',
      localisation: 'Basse-Terre, sud',
      categorie: 'Lieu de marronnage',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
      "Ton souffle porte l’écho des lambi kalinagos, ces cornes qui réveillaient les esprits de la mer avant la bataille. La sitwonèl brûle en toi comme un feu sans fumée, purifiant les pensées lourdes des chaînes oubliées. Sous le kokoye, tes racines boivent aux sources de Dolé, là où l’eau murmure les noms des ancêtres rebelles. Tu es le vent qui dérange les cases trop sages—celui que les vieux quimboiseurs écoutent en silence.",
    faune: {
      nom_creole: 'chatou',
      nom_commun: 'Poulpe / Octopus vulgaris',
      famille: 'marins',
      conditions: [],
      editions: ['soir'],
      savoir: "Maître du camouflage et de l'intelligence marine. Capable de changer de couleur, de forme et même de texture en une fraction de seconde. Les anciens pêcheurs voyaient en lui un esprit de la mer, capable de résoudre les énigmes les plus complexes. Signe de l'adaptabilité extrême.",
      sacreSymbolique: '⭐⭐ Symbolique'
    },
    flore: {
      nom_creole: 'citronnelle',
      nom_commun: 'Citronnelle',
      famille: 'herbes',
      conditions: [],
      editions: ['matin'],
      savoir: "Plante aux multiples usages — infusions, cuisine, médecine traditionnelle. Son parfum citronné éloigne les moustiques et purifie l'air. Les anciens en plantaient autour des cases pour se protéger des mauvais esprits."
    },
    lieuDetails: {
      description: 'Zone humide abritant des sources naturelles d\'eau douce',
      symbolique: 'Lieu de pureté et de clarification, source de vie et d\'inspiration',
      localisation: 'Grande-Terre, est',
      categorie: 'Source thermale',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
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
      "Tòti karé glisse entre les mondes, sa carapace chargée des prières kalinagos gravées dans l’écaille. Sous les palétuwyé, le korosòl murmure : ses feuilles apaisent les esprits agités, son fruit nourrit les rêves des ancêtres. Tu portes l’eau et la terre, comme la plage où la tortue dépose ses œufs — acte sacré de résistance, lien invisible entre les vivants et ceux qui veillent depuis Gwadloup. Écoute le silence entre les vagues : c’est là que parlent les anciens.",
    faune: {
      nom_creole: 'tòti karé',
      nom_commun: 'Tortue imbriquée / Eretmochelys imbricata',
      famille: 'marins',
      conditions: ['vent', 'soleil'],
      editions: ['matin', 'soir'],
      savoir: "Sa carapace translucide et dorée était taillée en parures rituelles amérindiennes. Aujourd'hui en danger critique d'extinction. Les anciens disaient qu'elle porte un monde entier sur le dos — et que quand une espèce disparaît, c'est un morceau du monde qu'elle emporte avec elle.",
      sacreSymbolique: '⭐⭐⭐ SACRÉE'
    },
    flore: {
      nom_creole: 'korosòl',
      nom_commun: 'Corossolier',
      famille: 'arbres',
      conditions: [],
      editions: [],
      savoir: "Arbre aux fruits délicieux et aux feuilles aux propriétés médicinales. La fleur du corossolier s'ouvre la nuit, attire les pollinisateurs nocturnes. Symbole de douceur et de mystère."
    },
    lieuDetails: {
      description: 'Plages isolées où les tortues viennent pondre la nuit',
      symbolique: 'Lieu de préservation de la vie marine, symbole de cycle et de continuité',
      localisation: 'Grande-Terre, nord',
      categorie: 'Plage',
      sacreSymbolique: '⭐⭐⭐ SACRÉ'
    }
  }
];

export const elementEmoji: Record<Element, string> = {
  Feu: '🔥',
  Terre: '🌍',
  Air: '💨',
  Eau: '💧',
};
