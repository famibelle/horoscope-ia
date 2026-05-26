import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis .env

// Importer les bases de données culturelles
import { floreData } from '@/lib/private/flore-data';
import { fauneData } from '@/lib/private/faune-data';
import { todayGuadeloupe } from '@/lib/edition';
import { MARYSE_SYSTEM } from '@/lib/private/maryse-prompt';
import signeData from '@/lib/private/signe-du-jour-data.json';
// Importer les données vaudou
import { plantesData, animauxData } from '@/lib/private/vaudou-data';
import { SIGN_TO_VAUDOU_CONTEXT } from '@/lib/private/vaudou-mappings';

// Importer le système de glossaire
import {
  extractGlossaryTerms,
  updateGlossary,
  removeRedundantParentheses,
  loadGlossary
} from '@/lib/private/glossaire';

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

// Fonction pour choisir une entrée vaudou si possible
function pickVaudouEntry(
  type: 'flore' | 'faune',
  weatherTags: string[],
  edition: string,
  signId: string,
): SigneEntry | null {
  const signVaudou = SIGN_TO_VAUDOU_CONTEXT[signId];
  if (!signVaudou) return null;
  
  // Obtenir les plantes ou animaux sacrés pour ce signe
  const vaudouPlantes = plantesData.filter(p => 
    p.famille.toLowerCase() === signVaudou.famille.toLowerCase()
  );
  const vaudouAnimaux = animauxData.filter(a => 
    a.famille.toLowerCase() === signVaudou.famille.toLowerCase()
  );
  
  const vaudouPool = type === 'flore' ? vaudouPlantes : vaudouAnimaux;
  if (vaudouPool.length === 0) return null;
  
  // Trouver une correspondance dans la pool principale
  const effectiveEdition = edition === 'midi' ? 'matin' : edition;
  
  // Esayer de trouver une entrée qui correspond aux conditions météo
  const matchingVaudou = vaudouPool.filter((v) => {
    const poolKey = type === 'flore' ? 'flora' : 'faune';
    const nomCreoleMatch = (typedData as any)[poolKey].find((e: any) => 
      e.nom_creole.toLowerCase().includes(v.nomCreole.toLowerCase())
    );
    if (!nomCreoleMatch) return false;
    
    const editionOk = nomCreoleMatch.editions.length === 0 || 
      nomCreoleMatch.editions.includes(effectiveEdition);
    const condOk = nomCreoleMatch.conditions.length === 0 ||
      nomCreoleMatch.conditions.some((c: string) => weatherTags.includes(c));
    return editionOk && condOk;
  });
  
  if (matchingVaudou.length > 0) {
    const pickedVaudou = matchingVaudou[Math.floor(Math.random() * matchingVaudou.length)];
    const poolKey = type === 'flore' ? 'flora' : 'faune';
    const nomCreoleMatch = (typedData as any)[poolKey].find((e: any) => 
      e.nom_creole.toLowerCase().includes(pickedVaudou.nomCreole.toLowerCase())
    );
    return nomCreoleMatch || null;
  }
  
  // Sinon, choisir une entrée vaudou aléatoire
  const randomVaudou = vaudouPool[Math.floor(Math.random() * vaudouPool.length)];
  const poolKey = type === 'flore' ? 'flora' : 'faune';
  const nomCreoleMatch = (typedData as any)[poolKey].find((e: any) => 
    e.nom_creole.toLowerCase().includes(randomVaudou.nomCreole.toLowerCase())
  );
  return nomCreoleMatch || null;
}

