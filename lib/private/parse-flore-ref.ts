/**
 * Script de conversion de flore_guadeloupe_ref.md vers flore-data.ts
 * Exécution : npx tsx lib/private/parse-flore-ref.ts
 * 
 * Structure du MD attendu :
 * | Famille | Nom créole | Nom français | Nom scientifique | Usage |
 * | FRUITS | | | | |
 * | Fruit | Mango péyi | Mangue locale | Mangifera indica | Usage...
 */

import fs from 'fs';
import path from 'path';

// Chemins des fichiers
const MD_PATH = path.join(__dirname, 'flore_guadeloupe_ref.md');
const TS_PATH = path.join(__dirname, 'flore-data.ts');

// Interface TypeScript à générer
const TS_INTERFACE = `export interface FloreEntry {
  id: string;
  categorie: string;
  sousCategorie: string;
  nomCreole: string;
  nomFrancais: string;
  nomScientifique: string;
  usage: string;
  isResistanceSymbol: boolean;
  resistanceType?: string;
  resistanceDescription?: string;
  sacreSymbolique?: string;
  dimensionCulturelle: string;
  tags: string[];
}
`;

// Nettoyer une cellule
function cleanCell(cell: string): string {
  return cell.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
}

// Générer un ID unique
function generateId(nomCreole: string, index: number): string {
  return nomCreole
    .toLowerCase()
    .replace(/\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '') || `flore-${index}`;
}

// Détecter si c'est un symbole de résistance
function hasResistanceMarkers(...texts: string[]): boolean {
  return texts.some(t => t.includes('⭐'));
}

// Extraire le type et la description de résistance
// Format attendu : "[description] ⭐⭐⭐ [TYPE DE RÉSISTANCE]"
function extractResistanceInfo(dimension: string): { type?: string; description?: string } {
  if (!dimension.includes('⭐')) return {};
  
  const parts = dimension.split('⭐').map(p => p.trim()).filter(p => p);
  if (parts.length === 0) return {};
  
  // La dernière partie contient généralement le type
  const lastPart = parts[parts.length - 1];
  
  // Si la dernière partie commence par "Résistance" ou "SYMBOLE", c'est le type
  if (lastPart.match(/^(R[éè]sistance|SYMBOLE)/i)) {
    const type = lastPart.split('|')[0].trim();
    // La description est tout ce qui est avant les ⭐
    const description = parts.slice(0, -1).join(' ').trim();
    return { type: type || undefined, description: description || undefined };
  }
  
  // Sinon, chercher un pattern "Résistance ..." dans n'importe quelle partie
  for (const part of parts) {
    const match = part.match(/^(R[éè]sistance\s+[^\s].*)/i);
    if (match) {
      return { type: match[1].trim(), description: undefined };
    }
  }
  
  return {};
}

// Parser une ligne de tableau
function parseRow(line: string): string[] | null {
  const cleaned = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = cleaned.split('|').map(cleanCell);
  return cells.length >= 5 ? cells : null;
}

// Vérifier si une ligne est un séparateur de tableau
function isTableSeparator(line: string): boolean {
  return line.includes('---') && line.includes('|');
}

// Vérifier si une ligne est un en-tête de tableau
function isTableHeader(line: string): boolean {
  return line.includes('Famille') && line.includes('Nom créole');
}

// Vérifier si une ligne est une section (ex: | FRUITS | | | | |)
function isSectionLine(cells: string[]): boolean {
  if (cells.length < 2) return false;
  const firstCell = cells[0].toUpperCase();
  const restEmpty = cells.slice(1).every(c => c === '');
  return restEmpty && firstCell === firstCell && firstCell.length > 0;
}

// Vérifier si une ligne est une sous-section (ex: | Fruit | Mango | ...)
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
  usage: string,
  sacreSymbolique: string,
  dimensionCulturelle: string,
  index: number
): Record<string, any> {
  const id = generateId(nomCreole, index);
  
  // EXTRAIRE LE TYPE ET LA DESCRIPTION AVANT DE NETTOYER
  const isResistanceSymbol = hasResistanceMarkers(usage, dimensionCulturelle, sacreSymbolique);
  
  // Extraire info de résistance depuis toutes les colonnes
  let resistanceType: string | undefined;
  let resistanceDescription: string | undefined;
  
  for (const text of [dimensionCulturelle, sacreSymbolique, usage]) {
    if (resistanceType && resistanceDescription) break;
    const info = extractResistanceInfo(text);
    resistanceType = resistanceType || info.type;
    resistanceDescription = resistanceDescription || info.description;
  }
  
  // Nettoyer toutes les chaînes (enlever ⭐ et normaliser les espaces)
  const cleanUsage = usage.replace(/⭐/g, '').replace(/\s+/g, ' ').trim();
  const cleanSacre = sacreSymbolique.replace(/⭐/g, '').replace(/\s+/g, ' ').trim();
  const cleanDimension = dimensionCulturelle.replace(/⭐/g, '').replace(/\s+/g, ' ').trim();
  
  const tags = [
    category.toLowerCase(),
    sousCategory.toLowerCase(),
    ...(isResistanceSymbol ? ['resistance'] : []),
    ...(resistanceType ? [resistanceType.toLowerCase().replace(/\s+/g, '-')] : [])
  ].filter(Boolean);
  
  return {
    id,
    categorie: category,
    sousCategorie: sousCategory.replace(/\s*—\s*/g, '-').toLowerCase(),
    nomCreole,
    nomFrancais,
    nomScientifique,
    usage: cleanDimension || cleanUsage || usage,
    isResistanceSymbol,
    resistanceType,
    resistanceDescription,
    sacreSymbolique: cleanSacre || resistanceType || undefined,
    dimensionCulturelle: cleanDimension || cleanUsage || usage,
    tags
  };
}

