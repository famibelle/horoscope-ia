/**
 * Script de test pour le système de garde-fous
 * Exécuter avec: npx tsx scripts/test-safety.ts
 */

import { applySafetyFilters, applySafetyFiltersToObject } from '@/lib/private/safety-filter';

console.log('='.repeat(60));
console.log('🧪 TEST DU SYSTÈME DE GARDE-FOUS VAUDOU');
console.log('='.repeat(60));
console.log();

// Test 1
console.log('📝 Test 1: Filtre de base');
const text1 = 'Allume une bougie pour Légba et bois du rhum pour honorer les loas.';
console.log('Original:', text1);
const result1 = applySafetyFilters(text1, { logWarnings: true });
console.log('Filtré:', result1.safeText.substring(0, 100) + '...');
console.log();

// Test 2
console.log('📝 Test 2: Filtre sur un objet JSON');
const horoscope = {
  ouverture: 'Allume une bougie blanche pour commencer ton rituel.',
  amour: 'Ton partenaire t\'attend avec impatience.',
  travail: 'Prends un couteau pour couper les liens négatifs.',
  conseil: 'Bois du rhum pour célébrer.',
};
const result2 = applySafetyFiltersToObject(horoscope, { logWarnings: true });
console.log('Statistiques:', result2.stats.totalReplacements, 'remplacements');
console.log();

console.log('='.repeat(60));
console.log('✅ TOUS LES TESTS TERMINÉS');
console.log('='.repeat(60));
