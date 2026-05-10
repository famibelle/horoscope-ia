import { readFileSync, writeFileSync } from 'fs';

const INDEX_CULTUREL = '/home/medhi/SourceCode/FlashInfoKarukera/private/index_culturel';

interface CulturalEntry {
  nomCreole: string;
  nomFr: string;
  culture: string;
}

type Element = 'Eau' | 'Feu' | 'Terre' | 'Air';

const SIGN_ELEMENTS: Record<string, Element> = {
  belier: 'Feu', taureau: 'Terre', gemeaux: 'Air', cancer: 'Eau',
  lion: 'Feu', vierge: 'Terre', balance: 'Air', scorpion: 'Eau',
  sagittaire: 'Feu', capricorne: 'Terre', verseau: 'Air', poissons: 'Eau',
};

const ELEMENT_FAUNE: Record<Element, string[]> = {
  Eau:   ['Crustacé', 'Mollusque', 'Poisson', 'Tortue marine', 'Amphibien'],
  Feu:   ['Oiseau', 'Reptile', 'Insecte'],
  Terre: ['Mammifère', 'Reptile', 'Insecte', 'Amphibien'],
  Air:   ['Oiseau', 'Chauve-souris', 'Insecte'],
};

const ELEMENT_FLORE: Record<Element, string[]> = {
  Eau:   ['Rimèd razié', 'Ornementale / Sacrée'],
  Feu:   ['Arbre', 'Ornementale / Sacrée', 'Plante / Résistance'],
  Terre: ['Légume / Racine', 'Fruit', 'Plante racine', 'Rimèd razié'],
  Air:   ['Rimèd razié', 'Arbre fruitier', 'Arbuste / Culture'],
};

const ELEMENT_LIEUX: Record<Element, string[]> = {
  Eau:   ['Source thermale', 'Cascade', 'Rivière', 'Mangrove', 'Lac', 'Bras de mer', 'Fonds marins', 'Îlet', 'Lieu rituel'],
  Feu:   ['Volcan', 'Forêt / Réserve', 'Mornes', 'Falaise', 'Pointe', 'Cap', 'Axe symbolique'],
  Terre: ['Forêt / Réserve', 'Mornes', 'Île', 'Grotte/Abri', 'Axe symbolique'],
  Air:   ['Pointe', 'Falaise', 'Cap', 'Île', 'Fonds marins'],
};

function parseMarkdownRows(content: string): Array<string[]> {
  return content.split('\n')
    .filter(l => l.startsWith('|') && !l.includes('---'))
    .map(l => l.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1))
    .filter(cols => cols.length >= 2 && cols[0] && cols[1]);
}

function parseFaune(categories: string[]): CulturalEntry[] {
  const content = readFileSync(`${INDEX_CULTUREL}/faune_guadeloupe_ref.md`, 'utf-8');
  return parseMarkdownRows(content)
    .filter(cols => categories.some(c => cols[0].includes(c)) && cols.length >= 6)
    .map(cols => ({ nomCreole: cols[1], nomFr: cols[2], culture: cols[5] }))
    .filter(e => e.nomCreole && e.culture.length > 20);
}

function parseFlore(categories: string[]): CulturalEntry[] {
  const content = readFileSync(`${INDEX_CULTUREL}/flore_guadeloupe_ref.md`, 'utf-8');
  return parseMarkdownRows(content)
    .filter(cols => categories.some(c => cols[0].includes(c)) && cols.length >= 5)
    .map(cols => ({ nomCreole: cols[1], nomFr: cols[2], culture: cols[4] }))
    .filter(e => e.nomCreole && e.culture.length > 20);
}

function parseLieux(categories: string[]): CulturalEntry[] {
  const content = readFileSync(`${INDEX_CULTUREL}/lieux_spirituels_ref.md`, 'utf-8');
  return parseMarkdownRows(content)
    .filter(cols => categories.some(c => cols[0].includes(c)) && cols.length >= 5)
    .map(cols => ({ nomCreole: cols[1], nomFr: cols[2], culture: cols[4] }))
    .filter(e => e.nomCreole && e.culture.length > 20);
}

const result: Record<string, { faune: CulturalEntry[]; flore: CulturalEntry[]; lieux: CulturalEntry[] }> = {};

for (const [signId, element] of Object.entries(SIGN_ELEMENTS)) {
  result[signId] = {
    faune: parseFaune(ELEMENT_FAUNE[element]),
    flore: parseFlore(ELEMENT_FLORE[element]),
    lieux: parseLieux(ELEMENT_LIEUX[element]),
  };
  console.log(`${signId} (${element}): ${result[signId].faune.length} faune, ${result[signId].flore.length} flore, ${result[signId].lieux.length} lieux`);
}

writeFileSync(
  '/home/medhi/SourceCode/horoscope-ia/lib/cultural-context-data.json',
  JSON.stringify(result, null, 2),
);
console.log('\nFichier généré : lib/cultural-context-data.json');
