import { config } from 'dotenv';
config();

import { todayGuadeloupe } from '@/lib/edition';
const PRESAGE_SYSTEM = `Tu es Maryse, conteuse guadeloupéenne. Tu réponds UNIQUEMENT par une seule phrase courte en français, sans titre, sans introduction, sans JSON. La phrase commence obligatoirement par "Si tu croises".
INTERDIT : suggérer d'allumer une bougie, une flamme ou un feu — même symboliquement. Le présage reste une observation de la nature, pas un rituel.
VOCABULAIRE : le tambour guadeloupéen s'appelle "ka" — jamais "tambour".`;
import signeData from '@/lib/private/presage-du-jour-data.json';
import { logMistralUsage, usageFromMistralResponse } from '@/lib/mistral-usage';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

// Parser les arguments en ligne de commande
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('-v') || args.includes('--verbose'),
  force: args.includes('-f') || args.includes('--force'),
  date: args.find(arg => arg.startsWith('--date='))?.split('=')[1],
};

function logVerbose(message: string, data?: any) {
  if (options.verbose) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    if (data !== undefined) {
      console.log(`   [${timestamp}] ℹ️  ${message}`, data);
    } else {
      console.log(`   [${timestamp}] ℹ️  ${message}`);
    }
  }
}

function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`   [${timestamp}] ❌  ${message}`, error || '');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Types pour les données du présage du jour
interface PresageEntry {
  nom_creole: string;
  nom_commun: string;
  conditions: string[];
  editions: string[];
  savoir: string;
}

interface PresageData {
  flora: PresageEntry[];
  faune: PresageEntry[];
}

const typedData = signeData as PresageData;

function weatherToConditions(weatherSummary: string): string[] {
  const w = weatherSummary.toLowerCase();
  const tags: string[] = [];
  if (w.includes('pluie') || w.includes('rain')) tags.push('pluie');
  if (w.includes('nuageux') || w.includes('couvert')) tags.push('nuageux');
  if (w.includes('vent fort') || w.includes('venteux')) tags.push('vent');
  if (w.includes('orage') || w.includes('thunder')) tags.push('orage');
  if (w.includes('soleil') || w.includes('dégagé') || w.includes('clear')) tags.push('ensoleillé');
  return tags;
}

async function fetchWeatherSummary(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=precipitation_sum,windspeed_10m_max,weathercode' +
        '&timezone=America%2FGuadeloupe&forecast_days=1',
    );
    if (!res.ok) return '';
    const data = await res.json();
    const d = data.daily;
    if (!d?.time?.length) return '';
    const rain = d.precipitation_sum[0] as number;
    const wind = Math.round(d.windspeed_10m_max[0]);
    const parts: string[] = [];
    if (rain > 10) parts.push('pluie');
    else if (rain > 2) parts.push('légère pluie');
    if (wind > 40) parts.push('vent fort');
    else if (wind > 20) parts.push('vent modéré');
    if (parts.length === 0) parts.push('ensoleillé');
    return parts.join(', ');
  } catch {
    return '';
  }
}

function pickEntry(
  pool: PresageEntry[],
  weatherTags: string[],
  edition: string,
): PresageEntry | null {
  const effectiveEdition = edition === 'midi' ? 'matin' : edition;

  const matching = pool.filter((e) => {
    const editionOk = e.editions.length === 0 || e.editions.includes(effectiveEdition);
    const condOk =
      e.conditions.length === 0 ||
      e.conditions.some((c) => weatherTags.includes(c));
    return editionOk && condOk;
  });
  const source = matching.length > 0 ? matching : pool.filter((e) =>
    e.editions.length === 0 || e.editions.includes(effectiveEdition),
  );
  if (source.length === 0) return null;
  return source[Math.floor(Math.random() * source.length)];
}

function buildPresageUserPrompt(
  type: 'flore' | 'faune',
  nomCommun: string,
  nomCreole: string,
  savoir: string,
  weather: string,
): string {
  return `${type === 'flore' ? 'PLANTE' : 'ANIMAL'} : ${nomCommun} (${nomCreole})
MÉTÉO DU JOUR : ${weather || 'Temps variable'}
SAVOIR : ${savoir}

RÈGLES :
- Commence OBLIGATOIREMENT par "Si tu croises"
- 1 phrase courte, s'arrêter après le premier point
- Sans titre, sans formule introductive
- 1 mot créole max, TOUJOURS avec traduction entre parenthèses`;
}

async function logRawData(filename: string, prompt: string, response: string) {
  const fs = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'lib', 'private', 'logs');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${filename}_${new Date().toISOString().split('T')[0]}.log`);
  
  const content = `
