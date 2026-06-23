// Charger les variables d'environnement depuis .env — DOIT rester le premier
// import : les modules importés ensuite lisent process.env à leur chargement
// (ex. glossaire.ts), avant l'exécution de tout autre code de ce fichier.
import 'dotenv/config';

// Importer les bases de données culturelles pour le mode verbose
import { floreData } from '@/lib/private/flore-data';
import { fauneData } from '@/lib/private/faune-data';
import { lieuxData } from '@/lib/private/lieux-data';
import { kreyolData } from '@/lib/private/kreyol-data';
import { histoireData } from '@/lib/private/histoire-data';

// Importer le système de garde-fous de sécurité
import { applySafetyFiltersToObject } from '@/lib/private/safety-filter';

// Importer le système de glossaire
import { extractGlossaryTerms, updateGlossary, removeRedundantParentheses, loadGlossary, initGlossaryCache, flushGlossaryToSupabase } from '@/lib/private/glossaire';

// Parser les arguments en ligne de commande
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('-v') || args.includes('--verbose'),
  force: args.includes('-f') || args.includes('--force'),
  date: args.find(arg => arg.startsWith('--date='))?.split('=')[1],
  signs: args.find(arg => arg.startsWith('--signs='))?.split('=')[1]?.split(','),
  editions: args.find(arg => arg.startsWith('--editions='))?.split('=')[1]?.split(','),
};

// Filtrer les signes si spécifiés
import { signs as allSigns } from '@/lib/signs-data';
const signs = options.signs 
  ? allSigns.filter(s => options.signs!.includes(s.id)) 
  : allSigns;

if (signs.length === 0 && options.signs) {
  console.error(`❌ Aucun signe valide trouvé pour: ${options.signs.join(', ')}`);
  process.exit(1);
}
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

// Helper pour les logs d'erreur verboses
function logVerboseError(message: string, error?: any) {
  if (options.verbose) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`   [${timestamp}] ⚠️  ${message}`, error || '');
  }
}

if (options.verbose) {
  console.log('🔊 Mode verbose activé');
  console.log(`   Arguments: ${args.join(' ')}`);
}
if (options.force) {
  console.log('⚡ Mode force activé - régénération forcée');
}

import { MARYSE_SYSTEM, buildHoroscopeUserPrompt, buildHoroscopeMetadata, type Edition, type HoroscopeMetadata, type CulturalContext } from '@/lib/private/maryse-prompt';
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

function limitVeve(text: string): string {
  let count = 0;
  return text.replace(/vèvè/gi, (match) => {
    count++;
    return count <= 1 ? match : 'signe sacré';
  });
}

// Limite le totem du signe (nomKreyol + tokens du faune) à 1 occurrence
// dans tout le JSON généré — même logique que limitVeve().
// Le totem est déjà injecté 3× dans le prompt (animal, nomKreyol, spirituel) ;
// sans ce filtre il sature le texte produit.
// Remplacement : "l'ancêtre" — terme générique spirituellement cohérent.
function limitTotem(text: string, sign: { nomKreyol: string; faune?: { nom_creole: string } }): string {
  // Extraire les tokens significatifs (≥4 chars) du nomKreyol et du nom créole du faune
  const raw = [sign.nomKreyol, sign.faune?.nom_creole || ''];
  const keywords = new Set<string>(
    raw.flatMap(s => s.split(/[/\s\-]+/).map(t => t.trim().toLowerCase()))
       .filter(t => t.length >= 5)
  );

  let result = text;
  for (const kw of keywords) {
    const pattern = new RegExp(`\\b${kw}\\b`, 'gi');
    let count = 0;
    result = result.replace(pattern, (match) => {
      count++;
      return count <= 1 ? match : "l'ancêtre";
    });
  }
  return result;
}

// Élimine le doublon "ka ka" produit quand tambour→ka s'applique
// à un texte qui contenait déjà "ka" (ex: "rythme du tambour ka" → "rythme du ka ka")
function fixKaKa(text: string): string {
  return text.replace(/\bka\s+ka\b/gi, 'ka');
}

