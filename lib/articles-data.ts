export interface ArticleMeta {
  slug: string;
  emoji: string;
  title: string;
  excerpt: string;
  tag: string;
  tagColor: string;
  readTime: string;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: 'lune-et-peche',
    emoji: '🌕',
    title: 'La lune et les pêcheurs de Karukera',
    excerpt:
      "Avant le GPS, avant les météos satellitaires, les pêcheurs de Guadeloupe lisaient la lune. Ce savoir-là ne s'apprend pas dans les livres.",
    tag: 'Lune',
    tagColor: 'from-ancestral-cream to-ancestral-gold',
    readTime: '5 min',
  },
  {
    slug: 'quimbois-et-planetes',
    emoji: '🔮',
    title: "Quimbois et planètes — un savoir parallèle",
    excerpt:
      "Le quimbois n'est pas de la superstition. C'est une manière de lire le monde invisible que l'Occident a choisi d'ignorer — et les planètes en font partie.",
    tag: 'Spirituel',
    tagColor: 'from-ancestral-earth to-ancestral-deepBrown',
    readTime: '12 min',
  },
  {
    slug: 'soufriere-et-saturne',
    emoji: '🌋',
    title: "La Soufrière, Saturne et l'art d'attendre",
    excerpt:
      "La Soufrière gronde depuis toujours. Saturne aussi. Ces deux forces ont la même leçon à nous enseigner : rien de solide ne se construit dans la précipitation.",
    tag: 'Planètes',
    tagColor: 'from-ancestral-terracotta to-ancestral-earth',
    readTime: '5 min',
  },
  {
    slug: 'signes-eau-mangrove',
    emoji: '🌊',
    title: "Les signes d'eau et la mangrove guadeloupéenne",
    excerpt:
      "Cancer, Scorpion, Poissons — ces signes vivent là où la terre et l'eau se mélangent. La mangrove de Guadeloupe leur ressemble plus qu'ils ne le croient.",
    tag: 'Éléments',
    tagColor: 'from-ancestral-forest to-ancestral-earth',
    readTime: '5 min',
  },
  {
    slug: 'venus-en-caraibe',
    emoji: '❤️',
    title: "Vénus en Caraïbe — amour, corps, liberté",
    excerpt:
      "L'amour en Guadeloupe ne ressemble pas à l'amour dans les romans parisiens. Vénus, ici, a les pieds dans le sable et la voix qui porte loin.",
    tag: 'Amour',
    tagColor: 'from-ancestral-gold to-ancestral-terracotta',
    readTime: '6 min',
  },
  {
    slug: 'mercure-et-creole',
    emoji: '💬',
    title: 'Mercure et la langue créole — parler pour guérir',
    excerpt:
      "Mercure gouverne la parole, les mots, les échanges. Le créole guadeloupéen est une langue qui a survécu à l'interdit. Cette résistance-là est mercurienne.",
    tag: 'Langage',
    tagColor: 'from-ancestral-forest to-ancestral-gold',
    readTime: '6 min',
  },
  {
    slug: 'careme-et-gemeaux',
    emoji: '🌬️',
    title: "Le carême et l'énergie des Gémeaux — le vent du changement",
    excerpt:
      "En Guadeloupe, le carême n'est pas que la saison sèche. C'est le vent alizé qui nettoie tout sur son passage. Les Gémeaux, eux, le savent depuis toujours.",
    tag: 'Saisons',
    tagColor: 'from-ancestral-gold to-ancestral-forest',
    readTime: '5 min',
  },
  {
    slug: 'fete-cuisinieres-cancer',
    emoji: '🍲',
    title: "La fête des cuisinières et les énergies de Cancer",
    excerpt:
      "Chaque année en août, les cuisinières de Pointe-à-Pitre défilent en grande pompe. Ce rituel de partage et de soin, c'est Cancer dans toute sa splendeur.",
    tag: 'Traditions',
    tagColor: 'from-ancestral-terracotta to-ancestral-gold',
    readTime: '5 min',
  },
  {
    slug: 'bele-gwoka-mars',
    emoji: '🥁',
    title: "Bèlè, gwoka et Mars — rythmes ancestraux et planètes guerrières",
    excerpt:
      "Le gwoka n'est pas juste de la musique. C'est une arme. Mars, planète de l'action et de la lutte, résonne dans chaque frappe du ka comme un appel à se tenir debout.",
    tag: 'Musique',
    tagColor: 'from-ancestral-earth to-ancestral-terracotta',
    readTime: '6 min',
  },
  {
    slug: 'igname-et-vierge',
    emoji: '🌱',
    title: "L'igname et la Vierge — nourrir son âme avec la terre",
    excerpt:
      "L'igname est la reine des tubercules guadeloupéens. Elle demande patience, sol bien travaillé, gestes précis. La Vierge, signe de service et de rigueur, lui ressemble.",
    tag: 'Terre',
    tagColor: 'from-ancestral-forest to-ancestral-earth',
    readTime: '5 min',
  },
  {
    slug: 'kolibri-et-verseau',
    emoji: '🐦',
    title: "Kolibri et Verseau — la liberté comme horizon",
    excerpt:
      "Le colibri de Guadeloupe pèse trois grammes et bat des ailes deux cents fois par seconde. Le Verseau, lui, ne tient pas en place non plus. Deux êtres faits pour les grands espaces.",
    tag: 'Nature',
    tagColor: 'from-ancestral-gold to-ancestral-cream',
    readTime: '5 min',
  },
  {
    slug: 'canne-a-sucre-capricorne',
    emoji: '🎋',
    title: "La canne à sucre et le Capricorne — labeur, patience et récompense",
    excerpt:
      "La canne à sucre a façonné la Guadeloupe dans sa chair. Le Capricorne, lui, sait mieux que tout autre signe que rien de durable ne se construit sans travail, sans douleur, et sans le temps long.",
    tag: 'Terre',
    tagColor: 'from-ancestral-earth to-ancestral-deepBrown',
    readTime: '6 min',
  },
];

export function getArticle(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
