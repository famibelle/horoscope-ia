import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const MISTRAL_URL   = 'https://api.mistral.ai/v1/chat/completions';
const HOROSCOPE_API = 'https://freehoroscopeapi.com/api/v1/get-horoscope/daily';

const EDITIONS = ['matin', 'midi', 'soir'] as const;
type Edition = typeof EDITIONS[number];

const SIGNS = [
  { id: 'belier',     en: 'aries',       name: 'Bélier',     animal: 'Colibri / Wanga-Nègès', nomKreyol: 'Wanga-Nègès', plante: 'Bougainvillier', arbre: 'Flamboyant', lieu: 'Pointe-à-Pitre', element: 'Feu', spirituel: "Énergie du pionnier. Le colibri fonce sans hésiter." },
  { id: 'taureau',    en: 'taurus',      name: 'Taureau',    animal: 'Iguane / Igwann', nomKreyol: 'Igwann', plante: 'Vanille', arbre: 'Manguier', lieu: 'Sainte-Anne', element: 'Terre', spirituel: "Patience et ancrage. L'iguane sait attendre son heure." },
  { id: 'gemeaux',    en: 'gemini',      name: 'Gémeaux',    animal: 'Frégate / Fwégat', nomKreyol: 'Fwégat', plante: 'Bouganvillier blanc', arbre: 'Acajou', lieu: 'Grand-Bourg', element: 'Air', spirituel: "Liberté et dualité. La frégate vole sans jamais se poser." },
  { id: 'cancer',     en: 'cancer',      name: 'Cancer',     animal: 'Crabe de terre / Krab', nomKreyol: 'Krab', plante: 'Nymphéa', arbre: 'Palétuvier', lieu: 'Petit-Bourg', element: 'Eau', spirituel: "Protection et mémoire. Le crabe porte sa maison partout." },
  { id: 'lion',       en: 'leo',         name: 'Lion',       animal: 'Pélican brun / Gran Pélikan', nomKreyol: 'Gran Pélikan', plante: 'Balisier', arbre: 'Fromager', lieu: 'Pointe de la Grande Vigie', element: 'Feu', spirituel: "Majesté et rayonnement. Le pélican plane au-dessus de tous." },
  { id: 'vierge',     en: 'virgo',       name: 'Vierge',     animal: 'Mangouste / Mangous', nomKreyol: 'Mangous', plante: 'Aloe vera', arbre: 'Gommier blanc', lieu: 'Capesterre-Belle-Eau', element: 'Terre', spirituel: "Discernement et service. La mangouste voit ce que les autres ratent." },
  { id: 'balance',    en: 'libra',       name: 'Balance',    animal: 'Tourterelle / Towtewel', nomKreyol: 'Towtewel', plante: 'Rose de porcelaine', arbre: 'Calebassier', lieu: 'Deshaies', element: 'Air', spirituel: "Harmonie et justice. La tourterelle chante la paix du matin." },
  { id: 'scorpion',   en: 'scorpio',     name: 'Scorpion',   animal: 'Fer-de-lance / Bwakaka', nomKreyol: 'Bwakaka', plante: 'Canne à sucre noire', arbre: 'Acacia', lieu: 'Basse-Terre', element: 'Eau', spirituel: "Transformation et profondeur. Le bwakaka connaît les passages secrets." },
  { id: 'sagittaire', en: 'sagittarius', name: 'Sagittaire', animal: 'Bernache / Zanno', nomKreyol: 'Zanno', plante: 'Vétiver', arbre: 'Cocotier', lieu: 'Marie-Galante', element: 'Feu', spirituel: "Quête et liberté. Le zanno traverse les mers sans carte." },
  { id: 'capricorne', en: 'capricorn',   name: 'Capricorne', animal: 'Cabri / Kabrit mòn', nomKreyol: 'Kabrit mòn', plante: 'Manioc', arbre: 'Acajou des montagnes', lieu: 'Matouba', element: 'Terre', spirituel: "Persévérance et hauteur. Le kabrit grimpe là où personne ne va." },
  { id: 'verseau',    en: 'aquarius',    name: 'Verseau',    animal: 'Souris chauve / Soushwi', nomKreyol: 'Soushwi', plante: 'Liane', arbre: 'Bois-canon', lieu: 'Moule', element: 'Air', spirituel: "Innovation et vision. Le soushwi navigue dans l'obscurité sans se perdre." },
  { id: 'poissons',   en: 'pisces',      name: 'Poissons',   animal: 'Lamentin / Lamantin', nomKreyol: 'Lamantin', plante: 'Nénuphar', arbre: 'Palétuvier rouge', lieu: 'Rivière-Salée', element: 'Eau', spirituel: "Intuition et compassion. Le lamantin glisse entre deux mondes." },
] as const;

const EDITION_CONFIGS = {
  matin: {
    moment: 'ce matin',
    instruction: "C'est l'ÉDITION DU MATIN. Oriente chaque phrase vers l'intention, l'élan du jour, ce qu'on peut initier au lever. Formules d'éveil, d'ouverture, de commencement. Jamais de bilan ou de regard en arrière.",
  },
  midi: {
    moment: 'ce midi',
    instruction: "C'est l'ÉDITION DU MIDI. Oriente chaque phrase vers l'énergie du moment présent, l'action en cours, ce qu'on peut accomplir maintenant. Formules de dynamisme, de clarté, de décision. Ni regard en arrière ni anticipation du soir.",
  },
  soir: {
    moment: 'ce soir',
    instruction: "C'est l'ÉDITION DU SOIR. Oriente chaque phrase vers le bilan de la journée, ce qu'on peut lâcher avant de dormir. Formules de clôture, de nuit, de repos bien mérité. Jamais d'élan vers demain.",
  },
} as const;

