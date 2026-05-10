export interface HoroscopeResponse {
  ouverture: string;
  amour: string;
  travail: string;
  argent: string;
  amitie: string;
  prediction: string;
  signFr: string;
  weather: string;
  edition?: 'matin' | 'midi' | 'soir';
  source: 'mistral' | 'raw' | 'fallback';
}

export function formatDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
