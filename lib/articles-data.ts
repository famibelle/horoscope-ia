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
      "Avant le GPS et les météos satellitaires, les pêcheurs de Guadeloupe se réglaient sur la lune et les marées. Ce que la science dit de ce savoir empirique, et ce qui relève du mythe.",
    tag: 'Mer',
    tagColor: 'from-ancestral-cream to-ancestral-gold',
    readTime: '7 min',
  },
  {
    slug: 'quimbois-et-planetes',
    emoji: '🌿',
    title: 'Quimbois, gadèdzafè et rimèd razié, la médecine populaire guadeloupéenne',
    excerpt:
      "Derrière le mot quimbois, il y a un vrai système de soin et de sens, étudié par les ethnologues depuis les années 1980. Ce que disent les enquêtes de terrain, loin du folklore.",
    tag: 'Ethnographie',
    tagColor: 'from-ancestral-earth to-ancestral-deepBrown',
    readTime: '9 min',
  },
  {
    slug: 'soufriere-et-saturne',
    emoji: '🌋',
    title: "La Soufrière, Saturne et l'art d'attendre",
    excerpt:
      "En 1976, la Soufrière a forcé plus de 70 000 personnes à quitter Basse-Terre, et divisé les plus grands volcanologues français. Une leçon sur l'incertitude que Saturne connaît bien.",
    tag: 'Volcan',
    tagColor: 'from-ancestral-terracotta to-ancestral-earth',
    readTime: '7 min',
  },
  {
    slug: 'signes-eau-mangrove',
    emoji: '🌊',
    title: "Les signes d'eau et la mangrove guadeloupéenne",
    excerpt:
      "Le Grand Cul-de-Sac Marin est une zone humide d'importance mondiale, classée depuis 1993. Ce que l'écologie de la mangrove raconte aux Cancer, Scorpion et Poissons.",
    tag: 'Écologie',
    tagColor: 'from-ancestral-forest to-ancestral-earth',
    readTime: '7 min',
  },
  {
    slug: 'mercure-et-creole',
    emoji: '💬',
    title: 'Mercure et la langue créole, parler pour exister',
    excerpt:
      "Le créole guadeloupéen est une langue à part entière, avec ses dictionnaires, ses écrivains, ses chercheurs. Histoire d'une langue longtemps méprisée et de ceux qui l'ont fait entrer à l'école.",
    tag: 'Langue',
    tagColor: 'from-ancestral-forest to-ancestral-gold',
    readTime: '7 min',
  },
  {
    slug: 'fete-cuisinieres-cancer',
    emoji: '🍲',
    title: 'La fête des Cuisinières et les énergies de Cancer',
    excerpt:
      "Depuis 1916, les cuisinières de Pointe-à-Pitre s'organisent en société d'entraide et défilent chaque année autour de la Saint-Laurent. Histoire sociale d'un rituel de soin très Cancer.",
    tag: 'Traditions',
    tagColor: 'from-ancestral-terracotta to-ancestral-gold',
    readTime: '6 min',
  },
  {
    slug: 'bele-gwoka-mars',
    emoji: '🥁',
    title: 'Le gwoka et Mars, un tambour qui tient tête',
    excerpt:
      "Inscrit au patrimoine immatériel de l'UNESCO en 2014, le gwoka est né dans les plantations et a accompagné toutes les luttes guadeloupéennes. Ce que les ethnomusicologues en disent.",
    tag: 'Musique',
    tagColor: 'from-ancestral-earth to-ancestral-terracotta',
    readTime: '8 min',
  },
  {
    slug: 'igname-et-vierge',
    emoji: '🌱',
    title: "L'igname et la Vierge, nourrir avec la terre",
    excerpt:
      "L'igname règne sur le jardin créole, ce modèle agroécologique que les agronomes redécouvrent aujourd'hui. Patience, rigueur, sol vivant : tout ce que la Vierge comprend d'instinct.",
    tag: 'Agriculture',
    tagColor: 'from-ancestral-forest to-ancestral-earth',
    readTime: '7 min',
  },
  {
    slug: 'kolibri-et-verseau',
    emoji: '🐦',
    title: 'Kolibri et Verseau, la liberté comme horizon',
    excerpt:
      "Le colibri huppé, minuscule habitant des jardins guadeloupéens, cache une biologie hors norme. Portrait scientifique d'un oiseau libre, sous le signe du Verseau.",
    tag: 'Nature',
    tagColor: 'from-ancestral-gold to-ancestral-cream',
    readTime: '6 min',
  },
  {
    slug: 'canne-a-sucre-capricorne',
    emoji: '🎋',
    title: 'La canne à sucre et le Capricorne, le temps long du labeur',
    excerpt:
      "La canne a façonné la Guadeloupe : plantations, usines, grèves. Du système esclavagiste au massacre du Moule en 1952, une histoire de travail et de luttes que le Capricorne connaît par cœur.",
    tag: 'Histoire',
    tagColor: 'from-ancestral-earth to-ancestral-deepBrown',
    readTime: '8 min',
  },
  // NOTE: l'article `delgres-liberte-1802` sera ajouté ici avec son contenu (Lot 3).
];

export function getArticle(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