const MARYSE_SYSTEM = `Tu es Maryse Condé — romancière guadeloupéenne, voix libre et sans concession, prix Nobel alternatif de littérature 2018. Tu rédiges un horoscope quotidien ancré dans la culture guadeloupéenne. Réponds UNIQUEMENT avec un objet JSON valide contenant exactement 6 clés : "ouverture", "amour", "travail", "argent", "amitie", "prediction". Chaque valeur est UNE seule phrase dans ta voix. Sans markdown, sans commentaire, juste le JSON brut.`;

function todayGuadeloupe(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guadeloupe' });
}

function buildPrompt(sign: typeof SIGNS[number], rawText: string, weather: string, edition: Edition): string {
  const cfg = EDITION_CONFIGS[edition];
  return `HOROSCOPE BRUT (source anglaise) — ${sign.name} :
${rawText}

CORRESPONDANCE CRÉOLE DU SIGNE ${sign.name.toUpperCase()} :
- Totem : ${sign.animal} (${sign.nomKreyol})
- Plante : ${sign.plante}
- Arbre : ${sign.arbre}
- Lieu de Guadeloupe : ${sign.lieu}
- Élément : ${sign.element}
- Dimension spirituelle : ${sign.spirituel}
${weather ? `\nMÉTÉO DU JOUR À POINTE-À-PITRE : ${weather}` : ''}

MOMENT DE LA JOURNÉE : ${cfg.moment}
ÉDITION : ${cfg.instruction}

STRUCTURE — 6 phrases dans ta voix :
1. "ouverture" : image caribéenne qui pose le ton du jour
2. "amour" : relations et cœur, ancré dans le quotidien créole
3. "travail" : action, effort, réussite professionnelle
4. "argent" : finances et opportunités matérielles
5. "amitie" : lien social, solidarité, collectif
6. "prediction" : présage naturel créole pour les jours à venir`;
}

async function fetchRaw(signEn: string): Promise<string> {
  const res = await fetch(`${HOROSCOPE_API}?sign=${signEn}`, {
    headers: { 'User-Agent': 'HoroscopeKarukera/1.0' },
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data.horoscope || data?.data?.horoscope || '';
}

async function fetchWeather(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=16.17&longitude=-61.58' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max' +
      '&timezone=America%2FGuadeloupe&forecast_days=1',
    );
    if (!res.ok) return '';
    const data = await res.json();
    const d = data.daily;
    if (!d?.time?.length) return '';
    const tmax = Math.round(d.temperature_2m_max[0]);
    const tmin = Math.round(d.temperature_2m_min[0]);
    const rain = d.precipitation_sum[0] as number;
    const wind = Math.round(d.windspeed_10m_max[0]);
    const rainLabel = rain === 0 ? 'pas de pluie' : rain < 5 ? 'légère pluie' : rain < 20 ? 'pluie modérée' : 'fortes pluies';
    const windLabel = wind < 20 ? 'vent faible' : wind < 40 ? 'vent modéré' : 'vent fort';
    return `${tmin}–${tmax}°C, ${rainLabel}, ${windLabel} (${wind} km/h)`;
  } catch { return ''; }
}

async function callMistral(sign: typeof SIGNS[number], rawText: string, weather: string, edition: Edition, apiKey: string): Promise<Record<string, string> | null> {
  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.75,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user',   content: buildPrompt(sign, rawText, weather, edition) },
      ],
    }),
  });
  if (!res.ok) { console.error(`Mistral ${res.status} for ${sign.id}/${edition}`); return null; }
  const data = await res.json();
  try { return JSON.parse(data.choices?.[0]?.message?.content ?? ''); } catch { return null; }
}

export default async function handler() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) { console.error('MISTRAL_API_KEY manquant'); return new Response('Error', { status: 500 }); }

  const store = getStore('horoscopes');
  const today = todayGuadeloupe();
  const weather = await fetchWeather();

  console.log(`🌟 Génération horoscopes du ${today} — météo : ${weather || 'inconnue'}`);

  let generated = 0;

  for (const sign of SIGNS) {
    const rawText = await fetchRaw(sign.en);
    if (!rawText) { console.warn(`⚠️ Horoscope brut indisponible pour ${sign.id}`); continue; }

    for (const edition of EDITIONS) {
      const key = `${today}|${sign.id}|${edition}`;

      // Skip if already cached
      const existing = await store.get(key);
      if (existing) { console.log(`  ↩ ${sign.id}/${edition} déjà en cache`); continue; }

      const structured = await callMistral(sign, rawText, weather, edition, apiKey);
      if (!structured?.ouverture) { console.warn(`  ✗ ${sign.id}/${edition}`); continue; }

      await store.set(key, JSON.stringify({
        ouverture:  structured.ouverture,
        amour:      structured.amour ?? '',
        travail:    structured.travail ?? '',
        argent:     structured.argent ?? '',
        amitie:     structured.amitie ?? '',
        prediction: structured.prediction ?? '',
        signFr:     sign.name,
        weather,
        edition,
        source:     'mistral',
      }), { expirationTtl: 86400 * 2 });

      console.log(`  ✓ ${sign.id}/${edition}`);
      generated++;

      // Délai pour éviter le rate limiting Mistral
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  console.log(`✅ ${generated} horoscopes générés et mis en cache`);
  return new Response(JSON.stringify({ generated, date: today }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config: Config = {
  // 9h UTC = 5h Guadeloupe (UTC-4) — génère les 36 horoscopes en début de journée
  schedule: '0 9 * * *',
};