// Marqueurs temporels incohérents avec l'édition (ex. "ce matin" dans l'édition du soir).
// Log-only : on ne réécrit pas silencieusement, on signale pour audit qualité.
const FORBIDDEN_TIME_MARKERS: Record<string, RegExp[]> = {
  nuit:  [/\bce matin\b/gi, /\bau lever\b/gi, /\bà l'aube\b/gi, /\bce midi\b/gi, /\bcet après-midi\b/gi, /\bce soir\b/gi],
  matin: [/\bce midi\b/gi, /\bcet après-midi\b/gi, /\bce soir\b/gi, /\bcette nuit\b/gi, /\bavant de dormir\b/gi],
  midi:  [/\bce matin\b/gi, /\bau lever\b/gi, /\bà l'aube\b/gi, /\bce soir\b/gi, /\bcette nuit\b/gi, /\bavant de dormir\b/gi],
  soir:  [/\bce matin\b/gi, /\bau lever\b/gi, /\bà l'aube\b/gi, /\bce midi\b/gi, /\bcet après-midi\b/gi],
};

function checkTemporalCoherence(text: string, edition: string, signId: string): void {
  const patterns = FORBIDDEN_TIME_MARKERS[edition];
  if (!patterns) return;
  const hits = patterns
    .map(re => (text.match(re) || []))
    .flat();
  if (hits.length > 0) {
    console.warn(
      `   ⏰ Incohérence temporelle ${signId} (${edition}) : ${[...new Set(hits.map(h => h.toLowerCase()))].join(', ')} — à surveiller dans le rapport qualité.`
    );
  }
}

// Remplace "lajan circule/coule comme la sève de/du/dans [plante]"
// par une métaphore neutre mais ancrée dans le quotidien créole.
// La prohibition prompt seule ne suffit pas — le modèle ignore la règle.
function removeSeve(jsonStr: string): string {
  // Capture la phrase entière jusqu'au premier point pour éviter les artefacts de concat.
  return jsonStr.replace(
    /lajan\s+(circule|coule)[^"]*?comme la sève[^".]*\./gi,
    "Lajan se déplace avec discernement aujourd'hui."
  );
}

function restoreApostrophes(text: string): string {
  return text
    .replace(/\baujourd hui\b/gi, "aujourd'hui")
    .replace(/\bpresqu île\b/gi, "presqu'île")
    // l' avant voyelle ou h (l arbre → l'arbre, l eau → l'eau)
    .replace(/\bl ([aeiouhàâéèêëîïôùûüœæ])/gi, (_, v) => `l'${v}`)
    // d' avant majuscule — noms propres (d Ogoun → d'Ogoun)
    .replace(/\bd ([A-ZÁÀÂÉÈÊËÎÏÔÙÛÜ])/g, (_, v) => `d'${v}`)
    // j' avant voyelle (j ai → j'ai)
    .replace(/\bj ([aeiouyàâéèêëîïôùûü])/gi, (_, v) => `j'${v}`)
    // c'est, s'il, n'est
    .replace(/\bc (est\b|était)/gi, (_, v) => `c'${v}`)
    .replace(/\bs (il\b|ils\b|elle\b|elles\b|en\b|y\b)/gi, (_, v) => `s'${v}`)
    .replace(/\bn (est\b|a\b|ai\b|ont\b)/gi, (_, v) => `n'${v}`);
}

async function fetchRawHoroscope(signEn: string): Promise<string> {
  logVerbose(`Appel FreeHoroscopeAPI pour ${signEn}...`);
  const startTime = Date.now();
  
  const res = await fetch(
    `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${signEn}`,
    { headers: { 'User-Agent': 'HoroscopeKarukera/1.0' } }
  );
  
  logVerbose(`Réponse FreeHoroscopeAPI: ${res.status} ${res.statusText} (${Date.now() - startTime}ms)`);
  
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  
  logVerbose('Données brutes reçues', {
    hasHoroscope: !!data.horoscope,
    hasDataHoroscope: !!data?.data?.horoscope,
    hasDescription: !!data.description,
    responseSize: JSON.stringify(data).length
  });
  
  const result = data.horoscope || data?.data?.horoscope || data.description || '';
  logVerbose(`Horoscope brut extrait: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
  return result;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fonction utilitaire pour retry avec exponentiel backoff
async function retry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      logVerboseError(`⚠️  Tentative ${attempt}/${maxRetries} échouée pour ${operationName}: ${lastError.message}. Retry dans ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  
  throw new Error(`❌ Échec après ${maxRetries} tentatives pour ${operationName}: ${lastError?.message || 'Erreur inconnue'}`);
}

// Wrapper pour fetch avec retry automatique
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  operationName: string = 'fetch'
): Promise<Response> {
  return retry(
    async () => {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res;
    },
    maxRetries,
    2000, // base delay 2s
    operationName
  );
}

async function generateWithMistral(
  signId: string,
  rawText: string,
  weather: string,
  edition: Edition
): Promise<string | null> {
  logVerbose(`Démarrage délai 3s avant appel Mistral pour ${signId}...`);
  // Délai pour éviter le rate limit Mistral (réduit de 10s à 3s)
  await delay(3000);
  logVerbose(`Délai terminé, appel Mistral imminent`);

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.log('❌ MISTRAL_API_KEY non trouvé dans .env');
    logVerboseError('MISTRAL_API_KEY manquant dans les variables d\'environnement');
    return null;
  }

  const sign = signs.find((s) => s.id === signId);
  if (!sign) {
    logVerboseError(`Signe non trouvé: ${signId}`);
    return null;
  }

  logVerbose('Récupération du contexte culturel...');
  const medicinal = getMedicinalPlant(signId, todayGuadeloupe());
  const pratique = getResistancePratique(signId, todayGuadeloupe());
  const objet = getResistanceObjet(signId, todayGuadeloupe());
  const faune = getSignFaune(signId, todayGuadeloupe());
  const flore = getSignFlore(signId, todayGuadeloupe());
  const lieu = getSignLieu(signId, todayGuadeloupe());
  const historicalResonance = getHistoricalResonance(todayGuadeloupe(), signId);

  // Trouver les entrées correspondantes dans les bases de données
  const fauneNom = sign.faune?.nom_creole || sign.nomKreyol || '';
  const floreNom = sign.flore?.nom_creole || sign.plante || '';
  const lieuNom = sign.lieu || '';

  // CORRECTION: Correspondance plus flexible (contient au lieu de égal)
  const fauneEntry = fauneData.find(f => 
    f.nomCreole.toLowerCase().includes(fauneNom.toLowerCase()) || 
    f.nomFrancais.toLowerCase().includes(fauneNom.toLowerCase()) ||
    fauneNom.toLowerCase().includes(f.nomCreole.toLowerCase()) ||
    fauneNom.toLowerCase().includes(f.nomFrancais.toLowerCase())
  );
  const floreEntry = floreData.find(f => 
    f.nomCreole.toLowerCase().includes(floreNom.toLowerCase()) || 
    f.nomFrancais.toLowerCase().includes(floreNom.toLowerCase()) ||
    floreNom.toLowerCase().includes(f.nomCreole.toLowerCase()) ||
    floreNom.toLowerCase().includes(f.nomFrancais.toLowerCase())
  );
  const lieuEntry = lieuxData.find(l => 
    l.nom.toLowerCase().includes(lieuNom.toLowerCase()) ||
    lieuNom.toLowerCase().includes(l.nom.toLowerCase())
  );
  
  // CORRECTION: Filtre KREYOL plus intelligent
  // Les familles dans kreyolData sont "animaux-symboles de résistance", etc.
  // On filtre par :
  // 1. nomCreole qui correspond à animal/flore du signe
  // 2. tags qui contiennent des mots-clés
  const kreyolByElement = kreyolData.filter(k => 
    // Correspondance avec l'animal du signe
    (k.nomCreole.toLowerCase() === sign.animal?.toLowerCase()) ||
    (k.nomCreole.toLowerCase() === sign.nomKreyol?.toLowerCase()) ||
    // Correspondance avec la plante du signe
    (k.nomCreole.toLowerCase() === sign.plante?.toLowerCase()) ||
    // Correspondance avec le lieu du signe
    (k.nomCreole.toLowerCase() === sign.lieu?.toLowerCase()) ||
    // Correspondance par tags (plus large)
    (k.tags && k.tags.some(tag => 
      tag.includes(sign.element.toLowerCase()) ||
      tag.includes(sign.animal?.toLowerCase() || '') ||
      tag.includes(sign.plante?.toLowerCase() || '')
    ))
  );
  
  // Logs détaillés pour chaque source culturelle
  logVerbose('===== DÉTAILS CULTURELS DEPUIS LES BASES DE DONNÉES =====');

  logVerbose('📚 FAUNE-DATA (source brute)', fauneEntry || 'Aucune entrée trouvée');
  logVerbose('📚 FLORE-DATA (source brute)', floreEntry ? {
    nomCreole: floreEntry.nomCreole,
    nomFrancais: floreEntry.nomFrancais,
    usage: floreEntry.usage,
    dimensionCulturelle: floreEntry.dimensionCulturelle
  } : 'Aucune entrée trouvée');

  logVerbose('📚 LIEUX-DATA (source brute)', lieuEntry ? {
    nom: lieuEntry.nom,
    localisation: lieuEntry.localisation,
    dimensionCulturelle: lieuEntry.dimensionCulturelle
  } : 'Aucune entrée trouvée');

  logVerbose('📚 KREYOL-DATA (filtré par élément/spirituel)', {
    count: kreyolByElement.length,
    elements: kreyolByElement.map(k => ({ nomCreole: k.nomCreole, type: k.typeResistance })),
    totalKreyol: kreyolData.length
  });

  logVerbose('📚 HISTOIRE-DATA (sélection hash sign+date)', {
    selected: historicalResonance?.substring(0, 120) || 'Aucune',
    totalHistoire: histoireData.length
  });
  
  logVerbose('===== DÉTAILS CULTURELS PROCESSÉS =====');
  
  // CORRECTION: faune/flore/lieu viennent de getSignFaune/getSignFlore/getSignLieu
  // qui retournent CulturalEntry (nomCreole, nomFr, culture) et non FauneData/FloraData
  logVerbose('🌿 FAUNE (animaux - depuis getSignFaune)', {
    nomCreole: faune?.nomCreole || '',
    nomFr: faune?.nomFr || '',
    culture: faune?.culture?.substring(0, 150) || ''
  });
  
  logVerbose('🌺 FLORE (plantes - depuis getSignFlore)', {
    nomCreole: flore?.nomCreole || '',
    nomFr: flore?.nomFr || '',
    culture: flore?.culture?.substring(0, 150) || ''
  });
  
  logVerbose('🏞️  LIEUX (sites sacrés - depuis getSignLieu)', {
    nomCreole: lieu?.nomCreole || '',
    nomFr: lieu?.nomFr || '',
    culture: lieu?.culture?.substring(0, 150) || ''
  });
  
  logVerbose('🎭 OBJETS KREYOL (symboles de résistance - depuis getResistanceObjet)', {
    nomCreole: objet?.nomCreole || '',
    nomFr: objet?.nomFr || '',
    dimension: objet?.dimension?.substring(0, 150) || ''
  });
  
  logVerbose('📜 HISTOIRE (depuis getHistoricalResonance)', {
    historique: historicalResonance || 'Aucune résonance historique trouvée'
  });
  
  logVerbose('💊 PLANTES MÉDICINALES (depuis getMedicinalPlant)', {
    nomCreole: medicinal?.nomCreole || '',
    nomFr: medicinal?.nomFr || '',
    usage: medicinal?.usage?.substring(0, 150) || ''
  });
  
  logVerbose('⚔️  PRATIQUES DE RÉSISTANCE (depuis getResistancePratique)', {
    nomCreole: pratique?.nomCreole || '',
    nomFr: pratique?.nomFr || '',
    dimension: pratique?.dimension?.substring(0, 150) || ''
  });
  
  logVerbose('===== FIN DÉTAILS CULTURELS =====');
  
  // ==========================================
  // CONTEXTE VAUDOU - Logs explicites
  // ==========================================
  const { getVaudouContextForSign } = await import('@/lib/private/vaudou-mappings');
  const vaudouContext = getVaudouContextForSign(signId);
  
  logVerbose('✨ CONTEXTE VAUDOU (pour enrichir le prompt Mistral)', {
    signe: signId,
    loa: vaudouContext.loa,
    famille: vaudouContext.famille,
    couleurs: vaudouContext.elements.couleurs,
    plante: vaudouContext.elements.plante,
    animal: vaudouContext.elements.animal,
    objet: vaudouContext.elements.objet,
    lieu: vaudouContext.elements.lieu,
    rituel: vaudouContext.elements.rituel,
    emoji: vaudouContext.elements.emoji,
    energie: vaudouContext.elements.energie
  });
  
  // Logs pour les loas pertinents
  const { SIGN_TO_LOA } = await import('@/lib/private/vaudou-mappings');
  const loasPertinents = [SIGN_TO_LOA[signId], ...Object.values(SIGN_TO_LOA).filter(l => l !== SIGN_TO_LOA[signId])].slice(0, 3);
  logVerbose('📚 LOAS PERTINENTS (pour le prompt)', loasPertinents);

  const culturalCtx: CulturalContext = {
    medicinal,
    pratique,
    objet,
    faune:    faune?.nomCreole ? faune : undefined,
    flore:    flore?.nomCreole ? flore : undefined,
    lieu:     lieu?.nomCreole  ? lieu  : undefined,
    historicalResonance,
  };

  const userPrompt = buildHoroscopeUserPrompt(sign, rawText, weather, edition, undefined, undefined, culturalCtx);
  logVerbose(`Prompt utilisateur généré (${userPrompt.length} caractères)`);
  logVerbose(`Modèle: mistral-large-latest, Temp: 0.75, Max tokens: 900`);

  // Wrapper pour Mistral API avec retry complet (HTTP + parsing JSON)
  async function callMistralWithFullRetry(): Promise<string | null> {
    const maxAttempts = 3;
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const startTime = Date.now();
        const res = await fetchWithRetry(
          MISTRAL_URL,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'mistral-large-latest',
              temperature: 0.75,
              max_tokens: 900,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: MARYSE_SYSTEM },
                { role: 'user', content: userPrompt },
              ],
            }),
          },
          3,
          `Mistral-large pour ${signId} ${edition} (tentative ${attempt}/${maxAttempts})`
        );

        logVerbose(`Réponse Mistral: ${res.status} ${res.statusText} (${Date.now() - startTime}ms)`);

        const data = await res.json();
        logVerbose('Réponse Mistral parsée', {
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length,
          finishReason: data.choices?.[0]?.finish_reason,
          usage: data.usage
        });

        const content: string = data.choices?.[0]?.message?.content ?? '';
        logVerbose(`Contenu brut reçu: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`);
        
        // Nettoyage minimal du JSON
        const cleaned = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        return cleaned;
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        logVerboseError(`⚠️  Échec fetch Mistral (tentative ${attempt}/${maxAttempts}): ${lastError.message}`);
        
        if (attempt < maxAttempts) {
          const retryDelay = 5000 * attempt;
          logVerbose(`Retry dans ${retryDelay}ms...`);
          await delay(retryDelay);
        }
      }
    }
    
    // Tous les retries ont échoué
    console.log(`❌ Échec définitif pour ${signId} (${edition}) après ${maxAttempts} tentatives`);
    logVerboseError(`Dernière erreur: ${lastError?.message || 'Erreur inconnue'}`);
    return null;
  }

  const parsed = await callMistralWithFullRetry();
  if (!parsed) {
    return null;
  }
  
  return parsed;
}

