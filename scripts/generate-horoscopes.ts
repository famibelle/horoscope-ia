import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis .env

import { signs } from '@/lib/signs-data';
import { MARYSE_SYSTEM, buildHoroscopeUserPrompt, type Edition } from '@/lib/private/maryse-prompt';
import {
  getMedicinalPlant,
  getResistancePratique,
  getResistanceObjet,
  getSignFaune,
  getSignFlore,
  getSignLieu,
  getHistoricalResonance,
} from '@/lib/cultural-context';
import { todayGuadeloupe } from '@/lib/edition';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const SIGN_EN: Record<string, string> = {
  belier: 'aries',
  taureau: 'taurus',
  gemeaux: 'gemini',
  cancer: 'cancer',
  lion: 'leo',
  vierge: 'virgo',
  balance: 'libra',
  scorpion: 'scorpio',
  sagittaire: 'sagittarius',
  capricorne: 'capricorn',
  verseau: 'aquarius',
  poissons: 'pisces',
};

async function fetchRawHoroscope(signEn: string): Promise<string> {
  const res = await fetch(
    `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${signEn}`,
    { headers: { 'User-Agent': 'HoroscopeKarukera/1.0' } }
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.horoscope || data?.data?.horoscope || data.description || '';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithMistral(
  signId: string,
  rawText: string,
  weather: string,
  edition: Edition
): Promise<Record<string, string> | null> {
  // Délai pour éviter le rate limit Mistral
  await delay(10000);

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.log('❌ MISTRAL_API_KEY non trouvé dans .env');
    return null;
  }

  const sign = signs.find((s) => s.id === signId);
  if (!sign) return null;

  const medicinal = getMedicinalPlant(signId, todayGuadeloupe());
  const pratique = getResistancePratique(signId, todayGuadeloupe());
  const objet = getResistanceObjet(signId, todayGuadeloupe());
  const faune = getSignFaune(signId, todayGuadeloupe());
  const flore = getSignFlore(signId, todayGuadeloupe());
  const lieu = getSignLieu(signId, todayGuadeloupe());
  const historicalResonance = getHistoricalResonance(todayGuadeloupe());

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
        { role: 'user', content: buildHoroscopeUserPrompt(sign, rawText, weather, edition, undefined, undefined) },
      ],
    }),
  });

  if (!res.ok) {
    console.log(`❌ Mistral large échoué: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  try {
    return JSON.parse(content);
  } catch {
    console.log(`❌ JSON invalide pour ${signId}`);
    return null;
  }
}

async function generateTeaser(
  signName: string,
  structured: Record<string, string>
): Promise<string> {
  // Délai pour éviter le rate limit Mistral
  await delay(5000);

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return '';

  const fullText = [
    structured.ouverture,
    structured.amour,
    structured.travail,
    structured.argent,
    structured.amitie,
    structured.prediction,
  ]
    .filter(Boolean)
    .join(' ');

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.8,
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content:
            `Tu es Maryse CondAI. Rédige une accroche de 2 phrases maximum à partir de l'horoscope du ${signName}, en voix directe et sensuelle, qui donne envie de lire la suite sans tout révéler. Pas de titre, pas de ponctuation finale superflue.`,
        },
        { role: 'user', content: fullText },
      ],
    }),
  });

  if (!res.ok) {
    console.log(`❌ Mistral small échoué: ${res.status}`);
    return '';
  }

  return (await res.json()).choices?.[0]?.message?.content?.trim() ?? '';
}

async function fetchWeather(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max' +
        '&timezone=America%2FGuadeloupe&forecast_days=1'
    );
    if (!res.ok) return '';
    const data = await res.json();
    const d = data.daily;
    if (!d?.time?.length) return '';
    const tmax = Math.round(d.temperature_2m_max[0]);
    const tmin = Math.round(d.temperature_2m_min[0]);
    const rain = d.precipitation_sum[0] as number;
    const wind = Math.round(d.windspeed_10m_max[0]);
    const rainLabel =
      rain === 0
        ? 'pas de pluie'
        : rain < 5
          ? 'légère pluie'
          : rain < 20
            ? 'pluie modérée'
            : 'fortes pluies';
    const windLabel =
      wind < 20 ? 'vent faible' : wind < 40 ? 'vent modéré' : 'vent fort';
    return `${tmin}–${tmax}°C, ${rainLabel}, ${windLabel} (${wind} km/h)`;
  } catch {
    return '';
  }
}

async function saveToLocalFile(today: string, data: Record<string, any>) {
  const fs = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'data', 'horoscopes');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${today}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

