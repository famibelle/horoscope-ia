import { RITUAL_DATES } from './vaudou-mappings';
import { datesData } from './vaudou-data';

export interface RitualDateInfo {
  date: string;
  month: number;
  day: number;
  nomFrancais: string;
  nomCreole?: string;
  loa: string;
  famille: string;
  theme: string;
  dimensionCulturelle: string;
  niveauSacralite: string;
}

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4,
  mai: 5, juin: 6, juillet: 7, août: 8, aout: 8,
  septembre: 9, octobre: 10, novembre: 11, décembre: 12, decembre: 12,
};

// Algorithme de Meeus/Jones/Butcher pour calculer Pâques
function easterDate(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function addDaysToDate(month: number, day: number, year: number, delta: number): { month: number; day: number } {
  const d = new Date(year, month - 1, day + delta);
  return { month: d.getMonth() + 1, day: d.getDate() };
}

function parseFrenchDate(datePeriod: string, year: number): { month: number; day: number } | null {
  // Nettoyer les suffixes parasites comme " (aussi)"
  const cleaned = datePeriod.replace(/\s*\(.*?\)/g, '').trim();

  // Cas Pâques
  if (cleaned.includes('Pâques') || cleaned.includes('Paques')) {
    const easter = easterDate(year);
    const afterMatch = cleaned.match(/(\d+)\s+jours?\s+après/i);
    const beforeMatch = cleaned.match(/(\d+)\s+jours?\s+avant/i);
    if (afterMatch) return addDaysToDate(easter.month, easter.day, year, parseInt(afterMatch[1]));
    if (beforeMatch) return addDaysToDate(easter.month, easter.day, year, -parseInt(beforeMatch[1]));
    return easter;
  }

  // Cas "Date variable" → ignorer
  if (cleaned.toLowerCase().startsWith('date variable')) return null;

  // Cas "DD (er|ème)? mois" ex: "1er novembre", "25 décembre", "8 novembre"
  const match = cleaned.match(/^(\d+)(?:er|ème|e)?\s+([a-zàâéèêëîïôùûüç]+)$/i);
  if (match) {
    const day = parseInt(match[1]);
    const monthName = match[2].toLowerCase();
    const month = FRENCH_MONTHS[monthName];
    if (month && day >= 1 && day <= 31) return { month, day };
  }

  return null;
}

export function getAllRitualDates(): RitualDateInfo[] {
  const year = new Date().getFullYear();
  const allDates: RitualDateInfo[] = [];

  // Entrées de RITUAL_DATES (format MM-DD natif)
  RITUAL_DATES.forEach(d => {
    const [month, day] = d.date.split('-').map(Number);
    allDates.push({
      date: d.date,
      month,
      day,
      nomFrancais: d.name,
      loa: d.loa,
      famille: d.loa === 'Baron Samedi' || d.loa === 'Gede' ? 'Petro' : 'Rada',
      theme: d.theme,
      dimensionCulturelle: d.theme,
      niveauSacralite: 'SACRÉ',
    });
  });

  // Entrées de vaudou-data.ts (datePeriod en français)
  datesData.forEach(d => {
    const parsed = parseFrenchDate(d.datePeriod, year);
    if (!parsed) return;

    // Éviter les doublons avec RITUAL_DATES (même mois+jour)
    const alreadyExists = allDates.some(e => e.month === parsed.month && e.day === parsed.day);
    if (alreadyExists) return;

    allDates.push({
      date: `${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`,
      month: parsed.month,
      day: parsed.day,
      nomFrancais: d.nomFrancais,
      nomCreole: d.nomCreole,
      loa: d.famille,
      famille: d.famille,
      theme: d.dimensionCulturelle.split('.')[0],
      dimensionCulturelle: d.dimensionCulturelle,
      niveauSacralite: d.niveauSacralite,
    });
  });

  return allDates.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
}
