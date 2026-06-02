import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis .env

import { signs as allSigns } from '@/lib/signs-data';
import { todayGuadeloupe } from '@/lib/edition';
import { MARYSE_SYSTEM } from '@/lib/private/maryse-prompt';
import { applySafetyFiltersToObject } from '@/lib/private/safety-filter';
import {
  getCulturalContext,
  getAmbianceBienetre,
  getAmbianceBeaute,
  getAmbianceEsprit,
  getAmbianceMaison,
  getAmbianceJardinage,
} from '@/lib/cultural-context';
import { computeScores } from '@/lib/scores';
import type { WeatherData } from '@/app/api/weather/route';
import type { Edition } from '@/lib/private/maryse-prompt';
// Import vaudou compatibility
import { getVaudouCompatibility, mergeCompatibilities } from '@/lib/private/vaudou-compatibility';
import { getVaudouContextForSign, SIGN_TO_LOA, SIGN_TO_VAUDOU_CONTEXT } from '@/lib/private/vaudou-mappings';
import { animauxData, rituelsData } from '@/lib/private/vaudou-data';

// Importer le système de garde-fous de sécurité
import { applySafetyFilters, applySafetyFiltersToObject } from '@/lib/private/safety-filter';

// Importer le système de glossaire
import {
  extractGlossaryTerms,
  updateGlossary,
  removeRedundantParentheses,
  loadGlossary,
  initGlossaryCache,
  flushGlossaryToSupabase,
} from '@/lib/private/glossaire';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

// Parser les arguments en ligne de commande
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('-v') || args.includes('--verbose'),
  force: args.includes('-f') || args.includes('--force'),
  date: args.find(arg => arg.startsWith('--date='))?.split('=')[1],
  signs: args.find(arg => arg.startsWith('--signs='))?.split('=')[1]?.split(','),
};

const signs = options.signs
  ? allSigns.filter(s => options.signs!.includes(s.id))
  : allSigns;

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
  if (options.verbose) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`   [${timestamp}] ❌  ${message}`, error || '');
  } else {
    console.log(`❌ ${message}`);
  }
}

function lunarPhaseLabel(): string {
  const known = new Date('2000-01-06').getTime();
  const days = (Date.now() - known) / 86_400_000;
  const cycle = ((days % 29.53) + 29.53) % 29.53;
  const idx = Math.floor((cycle / 29.53) * 8) % 8;
  return [
    'Nouvelle lune', 'Croissant naissant', 'Premier quartier', 'Croissant gibbeuse',
    'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Croissant décroissant',
  ][idx];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWeather(): Promise<string> {
  logVerbose('Appel Open-Meteo API pour la météo de la Guadeloupe...');
  const startTime = Date.now();
  
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=16.17&longitude=-61.58' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode' +
        '&timezone=America%2FGuadeloupe&forecast_days=1'
    );
    
    logVerbose(`Réponse Open-Meteo: ${res.status} (${Date.now() - startTime}ms)`);
    
    if (!res.ok) {
      logError('Échec récupération météo', { status: res.status });
      return '';
    }
    
    const data = await res.json();
    const d = data.daily;
    if (!d?.time?.length) {
      logError('Pas de données quotidiennes disponibles');
      return '';
    }
    
    const tmax = Math.round(d.temperature_2m_max[0]);
    const tmin = Math.round(d.temperature_2m_min[0]);
    const rain = d.precipitation_sum[0] as number;
    const wind = Math.round(d.windspeed_10m_max[0]);
    const code = d.weathercode?.[0] ?? 0;
    
    const rainLabel =
      rain === 0 ? 'pas de pluie'
        : rain < 5 ? 'légère pluie'
        : rain < 20 ? 'pluie modérée'
        : 'fortes pluies';
    const alizeLabel =
      wind < 20 ? `alizé léger (${wind} km/h)`
      : wind < 40 ? `alizé modéré (${wind} km/h)`
      :             `grains forts (${wind} km/h)`;
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
    logError('Erreur lors de la récupération météo', e instanceof Error ? e.message : e);
    return '';
  }
}

