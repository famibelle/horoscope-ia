import type { Edition } from '@/private/maryse-prompt';

export function detectEdition(): Edition {
  const h = new Date().getHours();
  return h < 18 ? 'matin' : 'soir';
}

export const EDITION_LABELS: Record<Edition, { label: string; emoji: string; desc: string }> = {
  matin: { label: 'Matin', emoji: '🌅', desc: 'Intention & éveil' },
  soir:  { label: 'Soir',  emoji: '🌙', desc: 'Bilan & repos' },
};
