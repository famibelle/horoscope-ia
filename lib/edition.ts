import type { Edition } from '@/lib/private/maryse-prompt';

/* ── Time of Day Detection (Visiteur's local browser time) ───────── */

const TIME_OF_DAY_TO_INTRO: Record<'nuit' | 'matin' | 'midi' | 'soir', string> = {
  matin: 'ce matin',
  midi: 'cet après-midi',
  soir: 'ce soir',
  nuit: 'cette nuit',
};

export function getVisitorTimeOfDay(): 'nuit' | 'matin' | 'midi' | 'soir' {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return 'nuit';
  if (hour < 12) return 'matin';
  if (hour < 18) return 'midi';
  return 'soir';
}

export function getIntroPhrase(): string {
  const timeOfDay = getVisitorTimeOfDay();
  return `et ${TIME_OF_DAY_TO_INTRO[timeOfDay]} ...`;
}

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

/**
 * Retourne l'heure actuelle à Guadeloupe (0-23)
 */
export function getGuadeloupeHour(): number {
  return parseInt(
    new Date().toLocaleString('en-US', {
      timeZone: 'America/Guadeloupe',
      hour: 'numeric',
      hour12: false,
    }),
    10,
  );
}

/**
 * Retourne l'heure formatée HH:MM à Guadeloupe
 */
export function getGuadeloupeTime(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Guadeloupe',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Type étendu incluant la nuit
 */
export type EditionWithNight = Edition | 'nuit';

/**
 * Détecte l'édition avec la nuit (0h-6h) basée sur l'heure de Guadeloupe
 */
export function detectEditionWithNight(): EditionWithNight {
  const h = getGuadeloupeHour();
  if (h >= 0 && h < 6) return 'nuit';
  if (h < 12) return 'matin';
  if (h < 18) return 'midi';
  return 'soir';
}

/**
 * Détecte l'édition avec la nuit (0h-6h) basée sur l'HEURE LOCALE du navigateur
 * C'est cette fonction qui fait foi pour l'affichage des onglets
 */
export function detectLocalEditionWithNight(): EditionWithNight {
  const h = new Date().getHours();
  if (h >= 0 && h < 6) return 'nuit';
  if (h < 12) return 'matin';
  if (h < 18) return 'midi';
  return 'soir';
}

export function todayGuadeloupe(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guadeloupe' });
}

export const EDITION_LABELS: Record<Edition, { label: string; emoji: string; desc: string }> = {
  nuit:  { label: 'Nuit',  emoji: '🌌', desc: 'Rêves & ancêtres' },
  matin: { label: 'Matin', emoji: '🌅', desc: 'Intention & éveil' },
  midi:  { label: 'Midi',  emoji: '☀️', desc: 'Énergie & action' },
  soir:  { label: 'Soir',  emoji: '🌙', desc: 'Bilan & repos' },
};

/**
 * Retourne les labels dynamiques selon l'heure de Guadeloupe.
 * Option D : Le matin, midi/soir/nuit deviennent des "Prédictions" si futur
 */
export function getDynamicEditionLabels(currentEdition: Edition): Record<Edition, { label: string; emoji: string; desc: string }> {
  const h = getGuadeloupeHour();
  const isNight = h >= 0 && h < 6;
  const isMorning = h >= 6 && h < 12;
  const isAfternoon = h >= 12 && h < 18;

  if (isNight) {
    // La nuit : Matin, Midi, Soir sont des prédictions
    return {
      nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Ce qui compte maintenant' },
      matin: { label: 'Matin', emoji: '🔮', desc: 'Ce qui vous attend demain matin' },
      midi:  { label: 'Midi', emoji: '🔮', desc: 'Ce qui vous attend demain à midi' },
      soir:  { label: 'Soir', emoji: '🔮', desc: 'Ce qui vous attend demain soir' },
    };
  }

  if (isMorning) {
    // Le matin : Midi et Soir sont des prédictions, Nuit est déjà passée
    return {
      nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Cette nuit (pour référence)' },
      matin: { label: 'Matin', emoji: '🌅', desc: 'Ce qui compte maintenant' },
      midi:  { label: 'Midi', emoji: '🔮', desc: 'Ce qui vous attend cet après-midi' },
      soir:  { label: 'Soir', emoji: '🌙', desc: 'Comment terminer votre journée' },
    };
  }

  if (isAfternoon) {
    // À midi : Soir est une prédiction, Nuit et Matin sont déjà passés
    return {
      nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Cette nuit (pour référence)' },
      matin: { label: 'Matin', emoji: '🌅', desc: 'Ce matin (pour référence)' },
      midi:  { label: 'Midi', emoji: '☀️', desc: 'Ce qui compte maintenant' },
      soir:  { label: 'Soir', emoji: '🌙', desc: 'Comment terminer votre journée' },
    };
  }

  // Le soir : Nuit est une prédiction, Matin et Midi sont déjà passés
  return {
    nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Ce qui vous attend cette nuit' },
    matin: { label: 'Matin', emoji: '🌅', desc: 'Ce matin (pour référence)' },
    midi:  { label: 'Midi', emoji: '☀️', desc: 'Cet après-midi (pour référence)' },
    soir:  { label: 'Soir', emoji: '🌙', desc: 'Ce qui compte maintenant' },
  };
}

/**
 * Retourne les labels dynamiques selon l'HEURE LOCALE du navigateur.
 * C'est cette fonction qui fait foi pour l'affichage des onglets.
 */
export function getLocalDynamicEditionLabels(currentEdition: Edition): Record<Edition, { label: string; emoji: string; desc: string }> {
  const h = new Date().getHours();
  const isNight = h >= 0 && h < 6;
  const isMorning = h >= 6 && h < 12;
  const isAfternoon = h >= 12 && h < 18;

  if (isNight) {
    return {
      nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Ce qui compte maintenant' },
      matin: { label: 'Matin', emoji: '🔮', desc: 'Ce qui vous attend demain matin' },
      midi:  { label: 'Midi', emoji: '🔮', desc: 'Ce qui vous attend demain à midi' },
      soir:  { label: 'Soir', emoji: '🔮', desc: 'Ce qui vous attend demain soir' },
    };
  }

  if (isMorning) {
    return {
      nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Cette nuit (pour référence)' },
      matin: { label: 'Matin', emoji: '🌅', desc: 'Ce qui compte maintenant' },
      midi:  { label: 'Midi', emoji: '🔮', desc: 'Ce qui vous attend cet après-midi' },
      soir:  { label: 'Soir', emoji: '🌙', desc: 'Comment terminer votre journée' },
    };
  }

  if (isAfternoon) {
    return {
      nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Cette nuit (pour référence)' },
      matin: { label: 'Matin', emoji: '🌅', desc: 'Ce matin (pour référence)' },
      midi:  { label: 'Midi', emoji: '☀️', desc: 'Ce qui compte maintenant' },
      soir:  { label: 'Soir', emoji: '🌙', desc: 'Comment terminer votre journée' },
    };
  }

  // Le soir : Nuit est une prédiction, Matin et Midi sont déjà passés
  return {
    nuit:   { label: 'Nuit', emoji: '🌌', desc: 'Ce qui vous attend cette nuit' },
    matin: { label: 'Matin', emoji: '🌅', desc: 'Ce matin (pour référence)' },
    midi:  { label: 'Midi', emoji: '☀️', desc: 'Cet après-midi (pour référence)' },
    soir:  { label: 'Soir', emoji: '🌙', desc: 'Ce qui compte maintenant' },
  };
}