function buildSigneDuJourUserPrompt(
  type: 'flore' | 'faune',
  nomCommun: string,
  nomCreole: string,
  savoir: string,
  weather: string,
  loa?: string,
  familleVaudou?: string,
): string {
  const vaudouSection = loa && familleVaudou 
    ? `🔮 **CONTEXTE VAUDOU** :
Loa associé : **${loa}** (${familleVaudou})
Intègre une référence subtile au loa ou à son énergie dans ta phrase.`
    : '';
  
  return `${type === 'flore' ? 'PLANTE' : 'ANIMAL'} : ${nomCommun} (${nomCreole})
MÉTÉO DU JOUR : ${weather || 'Temps variable'}
SAVOIR : ${savoir}
${vaudouSection}

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
  entry: SigneEntry,
  weather: string,
  loa?: string,
  familleVaudou?: string,
): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    logError('MISTRAL_API_KEY non trouvé');
    return null;
  }

  logVerbose(`Génération phrase pour ${entry.nom_creole}...`);

  // Délai pour éviter le rate limit (réduit de 3s à 2s)
  await delay(2000);

  const prompt = buildSigneDuJourUserPrompt(
    type,
    entry.nom_commun,
    entry.nom_creole,
    entry.savoir,
    weather,
    loa,
    familleVaudou,
  );
  
  // LOG DU PROMPT ENVOYÉ
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
      max_tokens: 80,
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        {
          role: 'user',
          content: prompt,
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
  
  // Log persistent dans lib/private/logs/
  await logRawData('generate-signe-du-jour', prompt, content);
  
  // LOG ABSOLU : CONTENU BRUT AVANT TOUTE MANIPULATION
  console.error(`!!! DEBUG: RAW MISTRAL RESPONSE START !!!`);
  console.error(content);
  console.error(`!!! DEBUG: RAW MISTRAL RESPONSE END !!!`);
  
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
  
  // D'abord essayer de trouver une entrée vaudou correspondante
  let entry: SigneEntry | null = null;
  for (const sign of Object.keys(SIGN_TO_VAUDOU_CONTEXT)) {
    entry = pickVaudouEntry(type, weatherTags, edition, sign);
    if (entry) {
      logVerbose(`Entrée vaudou trouvée pour signe ${sign}: ${entry.nom_creole}`);
      break;
    }
  }
  
  // Si pas d'entrée vaudou trouvée, utiliser la sélection normale
  if (!entry) {
    entry = pickEntry(pool, weatherTags, edition);
  }

  if (!entry) {
    console.log(`❌ Aucun signe disponible pour ${type} avec les conditions ${weatherTags.join(', ')}`);
    return;
  }

  // Déterminer le contexte vaudou pour cette entrée
  let loa: string | undefined;
  let familleVaudou: string | undefined;
  
  // Essayer de trouver le loa et famille associés
  const vaudouPlante = plantesData.find(p => p.nomCreole.toLowerCase() === entry.nom_creole.toLowerCase());
  const vaudouAnimal = animauxData.find(a => a.nomCreole.toLowerCase() === entry.nom_creole.toLowerCase());
  
  if (vaudouPlante) {
    // Trouver le signe associé à cette famille vaudou
    const matchingSign = Object.entries(SIGN_TO_VAUDOU_CONTEXT).find(([_, ctx]) => 
      ctx.famille.toLowerCase() === vaudouPlante.famille.toLowerCase()
    );
    if (matchingSign) {
      loa = SIGN_TO_VAUDOU_CONTEXT[matchingSign[0]].loa;
      familleVaudou = SIGN_TO_VAUDOU_CONTEXT[matchingSign[0]].famille;
    }
  } else if (vaudouAnimal) {
    const matchingSign = Object.entries(SIGN_TO_VAUDOU_CONTEXT).find(([_, ctx]) => 
      ctx.famille.toLowerCase() === vaudouAnimal.famille.toLowerCase()
    );
    if (matchingSign) {
      loa = SIGN_TO_VAUDOU_CONTEXT[matchingSign[0]].loa;
      familleVaudou = SIGN_TO_VAUDOU_CONTEXT[matchingSign[0]].famille;
    }
  }

  console.log(`🎯 Type: ${type}, Entry: ${entry.nom_creole}, Loa: ${loa || 'Aucun'}, Famille: ${familleVaudou || 'Aucune'}`);

  let phrase = await generatePhrase(type, entry, weather, loa, familleVaudou);
  
  // ==========================================
  // 📚 EXTRACTION DES TERMES POUR LE GLOSSAIRE
  // ==========================================
  if (phrase) {
    logVerbose('📚 Extraction des termes pour le glossaire (signe du jour)...');
    const terms = extractGlossaryTerms(phrase);
    
    if (terms.length > 0) {
      const dateToday = new Date().toISOString().split('T')[0];
      const sourceFile = `signe-du-jour/${today}.json`;
      updateGlossary(terms, dateToday, sourceFile);
    } else {
      logVerbose('ℹ️  Aucun terme entre parenthèses détecté pour le glossaire');
    }
    
    // ==========================================
    // 🗑️  SUPPRESSION DES PARENTHÈSES REDONDANTES
    // ==========================================
    logVerbose('🗑️  Suppression des parenthèses pour les termes connus...');
    phrase = removeRedundantParentheses(phrase);
  }

  const result = {
    date: today,
    type,
    nomCreole: entry.nom_creole,
    nomCommun: entry.nom_commun,
    phrase: phrase ?? `Si tu croises ${entry.nom_creole} aujourd'hui, écoute ce que la terre te dit.`,
    edition,
    loa: loa || undefined,
    familleVaudou: familleVaudou || undefined,
  };

  // Appliquer aussi sur le résultat final (au cas où nomCreole/nomCommun ont des parenthèses)
  if (result.phrase) {
    result.phrase = removeRedundantParentheses(result.phrase);
  }

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