async function generateTeaser(
  signName: string,
  rawContent: string
): Promise<string> {
  logVerbose(`Démarrage délai 2s avant appel Mistral small pour teaser ${signName}...`);
  // Délai pour éviter le rate limit Mistral (réduit de 5s à 2s)
  await delay(2000);
  logVerbose(`Délai terminé, appel Mistral small imminent`);

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    logVerboseError('MISTRAL_API_KEY manquant pour teaser');
    return '';
  }

  const fullText = rawContent;

  logVerbose(`Texte complet pour teaser: ${fullText.substring(0, 150)}${fullText.length > 150 ? '...' : ''}`);
  logVerbose(`Modèle: mistral-small-latest, Temp: 0.8, Max tokens: 120`);

  const startTime = Date.now();
  const res = await fetchWithRetry(
    MISTRAL_URL,
    {
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
              `Tu es Maryse CondAI. Rédige une accroche de 2 phrases maximum à partir de l'horoscope du ${signName}, en voix directe et sensuelle, qui donne envie de lire la suite sans tout révéler. Ancre-toi dans les symboles propres à ce signe — pas dans des images génériques (mer, vent, danse, racines). Pas de titre, pas de ponctuation finale superflue.`,
          },
          { role: 'user', content: fullText },
        ],
      }),
    },
    3,
    `Mistral-small teaser pour ${signName}`
  );

  logVerbose(`Réponse Mistral small: ${res.status} ${res.statusText} (${Date.now() - startTime}ms)`);

  // fetchWithRetry garantit que res.ok est true

  const data = await res.json();
  let teaser = data.choices?.[0]?.message?.content?.trim() ?? '';
  
  // ==========================================
  // 📚 EXTRACTION DES TERMES POUR LE GLOSSAIRE (TEASER)
  // ==========================================
  if (teaser) {
    // Nettoyage post-génération du teaser
    // Si le corps contient déjà vèvè, on le supprime du teaser pour éviter le doublon
    const bodyHasVeve = /vèvè/i.test(rawContent);
    teaser = restoreApostrophes(fixKaKa(teaser
      .replace(/\btambours?\b/gi, 'ka')
      .replace(/—/g, ',')
      .replace(/\b[Ll][ae]s?\s+[Ll]ajan\b/g, 'Lajan')
      .replace(bodyHasVeve ? /vèvè/gi : /(?!)/g, 'signe sacré')));

    const teaserTerms = extractGlossaryTerms(teaser);
    if (teaserTerms.length > 0) {
      const dateToday = new Date().toISOString().split('T')[0];
      const sourceFile = `horoscopes/${todayGuadeloupe()}.json`;
      updateGlossary(teaserTerms, dateToday, sourceFile);
    }
    teaser = removeRedundantParentheses(teaser);
  }
  
  logVerbose(`Teaser généré: "${teaser}"`)
  return teaser;
}

