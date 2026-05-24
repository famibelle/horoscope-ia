import type { FauneData, FloraData, LieuDetails } from './signs-data';

export interface CulturalData {
  faune?: FauneData;
  flore?: FloraData;
  lieuDetails?: LieuDetails;
  element: string;
  spirituel: string;
  animal: string;
  nomKreyol: string;
  plante: string;
  arbre: string;
  lieu: string;
  rawHoroscope?: string;
}

// Interface pour le contexte vaudou
export interface VaudouContext {
  loa: string;
  famille: 'Rada' | 'Petro' | 'Congo';
  energie: string;
  couleurs: string[];
  plante?: string;
  animal?: string;
  objet?: string;
  lieu?: string;
  rituel?: string;
  emoji: string;
}

export interface HoroscopeResponse {
  ouverture: string;
  amour: string;
  travail: string;
  argent: string;
  amitie: string;
  sante: string;
  prediction: string;
  conseil: string;
  signFr: string;
  weather: string;
  edition?: 'nuit' | 'matin' | 'midi' | 'soir';
  teaser?: string;
  source: 'mistral' | 'raw' | 'fallback';
  culturalData?: CulturalData;
  vaudou?: VaudouContext;
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