// Fonction principale
function main() {
  console.log('📖 Lecture de flore_guadeloupe_ref.md...');
  
  const mdContent = fs.readFileSync(MD_PATH, 'utf-8');
  const lines = mdContent.split('\n');
  
  const entries: Array<Record<string, any>> = [];
  let currentCategory = 'INCONNUE';
  let currentSousCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Ignorer les commentaires et titres
    if (line.startsWith('#') || line.startsWith('| ---')) continue;
    
    // Ignorer l'en-tête du tableau
    if (isTableSeparator(line) || isTableHeader(line)) continue;
    
    const cells = parseRow(line);
    if (!cells) continue;
    
    // Détecter les lignes de section (ex: | FRUITS | | | | |)
    if (isSectionLine(cells)) {
      currentCategory = cells[0];
      currentSousCategory = '';
      continue;
    }
    
    // Détecter les lignes de sous-section (ex: | Fruit | Mango péyi | ...)
    if (isSubSectionLine(cells)) {
      // Si c'est une sous-section avec données
      if (cells[1] !== '') {
        currentSousCategory = cells[0];
        // C'est aussi une ligne de données
        addEntry(entries, currentCategory, currentSousCategory, cells);
      } else {
        currentSousCategory = cells[0];
      }
      continue;
    }
    
    // Ligne de données standard (5+ colonnes)
    if (cells.length >= 5) {
      // Si la première cellule n'est pas vide, c'est peut-être une sous-catégorie
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
  
  // Générer le fichier TypeScript
  generateTSFile(entries);
}

// Normaliser un nom pour la comparaison (enlever accents, mettre en minuscules)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Enlever les accents
    .replace(/\s+/g, '');
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
  const usage = cells[4];
  const sacreSymbolique = cells[5] || '';
  const dimensionCulturelle = cells[6] || '';
  
  if (!nomCreole || nomCreole === '---') return;
  
  // Générer une clé unique basée sur le nom scientifique (le plus fiable)
  // Si nomScientifique est vide, utiliser nomCreole + nomFrancais normalisés
  const uniqueKey = nomScientifique 
    ? normalizeName(nomScientifique)
    : `${normalizeName(nomCreole)}|${normalizeName(nomFrancais)}`;
  
  // Créer la nouvelle entrée
  const newEntry = createEntry(
    category, sousCategory, nomCreole, nomFrancais,
    nomScientifique, usage, sacreSymbolique, dimensionCulturelle, entries.length
  );
  
  // Si l'entrée existe déjà, la remplacer (on garde la dernière, souvent la plus complète)
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

// Données générées automatiquement depuis flore_guadeloupe_ref.md
// NE PAS MODIFIER MANUELLEMENT - Exécuter 'npm run flore:parse' pour mettre à jour
export const floreData: FloreEntry[] = [
${props}
];

// Index pour recherche rapide
export const floreIndex: Record<string, FloreEntry> = {
${entries.map(entry => `  "${entry.id}": floreData.find(p => p.id === "${entry.id}")!`).join(',\n')}
};

// Fonction utilitaire
export function getFloreByNomCreole(nom: string): FloreEntry | undefined {
  return floreData.find(p => 
    p.nomCreole.toLowerCase() === nom.toLowerCase() ||
    p.nomCreole.toLowerCase().includes(nom.toLowerCase())
  );
}
`;
  
  fs.writeFileSync(TS_PATH, tsContent, 'utf-8');
  console.log(`📝 Fichier généré : ${TS_PATH}`);
  console.log(`🔍 Exemple : ${entries.length > 0 ? `${entries[0].nomCreole} (${entries[0].id})` : 'Aucune entrée'}`);
}

// Exécuter
main();