--- PROMPT SENT ---
${prompt}
--- RAW RESPONSE ---
${response}
------------------
`;
  await fs.appendFile(filePath, content);
}

async function generatePhrase(
  type: 'flore' | 'faune',
  entry: PresageEntry,
  weather: string,
): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    logError('MISTRAL_API_KEY non trouvé');
    return null;
  }

  logVerbose(`Génération phrase pour ${entry.nom_creole}...`);

  await delay(2000);

  const prompt = buildPresageUserPrompt(
    type,
    entry.nom_commun,
    entry.nom_creole,
    entry.savoir,
    weather,
  );
  
  console.error(`!!! DEBUG: PROMPT SENT TO MISTRAL !!!`);
  console.error(prompt);
  console.error(`!!! FIN PROMPT !!!`);

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.8,
      max_tokens: 120,
      messages: [
        { role: 'system', content: PRESAGE_SYSTEM },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    logError(`Mistral échoué: ${res.status}`);
    logMistralUsage({ source: 'generate-presage-du-jour', model: 'mistral-small-latest', success: false, httpStatus: res.status });
    if (res.status === 401 || res.status === 403) {
      // Clé invalide ou quota mensuel épuisé : échec franc plutôt qu'un présage sans phrase
      throw new Error(`Mistral HTTP ${res.status} — clé invalide ou quota mensuel épuisé, génération interrompue`);
    }
    return null;
  }

  const data = await res.json();
  logMistralUsage({
    source: 'generate-presage-du-jour',
    model: 'mistral-small-latest',
    success: true,
    httpStatus: res.status,
    ...usageFromMistralResponse(data),
  });
  const content = data.choices?.[0]?.message?.content ?? '{}';

  await logRawData('generate-presage-du-jour', prompt, content);
  
  return content.trim() || null;
}

async function saveToSupabase(data: any): Promise<void> {
  const { upsertRest } = await import('@/lib/supabase-rest');
  const row = {
    date: data.date,
    type: data.type,
    nom_creole: data.nomCreole,
    nom_commun: data.nomCommun,
    presage_naturel: data.presageNaturel,
    interpretation: data.interpretation ?? null,
  };
  await upsertRest('presages', row, 'date');
  console.log(`✅ [SUPABASE] Présage du ${data.date} upsert`);
}

async function saveToFile(today: string, data: any): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const dir = path.join(process.cwd(), 'public', 'data', 'presage-du-jour');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${today}.json`);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  await saveToSupabase(data);
  logVerbose(`Fichier sauvegardé: ${filePath}`);
  return filePath;
}

export async function generatePresageDuJour() {
  const today = options.date || todayGuadeloupe();
  const filePath = `data/presage-du-jour/${today}.json`;

  logVerbose(`Début de la génération du présage du jour`, {
    date: today,
    forceMode: options.force,
    outputPath: filePath
  });

  if (!options.force) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const existingFilePath = path.join(process.cwd(), 'public', filePath);
      await fs.access(existingFilePath);
      console.log(`
⏭️  Le présage du jour pour le ${today} existe déjà (${filePath})`);
      return;
    } catch {
      logVerbose('Aucun fichier existant trouvé, génération nécessaire');
    }
  }

  console.log(`
🌿 ========== GÉNÉRATION DU PRÉSAGE DU JOUR POUR LE ${today} ==========`);

  const weather = await fetchWeatherSummary();
  console.log(`🌤️  Météo: ${weather}
`);

  const todayDate = new Date(today);
  const useFlora = todayDate.getDate() % 2 === 0;
  const type: 'flore' | 'faune' = useFlora ? 'flore' : 'faune';
  const pool = useFlora ? typedData.flora : typedData.faune;
  const edition = 'matin';

  const weatherTags = weatherToConditions(weather);
  const entry = pickEntry(pool, weatherTags, edition);

  if (!entry) {
    console.log(`❌ Aucun présage disponible pour ${type} avec les conditions ${weatherTags.join(', ')}`);
    return;
  }

  console.log(`🎯 Type: ${type}, Entry: ${entry.nom_creole}`);

  let content = await generatePhrase(type, entry, weather);
  
  let result = {
    date: today,
    type,
    nomCreole: entry.nom_creole,
    nomCommun: entry.nom_commun,
    presageNaturel: "",
    interpretation: null as string | null
  };
  
  if (content) {
    result.presageNaturel = content;
    result.interpretation = null;
  }

  await saveToFile(today, result);

  console.log(`
✨ ========== TERMINÉ ==========`);
  console.log(`   Fichier: ${filePath}
`);
}

// Exécuter
generatePresageDuJour()
  .then(() => {
    logVerbose('🎉 Script terminé avec succès');
  })
  .catch((error) => {
    logError('❌ Erreur fatale dans le script', error instanceof Error ? error.message : error);
    console.error(error);
    // Exit non-zéro pour que le workflow GitHub Actions passe en échec (et notifie)
    process.exitCode = 1;
  });