async function saveToSupabase(data: Record<string, any>): Promise<void> {
  const { upsertRest } = await import('@/lib/supabase-rest');
  const rows = Object.entries(data).map(([key, v]) => {
    const [date, sign_id, edition] = key.split('|');
    return {
      date, sign_id, edition,
      ambiance: v.ambiance,
      chiffre_porte_bonheur: v.chiffrePorteBonheur,
      compatibilite: v.compatibilite,
      loa: v.loa,
      famille_vaudou: v.familleVaudou,
      couleurs_sacrees: v.couleursSacrees,
      lune_bienetre: v.lune?.bienetre,
      lune_beaute: v.lune?.beaute,
      lune_esprit: v.lune?.esprit,
      lune_maison: v.lune?.maison,
      lune_jardinage: v.lune?.jardinage,
      scores: v.scores,
    };
  });
  await upsertRest('ambiances', rows, 'date,sign_id,edition');
  console.log(`✅ [SUPABASE] ${rows.length} ambiance(s) upsertée(s)`);
}

async function saveToLocalFile(today: string, data: Record<string, any>): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const dir = path.join(process.cwd(), 'public', 'data', 'ambiance');
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

async function generateAmbience(
  signId: string,
  edition: Edition,
  weather: string,
  today: string,
): Promise<Record<string, any> | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.log('❌ MISTRAL_API_KEY non trouvé dans .env');
    logError('MISTRAL_API_KEY manquant');
    return null;
  }

  const sign = signs.find((s) => s.id === signId);
  if (!sign) {
    logError(`Signe non trouvé: ${signId}`);
    return null;
  }

  logVerbose(`Génération ambiance pour ${signId} (${edition})...`);

  const lunarPhase = lunarPhaseLabel();
  const otherSigns = signs.filter((s) => s.id !== signId).map((s) => s.id);
  const culturalContext = getCulturalContext(signId, today);

  const luneBienetre = getAmbianceBienetre(signId, today);
  const luneBeaute = getAmbianceBeaute(signId, today);
  const luneEsprit = getAmbianceEsprit(signId, today);
  const luneMaison = getAmbianceMaison(signId, today);
  const luneJardinage = getAmbianceJardinage(signId, today);

  // ============================================
  // CONTEXTE VAUDOU
  // ============================================
  const vaudouContext = getVaudouContextForSign(signId);
  const loa = SIGN_TO_LOA[signId];
  const signVaudouContext = SIGN_TO_VAUDOU_CONTEXT[signId];

  // Rotation déterministe par signe+date (évite les répétitions inter-signes)
  function pickBySignDate<T>(arr: T[], count: number): T[] {
    if (!arr.length) return [];
    let hash = 0;
    const key = signId + today;
    for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    const start = Math.abs(hash) % arr.length;
    const result: T[] = [];
    for (let i = 0; i < Math.min(count, arr.length); i++) result.push(arr[(start + i) % arr.length]);
    return result;
  }
  const rituelsJour  = pickBySignDate(rituelsData, 2);
  const animauxSacres = pickBySignDate(animauxData, 1);

  // Récupérer la compatibilité vaudou
  const vaudouCompat = getVaudouCompatibility(signId);
  
  // Sélectionner 2 signes compatibles selon le vaudou
  // Priorité : amour > amitié > éviter les conflits
  const compatibleSigns = [
    ...vaudouCompat.love.filter(s => s !== signId),
    ...vaudouCompat.friendship.filter(s => s !== signId && !vaudouCompat.love.includes(s))
  ].slice(0, 2);
  
  // Si pas assez de compatibles vaudou, compléter avec des signes aléatoires
  const finalCompatibleSigns = compatibleSigns.length >= 2 
    ? compatibleSigns.slice(0, 2)
    : [...compatibleSigns, ...otherSigns.filter(s => !vaudouCompat.conflict.includes(s))].slice(0, 2);

  // Calcul des scores (réutilisation de la même logique que dans l'API)
  const weatherData: WeatherData = {
    tmin: 24,
    tmax: 30,
    rain: 0,
    wind: 20,
    code: 1,
    label: 'Partiellement nuageux',
    summary: weather || '',
  };
  const scores = computeScores(signId, today, weatherData);

  const prompt = `Tu es Maryse CondAI, voix astrologique de Karukera (Guadeloupe).
Génère l'ambiance astrale du jour pour le ${sign.name} (édition ${edition}).

Signe : ${sign.name} · Planète : ${sign.planet} · Élément : ${sign.element}
Phase lunaire : ${lunarPhase}
Météo à Pointe-à-Pitre : ${weather}

${culturalContext}

🔮 **CONTEXTE VAUDOU GUADELOUPÉEN** :
📌 Signe ${sign.name} → Loa principal : **${loa}** (${signVaudouContext?.famille || 'Rada'})
   Énergie : ${signVaudouContext?.energie || 'Harmonie et équilibre'}
   Couleurs sacrées : ${(signVaudouContext?.couleurs || ['blanc']).join(', ')}
   Symbole : ${signVaudouContext?.emoji || '🔮'}
   Animaux sacrés du jour : ${animauxSacres.map(a => `${a.nomCreole} (${a.nomFrancais}) — ${a.dimensionCulturelle}`).join(' | ')}
   Rituels du jour : ${rituelsJour.map(r => `${r.nomCreole} (${r.nomFrancais}) — ${r.description}`).join(' | ')}

Scores énergétiques du jour (FIXES — calculés depuis les cycles planétaires, la météo et le calendrier guadeloupéen) :
Amour ${scores.amour}% · Travail ${scores.travail}% · Bien-être ${scores.bienetre}% · Vie sociale ${scores.vieSociale}% · Finances ${scores.finances}%

Tiens compte de ces scores et du contexte vaudou dans ton ambiance : commente brièvement les domaines forts (>75) et faibles (<50). Intègre au moins UNE référence vaudou (loa, couleur, plante ou animal sacré) dans l'ambiance.

Réponds avec un objet JSON valide et ces clés exactes :
{
  "ambiance": "2-3 phrases sur l'énergie du jour, ancrées dans les références culturelles ci-dessus et cohérentes avec les scores. Intègre au moins 1 référence vaudou (loa, couleur, symbole).",
  "chiffrePorteBonheur": <entier 1-99, de préférence un nombre premier (2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97)>
  "compatibilite": ["<signId1>", "<signId2>"],
  "loa": "${loa}",
  "familleVaudou": "${signVaudouContext?.famille || 'Rada'}",
  "couleursSacrees": ["${(signVaudouContext?.couleurs || ['blanc']).join('", "')}"],
  "lune": {
    "bienetre": "conseil bien-être ancré sur le rimèd razié du jour : ${luneBienetre.nomCreole} (${luneBienetre.nomFr}) — ${luneBienetre.usage}. Mentionne le nom créole et son usage pour le corps. 2 phrases.",
    "beaute": "conseil beauté/soin naturel ancré sur la plante du jour : ${luneBeaute.nomCreole} (${luneBeaute.nomFr}) — ${luneBeaute.culture}. Mentionne le nom créole et son usage beauté ou soin. 2 phrases.",
    "esprit": "conseil mental ou spirituel ancré sur un des rituels vaudou du jour (${rituelsJour.map(r => r.nomCreole).join(', ')}) OU sur l'objet/lieu de résistance : ${luneEsprit.nomCreole} (${luneEsprit.nomFr}) — ${luneEsprit.dimension}. Lié aussi à la ${lunarPhase}. 2 phrases.",
    "maison": "conseil maison/espace de vie créole ancré sur l'objet ou pratique du jour : ${luneMaison.nomCreole} (${luneMaison.nomFr}) — ${luneMaison.dimension}. 2 phrases.",
    "jardinage": "conseil jardinage créole ancré sur la plante du jour : ${luneJardinage.nomCreole} (${luneJardinage.nomFr}) — ${luneJardinage.culture}. Mentionne le nom créole et comment la cultiver ou l'utiliser selon la ${lunarPhase}. 2 phrases."
  }
}

Pour "compatibilite" choisis exactement 2 valeurs parmi : ${finalCompatibleSigns.join(', ')} (basé sur la compatibilité vaudou via les loas).
SÉCURITÉ — dans tous les champs lune (bienetre, beaute, esprit, maison, jardinage) : JAMAIS de bougie, flamme ou feu. JAMAIS Legba sauf si c'est le loa assigné au signe. Le tambour guadeloupéen s'appelle "ka", jamais "tambour".
Utilise 1 mot créole max par phrase, TOUJOURS avec traduction entre parenthèses.
Sans markdown dans les valeurs JSON.`;

  // Délai pour éviter le rate limit Mistral (réduit de 5s à 2s)
  logVerbose(`Délai 2s avant appel Mistral pour ${signId} ${edition}...`);
  await delay(2000);
  logVerbose(`Délai terminé, appel Mistral`);

  const startTime = Date.now();
  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.8,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user', content: prompt },
      ],
    }),
  });

  logVerbose(`Réponse Mistral: ${res.status} (${Date.now() - startTime}ms)`);

  if (!res.ok) {
    console.log(`❌ Mistral échoué: ${res.status}`);
    logError('Échec appel Mistral', { status: res.status });
    return null;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '{}';

  try {
    const parsed = JSON.parse(content);
    logVerbose('JSON valide parsé avec succès', Object.keys(parsed));
    
    // ==========================================
    // 📚 EXTRACTION DES TERMES POUR LE GLOSSAIRE
    // ==========================================
    logVerbose('📚 Extraction des termes pour le glossaire...');
    
    const textForGlossary = JSON.stringify(parsed);
    const terms = extractGlossaryTerms(textForGlossary);
    
    if (terms.length > 0) {
      const dateToday = new Date().toISOString().split('T')[0];
      const today = todayGuadeloupe();
      const sourceFile = `ambiance/${today}.json`;
      updateGlossary(terms, dateToday, sourceFile);
    } else {
      logVerbose('ℹ️  Aucun terme entre parenthèses détecté pour le glossaire');
    }
    
    // ==========================================
    // 🗑️  SUPPRESSION DES PARENTHÈSES REDONDANTES
    // ==========================================
    logVerbose('🗑️  Suppression des parenthèses pour les termes connus...');
    const parsedWithCleanedText = JSON.parse(
      JSON.stringify(parsed).replace(/(\w[\w'\-]*)\s*\(([^)]+)\)/g, (match, term) => {
        const glossary = loadGlossary();
        if (glossary[term]) {
          return term;
        }
        return match;
      })
    );
    
    // ==========================================
    // 🛡️ APPLICATION DES GARDE-FOUS DE SÉCURITÉ
    // ==========================================
    logVerbose('🛡️  Application des garde-fous de sécurité...');
    const { filtered: safeParsed, warnings, stats } = applySafetyFiltersToObject(
      parsedWithCleanedText,
      { logWarnings: true, includeStats: true }
    );
    
    if (warnings.length > 0) {
      logVerbose(`✅ ${warnings.length} garde-fous appliqués pour ${signId} (${edition})`, {
        highPriority: stats.highPriority,
        mediumPriority: stats.mediumPriority,
        lowPriority: stats.lowPriority,
        totalReplacements: stats.totalReplacements,
      });
    } else {
      logVerbose(`✅ Aucun garde-fou nécessaire pour ${signId} (${edition})`);
    }
        // S'assurer que compatibilite et couleursSacrees sont des tableaux (Mistral renvoie parfois des objets)
        const ensureArray = (val: any) => {
          if (Array.isArray(val)) return val;
          if (val && typeof val === 'object') return Object.values(val);
          return [];
        };

        const finalResult = {
          ...safeParsed,
          compatibilite: ensureArray(safeParsed.compatibilite),
          couleursSacrees: ensureArray(safeParsed.couleursSacrees),
          scores
        };

        return finalResult;
        } catch (e) {
        console.log(`❌ JSON invalide pour ${signId} ${edition}`);
        logError('Échec parsing JSON', e instanceof Error ? e.message : e);
        return null;
        }  }

async function generateAllAmbiances() {
  await initGlossaryCache();
  const today = options.date || todayGuadeloupe();
  const filePath = `data/ambiance/${today}.json`;
  // Vérifier si les ambiances du jour existent déjà (sauf si --force)
  if (!options.force) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const existingFilePath = path.join(process.cwd(), 'public', filePath);
      await fs.access(existingFilePath);
      console.log(`\n⏭️  Les ambiances pour le ${today} existent déjà (${filePath})`);
      console.log('   → Pas de régénération nécessaire.\n');
      console.log('   Pour forcer: passez --force ou -f\n');
      logVerbose('Fichier existant détecté, génération annulée');
      return;
    } catch {
      // Fichier n'existe pas, continuer la génération
      logVerbose('Aucun fichier existant trouvé, génération nécessaire');
    }
  } else if (options.verbose) {
    console.log(`\n⚡ Mode force: régénération des ambiances pour ${today}...\n`);
  }

  console.log(`\n🌙 ========== GÉNÉRATION DES AMBIANCES POUR LE ${today} ==========`);

  const weather = await fetchWeather();
  console.log(`🌤️  Météo: ${weather}\n`);
  logVerbose('Météo récupérée avec succès');

  const editions: Edition[] = ['nuit', 'matin', 'midi', 'soir'];
  const total = signs.length * editions.length;
  let generated = 0;
  let failed = 0;

  const results: Record<string, any> = {};

  for (const sign of signs) {
    for (const edition of editions) {
      const blobKey = `${today}|${sign.id}|${edition}`;
      console.log(`🔄 [${generated + failed + 1}/${total}] ${sign.id} (${edition})...`);

      const ambiance = await generateAmbience(sign.id, edition, weather, today);
      
      if (ambiance) {
        results[blobKey] = ambiance;
        console.log(`✅ [${++generated}/${total}] ${sign.id} (${edition}) - GÉNÉRÉ`);
      } else {
        console.log(`❌ [${++failed}/${total}] ${sign.id} (${edition}) - ÉCHEC`);
        logError(`Échec génération ambiance pour ${sign.id} ${edition}`);
      }

      // Sauvegarder au fil de l'eau
      if (Object.keys(results).length > 0) {
        await saveToLocalFile(today, results);
        if (ambiance) await saveToSupabase({ [blobKey]: ambiance });
      }
    }
  }

  console.log(`\n✨ ========== TERMINÉ ==========`);
  console.log(`   Générés: ${generated}/${total}`);
  console.log(`   Échecs: ${failed}/${total}`);
  console.log(`   Fichier: ${filePath}\n`);
  logVerbose('Génération complète terminée', {
    generated,
    failed,
    total,
    successRate: `${((generated / total) * 100).toFixed(1)}%`
  });
  await flushGlossaryToSupabase();
}

// Exécuter
generateAllAmbiances()
  .then(() => {
    logVerbose('🎉 Script terminé avec succès');
  })
  .catch((error) => {
    logError('❌ Erreur fatale dans le script', error instanceof Error ? error.message : error);
    console.error(error);
  });
