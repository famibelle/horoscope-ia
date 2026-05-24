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

// Convertir les dates rituelles en objets détaillés
export function getAllRitualDates(): RitualDateInfo[] {
  const allDates: RitualDateInfo[] = [];
  
  // Ajouter les dates du RITUAL_DATES
  RITUAL_DATES.forEach(d => {
    const [month, day] = d.date.split('-').map(Number);
    allDates.push({
      date: d.date,
      month,
      day,
      nomFrancais: d.name,
      loa: d.loa,
      famille: d.loa === 'Baron Samedi' || d.loa === 'Gede' ? 'Petro' : d.loa === 'Damballa' ? 'Rada' : 'Rada',
      theme: d.theme,
      dimensionCulturelle: d.theme,
      niveauSacralite: 'SACRÉ',
    });
  });
  
  // Ajouter les dates de vaudou-data.ts
  datesData.forEach(d => {
    const monthDay = d.datePeriod.split('-')[0]; // Extraire MM-DD
    if (monthDay) {
      const [month, day] = monthDay.split('-').map(Number);
      if (!isNaN(month) && !isNaN(day)) {
        allDates.push({
          date: d.datePeriod,
          month,
          day,
          nomFrancais: d.nomFrancais,
          nomCreole: d.nomCreole,
          loa: d.famille,
          famille: d.famille,
          theme: d.dimensionCulturelle.split('.')[0],
          dimensionCulturelle: d.dimensionCulturelle,
          niveauSacralite: d.niveauSacralite,
        });
      }
    }
  });
  
  // Trier par mois et jour
  return allDates.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
}
