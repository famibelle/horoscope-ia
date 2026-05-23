import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis .env

// Importer les bases de données culturelles
import { floreData } from '@/lib/private/flore-data';
import { fauneData } from '@/lib/private/faune-data';
import { todayGuadeloupe } from '@/lib/edition';
import { MARYSE_SYSTEM } from '@/lib/private/maryse-prompt';
import signeData from '@/lib/private/signe-du-jour-data.json';

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

// Types pour les données du signe du jour
interface SigneEntry {
  nom_creole: string;
  nom_commun: string;
  famille?: string;
  conditions: string[];
  editions: string[];
  savoir: string;
}

interface SigneData {
  flora: SigneEntry[];
  faune: SigneEntry[];
}

const typedData = signeData as SigneData;

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
  pool: SigneEntry[],
  weatherTags: string[],
  edition: string,
): SigneEntry | null {
  // Fallback pour 'midi' qui n'existe pas dans les données
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

function buildSigneDuJourUserPrompt(
  type: 'flore' | 'faune',
  nomCommun: string,
  nomCreole: string,
  savoir: string,
  weather: string,
): string {
  return `${type === 'flore' ? 'PLANTE' : 'ANIMAL'} : ${nomCommun} (${nomCreole})
MÉTÉO DU JOUR : ${weather || 'Temps variable'}
SAVOIR : ${savoir}`;
}

async function generatePhrase(
  type: 'flore' | 'faune',
  entry: SigneEntry,
  weather: string,
): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    logError('MISTRAL_API_KEY non trouvé');
    return null;
  }

  logVerbose(`Génération phrase pour ${entry.nom_creole}...`);

  // Délai pour éviter le rate limit
  await delay(3000);

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.8,
      max_tokens: 80,
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        {
          role: 'user',
          content: buildSigneDuJourUserPrompt(
            type,
            entry.nom_commun,
            entry.nom_creole,
            entry.savoir,
            weather,
          ),
        },
      ],
    }),
  });

  logVerbose(`Réponse Mistral: ${res.status}`);

  if (!res.ok) {
    logError(`Mistral échoué: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  return content.trim() || null;
}

async function saveToFile(today: string, data: any): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const dir = path.join(process.cwd(), 'public', 'data', 'signe-du-jour');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${today}.json`);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  logVerbose(`Fichier sauvegardé: ${filePath}`);
  return filePath;
}

export async function generateSigneDuJour() {
  const today = options.date || todayGuadeloupe();
  const filePath = `data/signe-du-jour/${today}.json`;

  logVerbose(`Début de la génération du signe du jour`, {
    date: today,
    forceMode: options.force,
    outputPath: filePath
  });

  // Vérifier si le fichier existe déjà (sauf si --force)
  if (!options.force) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const existingFilePath = path.join(process.cwd(), 'public', filePath);
      await fs.access(existingFilePath);
      console.log(`\n⏭️  Le signe du jour pour le ${today} existe déjà (${filePath})`);
      console.log('   → Pas de régénération nécessaire.\n');
      console.log('   Pour forcer: passez --force ou -f\n');
      return;
    } catch {
      // Fichier n'existe pas, continuer
      logVerbose('Aucun fichier existant trouvé, génération nécessaire');
    }
  } else if (options.verbose) {
    console.log(`\n⚡ Mode force: régénération du signe du jour pour ${today}...\n`);
  }

  console.log(`\n🌿 ========== GÉNÉRATION DU SIGNE DU JOUR POUR LE ${today} ==========`);

  const weather = await fetchWeatherSummary();
  console.log(`🌤️  Météo: ${weather}\n`);
  logVerbose('Météo récupérée avec succès');

  // Alterner flora/faune selon le jour (pair/impair)
  const todayDate = new Date(today);
  const useFlora = todayDate.getDate() % 2 === 0;
  const type: 'flore' | 'faune' = useFlora ? 'flore' : 'faune';
  const pool = useFlora ? typedData.flora : typedData.faune;
  const edition = 'matin'; // Générer pour le matin par défaut

  const weatherTags = weatherToConditions(weather);
  const entry = pickEntry(pool, weatherTags, edition);

  if (!entry) {
    console.log(`❌ Aucun signe disponible pour ${type} avec les conditions ${weatherTags.join(', ')}`);
    return;
  }

  console.log(`🎯 Type: ${type}, Entry: ${entry.nom_creole}`);

  const phrase = await generatePhrase(type, entry, weather);

  const result = {
    date: today,
    type,
    nomCreole: entry.nom_creole,
    nomCommun: entry.nom_commun,
    phrase: phrase ?? `Si tu croises ${entry.nom_creole} aujourd'hui, écoute ce que la terre te dit.`,
    edition,
  };

  await saveToFile(today, result);

  console.log(`\n✨ ========== TERMINÉ ==========`);
  console.log(`   Fichier: ${filePath}\n`);
  logVerbose('Génération complète terminée', result);
}

// Exécuter
generateSigneDuJour()
  .then(() => {
    logVerbose('🎉 Script terminé avec succès');
  })
  .catch((error) => {
    logError('❌ Erreur fatale dans le script', error instanceof Error ? error.message : error);
    console.error(error);
  });
