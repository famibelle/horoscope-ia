import data from './cultural-context-data.json';

interface CulturalEntry {
  nomCreole: string;
  nomFr: string;
  culture: string;
}

interface MedicinalEntry {
  nomCreole: string;
  nomFr: string;
  usage: string;
}

export interface ResistanceEntry {
  nomCreole: string;
  nomFr: string;
  dimension: string;
}

type SignPool = {
  faune: CulturalEntry[];
  flore: CulturalEntry[];
  lieux: CulturalEntry[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typedData = data as unknown as {
  medicinal: MedicinalEntry[];
  resistancePratiques: ResistanceEntry[];
  resistanceObjets: ResistanceEntry[];
} & Record<string, SignPool>;

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset: number): T {
  return arr[(seed + offset * 97) % arr.length];
}

function shorten(text: string, max = 120): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf('.', max);
  return cut > 40 ? text.slice(0, cut + 1) : text.slice(0, max) + '…';
}

export function getMedicinalPlant(signId: string, date: string): MedicinalEntry {
  const pool = typedData.medicinal;
  const seed = hash(`${signId}|${date}|med`);
  return pool[seed % pool.length];
}

export function getResistancePratique(signId: string, date: string): ResistanceEntry {
  const pool = typedData.resistancePratiques;
  const seed = hash(`${signId}|${date}|pratique`);
  return pool[seed % pool.length];
}

export function getResistanceObjet(signId: string, date: string): ResistanceEntry {
  const pool = typedData.resistanceObjets;
  const seed = hash(`${signId}|${date}|objet`);
  return pool[seed % pool.length];
}

export function getCulturalContext(signId: string, date: string): string {
  const pool = typedData[signId];
  if (!pool) return '';

  const seed = hash(`${signId}|${date}`);

  const faune = pick(pool.faune, seed, 0);
  const flore = pick(pool.flore, seed, 1);
  const lieu  = pick(pool.lieux, seed, 2);

  return [
    `Références culturelles karukera pour ce jour (utilise-les concrètement dans tes conseils) :`,
    `• Faune : ${faune.nomCreole} (${faune.nomFr}) — ${shorten(faune.culture)}`,
    `• Flore : ${flore.nomCreole} (${flore.nomFr}) — ${shorten(flore.culture)}`,
    `• Lieu sacré : ${lieu.nomCreole} — ${shorten(lieu.culture)}`,
  ].join('\n');
}
