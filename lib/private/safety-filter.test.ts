/**
 * 🧪 Tests Unitaires pour le Module de Filtrage de Sécurité
 */

import {
  applySafetyFilters,
  hasDangerousContent,
  hasCriticalContent,
  findDangerousMatches,
  checkSafety,
  normalizeText,
  applySafetyFiltersToObject,
} from './safety-filter';

import {
  SAFETY_RULES,
  SAFETY_CATEGORIES,
  getRulesByCategory,
  getRulesByPriority,
  getRuleById,
} from './safety-guards';

describe('🛡️ Safety Guards Module', () => {
  it('devrait avoir des règles définies', () => {
    expect(SAFETY_RULES).toBeDefined();
    expect(SAFETY_RULES.length).toBeGreaterThan(0);
  });

  it('devrait avoir des catégories définies', () => {
    expect(SAFETY_CATEGORIES).toBeDefined();
    expect(Object.keys(SAFETY_CATEGORIES).length).toBeGreaterThan(0);
  });

  it('getRulesByCategory devrait filtrer par catégorie', () => {
    const fireRules = getRulesByCategory('fire');
    expect(fireRules.every(rule => rule.category === 'fire')).toBe(true);
  });

  it('getRuleById devrait trouver une règle', () => {
    const rule = getRuleById('fire_candle_light_verb');
    expect(rule).toBeDefined();
    expect(rule?.id).toBe('fire_candle_light_verb');
  });
});

describe('🔍 Safety Filter Module', () => {
  describe('applySafetyFilters', () => {
    it('devrait remplacer Allume une bougie', () => {
      const text = 'Allume une bougie pour le rituel.';
      const result = applySafetyFilters(text, { logWarnings: false });
      expect(result.safeText).toContain('Imagine une bougie allumée');
      expect(result.safeText).not.toContain('Allume');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].category).toBe('fire');
    });

    it('devrait remplacer Brûle de l\'encens', () => {
      const text = 'Fais brûler de l\'encens';
      const result = applySafetyFilters(text, { logWarnings: false });
      expect(result.safeText).toContain('Visualise une fumée');
      expect(result.warnings.some(w => w.category === 'fire')).toBe(true);
    });

    it('devrait remplacer Mange cette plante', () => {
      const text = 'Mange cette plante sacrée';
      const result = applySafetyFilters(text, { logWarnings: false });
      expect(result.safeText).toContain('Médite sur les propriétés');
      expect(result.warnings.some(w => w.category === 'ingestion')).toBe(true);
    });

    it('devrait remplacer Prends un couteau', () => {
      const text = 'Prends un couteau';
      const result = applySafetyFilters(text, { logWarnings: false });
      expect(result.safeText).toContain('Symbolise');
      expect(result.warnings.some(w => w.category === 'dangerous_objects')).toBe(true);
    });

    it('devrait préserver le texte sans danger', () => {
      const text = 'Médite sur la lumière';
      const result = applySafetyFilters(text, { logWarnings: false });
      expect(result.safeText).toBe(text);
      expect(result.warnings.length).toBe(0);
    });

    it('devrait gérer le texte vide', () => {
      const result = applySafetyFilters('', { logWarnings: false });
      expect(result.safeText).toBe('');
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('hasDangerousContent', () => {
    it('devrait détecter du contenu dangereux', () => {
      expect(hasDangerousContent('Allume une bougie')).toBe(true);
      expect(hasDangerousContent('Bois du rhum')).toBe(true);
      expect(hasDangerousContent('Prends un couteau')).toBe(true);
    });

    it('devrait ne pas détecter de contenu sans danger', () => {
      expect(hasDangerousContent('Médite sur la lumière')).toBe(false);
    });
  });

  describe('applySafetyFiltersToObject', () => {
    it('devrait filtrer un objet avec des valeurs string', () => {
      const obj = {
        ouverture: 'Allume une bougie',
        conseil: 'Médite sur la lumière',
        amor: 'Bois du rhum',
      };
      const result = applySafetyFiltersToObject(obj, { logWarnings: false });
      expect(result.filtered.ouverture).not.toContain('Allume');
      expect(result.filtered.conseil).toBe('Médite sur la lumière');
      expect(result.filtered.amor).not.toContain('Bois');
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    });

    it('devrait gérer les objets imbriqués', () => {
      const obj = {
        data: {
          horoscope: {
            ouverture: 'Allume une bougie',
            conseil: 'Prends un couteau',
          },
        },
      };
      const result = applySafetyFiltersToObject(obj as any, { logWarnings: false });
      expect((result.filtered as any).data.horoscope.ouverture).not.toContain('Allume');
      expect((result.filtered as any).data.horoscope.conseil).not.toContain('couteau');
    });

    it('devrait préserver les valeurs non-string', () => {
      const obj = {
        nom: 'Test',
        count: 42,
        isActive: true,
      };
      const result = applySafetyFiltersToObject(obj as any, { logWarnings: false });
      expect(result.filtered.nom).toBe('Test');
      expect(result.filtered.count).toBe(42);
      expect(result.filtered.isActive).toBe(true);
    });
  });

  describe('normalizeText', () => {
    it('devrait normaliser les sauts de ligne', () => {
      expect(normalizeText('Ligne 1\nLigne 2')).toBe('Ligne 1 Ligne 2');
    });

    it('devrait normaliser les espaces multiples', () => {
      expect(normalizeText('Texte   avec   espaces')).toBe('Texte avec espaces');
    });
  });
});
