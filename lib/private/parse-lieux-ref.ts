/**
 * Script de conversion de lieux_spirituels_ref.md vers lieux-data.ts
 * Exécution : npx tsx lib/private/parse-lieux-ref.ts
 */

import fs from 'fs';
import path from 'path';

const MD_PATH = path.join(__dirname, 'lieux_spirituels_ref.md');
const TS_PATH = path.join(__dirname, 'lieux-data.ts');

const TS_INTERFACE = `export interface LieuEntry {
  id: string;
  categorie: string;
  sousCategorie: string;
  nom: string;
  localisation: string;
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
function generateId(nom: string, localisation: string, index: number): string {
  const base = nom
    .toLowerCase()
    .replace(/\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (base) {
    // Ajouter la localisation pour éviter les doublons
    if (localisation) {
      const locBase = localisation
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-');
      // Prendre les premières lettres de la localisation pour différencier
      const locPrefix = locBase.split('-')[0].substring(0, 3);
      return `${base}-${locPrefix}`;
    }
    return base || `lieu-${index}`;
  }
  return `lieu-${index}`;
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
  
  if (lastPart.match(/^(SACR[ÉE]|SYMBOLE|MYTHIQUE|CULTUREL|AMBIVALENT|EMBL[ÉÉ]MATIQUE|END[ÉÉ]MIQUE)/i)) {
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
  return cells.length >= 4 ? cells : null;
}

// Vérifier si une ligne est un séparateur
function isTableSeparator(line: string): boolean {
  return line.includes('---') && line.includes('|');
}

// Vérifier si une ligne est un en-tête
function isTableHeader(line: string): boolean {
  return line.includes('Catégorie') && line.includes('Nom du lieu');
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
  if (cells.length < 4) return false;
  const firstCell = cells[0];
  const firstCellWords = firstCell.split(/\s+/).length;
  const hasDataAfter = cells.slice(1, 4).some(c => c !== '');
  return firstCellWords <= 3 && hasDataAfter;
}

// Créer une entrée
function createEntry(
  category: string,
  sousCategory: string,
  nom: string,
  localisation: string,
  sacreSymbolique: string,
  dimensionCulturelle: string,
  index: number
) {
  const id = generateId(nom, localisation, index);
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
    nom,
    localisation,
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
  const nom = cells[1];
  const localisation = cells[2];
  const sacreSymbolique = cells[3] || '';
  const dimensionCulturelle = cells[4] || '';
  
  if (!nom || nom === '---') return;
  
  // Clé unique basée sur le nom et la localisation
  const uniqueKey = `${normalizeName(nom)}|${normalizeName(localisation)}`;
  
  const newEntry = createEntry(
    category, sousCategory, nom, localisation,
    sacreSymbolique, dimensionCulturelle, entries.length
  );
  
  const existingIndex = entries.findIndex(e => 
    `${normalizeName(e.nom)}|${normalizeName(e.localisation)}` === uniqueKey
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

// Données générées automatiquement depuis lieux_spirituels_ref.md
// NE PAS MODIFIER MANUELLEMENT - Exécuter 'npm run lieux:parse' pour mettre à jour
export const lieuxData: LieuEntry[] = [
${props}
];

// Index pour recherche rapide
export const lieuxIndex: Record<string, LieuEntry> = {
${entries.map(entry => `  "${entry.id}": lieuxData.find(p => p.id === "${entry.id}")!`).join(',\n')}
};

// Fonction utilitaire
export function getLieuByNom(nom: string): LieuEntry | undefined {
  return lieuxData.find(p => 
    p.nom.toLowerCase() === nom.toLowerCase() ||
    p.nom.toLowerCase().includes(nom.toLowerCase())
  );
}
`;
  
  fs.writeFileSync(TS_PATH, tsContent, 'utf-8');
  console.log(`📝 Fichier généré : ${TS_PATH}`);
  console.log(`🔍 Exemple : ${entries.length > 0 ? `${entries[0].nom} (${entries[0].id})` : 'Aucune entrée'}`);
}

// Fonction principale
function main() {
  console.log('📖 Lecture de lieux_spirituels_ref.md...');
  
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
    
    if (cells.length >= 4) {
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
