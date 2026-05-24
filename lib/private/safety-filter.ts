/**
 * 🛡️ Module de Filtrage de Sécurité
 */

import {
  SAFETY_RULES,
  SAFETY_CATEGORIES,
  type SafetyRule,
  type SafetyCategory,
} from './safety-guards';

export interface SafetyFilterResult {
  safeText: string;
  warnings: SafetyWarning[];
  stats: SafetyFilterStats;
}

export interface SafetyWarning {
  category: SafetyCategory;
  ruleId: string;
  original: string;
  replacement: string;
  position: number;
  priority: number;
}

export interface SafetyFilterStats {
  totalReplacements: number;
  categories: Record<string, number>;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  originalLength: number;
  filteredLength: number;
}

export interface SafetyFilterOptions {
  logWarnings?: boolean;
  includeStats?: boolean;
  maxWarnings?: number;
  strictMode?: boolean;
}

const DEFAULT_OPTIONS: SafetyFilterOptions = {
  logWarnings: true,
  includeStats: true,
  maxWarnings: 100,
  strictMode: false,
};

export function applySafetyFilters(
  text: string,
  options: SafetyFilterOptions = {}
): SafetyFilterResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const warnings: SafetyWarning[] = [];
  let safeText = text;
  let stats: SafetyFilterStats = {
    totalReplacements: 0,
    categories: {},
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    originalLength: text.length,
    filteredLength: text.length,
  };

  Object.keys(SAFETY_CATEGORIES).forEach(cat => {
    stats.categories[cat] = 0;
  });

  const sortedRules = [...SAFETY_RULES].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    for (const pattern of rule.patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(safeText)) !== null) {
        if (match.index === pattern.lastIndex) {
          pattern.lastIndex++;
          continue;
        }

        const originalMatch = match[0];
        const position = match.index;
        const newText = safeText.substring(0, position) +
          rule.replacement +
          safeText.substring(position + originalMatch.length);

        if (newText !== safeText) {
          warnings.push({
            category: rule.category,
            ruleId: rule.id,
            original: originalMatch,
            replacement: rule.replacement,
            position,
            priority: rule.priority,
          });

          stats.totalReplacements++;
          stats.categories[rule.category] = (stats.categories[rule.category] || 0) + 1;
          if (rule.priority === 0) stats.highPriority++;
          else if (rule.priority === 1) stats.mediumPriority++;
          else if (rule.priority === 2) stats.lowPriority++;

          safeText = newText;
          pattern.lastIndex = position + rule.replacement.length;

          if (opts.maxWarnings && opts.maxWarnings > 0 && warnings.length >= opts.maxWarnings) {
            break;
          }
        } else {
          pattern.lastIndex++;
        }
      }
      pattern.lastIndex = 0;

      if (opts.maxWarnings && opts.maxWarnings > 0 && warnings.length >= opts.maxWarnings) {
        break;
      }
    }

    if (opts.maxWarnings && opts.maxWarnings > 0 && warnings.length >= opts.maxWarnings) {
      break;
    }
  }

  stats.filteredLength = safeText.length;

  if (opts.logWarnings && warnings.length > 0) {
    warnings.forEach(warning => {
      const categoryInfo = SAFETY_CATEGORIES[warning.category];
      const priorityIcon = warning.priority === 0 ? '⭐' : 
                          warning.priority === 1 ? '⚠️' : 'ℹ️';
      console.warn(
        `[SAFETY FILTER] ${priorityIcon} [${warning.category}] ${categoryInfo.emoji} ` +
        `Remplacé: "${warning.original}" → "${warning.replacement.substring(0, 60)}${warning.replacement.length > 60 ? '...' : ''}"`
      );
    });
    console.log(
      `[SAFETY FILTER] 📊 Statistiques: ${stats.totalReplacements} remplacements ` +
      `(P0: ${stats.highPriority}, P1: ${stats.mediumPriority}, P2: ${stats.lowPriority})`
    );
  }

  if (opts.strictMode && stats.highPriority > 0) {
    throw new Error(`[SAFETY FILTER] 🚨 Contenu dangereux détecté: ${stats.highPriority} remplacements critiques`);
  }

  return {
    safeText,
    warnings: opts.maxWarnings && opts.maxWarnings > 0 ? warnings.slice(0, opts.maxWarnings) : warnings,
    stats: opts.includeStats ? stats : { totalReplacements: warnings.length, categories: {}, highPriority: 0, mediumPriority: 0, lowPriority: 0, originalLength: text.length, filteredLength: safeText.length },
  };
}

export function hasDangerousContent(text: string, categories?: SafetyCategory[]): boolean {
  const rulesToCheck = categories 
    ? SAFETY_RULES.filter(rule => categories.includes(rule.category))
    : SAFETY_RULES;
  for (const rule of rulesToCheck) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) return true;
    }
  }
  return false;
}

export function hasCriticalContent(text: string): boolean {
  return hasDangerousContent(text, ['fire', 'ingestion', 'physical', 'medical', 'illegal', 'dangerous_objects', 'animal', 'self_harm']);
}

