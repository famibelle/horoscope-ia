/**
 * Glossaire Vaudou/Guadeloupe - Système d'enrichissement automatique
 * 
 * Ce module permet de:
 * 1. Extraire les termes entre parenthèses des textes générés
 * 2. Maintenir un glossaire centralisé des termes culturels
 * 3. Supprimer les parenthèses explicatives pour les termes connus
 * 
 * Exemple: "matoutou (fricassée de crabes)" → "matoutou" (après première occurrence)
 */

import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

const GLOSSARY_PATH = path.join(__dirname, 'glossaire.json');

export interface GlossaryEntry {
  definition: string;
  category: 'vaudou' | 'faune' | 'flore' | 'gastronomie' | 'lieu' | 'objet' | 'à_classer';
  firstSeen: string;
  count: number;
  sources: string[];
  synonyms?: string[];
  vaudou?: boolean;
}

/**
 * Charge le glossaire depuis le fichier JSON
 */
export function loadGlossary(): Record<string, GlossaryEntry> {
  try {
    if (fs.existsSync(GLOSSARY_PATH)) {
      const content = fs.readFileSync(GLOSSARY_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('[GLOSSAIRE] Erreur de chargement:', error);
  }
  return {};
}

/**
 * Sauvegarde le glossaire dans le fichier JSON
 */
export function saveGlossary(glossary: Record<string, GlossaryEntry>): void {
  try {
    fs.writeFileSync(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
  } catch (error) {
    console.error('[GLOSSAIRE] Erreur de sauvegarde:', error);
  }
}

/**
 * Extrait les termes entre parenthèses d'un texte
 * Exemple: "matoutou (fricassée de crabes)" → [{term: "matoutou", definition: "fricassée de crabes"}]
 */
export function extractGlossaryTerms(text: string): Array<{ term: string; definition: string }> {
  // Pattern: mot (définition) ou mot(définition)
  const pattern = /(\w[\w'\-]*)\s*\(([^)]+)\)/g;
  const matches = [...text.matchAll(pattern)];
  
  return matches.map(m => ({
    term: m[1].trim(),
    definition: m[2].trim()
  }));
}

/**
 * Met à jour le glossaire avec de nouveaux termes
 */
export function updateGlossary(
  terms: Array<{ term: string; definition: string }>,
  date: string,
  source: string
): void {
  const glossary = loadGlossary();
  let updated = false;

  for (const { term, definition } of terms) {
    if (!glossary[term]) {
      // Nouveau terme
      glossary[term] = {
        definition,
        category: 'à_classer',
        firstSeen: date,
        count: 1,
        sources: [source]
      };
      console.log(`[GLOSSAIRE] 🆕 Nouveau terme: "${term}" = "${definition}"`);
      updated = true;
    } else {
      // Terme existant
      if (!glossary[term].sources.includes(source)) {
        glossary[term].sources.push(source);
      }
      glossary[term].count++;
      
      // Si pas de définition existante, on prend celle-ci
      if (!glossary[term].definition) {
        glossary[term].definition = definition;
      }
      // Si définition différente, on log un warning
      else if (glossary[term].definition !== definition) {
        console.warn(`[GLOSSAIRE] ⚠️  Conflit de définition pour "${term}": "${glossary[term].definition}" vs "${definition}"`);
      }
      updated = true;
    }
  }

  if (updated) {
    saveGlossary(glossary);
    console.log(`[GLOSSAIRE] ✅ ${terms.length} termes traités`);
  }
}

/**
 * Supprime les parenthèses explicatives pour les termes connus du glossaire
 * Exemple: "matoutou (fricassée de crabes)" → "matoutou" si "matoutou" est dans le glossaire
 */
export function removeRedundantParentheses(text: string): string {
  const glossary = loadGlossary();
  
  // Supprime "(définition)" pour les termes connus
  return text.replace(/(\w[\w'\-]*)\s*\(([^)]+)\)/g, (match, term, definition) => {
    if (glossary[term]) {
      console.log(`[GLOSSAIRE] 🗑️  Parentheses supprimées: "${term} (${definition})" → "${term}"`);
      return term;  // Garde seulement le terme
    }
    return match;   // Garde l'original si inconnu
  });
}

/**
 * Initialise le glossaire avec des termes connus (optionnel)
 */
export function initializeGlossary(): void {
  const initial: Record<string, GlossaryEntry> = {
    "lyannaj": {
      definition: "Solidarité, entraidue, lien social dans la culture antillaise",
      category: "vaudou",
      firstSeen: "2024-01-01",
      count: 0,
      sources: [],
      vaudou: true
    },
    "matoutou": {
      definition: "Fricassée de crabes, plat traditionnel guadeloupéen",
      category: "gastronomie",
      firstSeen: "2024-01-01",
      count: 0,
      sources: []
    },
    "Urakan": {
      definition: "Frégate, oiseau symbole de liberté dans la culture antillaise",
      category: "faune",
      firstSeen: "2024-01-01",
      count: 0,
      sources: []
    },
    "bwa d'Ind": {
      definition: "Feuilles sacrées utilisées dans les rituels vaudou",
      category: "flore",
      firstSeen: "2024-01-01",
      count: 0,
      sources: []
    },
    "krab tè": {
      definition: "Crabe de terre, animal sacré dans les traditions guadeloupéennes",
      category: "faune",
      firstSeen: "2024-01-01",
      count: 0,
      sources: []
    }
  };
  
  const existing = loadGlossary();
  const merged = { ...initial, ...existing };
  saveGlossary(merged);
  console.log(`[GLOSSAIRE] 📚 Initialisé avec ${Object.keys(initial).length} termes`);
}

/**
 * Statistiques du glossaire
 */
export function getGlossaryStats(): {
  total: number;
  byCategory: Record<string, number>;
  mostFrequent: Array<{ term: string; count: number }>;
} {
  const glossary = loadGlossary();
  const total = Object.keys(glossary).length;
  
  const byCategory = Object.values(glossary).reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostFrequent = Object.entries(glossary)
    .map(([term, entry]) => ({ term, count: entry.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return { total, byCategory, mostFrequent };
}