async function fetchWeather(): Promise<string> {
  logVerbose('Appel Open-Meteo API pour la météo de la Guadeloupe...');
  const startTime = Date.now();
  
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max' +
        '&timezone=America%2FGuadeloupe&forecast_days=1'
    );
    
    logVerbose(`Réponse Open-Meteo: ${res.status} (${Date.now() - startTime}ms)`);
    
    if (!res.ok) {
      logVerboseError('Échec récupération météo', { status: res.status });
      return '';
    }
    
    const data = await res.json();
    logVerbose('Données météo parsées', {
      hasDaily: !!data.daily,
      timeLength: data.daily?.time?.length,
      temperatureMax: data.daily?.temperature_2m_max?.[0],
      temperatureMin: data.daily?.temperature_2m_min?.[0],
      precipitation: data.daily?.precipitation_sum?.[0],
      windspeed: data.daily?.windspeed_10m_max?.[0]
    });
    
    const d = data.daily;
    if (!d?.time?.length) {
      logVerboseError('Pas de données quotidiennes disponibles');
      return '';
    }
    
    const tmax = Math.round(d.temperature_2m_max[0]);
    const tmin = Math.round(d.temperature_2m_min[0]);
    const rain = d.precipitation_sum[0] as number;
    const wind = Math.round(d.windspeed_10m_max[0]);

    const rainLabel =
      rain === 0  ? 'pas de pluie'
      : rain < 5  ? 'légère pluie'
      : rain < 20 ? 'pluie modérée'
      :             'fortes pluies';

    // "alizé" = terme local guadeloupéen — évite que le modèle réutilise
    // "vent" comme image générique dans les horoscopes
    const alizeLabel =
      wind < 20 ? `alizé léger (${wind} km/h)`
      : wind < 40 ? `alizé modéré (${wind} km/h)`
      :             `grains forts (${wind} km/h)`;

    // Phase lunaire calculée localement — zéro coût API, varie chaque jour,
    // donne au modèle une image naturelle quotidienne alternative au "vent"
    const known = new Date('2000-01-06').getTime();
    const days  = (Date.now() - known) / 86_400_000;
    const cycle = ((days % 29.53) + 29.53) % 29.53;
    const moonIdx = Math.floor((cycle / 29.53) * 8) % 8;
    const moonLabel = [
      'Nouvelle lune', 'Croissant naissant', 'Premier quartier', 'Croissant gibbeuse',
      'Pleine lune',   'Gibbeuse décroissante', 'Dernier quartier', 'Croissant décroissant',
    ][moonIdx];

    const result = `${tmin}–${tmax}°C, ${rainLabel}, ${alizeLabel}, ${moonLabel}`;
    logVerbose(`Météo formatée: ${result}`);
    return result;
  } catch (e) {
    logVerboseError('Erreur lors de la récupération météo', e instanceof Error ? e.message : e);
    return '';
  }
}

