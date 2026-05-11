#!/usr/bin/env npx tsx
/**
 * Génère les 6 articles en voix Maryse Condé via Mistral Large.
 * Lance avec : npx tsx scripts/generate-articles.ts
 * Résultat dans lib/articles-content.json (versionné, aucun appel runtime).
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const MARYSE_SYSTEM = `Tu es Maryse Condé — romancière guadeloupéenne, prix Nobel alternatif de littérature 2018. Tu rédiges un article de fond pour un site d'astrologie ancré dans la culture guadeloupéenne.

Ta voix : phrases qui claquent, rythme oral, images concrètes ancrées dans le quotidien guadeloupéen et caribéen. Tu glisses parfois un mot créole comme on glisse une épice dans un plat. Tu ne surexpliques pas. Tu respectes l'intelligence de tes lecteurs.

Structure de l'article :
- introduction : accroche forte, 2-3 phrases
- 3 à 4 sections thématiques avec un titre court
- conclusion : une phrase qui reste, pas de morale facile

Format de réponse : un objet JSON valide avec ces clés exactes :
{
  "introduction": "...",
  "sections": [
    { "titre": "...", "corps": "..." },
    { "titre": "...", "corps": "..." },
    { "titre": "...", "corps": "..." }
  ],
  "conclusion": "..."
}

Chaque section fait 120 à 180 mots. Ton oral direct, parle à la deuxième personne parfois. Ancre dans la Guadeloupe : lieux réels (la Soufrière, la mangrove de Guadeloupe, la Pointe-à-Pitre, le marché de Saint-Claude…), plantes (manioc, balisier, canne), animaux (colibri, frégate, iguane). Sans markdown dans les valeurs JSON.`;

const PROMPTS: Record<string, string> = {
  'lune-et-peche': `Rédige un article intitulé "La lune et les pêcheurs de Karukera".

Sujet : avant le GPS et les météos satellitaires, les pêcheurs de Guadeloupe lisaient la lune pour décider quand partir en mer, comment poser les nasses, quand revenir. Ce savoir lunaire — transmis de père en fils, de mère en fille — est aussi une forme d'astrologie vivante, incarnée dans la pratique quotidienne. Parle des marées, des cycles lunaires et de la pêche au gros. Évoque la baie de Sainte-Rose, les pêcheurs de Marie-Galante, le boucantier. Lie ce savoir concret à ce que l'astrologie dit de la lune : émotions, rythmes, mémoire de l'eau.`,

  'quimbois-et-planetes': `Rédige un article intitulé "Quimbois et planètes — un savoir parallèle".

Sujet : le quimbois guadeloupéen n'est pas de la superstition — c'est un système de connaissance du monde invisible, structuré, transmis, efficace pour ceux qui y croient. Les planètes astrales et le quimbois partagent une même conviction fondamentale : les forces invisibles agissent sur le vivant. Explore les points de contact entre les deux systèmes (Mars et l'agression, Vénus et les sorts d'amour, Saturne et la protection des ancêtres). Évoque le malomé, les bains de chance, la fumée du soufre de la Soufrière utilisée dans certaines pratiques. Sois honnête : tu ne crois pas à tout, mais tu respectes ce savoir.`,

  'soufriere-et-saturne': `Rédige un article intitulé "La Soufrière, Saturne et l'art d'attendre".

Sujet : la Soufrière de Guadeloupe gronde en permanence depuis des siècles — elle menace, elle se tait, elle reprend. En 1976, Louis Jospin a ordonné l'évacuation de 72 000 personnes pour rien. En 2021, les fumées ont repris. La Soufrière enseigne la même leçon que Saturne en astrologie : la patience, l'endurance, la capacité à vivre avec une menace sourde et à ne pas se laisser consumer par l'urgence. Explore Saturne comme planète de la discipline et du temps long. Parle des Guadeloupéens qui n'ont pas évacué en 1976, de ceux qui connaissent leur volcan comme un voisin difficile mais familier.`,

  'signes-eau-mangrove': `Rédige un article intitulé "Les signes d'eau et la mangrove guadeloupéenne".

Sujet : Cancer, Scorpion, Poissons sont des signes d'eau — ils vivent dans l'entre-deux, dans les zones où les frontières ne tiennent pas. La mangrove de Guadeloupe (notamment autour du Grand Cul-de-Sac Marin) est exactement cet espace : ni tout à fait mer, ni tout à fait terre, passage entre les mondes, refuge des alevins et des crabes de terre. Explore les qualités de ces trois signes (intuition, profondeur, mémoire émotionnelle) à travers le prisme de la mangrove. Parle du palétuvrier, des racines aériennes, du silence particulier de ce milieu. Évoque aussi la menace que fait peser le changement climatique sur ces espaces — et sur la capacité des signes d'eau à préserver leur monde intérieur.`,

  'venus-en-caraibe': `Rédige un article intitulé "Vénus en Caraïbe — amour, corps, liberté".

Sujet : Vénus dans la tradition astrologique occidentale est souvent réduite à la séduction, aux roses et à la douceur. En Caraïbe, l'amour a une autre texture — il porte la mémoire de l'esclavage, la séparation des familles, les corps qui ont appartenu à d'autres. Et pourtant il y a une joie de vivre, une sensualité, une liberté dans le rapport au corps et à l'amour qui est proprement caribéenne. Explore Vénus à travers le prisme guadeloupéen : le gwo ka comme rituel amoureux collectif, les femmes de Maryse Condé qui aiment sans demander la permission, la liberté affective comme acte politique. Parle aussi de Vénus en Lion, en Scorpion, en Poissons — avec des images caribéennes.`,

  'mercure-et-creole': `Rédige un article intitulé "Mercure et la langue créole — parler pour guérir".

Sujet : Mercure gouverne la parole, les mots, la communication, les échanges. Le créole guadeloupéen est une langue qui a survécu à l'interdit — pendant des siècles on a voulu l'effacer, lui préférer le français, la langue du maître. Et pourtant le créole a résisté, s'est transformé, a absorbé, a inventé. Cette résistance par la langue est mercurienne dans son essence. Explore Mercure comme planète de l'intelligence adaptative et de la communication. Parle du créole comme langue de guérison (les proverbes, les chants de travail, le conteur — le majò djò — qui tient la nuit entière). Évoque Mercure rétrograde comme moment de retour à la langue maternelle, au mot juste qu'on avait oublié.`,
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
      max_tokens: 2000,
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

  const slugs = Object.keys(PROMPTS);
  const result: Record<string, unknown> = {};

  console.log(`\n🖊️  Génération de ${slugs.length} articles en voix Maryse Condé…\n`);

  for (const slug of slugs) {
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
