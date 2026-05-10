import data from './cultural-context-data.json';

interface CulturalEntry {
  nomCreole: string;
  nomFr: string;
  culture: string;
}

type SignPool = {
  faune: CulturalEntry[];
  flore: CulturalEntry[];
  lieux: CulturalEntry[];
};

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

export function getCulturalContext(signId: string, date: string): string {
  const pool = (data as Record<string, SignPool>)[signId];
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
