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
    tagColor: 'from-blue-400 to-violet-500',
    readTime: '5 min',
  },
  {
    slug: 'quimbois-et-planetes',
    emoji: '🔮',
    title: "Quimbois et planètes — un savoir parallèle",
    excerpt:
      "Le quimbois n'est pas de la superstition. C'est une manière de lire le monde invisible que l'Occident a choisi d'ignorer — et les planètes en font partie.",
    tag: 'Spirituel',
    tagColor: 'from-violet-500 to-indigo-600',
    readTime: '6 min',
  },
  {
    slug: 'soufriere-et-saturne',
    emoji: '🌋',
    title: "La Soufrière, Saturne et l'art d'attendre",
    excerpt:
      "La Soufrière gronde depuis toujours. Saturne aussi. Ces deux forces ont la même leçon à nous enseigner : rien de solide ne se construit dans la précipitation.",
    tag: 'Planètes',
    tagColor: 'from-amber-500 to-orange-600',
    readTime: '5 min',
  },
  {
    slug: 'signes-eau-mangrove',
    emoji: '🌊',
    title: "Les signes d'eau et la mangrove guadeloupéenne",
    excerpt:
      "Cancer, Scorpion, Poissons — ces signes vivent là où la terre et l'eau se mélangent. La mangrove de Guadeloupe leur ressemble plus qu'ils ne le croient.",
    tag: 'Éléments',
    tagColor: 'from-teal-400 to-cyan-600',
    readTime: '5 min',
  },
  {
    slug: 'venus-en-caraibe',
    emoji: '❤️',
    title: "Vénus en Caraïbe — amour, corps, liberté",
    excerpt:
      "L'amour en Guadeloupe ne ressemble pas à l'amour dans les romans parisiens. Vénus, ici, a les pieds dans le sable et la voix qui porte loin.",
    tag: 'Amour',
    tagColor: 'from-pink-500 to-rose-600',
    readTime: '6 min',
  },
  {
    slug: 'mercure-et-creole',
    emoji: '💬',
    title: 'Mercure et la langue créole — parler pour guérir',
    excerpt:
      "Mercure gouverne la parole, les mots, les échanges. Le créole guadeloupéen est une langue qui a survécu à l'interdit. Cette résistance-là est mercurienne.",
    tag: 'Langage',
    tagColor: 'from-emerald-400 to-green-600',
    readTime: '6 min',
  },
];

export function getArticle(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
