import type { Edition } from '@/private/maryse-prompt';

/**
 * Returns the current moon phase emoji based on lunar cycle
 * Calculates phase from a known reference date (2000-01-06 = new moon)
 */
export function getMoonPhaseEmoji(): string {
  const known = new Date('2000-01-06').getTime();
  const days = (Date.now() - known) / 86400000;
  const cycle = (days % 29.53 + 29.53) % 29.53;
  const idx = Math.floor(cycle / 29.53 * 8) % 8;
  const moonPhases = [
    '🌑', // Nouvelle lune
    '🌒', // Croissant naissant
    '🌓', // Premier quartier
    '🌔', // Croissant gibbeuse
    '🌕', // Pleine lune
    '🌖', // Gibbeuse décroissante
    '🌗', // Dernier quartier
    '🌘', // Croissant décroissant
  ];
  return moonPhases[idx];
}

export function detectEdition(): Edition {
  const h = parseInt(
    new Date().toLocaleString('en-US', {
      timeZone: 'America/Guadeloupe',
      hour: 'numeric',
      hour12: false,
    }),
    10,
  );
  if (h < 12) return 'matin';
  if (h < 18) return 'midi';
  return 'soir';
}

export function todayGuadeloupe(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guadeloupe' });
}

export const EDITION_LABELS: Record<Edition, { label: string; emoji: string; desc: string }> = {
  matin: { label: 'Matin', emoji: '🌅', desc: 'Intention & éveil' },
  midi:  { label: 'Midi',  emoji: '☀️', desc: 'Énergie & action' },
  soir:  { label: 'Soir',  emoji: '🌙', desc: 'Bilan & repos' },
};