export function findDangerousMatches(text: string): Array<{
  rule: SafetyRule;
  match: string;
  position: number;
  category: SafetyCategory;
  priority: number;
}> {
  const matches: Array<{
    rule: SafetyRule;
    match: string;
    position: number;
    category: SafetyCategory;
    priority: number;
  }> = [];

  for (const rule of SAFETY_RULES) {
    for (const pattern of rule.patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index === pattern.lastIndex) {
          pattern.lastIndex++;
          continue;
        }
        matches.push({
          rule,
          match: match[0],
          position: match.index,
          category: rule.category,
          priority: rule.priority,
        });
        pattern.lastIndex = match.index + 1;
      }
      pattern.lastIndex = 0;
    }
  }
  return matches.sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.position - b.position);
}

export function checkSafety(text: string): Omit<SafetyFilterResult, 'safeText'> {
  const result = applySafetyFilters(text, { logWarnings: false, includeStats: true });
  return { warnings: result.warnings, stats: result.stats };
}

export function formatSafetyReport(result: SafetyFilterResult): string {
  const lines: string[] = [
    '='.repeat(60),
    '🛡️  RAPPORT DE SÉCURITÉ',
    '='.repeat(60),
    '',
    `Original: ${result.stats.originalLength} caractères`,
    `Filtré:   ${result.stats.filteredLength} caractères`,
    `Remplacements: ${result.stats.totalReplacements}`,
    '',
    'Par priorité:',
    `  ⭐ Priorité 0 (Critique): ${result.stats.highPriority}`,
    `  ⚠️  Priorité 1 (Important): ${result.stats.mediumPriority}`,
    `  ℹ️  Priorité 2 (Conseillé): ${result.stats.lowPriority}`,
    '',
    'Par catégorie:',
  ];
  Object.entries(result.stats.categories).forEach(([category, count]) => {
    if (count > 0) {
      const catInfo = SAFETY_CATEGORIES[category as SafetyCategory];
      lines.push(`  ${catInfo?.emoji || '•'} ${category}: ${count}`);
    }
  });
  if (result.warnings.length > 0) {
    lines.push('', 'Détails:');
    result.warnings.slice(0, 10).forEach((warning, index) => {
      lines.push(
        `  ${index + 1}. [${warning.category}] "${warning.original}" → "${warning.replacement.substring(0, 50)}..."`
      );
    });
  }
  lines.push('='.repeat(60));
  return lines.join('\n');
}

export function normalizeText(text: string): string {
  return text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function applySafetyFiltersToObject(
  obj: Record<string, any>,
  options: SafetyFilterOptions = {}
): { filtered: Record<string, any>; warnings: SafetyWarning[]; stats: SafetyFilterStats } {
  const warnings: SafetyWarning[] = [];
  const filtered: Record<string, any> = {};
  let totalStats: SafetyFilterStats = {
    totalReplacements: 0,
    categories: {},
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    originalLength: 0,
    filteredLength: 0,
  };
  Object.keys(SAFETY_CATEGORIES).forEach(cat => { totalStats.categories[cat] = 0; });

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const result = applySafetyFilters(value, { ...options, logWarnings: false });
      filtered[key] = result.safeText;
      warnings.push(...result.warnings);
      totalStats.totalReplacements += result.stats.totalReplacements;
      Object.keys(result.stats.categories).forEach(cat => {
        totalStats.categories[cat] = (totalStats.categories[cat] || 0) + (result.stats.categories[cat] || 0);
      });
      totalStats.highPriority += result.stats.highPriority;
      totalStats.mediumPriority += result.stats.mediumPriority;
      totalStats.lowPriority += result.stats.lowPriority;
      totalStats.originalLength += result.stats.originalLength;
      totalStats.filteredLength += result.stats.filteredLength;
    } else if (typeof value === 'object' && value !== null) {
      const nestedResult = applySafetyFiltersToObject(value as Record<string, any>, options);
      filtered[key] = nestedResult.filtered;
      warnings.push(...nestedResult.warnings);
      totalStats.totalReplacements += nestedResult.stats.totalReplacements;
      Object.keys(nestedResult.stats.categories).forEach(cat => {
        totalStats.categories[cat] = (totalStats.categories[cat] || 0) + (nestedResult.stats.categories[cat] || 0);
      });
      totalStats.highPriority += nestedResult.stats.highPriority;
      totalStats.mediumPriority += nestedResult.stats.mediumPriority;
      totalStats.lowPriority += nestedResult.stats.lowPriority;
      totalStats.originalLength += nestedResult.stats.originalLength;
      totalStats.filteredLength += nestedResult.stats.filteredLength;
    } else {
      filtered[key] = value;
    }
  }

  if (options.logWarnings && warnings.length > 0) {
    console.warn(`[SAFETY FILTER] ${warnings.length} remplacements dans l'objet`);
    warnings.slice(0, 5).forEach(warning => {
      const categoryInfo = SAFETY_CATEGORIES[warning.category];
      console.warn(
        `[SAFETY FILTER] [${warning.category}] ${categoryInfo.emoji} ` +
        `"${warning.original}" → "${warning.replacement.substring(0, 40)}..."`
      );
    });
  }

  return { filtered, warnings, stats: totalStats };
}
