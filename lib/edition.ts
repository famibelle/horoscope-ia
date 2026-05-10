import type { Edition } from '@/private/maryse-prompt';

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
