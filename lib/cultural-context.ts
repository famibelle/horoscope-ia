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

export type SignPool = {
  faune: CulturalEntry[];
  flore: CulturalEntry[];
  lieux: CulturalEntry[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typedData = data as unknown as {
  medicinal: MedicinalEntry[];
  resistancePratiques: ResistanceEntry[];
  resistanceObjets: ResistanceEntry[];
  resistanceMaison: ResistanceEntry[];
  floreBeaute: CulturalEntry[];
  floreJardinage: CulturalEntry[];
} & Record<string, SignPool>;

/* ── Commemorations annuelles (MM-DD) ──────────────────────────────────────── */

const COMMEMORATIONS: Record<string, string> = {
  '05-27': "Journée des mémoires de l'esclavage en Guadeloupe — 27 mai 1848, Delgrès à Matouba, Solitude, les 87 000 affranchis.",
  '05-10': "Journée nationale des mémoires de l'esclavage et de leurs abolitions (France).",
  '04-27': "Anniversaire du décret Schœlcher (27 avril 1848) — l'abolition signée à Paris avant d'atteindre Karukera.",
  '08-15': "Fête des Cuisinières de Pointe-à-Pitre — rituels, robes madras, messe et banquet créole.",
  '07-14': "14 juillet — fête nationale mais aussi mémoire des Guadeloupéens morts dans les tranchées de 1914-1918.",
  '11-11': "Armistice — les soldats guadeloupéens revenaient du front portant la Croix de Guerre et un statut toujours colonial.",
  '02-06': "Lundi Gras — Guadeloupe en carnaval, les rues appartiennent aux vidés et aux masques.",
  '03-03': "Mardi Gras — apogée du carnaval, Vaval brûle ce soir.",
};

export function getHistoricalResonance(date: string): string | null {
  const mmdd = date.slice(5); // 'YYYY-MM-DD' → 'MM-DD'
  return COMMEMORATIONS[mmdd] ?? null;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

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

/* ── Global pools ───────────────────────────────────────────────────────────── */

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

/* ── Per-sign pools (different seeds from ambiance to avoid duplicate picks) ── */

export function getSignFaune(signId: string, date: string): CulturalEntry {
  const pool = typedData[signId];
  if (!pool?.faune?.length) return { nomCreole: '', nomFr: '', culture: '' };
  const seed = hash(`${signId}|${date}|faune`);
  return pick(pool.faune, seed, 0);
}

export function getSignFlore(signId: string, date: string): CulturalEntry {
  const pool = typedData[signId];
  if (!pool?.flore?.length) return { nomCreole: '', nomFr: '', culture: '' };
  const seed = hash(`${signId}|${date}|flore`);
  return pick(pool.flore, seed, 0);
}

export function getSignLieu(signId: string, date: string): CulturalEntry {
  const pool = typedData[signId];
  if (!pool?.lieux?.length) return { nomCreole: '', nomFr: '', culture: '' };
  const seed = hash(`${signId}|${date}|lieu`);
  return pick(pool.lieux, seed, 0);
}

/* ── Ambiance lune pickers ──────────────────────────────────────────────────── */

export function getAmbianceBienetre(signId: string, date: string): MedicinalEntry {
  const pool = typedData.medicinal;
  const seed = hash(`${signId}|${date}|ambiance-bienetre`);
  return pool[seed % pool.length];
}

export function getAmbianceBeaute(signId: string, date: string): CulturalEntry {
  const pool = typedData.floreBeaute;
  const seed = hash(`${signId}|${date}|ambiance-beaute`);
  return pick(pool, seed, 0);
}

export function getAmbianceEsprit(signId: string, date: string): ResistanceEntry {
  const pool = typedData.resistanceObjets;
  const seed = hash(`${signId}|${date}|ambiance-esprit`);
  return pool[seed % pool.length];
}

export function getAmbianceMaison(signId: string, date: string): ResistanceEntry {
  const pool = typedData.resistanceMaison;
  const seed = hash(`${signId}|${date}|ambiance-maison`);
  return pool[seed % pool.length];
}

export function getAmbianceJardinage(signId: string, date: string): CulturalEntry {
  const pool = typedData.floreJardinage;
  const seed = hash(`${signId}|${date}|ambiance-jardinage`);
  return pick(pool, seed, 0);
}

/* ── Ambiance context block (unchanged) ────────────────────────────────────── */

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
