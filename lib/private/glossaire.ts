/**
 * Glossaire Vaudou/Guadeloupe - Système d'enrichissement automatique
 *
 * Stratégie Supabase : cache mémoire par run.
 *   1. initGlossaryCache()        — charge tout en une requête au début du run
 *   2. loadGlossary()             — retourne le cache (synchrone, inchangé)
 *   3. updateGlossary() / saveGlossary() — mettent à jour le cache en mémoire
 *   4. flushGlossaryToSupabase()  — envoie tous les changements en une requête à la fin
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export interface GlossaryEntry {
  definition: string;
  category: 'vaudou' | 'faune' | 'flore' | 'gastronomie' | 'lieu' | 'objet' | 'à_classer';
  firstSeen: string;
  count: number;
  sources: string[];
  synonyms?: string[];
  vaudou?: boolean;
}

let _cache: Record<string, GlossaryEntry> = {};
let _dirty = false;

/**
 * À appeler une fois au début du script de génération.
 * Charge tous les termes depuis Supabase dans le cache mémoire.
 */
export async function initGlossaryCache(): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/glossaire?select=*`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
    },
  });
  if (!res.ok) {
    console.warn('[GLOSSAIRE] Impossible de charger depuis Supabase, cache vide.');
    return;
  }
  const rows: any[] = await res.json();
  _cache = {};
  for (const row of rows) {
    _cache[row.terme] = {
      definition: row.definition ?? '',
      category: row.category ?? 'à_classer',
      firstSeen: row.first_seen ?? '',
      count: row.count ?? 0,
      sources: row.sources ?? [],
      synonyms: row.synonyms ?? undefined,
      vaudou: row.vaudou ?? false,
    };
  }
  console.log(`[GLOSSAIRE] 📚 ${rows.length} termes chargés depuis Supabase`);
}

/**
 * Envoie tous les changements du cache vers Supabase.
 * À appeler une fois à la fin du script de génération.
 */
export async function flushGlossaryToSupabase(): Promise<void> {
  if (!_dirty) return;
  const rows = Object.entries(_cache).map(([terme, v]) => ({
    terme,
    definition: v.definition,
    category: v.category,
    first_seen: v.firstSeen || null,
    count: v.count,
    sources: v.sources,
    synonyms: v.synonyms ?? null,
    vaudou: v.vaudou ?? false,
  }));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/glossaire?on_conflict=terme`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[GLOSSAIRE] ❌ Erreur flush Supabase: ${res.status} ${text}`);
  } else {
    console.log(`[GLOSSAIRE] ✅ ${rows.length} termes sauvegardés dans Supabase`);
    _dirty = false;
  }
}

/** Retourne le cache mémoire (synchrone — compatible avec le code existant). */
export function loadGlossary(): Record<string, GlossaryEntry> {
  return _cache;
}

/** Met à jour le cache mémoire (les changements sont envoyés par flushGlossaryToSupabase). */
export function saveGlossary(glossary: Record<string, GlossaryEntry>): void {
  _cache = glossary;
  _dirty = true;
}

// Mots trop courts ou particules françaises/créoles qui ne sont pas des termes culturels
const GLOSSARY_STOP_WORDS = new Set([
  'k', 'b', 's', 'p', 'l', 'w', 'm', 'n',
  'an', 'de', 'du', 'la', 'le', 'pi', 'sa', 'si',
  'ou', 'et', 'en', 'ou', 'ni', 'ba', 'di',
  'ind', 'fli', 'san', 'dan',
]);

/** Extrait les termes entre parenthèses d'un texte. */
export function extractGlossaryTerms(text: string): Array<{ term: string; definition: string }> {
  const pattern = /(\w[\w'\-]*)\s*\(([^)]+)\)/g;
  const allMatches = Array.from(text.matchAll(pattern)).map(m => ({
    term: m[1].trim(),
    definition: m[2].trim(),
  }));

  // Correction 1 : rejeter les clés trop courtes ou mots outils
  const filtered = allMatches.filter(({ term }) =>
    term.length >= 3 && !GLOSSARY_STOP_WORDS.has(term.toLowerCase())
  );

  // Correction 2 : dédupliquer par terme dans le même run (garder la première occurrence)
  const seen = new Set<string>();
  return filtered.filter(({ term }) => {
    const key = term.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Met à jour le cache avec de nouveaux termes. */
export function updateGlossary(
  terms: Array<{ term: string; definition: string }>,
  date: string,
  source: string,
): void {
  let updated = false;
  for (const { term, definition } of terms) {
    if (!_cache[term]) {
      _cache[term] = {
        definition,
        category: 'à_classer',
        firstSeen: date,
        count: 1,
        sources: [source],
      };
      console.log(`[GLOSSAIRE] 🆕 Nouveau terme: "${term}" = "${definition}"`);
      updated = true;
    } else {
      if (!_cache[term].sources.includes(source)) {
        _cache[term].sources.push(source);
      }
      _cache[term].count++;
      if (!_cache[term].definition) {
        _cache[term].definition = definition;
      } else if (_cache[term].definition !== definition) {
        console.warn(`[GLOSSAIRE] ⚠️  Conflit: "${term}": "${_cache[term].definition}" vs "${definition}"`);
      }
      updated = true;
    }
  }
  if (updated) {
    _dirty = true;
    console.log(`[GLOSSAIRE] ✅ ${terms.length} termes traités`);
  }
}

/** Supprime les parenthèses explicatives pour les termes déjà connus. */
export function removeRedundantParentheses(text: string): string {
  return text.replace(/(\w[\w'\-]*)\s*\(([^)]+)\)/g, (match, term) => {
    if (_cache[term]) {
      console.log(`[GLOSSAIRE] 🗑️  Parenthèses supprimées: "${term}"`);
      return term;
    }
    return match;
  });
}

export function getGlossaryStats() {
  const total = Object.keys(_cache).length;
  const byCategory = Object.values(_cache).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostFrequent = Object.entries(_cache)
    .map(([term, e]) => ({ term, count: e.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  return { total, byCategory, mostFrequent };
}