async function saveToSupabase(data: Record<string, any>): Promise<void> {
  const { upsertRest } = await import('@/lib/supabase-rest');
  const rows = Object.entries(data).map(([key, v]) => {
    const [date, sign_id, edition] = key.split('|');
    return {
      date, sign_id, edition,
      ouverture: v.ouverture, amour: v.amour, travail: v.travail,
      argent: v.argent, amitie: v.amitie, prediction: v.prediction,
      conseil: v.conseil, teaser: v.teaser,
      sign_fr: v.signFr, weather: v.weather, source: v.source,
      raw_text: v.raw_text ?? null,
      // Métadonnées de construction
      element: v.element ?? null,
      animal: v.animal ?? null,
      plante: v.plante ?? null,
      arbre: v.arbre ?? null,
      lieu: v.lieu ?? null,
      planet: v.planet ?? null,
      loa: v.loa ?? null,
      famille_vaudou: v.famille_vaudou ?? null,
      energie_vaudou: v.energie_vaudou ?? null,
      couleurs_sacrees: v.couleurs_sacrees ?? null,
      edition_energie: v.edition_energie ?? null,
      heure_locale: v.heure_locale ?? null,
      is_ritual_date: v.is_ritual_date ?? false,
      date_rituelle: v.date_rituelle ?? null,
      faune_enrichies: v.faune_enrichies ?? null,
      flore_enrichies: v.flore_enrichies ?? null,
      lieux_enrichis: v.lieux_enrichis ?? null,
      kreyol_enrichis: v.kreyol_enrichis ?? null,
      histoire_enrichies: v.histoire_enrichies ?? null,
      loas_pertinents: v.loas_pertinents ?? null,
      animaux_sacres: v.animaux_sacres ?? null,
      plantes_sacrees: v.plantes_sacrees ?? null,
      contexte_dynamique: v.contexte_dynamique ?? null,
    };
  });
  await upsertRest('horoscopes', rows, 'date,sign_id,edition');
  console.log(`✅ [SUPABASE] ${rows.length} horoscope(s) upsertés`);
}