export async function generateAllHoroscopes() {
  const today = todayGuadeloupe();
  console.log(`\n📅 ========== GÉNÉRATION DES HOROSCOPES POUR LE ${today} ==========`);

  const weather = await fetchWeather();
  console.log(`🌤️  Météo: ${weather}\n`);

  const editions: Edition[] = ['nuit', 'matin', 'midi', 'soir'];
  const total = signs.length * editions.length;
  let generated = 0;
  let skipped = 0;

  const results: Record<string, any> = {};
  const filePath = `data/horoscopes/${today}.json`;

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('horoscopes');

    for (const sign of signs) {
      for (const edition of editions) {
        const blobKey = `${today}|${sign.id}|${edition}`;

        // Vérifier le cache
        const cached = await store.get(blobKey, { type: 'json' });
        if (cached) {
          console.log(`✅ [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - Déjà en cache Netlify`);
          skipped++;
          continue;
        }

        console.log(`🔄 [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - Récupération horoscope brut...`);

        // Récupérer l'horoscope brut
        const rawText = await fetchRawHoroscope(SIGN_EN[sign.id]);
        if (!rawText) {
          console.log(`❌ [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Pas de texte brut\n`);
          continue;
        }
        console.log(`   ✓ Horoscope brut reçu (${rawText.length} caractères)`);

        // Générer avec Mistral
        console.log(`   🤖 Appel Mistral (large) pour ${sign.id}...`);
        const structured = await generateWithMistral(sign.id, rawText, weather, edition);
        if (!structured?.ouverture) {
          console.log(`❌ [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Mistral large a échoué\n`);
          continue;
        }
        console.log(`   ✓ Mistral large: OK`);

        // Générer le teaser
        console.log(`   🤖 Appel Mistral (small) pour teaser...`);
        const teaser = await generateTeaser(sign.name, structured);
        console.log(`   ✓ Teaser généré: "${teaser.substring(0, 60)}..."`);

        // Sauvegarder
        const response = {
          ouverture: structured.ouverture,
          amour: structured.amour,
          travail: structured.travail,
          argent: structured.argent ?? '',
          amitie: structured.amitie ?? '',
          sante: structured.sante ?? '',
          prediction: structured.prediction ?? '',
          signFr: sign.name,
          weather,
          edition,
          teaser: teaser || undefined,
          source: 'mistral',
        };

        results[blobKey] = response;
        await store.set(blobKey, JSON.stringify(response));

        // Sauvegarder au fil de l'eau dans le fichier local
        await saveToLocalFile(today, results);

        console.log(`✅ [${++generated}/${total}] ${sign.id} (${edition}) - SAUVEGARDÉ\n`);
        console.log(`   📝 Ouverture: "${structured.ouverture}"`);
        console.log(`   💘 Amour: "${structured.amour}"`);
        console.log(`   💼 Travail: "${structured.travail}"`);
        console.log(`   💰 Argent: "${structured.argent}"`);
        console.log(`   👫 Amitié: "${structured.amitie}"`);
        console.log(`   🎯 Prédiction: "${structured.prediction}"`);
        console.log(`   🌟 Teaser: "${teaser}"\n`);
        console.log('---');
      }
    }

    console.log(`\n✨ ========== TERMINÉ (Netlify Blobs) ==========`);
    console.log(`   Générés: ${generated}/${total}`);
    console.log(`   Déjà en cache: ${skipped}/${total}`);
    console.log(`   Fichier local: ${filePath}\n`);
  } catch (error) {
    console.log('\n💡 ========== MODE LOCAL (sans Netlify Blobs) ==========');
    console.log('   Sauvegarde au fil de l\'eau dans data/horoscopes/\n');

    // Charger les horoscopes déjà générés
    let generated = 0;
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const existingFilePath = path.join(process.cwd(), filePath);
      const existingFile = await fs.readFile(existingFilePath, 'utf-8').catch(() => '{}');
      const existingResults = JSON.parse(existingFile || '{}');
      Object.assign(results, existingResults);
      generated = Object.keys(existingResults).length;
      console.log(`📂 Chargé ${generated} horoscopes existants depuis ${filePath}\n`);
    } catch {
      // Pas de fichier existant, on commence depuis 0
      generated = 0;
    }

    for (const sign of signs) {
      for (const edition of editions) {
        const blobKey = `${today}|${sign.id}|${edition}`;

        // Sauter si déjà dans results
        if (results[blobKey]) {
          console.log(`✅ [${generated + 1}/${total}] ${sign.id} (${edition}) - Déjà présent, sauté\n`);
          continue;
        }

        console.log(`🔄 [${generated + 1}/${total}] ${sign.id} (${edition})...`);

        const rawText = await fetchRawHoroscope(SIGN_EN[sign.id]);
        if (!rawText) {
          console.log(`❌ [${generated + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Pas de texte brut\n`);
          continue;
        }
        console.log(`   ✓ Horoscope brut reçu`);

        const structured = await generateWithMistral(sign.id, rawText, weather, edition);
        if (!structured?.ouverture) {
          console.log(`❌ [${generated + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Mistral large\n`);
          continue;
        }
        console.log(`   ✓ Mistral large: OK`);

        const teaser = await generateTeaser(sign.name, structured);
        console.log(`   ✓ Teaser: OK`);

        const response = {
          ouverture: structured.ouverture,
          amour: structured.amour,
          travail: structured.travail,
          argent: structured.argent ?? '',
          amitie: structured.amitie ?? '',
          sante: structured.sante ?? '',
          prediction: structured.prediction ?? '',
          signFr: sign.name,
          weather,
          edition,
          teaser: teaser || undefined,
          source: 'mistral',
        };

        results[blobKey] = response;
        await saveToLocalFile(today, results);

        console.log(`✅ [${++generated}/${total}] ${sign.id} (${edition}) - SAUVEGARDÉ`);
        console.log(`   📝 Ouverture: "${structured.ouverture}"`);
        console.log(`   💘 Amour: "${structured.amour}"`);
        console.log(`   💼 Travail: "${structured.travail}"`);
        console.log(`   💰 Argent: "${structured.argent}"`);
        console.log(`   👫 Amitié: "${structured.amitie}"`);
        console.log(`   🎯 Prédiction: "${structured.prediction}"`);
        console.log(`   🌟 Teaser: "${teaser}"\n`);
        console.log('---');
      }
    }

    console.log(`\n✨ ========== TERMINÉ (Mode Local) ==========`);
    console.log(`   Générés: ${Object.keys(results).length}/${total}`);
    console.log(`   Fichier: ${filePath}\n`);
  }
}

// Exécuter
generateAllHoroscopes().catch(console.error);
