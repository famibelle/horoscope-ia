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

  'venus-en-caraibe': `Rédige un article intitulé "Vénus en Caraïbe — amour, corps, liberté".

Sujet : Vénus dans la tradition astrologique occidentale est souvent réduite à la séduction, aux roses et à la douceur. En Caraïbe, l'amour a une autre texture — il porte la mémoire de l'esclavage, la séparation des familles, les corps qui ont appartenu à d'autres. Et pourtant il y a une joie de vivre, une sensualité, une liberté dans le rapport au corps et à l'amour qui est proprement caribéenne. Explore Vénus à travers le prisme guadeloupéen : le gwo ka comme rituel amoureux collectif, les femmes de Maryse Condé qui aiment sans demander la permission, la liberté affective comme acte politique. Parle aussi de Vénus en Lion, en Scorpion, en Poissons — avec des images caribéennes.`,

  'mercure-et-creole': `Rédige un article intitulé "Mercure et la langue créole — parler pour guérir".

Sujet : Mercure gouverne la parole, les mots, la communication, les échanges. Le créole guadeloupéen est une langue qui a survécu à l'interdit — pendant des siècles on a voulu l'effacer, lui préférer le français, la langue du maître. Et pourtant le créole a résisté, s'est transformé, a absorbé, a inventé. Cette résistance par la langue est mercurienne dans son essence. Explore Mercure comme planète de l'intelligence adaptative et de la communication. Parle du créole comme langue de guérison (les proverbes, les chants de travail, le conteur — le majò djò — qui tient la nuit entière). Évoque Mercure rétrograde comme moment de retour à la langue maternelle, au mot juste qu'on avait oublié. Développe chaque section sur 300 mots minimum avec des exemples précis de mots créoles, leur étymologie, leur usage dans la vie quotidienne.`,

  'careme-et-gemeaux': `Rédige un article intitulé "Le carême et l'énergie des Gémeaux — le vent du changement".

Sujet : En Guadeloupe, le carême désigne la saison sèche de janvier à juillet, portée par l'alizé — ce vent du nord-est qui balaie tout, dessèche la végétation, calme la mer et change les humeurs. C'est le contraire du Carême catholique : ici, c'est la saison du mouvement, des projets qui prennent forme, des routes qui s'ouvrent. Les Gémeaux (signe d'Air, gouverné par Mercure) vivent dans ce vent-là : mobilité, dualité, curiosité insatiable. Développe les 5 sections suivantes : (1) Le carême guadeloupéen, ses manifestations météo, les plantes qui fleurissent hors saison, le comportement de la mer à Grand Bourg ; (2) L'alizé comme force cosmique — ce que les anciens lui attribuaient, les légendes des pêcheurs de Sainte-Rose ; (3) Les Gémeaux vus depuis la Caraïbe — la dualité créole entre la mémoire de l'esclavage et l'élan vers le futur, entre Basse-Terre et Grande-Terre ; (4) Mercure en carême — comment les mois secs favorisent les négociations, les échanges, les décisions rapides ; (5) Ce que le carême enseigne aux autres signes. Inclus des détails climatiques précis et des expressions créoles. 1 400 mots minimum.`,

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

  'legba-les-chemins': `Rédige un article intitulé "Papa Legba, gardien des chemins et des seuils".

Sujet : Dans le vaudou guadeloupéen, Papa Legba est le premier invoqué dans toute cérémonie — sans lui, aucun loa ne peut être contacté. Gardien des carrefours (*kawoubouyé* en créole), il ouvre et ferme les portes entre le monde des vivants et celui des esprits. Sa correspondance africaine est Eshu (Yoruba). Ses couleurs sont le rouge et le noir. Ses offrandes : rhum, tabac, canne à sucre. Ses symboles : canne de vieillard, chapeau de paille. Il a une variante — Legba Ati — lié aux chemins secrets et à la magie cachée. En astrologie, il résonne avec l'énergie des Gémeaux : dualité, communication entre mondes, mobilité, carrefours mentaux.

Développe les 5 sections suivantes (chacune 280-380 mots) :
(1) Legba et la géographie sacrée de Guadeloupe — les carrefours dans la culture populaire guadeloupéenne, ce qu'on y fait (pièce lancée, crachat par terre, prière murmurée), les lieux précis où la présence des esprits est reconnue (les quatre-chemins de Gosier, de Sainte-Rose, de Capesterre), comment les anciens guidaient leurs enfants dans ces espaces ;
(2) Eshu, Legba, Exu — le même loa sous trois noms — la trajectoire de cet esprit depuis l'Afrique yoruba jusqu'à la Caraïbe en passant par le Brésil (Candomblé, Umbanda), ce que la Middle Passage a fait subir à cette figure, comment elle a survécu sous les traits de saint Lazare dans le catholicisme colonial ;
(3) Les cérémonies vaudou et le protocole de l'ouverture — pourquoi Legba est toujours le premier, le chant d'ouverture (Atibón Legba, ouvri barrière pou mwen), ce que signifie "ouvrir le chemin" dans la pratique concrète des hougan et manbo de Guadeloupe, les objets rituels (vèvè du carrefour tracé en poudre blanche, rhum versé aux quatre coins) ;
(4) Legba et les Gémeaux en astrologie — la dualité commune (vieux et jeune à la fois, doux et fort, passeur entre deux états), Mercure comme planète des seuils et des échanges, comment les natifs Gémeaux vivent instinctivement cette énergie du passage, du message, de l'entre-deux ;
(5) Legba aujourd'hui en Guadeloupe — entre tradition et modernité, comment la figure du vieux gardien des chemins survit dans les expressions créoles ("pa koupé wout mwen"), dans les pratiques de protection des maisons, dans les offrandes discrètes déposées aux croisées de route à l'aube. Ce qui reste quand on ne croit plus mais qu'on fait quand même par prudence.
1 400 mots minimum.`,

  'ezili-freda-amour': `Rédige un article intitulé "Ezili Freda — la déesse de l'amour qui n'appartient à personne".

Sujet : Ezili Freda est la loa de l'amour, de la beauté et de la prospérité dans le vaudou guadeloupéen. Sa correspondance africaine est Oshun (Yoruba). Ses couleurs : rose, blanc, bleu. Elle est synchrétisée avec la Vierge Marie — Notre-Dame de la Salette particulièrement. Ses symboles : miroirs, peignes en or, bijoux. Ses offrandes : parfums, champagne, poulets blancs, fleurs. Elle a une forme sombre — Ezili Je Wouj (Ezili aux Yeux Rouges) — liée à la colère et à la jalousie, invoquée pour la vengeance amoureuse. Ses plantes : jasmin (Ti-jasmin, Jasminum sambac), rose. En astrologie, elle résonne avec Vénus, le Lion et la maison 5 : passion créatrice, séduction, refus d'être possédée.

Développe les 5 sections suivantes (chacune 280-380 mots) :
(1) Ezili Freda dans la tradition guadeloupéenne — comment cette déesse est vécue dans la pratique populaire, les autels qui lui sont dressés dans les maisons de Pointe-à-Pitre et du Gosier, les femmes qui lui font des dons pour l'amour ou la fertilité, la confusion féconde avec la Vierge Marie dans un contexte catholique colonial, la fête du 16 juillet (Notre-Dame du Carmel) comme moment où les deux images se superposent ;
(2) La beauté comme pouvoir et comme danger — Ezili Freda n'est pas douce, elle est exigeante, capricieuse, capable de posséder ses initiés et de les faire pleurer sans raison apparente, le paradoxe d'un loa de l'amour qui porte aussi les blessures de l'amour, le mythe de la femme trop belle qu'aucun homme ne peut retenir, la figure de la femme libre dans la littérature guadeloupéenne (les personnages de Maryse Condé, de Simone Schwarz-Bart) ;
(3) Ezili Je Wouj — la face sombre — comment la même déesse peut devenir vengeresse, les rituels de rupture amoureuse, les bains de désenvoutement amoureux (bain d'amour, bain de chance), les pratiques de quimbois autour de la relation, pourquoi on ne joue pas avec Ezili et ce qui arrive quand on la déçoit ;
(4) Oshun, Aphrodite, Ezili — la même énergie sous trois latitudes — la permanence de l'archétype de la déesse de l'amour, ce qu'Oshun dit du Niger et Ezili de la Caraïbe, Vénus en astrologie comme planète des désirs, comment les natifs Lion, Taureau et Libra portent cette énergie dans leur rapport à l'amour et à la beauté ;
(5) Ezili Freda aujourd'hui — les femmes guadeloupéennes et la figure de la déesse libre, comment on porte des bijoux en son honneur sans le savoir, les parfums et les miroirs comme objets chargés, l'idée que l'amour vrai commence toujours par se plaire à soi-même avant de plaire aux autres — une leçon caribéenne que l'Occident apprend lentement.
1 400 mots minimum.`,

  'baron-samedi-mort-renaissance': `Rédige un article intitulé "Baron Samedi, maître de la mort et du rire".

Sujet : Baron Samedi est le loa de la mort et de la résurrection dans le vaudou guadeloupéen. Famille Pétro (née en Caraïbe, énergie forte). Couleurs : noir, violet, blanc. Offrandes : rhum noir, piments forts, poulets noirs. Symboles : squelettes, canne à pommeau, chapeau haut-de-forme, lunettes noires à un verre. Il parle avec un langage grossier mais protecteur. Gardien des cimetières — si tu es gravement malade et qu'il refuse de creuser ta tombe, tu survivras. Son arbre sacré : le bois-cochon (Xylosma buxifolium), dont les branches entourent les cimetières créoles. Variante proche : Baron Kriminel (forme noire absolue). En astrologie, il résonne avec le Scorpion (transformation, mort et renaissance, 8e maison) et Pluton.

Développe les 5 sections suivantes (chacune 280-380 mots) :
(1) Baron Samedi dans la culture guadeloupéenne — les cimetières comme lieux de pouvoir (cimetière de Morne-à-l'Eau avec ses tombes en carrelage noir et blanc, le cimetière de la Toussaint à Pointe-à-Pitre), les pratiques nocturnes, les offrandes déposées au pied des croix, la figure du Baron comme premier mort enterré dans chaque cimetière — et donc maître de tous ceux qui suivent ;
(2) Le rire de la mort — pourquoi Baron Samedi est obscène, blasphématoire et comique, comment l'humour noir est une stratégie de survie dans une culture qui a connu l'esclavage et ses violences, le lien entre le carnaval guadeloupéen (masques, déguisements, renversement de l'ordre) et l'énergie du Baron, les mas a pié, les mas doubout, le rire comme résistance ;
(3) Mort et renaissance dans le vaudou caribéen — la mort n'est pas une fin mais une transformation, les rituels funéraires créoles (la veillée mortuaire, le neuvaine, les chants de l'âme), ce que la famille Pétro dit que la Rada ne dit pas — la mort violente, arrachée, celle de l'esclavage et de la traversée, comment Baron Samedi est le loa qui a absorbé toute cette douleur-là ;
(4) Scorpion, Pluton et Baron Samedi — les trois maîtres de la transformation — pourquoi le Scorpion est le seul signe à avoir deux symboles (le scorpion et l'aigle, mort et résurrection), Pluton comme planète des ruptures nécessaires, comment les natifs Scorpion reconnaissent intuitivement la nécessité de mourir à soi-même pour renaître, le parallèle avec le rite de passage caribéen ;
(5) Baron Samedi aujourd'hui — la récupération pop culturelle (James Bond, Pirates des Caraïbes, Halloween) versus la réalité du loa dans les pratiques vivantes, ce qui se perd quand on déguise en carnaval ce qui était sacré, et ce qui résiste malgré tout — les offrandes discrètes, les familles qui connaissent les règles sans jamais les avoir apprises dans un livre.
1 400 mots minimum.`,

  'damballa-serpent-sagesse': `Rédige un article intitulé "Damballa, le grand serpent arc-en-ciel".

Sujet : Damballa (Damballa-Wedo) est le serpent cosmique du vaudou guadeloupéen, symbole de sagesse, de paix et de fertilité. Famille Rada. Correspondance africaine : Oshumare (Yoruba). Couleurs : blanc et vert. Associé aux arcs-en-ciel et aux sources d'eau pure. Offrandes : œufs blancs, lait, maïs. Rituel distinctif : tracer des serpents en poudre blanche (*pwen*) sur le sol. Animal associé : le serpent-boa (Boa constrictor). Plante associée : herbe-serpent (Aristolochia trilobata), utilisée pour neutraliser les venins. En astrologie, il résonne avec les Poissons (intuition, profondeur, dissolution des frontières) et Neptune (l'informe, l'ancien, l'inconscient collectif).

Développe les 5 sections suivantes (chacune 280-380 mots) :
(1) Damballa et le serpent en Guadeloupe — la place du serpent dans la culture créole (le boa de Guadeloupe, Boa constrictor, espèce protégée), les croyances populaires autour du serpent (signe de pluie prochaine, messager des ancêtres, gardien des sources), le paradoxe d'un animal à la fois redouté et sacré, la forêt de la Basse-Terre comme espace où Damballa est ressenti, les rivières du Parc National (Rivière des Vieux-Habitants, Rivière Sens) comme lieux sacrés ;
(2) Oshumare, Damballa, le serpent arc-en-ciel — la migration de cet archétype depuis l'Afrique yoruba jusqu'à la Caraïbe et au-delà (le serpent arc-en-ciel chez les Kalinagos, les Amérindiens d'Amazonie), ce que le serpent cosmique dit des civilisations qui l'ont vénéré, pourquoi l'arc-en-ciel (*lakansyèl* en créole) est regardé avec une attention particulière après la pluie dans la Guadeloupe traditionnelle ;
(3) Le silence de Damballa — contrairement aux autres loas, Damballa ne parle pas, il siffle, il se meut, il serpente, les initiés possédés par lui rampent au sol et refusent la nourriture ordinaire, ce que ce silence dit de la sagesse la plus ancienne — celle d'avant les mots, d'avant les catégories, d'avant la distinction entre le vivant et le mort, entre l'eau et la terre ;
(4) Guérison et serpent — l'herbe-serpent (Aristolochia trilobata) dans la pharmacopée créole guadeloupéenne, son utilisation contre les morsures de serpent et dans les bains purifiants, la médecine traditionnelle créole (*doktè fey*) comme héritière d'un savoir africain et kalinago combiné, comment Damballa est invoqué dans les rituels de guérison profonde (pas les maladies ordinaires, mais les crises existentielles, les ruptures d'identité), le lien avec Neptune et les Poissons en astrologie (médecine psychosomatique, dissolution de l'ego) ;
(5) Damballa dans le monde moderne — la mue comme métaphore de la transformation nécessaire (le serpent quitte sa peau pour grandir), comment cette image parle aux générations guadeloupéennes actuelles tiraillées entre l'héritage culturel et la modernité française, le retour discret mais réel des pratiques vaudou dans la jeunesse créole, ce que signifie honorer Damballa sans se déguiser en mystique.
1 400 mots minimum.`,

  'trois-familles-vaudou': `Rédige un article intitulé "Rada, Pétro, Congo — les trois familles du vaudou guadeloupéen".

Sujet : Le vaudou guadeloupéen est structuré en trois familles (Nations) qui correspondent à trois lignées d'esprits avec des énergies, des origines et des pratiques distinctes :
- **Rada** : 18 loas, origines africaines (Dahomey, Yoruba), énergie douce et bienveillante. Loas : Papa Legba, Ezili Freda, Damballa, Ogoun, Ayizan, Loko. Couleurs dominantes : blanc, bleu, or. Cérémonies diurnes, chants lents.
- **Pétro** : 18 loas, nés en Caraïbe (créés dans la douleur de l'esclavage), énergie forte et imprévisible. Loas : Baron Samedi, Kalfu, Marinette, Baron Kriminel. Couleurs : rouge, noir. Cérémonies nocturnes, rythmes violents, feu, piment.
- **Congo** : énergies terrestres et ancestrales, loa principal Azaka (agriculture, récoltes, peuple). Plus proche du quotidien, moins spectaculaire mais fondamental.
En astrologie, ces trois familles correspondent à trois types d'énergie : Rada = planètes de jour (Soleil, Jupiter, Vénus), Pétro = planètes de nuit et de transformation (Mars, Pluton, Saturne), Congo = planètes de la Terre et du corps (Lune, Cérès, Vesta).

Développe les 5 sections suivantes (chacune 280-380 mots) :
(1) Rada — la mémoire africaine intacte — d'où viennent ces esprits (le royaume de Dahomey, les ports de traite, les esclaves qui ont emporté leurs dieux dans la traversée), comment la Nation Rada représente la tentative de conserver ce qui existait avant, les cérémonies blanches et bleues, la voix de Damballa qui ne parle pas et d'Ezili qui pleure toujours, le lien avec les signes astrologiques diurnes — ceux qui cherchent la lumière ;
(2) Pétro — les loas nés de la résistance — comment des esprits entièrement nouveaux ont émergé dans la Caraïbe au XVIIe et XVIIIe siècles, forgés par la violence de l'esclavage, le manque, la séparation des familles, Baron Samedi qui garde les cimetières là où les esclaves enterraient leurs morts sans nom, Marinette qui hurle dans la forêt de nuit, Kalfu qui contrôle les carrefours dangereux — les mêmes carrefours que Legba, mais la nuit, et avec l'intention de nuire ou de protéger à tout prix ;
(3) Congo — les esprits de la terre et du peuple — Azaka, loa de l'agriculture (Taureau/Congo dans les mappings astrologiques), chapeau de paille et sacoche de paysan, invoqué pour les récoltes, la pluie, la stabilité du foyer, comment la Nation Congo représente le quotidien spirituel — pas le grand rituel exceptionnel mais la prière ordinaire du dimanche, le jardin créole comme espace sacré ;
(4) Les cérémonies et les différences rituelles — un ounfo (temple vaudou) ne ressemble pas à une église, mais il a ses règles aussi strictes, les tambours différents selon la famille (manman, seconde, bula pour Rada — kata, boula, assotor pour Pétro), les chants d'ouverture qui nomment chaque famille, comment un guérisseur (*hougan* ou *manbo*) navigue entre les trois, ce qu'on ne fait jamais mélanger ;
(5) Trois familles, un seul peuple — comment cette structure tripartite reflète l'histoire guadeloupéenne elle-même (africaine, créole, paysanne), le parallèle avec la trinité astrologique (feu/air/eau/terre), ce que comprendre les trois familles dit de la psychologie caribéenne — la capacité à tenir ensemble des énergies contradictoires, à ne pas choisir entre l'ancien monde et le nouveau, entre la douceur et la force.
1 400 mots minimum.`,

  'ogoun-mars-guerrier': `Rédige un article intitulé "Ogoun et Mars — l'énergie du guerrier qui protège".

Sujet : Ogoun est le loa de la guerre, du travail et de la justice dans le vaudou guadeloupéen. Famille Rada. Correspondance africaine : Ogun (Yoruba). Couleurs : vert et rouge. Symboles : épées, clous, machettes, outils en fer. Offrandes : rhum flambé, viande crue, piments. Protecteur des forgerons, des chasseurs, des travailleurs. Sa plante : plante-ogoun (Petiveria alliacea, *herbe-à-pisser* en créole), utilisée pour purifier le sang et soigner les plaies. Animal associé : coq rouge (sacrifié dans les cérémonies). En astrologie, il correspond à Mars et au Bélier — énergie initiatrice, combative, protectrice, force brute mise au service de la justice.

Développe les 5 sections suivantes (chacune 280-380 mots) :
(1) Ogoun et les travailleurs guadeloupéens — la machette (*kouto-manchèt*) comme outil universel de Guadeloupe (canne à sucre, forêt, cuisine), le travail manuel comme acte sacré dans la tradition créole, les coupeurs de canne qui invoquaient Ogoun pour tenir jusqu'au soir, les grèves de 1952 à Pointe-à-Pitre et la violence des forces de l'ordre contre les ouvriers agricoles — comment Ogoun est le loa des luttes sociales et pas seulement des guerres militaires ;
(2) Ogun en Afrique, Ogoun en Caraïbe — la trajectoire de cet esprit depuis le peuple Yoruba du Nigeria jusqu'aux plantations de Guadeloupe, comment il a survécu en changeant de visage (saint Jacques Majeur dans le catholicisme colonial), ce que signifie être le loa du fer dans une société où le fer a servi à enchaîner avant de servir à libérer, la machette comme objet chargé des deux côtés ;
(3) Mars en astrologie — force, courage, initiation — pourquoi Mars n'est pas la planète de la violence mais de l'énergie nécessaire pour commencer, pour défendre, pour ne pas céder, les natifs Mars en Bélier qui foncent sans calculer, Mars en Scorpion qui attend le bon moment, Mars en Cancer qui se bat pour sa famille — comment chaque position de Mars dans le thème natal dit quelque chose de la façon dont on mobilise sa force intérieure ;
(4) Plante-ogoun et médecine créole — la Petiveria alliacea (*herbe-à-pisser*, *guinea hen weed*) dans la pharmacopée traditionnelle guadeloupéenne, ses propriétés antiseptiques et anti-inflammatoires reconnues depuis des siècles par les *doktè fey*, la façon de la préparer (bain de feuilles, décoction, frottement), le lien entre soigner les plaies physiques et soigner les blessures de l'âme — Ogoun comme loa de la guérison par le fer, pas seulement de la guerre ;
(5) L'énergie guerrière aujourd'hui — ce que signifie invoquer Ogoun en 2026 en Guadeloupe, les jeunes qui se battent pour la reconnaissance culturelle, les artistes de gwoka qui continuent de frapper leurs tambours dans la même énergie que les résistants d'avant, la différence entre la violence subie et la force assumée, comment Mars en astrologie et Ogoun en vaudou disent la même chose : sans le courage de se lever, rien ne change jamais.
1 400 mots minimum.`,
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

  const slugs = requestedSlugs ?? Object.keys(PROMPTS);
  const result: Record<string, unknown> = { ...existing };

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