async function saveToLocalFile(today: string, data: Record<string, any>): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Sauvegarder dans public/ pour que les fichiers soient servis comme assets statiques
  const dir = path.join(process.cwd(), 'public', 'data', 'horoscopes');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${today}.json`);
  
  const entryCount = Object.keys(data).length;
  const fileSize = JSON.stringify(data, null, 2).length;
  
  logVerbose(`Sauvegarde dans ${filePath}`, {
    entries: entryCount,
    estimatedSize: `${(fileSize / 1024).toFixed(2)} KB`
  });
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  logVerbose(`Fichier sauvegardé avec succès: ${filePath}`);
  return filePath;
}

export async function generateAllHoroscopes() {
  await initGlossaryCache();
  const today = options.date || todayGuadeloupe();
  const filePath = `data/horoscopes/${today}.json`;
  
  logVerbose(`Début de la génération`, {
    date: today,
    forceMode: options.force,
    outputPath: filePath
  });
  
  // Vérifier si les horoscopes du jour existent déjà (sauf si --force)
  if (!options.force) {
    try {
      const fs = await import('fs/promises');
      await fs.access(filePath);
      console.log(`\n⏭️  Les horoscopes pour le ${today} existent déjà (${filePath})`);
      console.log('   → Pas de régénération nécessaire.\n');
      console.log('   Pour forcer: passez --force ou -f\n');
      logVerbose('Fichier existant détecté, génération annulée');
      return;
    } catch {
      // Fichier n'existe pas, continuer la génération
      logVerbose('Aucun fichier existant trouvé, génération nécessaire');
    }
  } else if (options.verbose) {
    console.log(`\n⚡ Mode force: régénération des horoscopes pour ${today}...\n`);
  }

  console.log(`\n📅 ========== GÉNÉRATION DES HOROSCOPES POUR LE ${today} ==========`);
  logVerbose(`Configuration: ${signs.length} signes × ${4} éditions = ${signs.length * 4} horoscopes à générer`);

  const weather = await fetchWeather();
  console.log(`🌤️  Météo: ${weather}\n`);
  logVerbose('Météo récupérée avec succès');

  const allEditions: Edition[] = ['nuit', 'matin', 'midi', 'soir'];
  const editions: Edition[] = options.editions
    ? allEditions.filter(e => options.editions!.includes(e))
    : allEditions;
  const total = signs.length * editions.length;
  let generated = 0;
  let skipped = 0;

  const results: Record<string, any> = {};
  logVerbose(`Initialisation: ${total} horoscopes à traiter`);

  try {
    logVerbose('Initialisation du store Netlify Blobs...');
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('horoscopes');
    logVerbose('Store Netlify Blobs connecté avec succès');

    for (const sign of signs) {
      for (const edition of editions) {
        const blobKey = `${today}|${sign.id}|${edition}`;
        logVerbose(`Traitement: ${sign.id} (${edition}) [${generated + skipped + 1}/${total}]`);

        // Vérifier le cache
        const cached = await store.get(blobKey, { type: 'json' });
        if (cached) {
          console.log(`✅ [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - Déjà en cache Netlify`);
          logVerbose(`Cache hit pour ${blobKey}`);
          skipped++;
          continue;
        }
        logVerbose(`Cache miss pour ${blobKey}, génération nécessaire`);

        console.log(`🔄 [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - Récupération horoscope brut...`);

        // Récupérer l'horoscope brut
        const rawText = await fetchRawHoroscope(SIGN_EN[sign.id]);
        if (!rawText) {
          console.log(`❌ [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Pas de texte brut\n`);
          logVerboseError(`Aucun texte brut reçu pour ${sign.id}`);
          continue;
        }
        console.log(`   ✓ Horoscope brut reçu (${rawText.length} caractères)`);
        logVerbose(`Texte brut: ${rawText.substring(0, 100)}...`);

        // Générer avec Mistral
        console.log(`   🤖 Appel Mistral (large) pour ${sign.id}...`);
        logVerbose(`Appel Mistral large pour ${sign.id} ${edition}`);
        const structured = await generateWithMistral(sign.id, rawText, weather, edition);
        
        if (!structured) {
          console.log(`❌ [${generated + skipped + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Pas de réponse\n`);
          continue;
        }
        console.log(`   ✓ Mistral large: OK`);

        // ==========================================
        // 📚 EXTRACTION DES TERMES POUR LE GLOSSAIRE
        // ==========================================
        const terms = extractGlossaryTerms(structured);
        if (terms.length > 0) {
          const dateToday = new Date().toISOString().split('T')[0];
          const sourceFile = `horoscopes/${todayGuadeloupe()}.json`;
          updateGlossary(terms, dateToday, sourceFile);
        }
        // Nettoyage post-génération
        const cleanedContent = removeRedundantParentheses(
          limitTotem(limitVeve(restoreApostrophes(fixKaKa(removeSeve(structured)
            .replace(/\btambours?\b/gi, 'ka'))
            .replace(/—/g, ',')
            .replace(/\b[Ll][ae]s?\s+[Ll]ajan\b/g, 'Lajan'))), sign)
        );

        // Audit log-only : signale les marqueurs temporels incohérents avec l'édition
        checkTemporalCoherence(cleanedContent, edition, sign.id);

        // Générer le teaser
        console.log(`   🤖 Appel Mistral (small) pour teaser...`);
        logVerbose(`Génération teaser pour ${sign.name}`);
        const teaser = await generateTeaser(sign.name, cleanedContent);
        console.log(`   ✓ Teaser généré: "${teaser.substring(0, 60)}..."`);
        logVerbose(`Teaser: "${teaser}"`);

        // Parser le JSON pour extraire les champs pour le frontend
        let parsed = {};
        try {
          parsed = JSON.parse(cleanedContent);
        } catch (e) {
          logVerboseError(`Erreur parsing JSON final pour ${sign.id}`, e);
        }

        // Sauvegarder
        const metadata = buildHoroscopeMetadata(sign, edition, weather, today);
        const response = {
          ...parsed,
          teaser: teaser || undefined,
          signFr: sign.name,
          weather,
          edition,
          source: 'mistral-raw',
          raw_text: rawText,
          ...metadata,
        };

        results[blobKey] = response;
        await store.set(blobKey, JSON.stringify(response));
        logVerbose(`Sauvegarde dans Netlify Blobs: ${blobKey}`);

        // Sauvegarder au fil de l'eau dans le fichier local + Supabase
        await saveToLocalFile(today, results);
        await saveToSupabase({ [blobKey]: response });

        console.log(`✅ [${++generated}/${total}] ${sign.id} (${edition}) - SAUVEGARDÉ\n`);
        console.log(`   🌟 Teaser: "${teaser}"\n`);
        logVerbose(`Horoscope complet sauvegardé pour ${sign.id} ${edition}`);
        console.log('---');
      }
    }

    console.log(`\n✨ ========== TERMINÉ (Netlify Blobs) ==========`);
    console.log(`   Générés: ${generated}/${total}`);
    console.log(`   Déjà en cache: ${skipped}/${total}`);
    console.log(`   Fichier local: ${filePath}\n`);
    logVerbose('Génération complète terminée avec Netlify Blobs', {
      generated,
      skipped,
      total,
      successRate: `${((generated / total) * 100).toFixed(1)}%`
    });
    
    // VALIDATION: Vérifier que tous les horoscopes ont été générés
    if (generated + skipped < total) {
      throw new Error(`❌ VALIDATION ÉCHOUÉE: Seulement ${generated + skipped}/${total} horoscopes générés`);
    }
  } catch (error) {

    logVerbose('Netlify Blobs non disponible, bascule en mode local', {
      error: error instanceof Error ? error.message : String(error)
    });
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
      logVerbose(`Chargement de ${generated} horoscopes existants depuis le fichier local`);
    } catch {
      // Pas de fichier existant, on commence depuis 0
      generated = 0;
      logVerbose('Aucun fichier local existant trouvé, démarrage à zéro');
    }

    logVerbose(`Début de la génération en mode local, ${Object.keys(results).length} déjà chargés`);

    for (const sign of signs) {
      for (const edition of editions) {
        const blobKey = `${today}|${sign.id}|${edition}`;
        logVerbose(`Traitement local: ${sign.id} (${edition}) [${generated + 1}/${total}]`);

        // Sauter si déjà dans results
        if (results[blobKey]) {
          console.log(`✅ [${generated + 1}/${total}] ${sign.id} (${edition}) - Déjà présent, sauté\n`);
          logVerbose(`Déjà présent dans results: ${blobKey}`);
          continue;
        }

        console.log(`🔄 [${generated + 1}/${total}] ${sign.id} (${edition})...`);

        const rawText = await fetchRawHoroscope(SIGN_EN[sign.id]);
        if (!rawText) {
          console.log(`❌ [${generated + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Pas de texte brut\n`);
          logVerboseError(`Aucun texte brut pour ${sign.id} en mode local`);
          continue;
        }
        console.log(`   ✓ Horoscope brut reçu`);
        logVerbose(`Texte brut reçu: ${rawText.substring(0, 80)}...`);

        const structured = await generateWithMistral(sign.id, rawText, weather, edition);
        
        if (!structured) {
          console.log(`❌ [${generated + 1}/${total}] ${sign.id} (${edition}) - ÉCHEC: Pas de réponse\n`);
          continue;
        }
        console.log(`   ✓ Mistral: OK`);

        // ==========================================
        // 📚 SYSTÈME DE GLOSSAIRE
        // ==========================================
        const terms = extractGlossaryTerms(structured);
        if (terms.length > 0) {
          const dateToday = new Date().toISOString().split('T')[0];
          const sourceFile = `horoscopes/${today}.json`;
          updateGlossary(terms, dateToday, sourceFile);
        }
        // Nettoyage post-génération
        const cleanedContent = removeRedundantParentheses(
          limitTotem(limitVeve(restoreApostrophes(fixKaKa(removeSeve(structured)
            .replace(/\btambours?\b/gi, 'ka'))
            .replace(/—/g, ',')
            .replace(/\b[Ll][ae]s?\s+[Ll]ajan\b/g, 'Lajan'))), sign)
        );

        const teaser = await generateTeaser(sign.name, cleanedContent);
        console.log(`   ✓ Teaser: OK`);
        logVerbose(`Teaser généré en mode local: "${teaser}"`);

        // Parser le JSON pour extraire les champs pour le frontend
        let parsed = {};
        try {
          parsed = JSON.parse(cleanedContent);
        } catch (e) {
          logVerboseError(`Erreur parsing JSON final local pour ${sign.id}`, e);
        }

        const metadata = buildHoroscopeMetadata(sign, edition, weather, today);
        const response = {
          ...parsed,
          teaser: teaser || undefined,
          signFr: sign.name,
          weather,
          edition,
          source: 'mistral-raw',
          raw_text: rawText,
          ...metadata,
        };
        results[blobKey] = response;
        await saveToLocalFile(today, results);
        await saveToSupabase({ [blobKey]: response });
        logVerbose(`Sauvegarde locale + Supabase: ${blobKey}`);

        console.log(`✅ [${++generated}/${total}] ${sign.id} (${edition}) - SAUVEGARDÉ`);
        console.log(`   🌟 Teaser: "${teaser}"\n`);
        logVerbose(`Horoscope complet sauvegardé en mode local pour ${sign.id} ${edition}`);
        console.log('---');
      }
    }

    console.log(`\n✨ ========== TERMINÉ (Mode Local) ==========`);
    console.log(`   Générés: ${Object.keys(results).length}/${total}`);
    console.log(`   Fichier: ${filePath}\n`);
    logVerbose('Génération complète terminée en mode local', {
      totalGenerated: Object.keys(results).length,
      totalExpected: total,
      successRate: `${((Object.keys(results).length / total) * 100).toFixed(1)}%`
    });
    
    // VALIDATION: Vérifier que tous les horoscopes ont été générés
    if (Object.keys(results).length < total) {
      throw new Error(`❌ VALIDATION ÉCHOUÉE: Seulement ${Object.keys(results).length}/${total} horoscopes générés`);
    }
  }
  await flushGlossaryToSupabase();
}

// Exécuter
generateAllHoroscopes()
  .then(() => {
    logVerbose('🎉 Script terminé avec succès');
  })
  .catch((error) => {
    logVerboseError('❌ Erreur fatale dans le script', error instanceof Error ? error.message : error);
    console.error(error);
  });
