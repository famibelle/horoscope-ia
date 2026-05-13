/**
 * Script de conversion de histoire_guadeloupe_ref.md vers histoire-data.ts
 * Exécution : npx tsx lib/private/parse-histoire-ref.ts
 */

import fs from 'fs';
import path from 'path';

const MD_PATH = path.join(__dirname, 'histoire_guadeloupe_ref.md');
const TS_PATH = path.join(__dirname, 'histoire-data.ts');

const TS_INTERFACE = `export interface HistoireEntry {
  id: string;
  periode: string;
  faitHistorique: string;
  porteeSymbolique: string;
  actionsMenees: string;
  lieu: string;
  pratiquesSpirituelles: string;
  tags: string[];
}
`;

// Normaliser un nom pour l'ID
function normalizeForId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

// Générer un ID
function generateId(periode: string, faitHistorique: string, index: number): string {
  const periodeBase = normalizeForId(periode);
  const faitBase = normalizeForId(faitHistorique.substring(0, 30));
  
  if (periodeBase && faitBase) {
    return `${periodeBase}-${faitBase}-${index}`;
  }
  if (periodeBase) {
    return `${periodeBase}-${index}`;
  }
  return `histoire-${index}`;
}

// Nettoyer une cellule
function cleanCell(cell: string): string {
  return cell.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
}

// Parser une ligne
function parseRow(line: string): string[] | null {
  const cleaned = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = cleaned.split('|').map(cleanCell);
  return cells.length >= 6 ? cells : null;
}

// Vérifier si une ligne est un séparateur
function isTableSeparator(line: string): boolean {
  return line.includes('---') && line.includes('|');
}

// Vérifier si une ligne est un en-tête
function isTableHeader(line: string): boolean {
  return line.includes('Période') && line.includes('Fait historique');
}

// Vérifier si une ligne est une section
function isSectionLine(cells: string[]): boolean {
  if (cells.length < 2) return false;
  const firstCell = cells[0];
  const restEmpty = cells.slice(1).every(c => c === '');
  return restEmpty && firstCell.startsWith('**') && firstCell.endsWith('**');
}

// Créer une entrée
function createEntry(
  periode: string,
  faitHistorique: string,
  porteeSymbolique: string,
  actionsMenees: string,
  lieu: string,
  pratiquesSpirituelles: string,
  index: number
) {
  const id = generateId(periode, faitHistorique, index);
  
  // Extraire les tags à partir de la portée symbolique et des pratiques
  const tags = [
    ...porteeSymbolique.split(/[;,]/).map(t => t.trim().toLowerCase()).filter(t => t.length > 0),
    ...lieu.split(/[;,]/).map(t => t.trim().toLowerCase()).filter(t => t.length > 0),
  ].slice(0, 10); // Limiter à 10 tags
  
  return {
    id,
    periode,
    faitHistorique,
    porteeSymbolique,
    actionsMenees,
    lieu,
    pratiquesSpirituelles,
    tags
  };
}

// Ajouter une entrée
function addEntry(
  entries: Array<Record<string, any>>,
  cells: string[]
) {
  const periode = cells[0];
  const faitHistorique = cells[1];
  const porteeSymbolique = cells[2];
  const actionsMenees = cells[3];
  const lieu = cells[4];
  const pratiquesSpirituelles = cells[5] || '';
  
  if (!faitHistorique || faitHistorique === '---') return;
  
  const newEntry = createEntry(
    periode, faitHistorique, porteeSymbolique,
    actionsMenees, lieu, pratiquesSpirituelles, entries.length
  );
  
  // Vérifier si l'entrée existe déjà (même période + fait historique)
  const existingIndex = entries.findIndex(e => 
    e.faitHistorique === faitHistorique && e.periode === periode
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

// Données générées automatiquement depuis histoire_guadeloupe_ref.md
// NE PAS MODIFIER MANUELLEMENT - Exécuter 'npm run histoire:parse' pour mettre à jour
export const histoireData: HistoireEntry[] = [
${props}
];

// Index pour recherche rapide
export const histoireIndex: Record<string, HistoireEntry> = {
${entries.map(entry => `  "${entry.id}": histoireData.find(p => p.id === "${entry.id}")!`).join(',\n')}
};

// Fonction utilitaire - chercher par période
export function getHistoireByPeriode(periode: string): HistoireEntry | undefined {
  return histoireData.find(p => 
    p.periode.toLowerCase().includes(periode.toLowerCase())
  );
}

// Fonction utilitaire - chercher par mots-clés
export function getHistoireByMotCle(mot: string): HistoireEntry | undefined {
  const motLower = mot.toLowerCase();
  return histoireData.find(p => 
    p.faitHistorique.toLowerCase().includes(motLower) ||
    p.porteeSymbolique.toLowerCase().includes(motLower) ||
    p.lieu.toLowerCase().includes(motLower)
  );
}

// Fonction utilitaire - obtenir toutes les entrées d'une période
 export function getHistoireByPeriodeAll(periode: string): HistoireEntry[] {
  const periodeLower = periode.toLowerCase();
  return histoireData.filter(p => 
    p.periode.toLowerCase().includes(periodeLower)
  );
}
`;
  
  fs.writeFileSync(TS_PATH, tsContent, 'utf-8');
  console.log(`📝 Fichier généré : ${TS_PATH}`);
  console.log(`🔍 Exemple : ${entries.length > 0 ? `${entries[0].faitHistorique.substring(0, 50)}... (${entries[0].id})` : 'Aucune entrée'}`);
}

// Fonction principale
function main() {
  console.log('📖 Lecture de histoire_guadeloupe_ref.md...');
  
  const mdContent = fs.readFileSync(MD_PATH, 'utf-8');
  const lines = mdContent.split('\n');
  
  const entries: Array<Record<string, any>> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('#') || line.startsWith('| ---')) continue;
    if (isTableSeparator(line) || isTableHeader(line)) continue;
    
    const cells = parseRow(line);
    if (!cells) continue;
    
    // Sauter les lignes de section (comme "**Avant 300 av. J.-C.**")
    if (isSectionLine(cells)) continue;
    
    // Sauter les lignes vides ou avec seulement des séparateurs
    if (cells.every(c => !c || c === '|' || c === '-')) continue;
    
    if (cells.length >= 6) {
      addEntry(entries, cells);
    }
  }
  
  console.log(`✅ Parsing terminé : ${entries.length} entrées trouvées`);
  generateTSFile(entries);
}

main();
