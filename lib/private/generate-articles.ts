#!/usr/bin/env npx tsx
/**
 * Génère des articles en voix Maryse Condé via Mistral Large.
 * Lance avec : npx tsx lib/private/generate-articles.ts
 * Résultat dans lib/articles-content.json (versionné, aucun appel runtime).
 *
 * PROTECTION : les articles déjà réécrits à la main avec un champ `sources`
 * (contenu vérifié, sourcé) sont considérés comme définitivement curatés et
 * ne sont JAMAIS régénérés par ce script, même en lançant --slugs=<leur-slug>,
 * sauf si l'on passe explicitement --overwrite-sourced. Perdre ce contenu
 * effacerait aussi son sourçage : ne passer ce flag qu'en connaissance de cause.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const MARYSE_SYSTEM = `Tu es Maryse Condé — romancière guadeloupéenne, prix Nobel alternatif de littérature 2018. Tu rédiges un article de fond pour un site d'astrologie ancré dans la culture guadeloupéenne.

Ta voix : phrases qui claquent, rythme oral, images concrètes ancrées dans le quotidien guadeloupéen et caribéen. Tu glisses parfois un mot créole comme on glisse une épice dans un plat. Tu ne surexpliques pas. Tu respectes l'intelligence de tes lecteurs.

Structure de l'article :
- introduction : accroche forte, 3-4 phrases qui posent la tension
- 5 à 6 sections thématiques avec un titre court et évocateur
- conclusion : un paragraphe de 80-100 mots qui laisse une résonance, pas de morale facile

Format de réponse : un objet JSON valide avec ces clés exactes :
{
  "introduction": "...",
  "sections": [
    { "titre": "...", "corps": "..." },
    { "titre": "...", "corps": "..." },
    { "titre": "...", "corps": "..." },
    { "titre": "...", "corps": "..." },
    { "titre": "...", "corps": "..." }
  ],
  "conclusion": "..."
}

IMPÉRATIF : Chaque section fait 280 à 380 mots minimum. Inclus dans chaque section au moins un détail historique précis, un lieu réel de Guadeloupe, une anecdote concrète ou un témoignage oral. Ton oral direct, parle à la deuxième personne parfois. Ancre dans la réalité guadeloupéenne : lieux réels (la Soufrière, la mangrove Grand Cul-de-Sac Marin, Pointe-à-Pitre, Saint-Claude, Marie-Galante, Capesterre-Belle-Eau…), plantes (manioc, balisier, canne à sucre, igname, balisier rouge), animaux (colibri falle-vert, frégate, iguane, lambi, ouassous). Références culturelles bienvenues : Maryse Condé elle-même, Aimé Césaire, Simone Schwarz-Bart, le gwoka, le quimbois, les cuisinières. Sans markdown dans les valeurs JSON. L'article complet doit dépasser 1 400 mots.`;

const PROMPTS: Record<string, string> = {
  'lune-et-peche': `Rédige un article intitulé "La lune et les pêcheurs de Karukera".

Sujet : avant le GPS et les météos satellitaires, les pêcheurs de Guadeloupe lisaient la lune pour décider quand partir en mer, comment poser les nasses, quand revenir. Ce savoir lunaire — transmis de père en fils, de mère en fille — est aussi une forme d'astrologie vivante, incarnée dans la pratique quotidienne. Parle des marées, des cycles lunaires et de la pêche au gros. Évoque la baie de Sainte-Rose, les pêcheurs de Marie-Galante, le boucantier. Lie ce savoir concret à ce que l'astrologie dit de la lune : émotions, rythmes, mémoire de l'eau.`,

  'quimbois-et-planetes': `Rédige un article intitulé "Quimbois et planètes — un savoir parallèle".

Sujet : le quimbois guadeloupéen n'est pas de la superstition — c'est un système de connaissance du monde invisible, structuré, transmis, efficace pour ceux qui y croient. Les planètes astrales et le quimbois partagent une même conviction fondamentale : les forces invisibles agissent sur le vivant. Explore les points de contact entre les deux systèmes (Mars et l'agression, Vénus et les sorts d'amour, Saturne et la protection des ancêtres). Évoque le malomé, les bains de chance, la fumée du soufre de la Soufrière utilisée dans certaines pratiques. Sois honnête : tu ne crois pas à tout, mais tu respectes ce savoir.`,

  'soufriere-et-saturne': `Rédige un article intitulé "La Soufrière, Saturne et l'art d'attendre".

Sujet : la Soufrière de Guadeloupe gronde en permanence depuis des siècles — elle menace, elle se tait, elle reprend. En 1976, Louis Jospin a ordonné l'évacuation de 72 000 personnes pour rien. En 2021, les fumées ont repris. La Soufrière enseigne la même leçon que Saturne en astrologie : la patience, l'endurance, la capacité à vivre avec une menace sourde et à ne pas se laisser consumer par l'urgence. Explore Saturne comme planète de la discipline et du temps long. Parle des Guadeloupéens qui n'ont pas évacué en 1976, de ceux qui connaissent leur volcan comme un voisin difficile mais familier.`,

  'signes-eau-mangrove': `Rédige un article intitulé "Les signes d'eau et la mangrove guadeloupéenne".

Sujet : Cancer, Scorpion, Poissons sont des signes d'eau — ils vivent dans l'entre-deux, dans les zones où les frontières ne tiennent pas. La mangrove de Guadeloupe (notamment autour du Grand Cul-de-Sac Marin) est exactement cet espace : ni tout à fait mer, ni tout à fait terre, passage entre les mondes, refuge des alevins et des crabes de terre. Explore les qualités de ces trois signes (intuition, profondeur, mémoire émotionnelle) à travers le prisme de la mangrove. Parle du palétuvrier, des racines aériennes, du silence particulier de ce milieu. Évoque aussi la menace que fait peser le changement climatique sur ces espaces — et sur la capacité des signes d'eau à préserver leur monde intérieur.`,

  'mercure-et-creole': `Rédige un article intitulé "Mercure et la langue créole — parler pour guérir".

Sujet : Mercure gouverne la parole, les mots, la communication, les échanges. Le créole guadeloupéen est une langue qui a survécu à l'interdit — pendant des siècles on a voulu l'effacer, lui préférer le français, la langue du maître. Et pourtant le créole a résisté, s'est transformé, a absorbé, a inventé. Cette résistance par la langue est mercurienne dans son essence. Explore Mercure comme planète de l'intelligence adaptative et de la communication. Parle du créole comme langue de guérison (les proverbes, les chants de travail, le conteur — le majò djò — qui tient la nuit entière). Évoque Mercure rétrograde comme moment de retour à la langue maternelle, au mot juste qu'on avait oublié. Développe chaque section sur 300 mots minimum avec des exemples précis de mots créoles, leur étymologie, leur usage dans la vie quotidienne.`,

  'fete-cuisinieres-cancer': `Rédige un article intitulé "La fête des cuisinières et les énergies de Cancer".

Sujet : Le 10 août de chaque année, des centaines de cuisinières en tenue traditionnelle guadeloupéenne — madras, foulard, bijoux d'or — défilent dans les rues de Pointe-à-Pitre puis s'installent pour un grand repas collectif. Cet événement, créé en 1916 par l'Association des cuisinières de la Guadeloupe, est l'un des plus anciens rituels de reconnaissance du travail féminin en France. Cancer, signe d'eau gouverné par la Lune, règne sur la nourriture, la mémoire familiale, la transmission, le soin. Développe les 5 sections : (1) Histoire de la fête des cuisinières — pourquoi 1916, qui étaient ces femmes, ce qu'elles ont voulu affirmer ; (2) Les plats du défilé et leur symbolique — colombo, blaff, accras, féroce d'avocat — chaque recette comme un récit ; (3) Cancer et la mémoire du corps — pourquoi certains plats guérissent, le rôle des grands-mères dans la transmission des savoirs culinaires et médicinaux ; (4) La Lune et la cuisine créole — les jours de Lune favorable pour planter, pour pêcher, pour préparer certaines préparations ; (5) Les cuisinières d'aujourd'hui — comment cette tradition se réinvente, qui la porte maintenant. 1 400 mots minimum.`,

  'bele-gwoka-mars': `Rédige un article intitulé "Bèlè, gwoka et Mars — rythmes ancestraux et planètes guerrières".

Sujet : Le gwoka est bien plus qu'un instrument — c'est une langue, une mémoire, une arme. Classé au patrimoine immatériel de l'UNESCO en 2014, il est né dans les plantations de Guadeloupe, là où les esclaves ne pouvaient pas parler mais pouvaient jouer du tambour. Mars, planète de l'action, du courage et du conflit, résonne dans chaque frappe du ka. Le bèlè est la danse qui l'accompagne — une danse de défi, de séduction, de résistance. Développe les 5 sections : (1) L'histoire du gwoka — des plantations au patrimoine mondial, les 7 rythmes (léwòz, toumblak, graj, woulé, mendé, padjanbèl, kaladja) et ce qu'ils signifient ; (2) Mars en astrologie — pourquoi ce n'est pas que violence mais aussi courage, initiative, énergie vitale ; (3) Le léwòz de Pointe-à-Pitre tous les samedis — ce qui se passe quand les gens jouent ensemble, la transe, la communauté ; (4) Les femmes et le gwoka — les grandes griotes, les maîtresses-ka, celles qu'on n'a pas assez citées ; (5) Ce que le gwoka peut enseigner à Mars en Bélier, Mars en Lion, Mars en Scorpion. 1 400 mots minimum.`,

  'igname-et-vierge': `Rédige un article intitulé "L'igname et la Vierge — nourrir son âme avec la terre".

Sujet : L'igname (Dioscorea alata) est la reine des tubercules guadeloupéens. Elle demande une préparation du sol longue, des gestes précis, une surveillance constante, et une récolte millimétrée. Chaque année à Capesterre-Belle-Eau, la Fête de l'Igname rassemble des milliers de personnes. La Vierge, signe de Terre gouverné par Mercure, est le signe du service, de la santé, de la précision et du travail bien fait. Les deux se ressemblent. Développe les 5 sections : (1) L'igname en Guadeloupe — variétés (cousse-couche, igname gros bras, chadire), techniques de culture traditionnelle, calendrier lunaire des agriculteurs ; (2) La Fête de l'Igname de Capesterre — son histoire, pourquoi cette ville, ce que la fête révèle sur le rapport guadeloupéen à la terre ; (3) La Vierge et la santé — pourquoi ce signe est obsédé par ce qu'on met dans son corps, l'alimentation comme médecine, le retour aux plantes médicinales ; (4) Nourrir vs guérir — la frontière floue entre cuisine créole et médecine traditionnelle, les remèdes à base d'igname, les ti-nains et les bananes-figue comme aliments thérapeutiques ; (5) La Vierge dans les jardins créoles — comment ce signe comprend instinctivement les cycles naturels. 1 400 mots minimum.`,

  'kolibri-et-verseau': `Rédige un article intitulé "Kolibri et Verseau — la liberté comme horizon".

Sujet : Le colibri falle-vert (Eulampis holosericeus) est l'oiseau emblématique de la Guadeloupe. Il pèse moins de cinq grammes, bat des ailes jusqu'à 200 fois par seconde, peut voler à reculons et en stationnaire — une physique impossib le que réalise la nature. Le Verseau, signe d'Air gouverné par Uranus, est le signe de la liberté, de l'originalité, de l'utopie et du refus des conventions. Les deux semblent venir d'un autre monde. Développe les 5 sections : (1) Le colibri en Guadeloupe — sa biologie étonnante, son rôle dans la pollinisation, pourquoi les jardiniers guadeloupéens le protègent, les fleurs du balisier rouge qu'il préfère ; (2) Le Verseau comme signe de l'impossible — figures verseau de l'histoire guadeloupéenne (Félix Éboué, né en Guyane mais figure caraïbéenne de la rupture), les révolutionnaires qui ont refusé le monde tel qu'il est ; (3) Liberté et esclavage — le paradoxe d'une île où la liberté a dû s'arracher, et comment le Verseau porte cette mémoire du refus ; (4) Uranus et les révolutions créoles — 1848, le vote de l'abolition, Victor Schœlcher, et comment chaque génération réinvente sa libération ; (5) Ce que le kolibri enseigne : être petit ne signifie pas être faible, et la vitesse n'est pas la même chose que la précipitation. 1 400 mots minimum.`,

  'canne-a-sucre-capricorne': `Rédige un article intitulé "La canne à sucre et le Capricorne — labeur, patience et récompense".

Sujet : La canne à sucre a façonné la Guadeloupe dans sa chair, son économie et sa mémoire. Elle a justifié la traite négrière, nourri l'Europe pendant des siècles, fait fortune pour les colons et la misère pour les esclaves. Aujourd'hui, la canne produit le rhum agricole — l'un des spiritueux les plus reconnus au monde, la seule AOC des DOM. Le Capricorne, signe de Terre gouverné par Saturne, est le signe du temps long, de la discipline, de la montée en puissance, du labeur qui finit par payer. Développe les 5 sections : (1) Histoire de la canne en Guadeloupe — son arrivée avec Christophe Colomb, le système des grandes habitations, les révoltes, l'abolition de 1848 et la continuité économique ; (2) Le rhum agricole guadeloupéen — Bielle, Damoiseau, Longueteau, Bologne, ce qui le différencie du rhum industriel, l'AOC depuis 2021 ; (3) Saturne et le temps long — pourquoi les Capricornes réussissent souvent tard, mais durablement, la patience comme stratégie et non comme résignation ; (4) La coupe de la canne — un travail physique extrême, les coupeurs de canne d'hier et d'aujourd'hui, les machines qui ont remplacé les bras, ce qu'on a perdu et ce qu'on a gagné ; (5) Ce que la canne enseigne : rien de précieux ne vient facilement, et les racines les plus profondes survivent aux tempêtes. 1 400 mots minimum.`,

  // NOTE: les prompts pour legba-les-chemins, ezili-freda-amour,
  // baron-samedi-mort-renaissance, damballa-serpent-sagesse,
  // trois-familles-vaudou et ogoun-mars-guerrier ont été retirés : ces
  // slugs sont supprimés de lib/articles-data.ts (contenu fondé sur le
  // vodou haïtien mal étiqueté « guadeloupéen », voir refonte /articles).
  // Ne pas les recréer sans un travail éditorial dédié et sourcé.
};

async function generateArticle(
  slug: string,
  apiKey: string,
): Promise<Record<string, unknown>> {
  const prompt = PROMPTS[slug];
  if (!prompt) throw new Error(`No prompt for slug: ${slug}`);

  console.log(`  → Génération : ${slug}…`);

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.8,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral ${res.status}: ${err}`);
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? '';
  return JSON.parse(content) as Record<string, unknown>;
}

async function main() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error('❌  MISTRAL_API_KEY manquant');
    process.exit(1);
  }

  // Support --slugs=slug1,slug2 pour régénération sélective
  const slugsArg = process.argv.find(a => a.startsWith('--slugs='));
  const requestedSlugs = slugsArg ? slugsArg.replace('--slugs=', '').split(',') : null;

  // Charger le JSON existant pour ne pas écraser les articles déjà bons
  let existing: Record<string, unknown> = {};
  try {
    const outPath = resolve(process.cwd(), 'lib/articles-content.json');
    existing = JSON.parse(require('fs').readFileSync(outPath, 'utf-8'));
  } catch { /* premier run */ }

  const allowOverwriteSourced = process.argv.includes('--overwrite-sourced');
  const slugs = requestedSlugs ?? Object.keys(PROMPTS);
  const result: Record<string, unknown> = { ...existing };

  console.log(`\n🖊️  Génération de ${slugs.length} article(s) demandé(s)…\n`);

  for (const slug of slugs) {
    const existingArticle = existing[slug] as { sources?: unknown[] } | undefined;
    const isCurated = Array.isArray(existingArticle?.sources) && existingArticle.sources.length > 0;

    if (isCurated && !allowOverwriteSourced) {
      console.log(`  ⏭️  ${slug} : déjà réécrit et sourcé à la main, ignoré (utiliser --overwrite-sourced pour forcer)`);
      continue;
    }

    try {
      result[slug] = await generateArticle(slug, apiKey);
      console.log(`  ✓ ${slug}`);
    } catch (e) {
      console.error(`  ✗ ${slug}:`, e);
      process.exit(1);
    }
    // Petit délai entre appels
    await new Promise((r) => setTimeout(r, 1500));
  }

  const outPath = resolve(process.cwd(), 'lib/articles-content.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✅  Contenu écrit dans lib/articles-content.json\n`);
}

main();
