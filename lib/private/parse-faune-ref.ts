/**
 * Script de conversion de faune_guadeloupe_ref.md vers faune-data.ts
 * Exécution : npx tsx lib/private/parse-faune-ref.ts
 */

import fs from 'fs';
import path from 'path';

const MD_PATH = path.join(__dirname, 'faune_guadeloupe_ref.md');
const TS_PATH = path.join(__dirname, 'faune-data.ts');

const TS_INTERFACE = `export interface FauneEntry {
  id: string;
  categorie: string;
  sousCategorie: string;
  nomCreole: string;
  nomFrancais: string;
  nomScientifique: string;
  isResistanceSymbol: boolean;
  resistanceType?: string;
  resistanceDescription?: string;
  sacreSymbolique?: string;
  dimensionCulturelle: string;
  tags: string[];
}
`;

// Normaliser un nom
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

// Générer un ID
function generateId(nomCreole: string, nomScientifique: string, index: number): string {
  const base = nomCreole
    .toLowerCase()
    .replace(/\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (base) {
    // Ajouter le nom scientifique pour éviter les doublons
    if (nomScientifique) {
      const sciBase = nomScientifique
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-');
      // Prendre les premières lettres du nom scientifique pour différencier
      const sciPrefix = sciBase.split('-')[0].substring(0, 3);
      return `${base}-${sciPrefix}`;
    }
    return base || `faune-${index}`;
  }
  return `faune-${index}`;
}

// Détecter si c'est un symbole de résistance
function hasResistanceMarkers(...texts: string[]): boolean {
  return texts.some(t => t.includes('⭐'));
}

// Extraire le type et la description de résistance
function extractResistanceInfo(dimension: string, sacre: string): { type?: string; description?: string } {
  const allText = `${sacre} ${dimension}`;
  if (!allText.includes('⭐')) return {};
  
  const parts = allText.split('⭐').map(p => p.trim()).filter(p => p);
  if (parts.length === 0) return {};
  
  const lastPart = parts[parts.length - 1];
  
  if (lastPart.match(/^(SACR[ÉE]|SYMBOLE|MYTHIQUE|CULTUREL|AMBIVALENT|EMBL[ÉÉ]MATIQUE|END[ÉÉ]MIQUE|DISPARU)/i)) {
    const type = lastPart.split('|')[0].trim();
    const description = parts.slice(0, -1).join(' ').trim();
    return { type: type || undefined, description: description || undefined };
  }
  
  for (const part of parts) {
    const match = part.match(/^(SACR[ÉE]|SYMBOLE|MYTHIQUE|[A-Z][^\s]+)/i);
    if (match) {
      return { type: match[0].trim(), description: undefined };
    }
  }
  
  return {};
}

// Nettoyer une cellule
function cleanCell(cell: string): string {
  return cell.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
}

// Parser une ligne
function parseRow(line: string): string[] | null {
  const cleaned = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = cleaned.split('|').map(cleanCell);
  return cells.length >= 5 ? cells : null;
}

// Vérifier si une ligne est un séparateur
function isTableSeparator(line: string): boolean {
  return line.includes('---') && line.includes('|');
}

// Vérifier si une ligne est un en-tête
function isTableHeader(line: string): boolean {
  return line.includes('Famille') && line.includes('Nom créole');
}

// Vérifier si une ligne est une section
function isSectionLine(cells: string[]): boolean {
  if (cells.length < 2) return false;
  const firstCell = cells[0].toUpperCase();
  const restEmpty = cells.slice(1).every(c => c === '');
  return restEmpty && firstCell === firstCell && firstCell.length > 0;
}

// Vérifier si une ligne est une sous-section
function isSubSectionLine(cells: string[]): boolean {
  if (cells.length < 5) return false;
  const firstCell = cells[0];
  const firstCellWords = firstCell.split(/\s+/).length;
  const hasDataAfter = cells.slice(1, 5).some(c => c !== '');
  return firstCellWords <= 3 && hasDataAfter;
}

// Créer une entrée
function createEntry(
  category: string,
  sousCategory: string,
  nomCreole: string,
  nomFrancais: string,
  nomScientifique: string,
  sacreSymbolique: string,
  dimensionCulturelle: string,
  index: number
) {
  const id = generateId(nomCreole, nomScientifique, index);
  const isResistanceSymbol = hasResistanceMarkers(dimensionCulturelle, sacreSymbolique);
  
  const { type: resistanceType, description: resistanceDescription } = 
    extractResistanceInfo(dimensionCulturelle, sacreSymbolique);
  
  const cleanSacre = sacreSymbolique.replace(/⭐/g, '').replace(/\s+/g, ' ').trim();
  const cleanDimension = dimensionCulturelle.replace(/⭐/g, '').replace(/\s+/g, ' ').trim();
  
  const tags = [
    category.toLowerCase(),
    sousCategory.toLowerCase(),
    ...(isResistanceSymbol ? ['resistance', 'sacré'] : []),
    ...(resistanceType ? [resistanceType.toLowerCase().replace(/\s+/g, '-')] : [])
  ].filter(Boolean);
  
  return {
    id,
    categorie: category,
    sousCategorie: sousCategory.replace(/\s*—\s*/g, '-').toLowerCase(),
    nomCreole,
    nomFrancais,
    nomScientifique,
    isResistanceSymbol,
    resistanceType,
    resistanceDescription,
    sacreSymbolique: cleanSacre || resistanceType || undefined,
    dimensionCulturelle: cleanDimension,
    tags
  };
}

// Ajouter une entrée avec déduplication
function addEntry(
  entries: Array<Record<string, any>>,
  category: string,
  sousCategory: string,
  cells: string[]
) {
  const nomCreole = cells[1];
  const nomFrancais = cells[2];
  const nomScientifique = cells[3];
  const sacreSymbolique = cells[4] || '';
  const dimensionCulturelle = cells[5] || '';
  
  if (!nomCreole || nomCreole === '---') return;
  
  // Clé unique basée sur le nom scientifique
  const uniqueKey = nomScientifique 
    ? normalizeName(nomScientifique)
    : `${normalizeName(nomCreole)}|${normalizeName(nomFrancais)}`;
  
  const newEntry = createEntry(
    category, sousCategory, nomCreole, nomFrancais,
    nomScientifique, sacreSymbolique, dimensionCulturelle, entries.length
  );
  
  const existingIndex = entries.findIndex(e => 
    (e.nomScientifique ? normalizeName(e.nomScientifique) : `${normalizeName(e.nomCreole)}|${normalizeName(e.nomFrancais)}`) === uniqueKey
  );
  
  if (existingIndex !== -1) {
    entries[existingIndex] = newEntry;
  } else {
    entries.push(newEntry);
  }
}

// Générer le fichier TypeScript
function generateTSFile(entries: Array<Record<string, any>>) {
  const props = entries.map(entry => {
    const lines = [];
    for (const [key, value] of Object.entries(entry)) {
      if (value === undefined) {
        lines.push(`  ${key}: undefined`);
      } else if (typeof value === 'string') {
        lines.push(`  ${key}: "${value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`);
      } else if (typeof value === 'boolean') {
        lines.push(`  ${key}: ${value}`);
      } else if (Array.isArray(value)) {
        lines.push(`  ${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
      }
    }
    return `  {
${lines.join(',\n')},
  }`;
  }).join(',\n');
  
  const tsContent = `${TS_INTERFACE}

// Données générées automatiquement depuis faune_guadeloupe_ref.md
// NE PAS MODIFIER MANUELLEMENT - Exécuter 'npm run faune:parse' pour mettre à jour
export const fauneData: FauneEntry[] = [
${props}
];

// Index pour recherche rapide
export const fauneIndex: Record<string, FauneEntry> = {
${entries.map(entry => `  "${entry.id}": fauneData.find(p => p.id === "${entry.id}")!`).join(',\n')}
};

// Fonction utilitaire
export function getFauneByNomCreole(nom: string): FauneEntry | undefined {
  return fauneData.find(p => 
    p.nomCreole.toLowerCase() === nom.toLowerCase() ||
    p.nomCreole.toLowerCase().includes(nom.toLowerCase()) ||
    p.nomFrancais.toLowerCase() === nom.toLowerCase() ||
    p.nomFrancais.toLowerCase().includes(nom.toLowerCase())
  );
}
`;
  
  fs.writeFileSync(TS_PATH, tsContent, 'utf-8');
  console.log(`📝 Fichier généré : ${TS_PATH}`);
  console.log(`🔍 Exemple : ${entries.length > 0 ? `${entries[0].nomCreole} (${entries[0].id})` : 'Aucune entrée'}`);
}

// Fonction principale
function main() {
  console.log('📖 Lecture de faune_guadeloupe_ref.md...');
  
  const mdContent = fs.readFileSync(MD_PATH, 'utf-8');
  const lines = mdContent.split('\n');
  
  const entries: Array<Record<string, any>> = [];
  let currentCategory = 'INCONNUE';
  let currentSousCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('#') || line.startsWith('| ---')) continue;
    if (isTableSeparator(line) || isTableHeader(line)) continue;
    
    const cells = parseRow(line);
    if (!cells) continue;
    
    if (isSectionLine(cells)) {
      currentCategory = cells[0];
      currentSousCategory = '';
      continue;
    }
    
    if (isSubSectionLine(cells)) {
      if (cells[1] !== '') {
        currentSousCategory = cells[0];
        addEntry(entries, currentCategory, currentSousCategory, cells);
      } else {
        currentSousCategory = cells[0];
      }
      continue;
    }
    
    if (cells.length >= 5) {
      if (cells[0] && cells[0] !== currentCategory && !cells[0].includes('/')) {
        const potentialSousCat = cells[0];
        if (potentialSousCat.split(/\s+/).length <= 3) {
          currentSousCategory = potentialSousCat;
        }
      }
      addEntry(entries, currentCategory, currentSousCategory, cells);
    }
  }
  
  console.log(`✅ Parsing terminé : ${entries.length} entrées trouvées`);
  generateTSFile(entries);
}

main();
