/**
 * Script de conversion de kreyol_resistance_symbol_ref.md vers kreyol-data.ts
 * Exécution : npx tsx lib/private/parse-kreyol-ref.ts
 */

import fs from 'fs';
import path from 'path';

const MD_PATH = path.join(__dirname, 'kreyol_resistance_symbol_ref.md');
const TS_PATH = path.join(__dirname, 'kreyol-data.ts');

const TS_INTERFACE = `export interface KreyolEntry {
  id: string;
  famille: string;
  nomCreole: string;
  nomFrancais: string;
  nomScientifique: string;
  typeResistance?: string;
  resistanceDescription?: string;
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
    if (nomScientifique) {
      const sciBase = nomScientifique
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-');
      const sciPrefix = sciBase.split('-')[0].substring(0, 3);
      return `${base}-${sciPrefix}`;
    }
    return base || `kreyol-${index}`;
  }
  return `kreyol-${index}`;
}

// Détecter si c'est un symbole de résistance
function hasResistanceMarkers(...texts: string[]): boolean {
  return texts.some(t => t.includes('⭐'));
}

// Extraire le type et la description de résistance
function extractResistanceInfo(sacre: string, dimension: string): { type?: string; description?: string } {
  const allText = `${sacre} ${dimension}`;
  if (!allText.includes('⭐')) return {};
  
  const parts = allText.split('⭐').map(p => p.trim()).filter(p => p);
  if (parts.length === 0) return {};
  
  const lastPart = parts[parts.length - 1];
  
  if (lastPart.match(/^(TOTEM|SACR[ÉE]|SYMBOLE|MYTHIQUE|CULTUREL|AMBIVALENT|EMBL[ÉÉ]MATIQUE|END[ÉÉ]MIQUE|R[ÉÉ]SISTANCE|LIBERT[ÉÉ]|ALIMENTAIRE|SPIRITUEL|COLLECTIVE|[ÉÉ]CONOMIQUE|IDENTITAIRE|PARADOXALE|AM[ÉÉ]RINDIEN)/i)) {
    const type = lastPart.split('|')[0].trim();
    const description = parts.slice(0, -1).join(' ').trim();
    return { type: type || undefined, description: description || undefined };
  }
  
  for (const part of parts) {
    const match = part.match(/^(TOTEM|SACR[ÉE]|SYMBOLE|MYTHIQUE|[A-Z][^\s]+)/i);
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

// Créer une entrée
function createEntry(
  famille: string,
  nomCreole: string,
  nomFrancais: string,
  nomScientifique: string,
  sacreSymbolique: string,
  dimensionCulturelle: string,
  index: number
) {
  const id = generateId(nomCreole, nomScientifique, index);
  const isResistanceSymbol = hasResistanceMarkers(dimensionCulturelle, sacreSymbolique);
  
  const { type: typeResistance, description: resistanceDescription } = 
    extractResistanceInfo(sacreSymbolique, dimensionCulturelle);
  
  const cleanSacre = sacreSymbolique.replace(/⭐/g, '').replace(/\s+/g, ' ').trim();
  const cleanDimension = dimensionCulturelle.replace(/⭐/g, '').replace(/\s+/g, ' ').trim();
  
  const tags = [
    famille.toLowerCase(),
    ...(isResistanceSymbol ? ['resistance'] : []),
    ...(typeResistance ? [typeResistance.toLowerCase().replace(/\s+/g, '-')] : [])
  ].filter(Boolean);
  
  return {
    id,
    famille: famille.replace(/\s*—\s*/g, '-').toLowerCase(),
    nomCreole,
    nomFrancais,
    nomScientifique,
    typeResistance,
    resistanceDescription,
    dimensionCulturelle: cleanDimension,
    tags
  };
}

// Ajouter une entrée avec déduplication
function addEntry(
  entries: Array<Record<string, any>>,
  famille: string,
  cells: string[]
) {
  const nomCreole = cells[1];
  const nomFrancais = cells[2];
  const nomScientifique = cells[3];
  const sacreSymbolique = cells[4] || '';
  const dimensionCulturelle = cells[5] || '';
  
  if (!nomCreole || nomCreole === '---') return;
  
  // Clé unique basée sur le nom scientifique ou créole
  const uniqueKey = nomScientifique 
    ? normalizeName(nomScientifique)
    : `${normalizeName(nomCreole)}|${normalizeName(nomFrancais)}`;
  
  const newEntry = createEntry(
    famille, nomCreole, nomFrancais,
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

// Données générées automatiquement depuis kreyol_resistance_symbol_ref.md
// NE PAS MODIFIER MANUELLEMENT - Exécuter 'npm run kreyol:parse' pour mettre à jour
export const kreyolData: KreyolEntry[] = [
${props}
];

// Index pour recherche rapide
export const kreyolIndex: Record<string, KreyolEntry> = {
${entries.map(entry => `  "${entry.id}": kreyolData.find(p => p.id === "${entry.id}")!`).join(',\n')}
};

// Fonction utilitaire
export function getKreyolByNom(nom: string): KreyolEntry | undefined {
  return kreyolData.find(p => 
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
  console.log('📖 Lecture de kreyol_resistance_symbol_ref.md...');
  
  const mdContent = fs.readFileSync(MD_PATH, 'utf-8');
  const lines = mdContent.split('\n');
  
  const entries: Array<Record<string, any>> = [];
  let currentFamille = 'INCONNUE';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('#') || line.startsWith('| ---')) continue;
    if (isTableSeparator(line) || isTableHeader(line)) continue;
    
    const cells = parseRow(line);
    if (!cells) continue;
    
    if (isSectionLine(cells)) {
      currentFamille = cells[0];
      continue;
    }
    
    if (cells.length >= 5) {
      if (cells[0] && cells[0] !== currentFamille && !cells[0].includes('/')) {
        const potentialFamille = cells[0];
        if (potentialFamille.split(/\s+/).length <= 5) {
          currentFamille = potentialFamille;
        }
      }
      addEntry(entries, currentFamille, cells);
    }
  }
  
  console.log(`✅ Parsing terminé : ${entries.length} entrées trouvées`);
  generateTSFile(entries);
}

main();
