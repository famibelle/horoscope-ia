import type { Edition } from '@/lib/private/maryse-prompt';

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

/**
 * Retourne les labels dynamiques selon l'heure actuelle.
 * Option D : Le matin, midi/soir deviennent des "Prédictions"
 */
export function getDynamicEditionLabels(currentEdition: Edition): Record<Edition, { label: string; emoji: string; desc: string }> {
  const currentHour = new Date().getHours();
  const isMorning = currentHour < 12;
  const isAfternoon = currentHour >= 12 && currentHour < 18;

  if (isMorning) {
    // Le matin : Midi et Soir sont des prédictions
    return {
      matin: { label: 'Édition du matin', emoji: '🌅', desc: 'Ce qui compte maintenant' },
      midi:  { label: 'Prédiction midi', emoji: '🔮', desc: 'Ce qui vous attend cet après-midi' },
      soir:  { label: 'Prédiction soir', emoji: '🌙', desc: 'Comment terminer votre journée' },
    };
  }

  if (isAfternoon) {
    // À midi : Soir est une prédiction
    return {
      matin: { label: 'Édition du matin', emoji: '🌅', desc: 'Ce matin (pour référence)' },
      midi:  { label: 'Édition du midi', emoji: '☀️', desc: 'Ce qui compte maintenant' },
      soir:  { label: 'Prédiction soir', emoji: '🌙', desc: 'Comment terminer votre journée' },
    };
  }

  // Le soir : tout est en mode "éditions"
  return {
    matin: { label: 'Édition du matin', emoji: '🌅', desc: 'Ce matin (pour référence)' },
    midi:  { label: 'Édition du midi', emoji: '☀️', desc: 'Cet après-midi (pour référence)' },
    soir:  { label: 'Édition du soir', emoji: '🌙', desc: 'Ce qui compte maintenant' },
  };
}
