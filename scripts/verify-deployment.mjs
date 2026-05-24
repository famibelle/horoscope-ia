/**
 * Script de vérification post-déploiement
 * 
 * Vérifie que les horoscopes sont correctement déployés et accessibles.
 * Peut être exécuté manuellement ou via GitHub Actions.
 * 
 * Usage:
 *   node scripts/verify-deployment.mjs
 *   node scripts/verify-deployment.mjs --date=2026-05-24
 *   node scripts/verify-deployment.mjs --verbose
 * 
 * Exit codes:
 *   0: Tout est OK
 *   1: Problèmes détectés
 * 
 * NOTE: Requiert Node.js 18+ (fetch natif)
 */

// Node.js 18+ a fetch natif, pas besoin d'importer

// Parser les arguments
const args = process.argv.slice(2);
const options = {
  date: args.find(arg => arg.startsWith('--date='))?.split('=')[1],
  verbose: args.includes('--verbose') || args.includes('-v'),
  baseUrl: args.find(arg => arg.startsWith('--url='))?.split('=')[1],
};

// Configuration
const DEFAULT_BASE_URL = 'https://horoscope-karukera.netlify.app';
const baseUrl = options.baseUrl || process.env.NETLIFY_URL || DEFAULT_BASE_URL;

// Liste des signes
const SIGNS = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge', 'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
const EDITIONS = ['nuit', 'matin', 'midi', 'soir'];

// Helper pour les logs
function log(message, data = null) {
  if (options.verbose) {
    if (data) {
      console.log(`   ℹ️  ${message}`, data);
    } else {
      console.log(`   ℹ️  ${message}`);
    }
  }
}

function success(message) {
  console.log(`✅ ${message}`);
}

function warning(message) {
  console.warn(`⚠️  ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
}

// Récupérer la date du jour
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Vérifier le fichier JSON
async function checkJsonFile(date) {
  const url = `${baseUrl}/data/horoscopes/${date}.json`;
  log(`Vérification du fichier JSON: ${url}`);
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      // Désactiver le cache pour la vérification
    });
    
    if (response.ok) {
      // Maintenant fetch le contenu pour compter les entrées
      const contentResponse = await fetch(url);
      if (contentResponse.ok) {
        const data = await contentResponse.json();
        const entryCount = Object.keys(data).length;
        const expectedCount = SIGNS.length * EDITIONS.length; // 12 * 4 = 48
        
        success(`Fichier JSON trouvé: ${entryCount} entrées`);
        
        if (entryCount === expectedCount) {
          return { exists: true, entryCount, complete: true };
        } else {
          warning(`Nombre d'entrées incomplet: ${entryCount}/${expectedCount}`);
          return { exists: true, entryCount, complete: false };
        }
      }
      return { exists: false, entryCount: 0, complete: false };
    } else {
      error(`Fichier JSON non trouvé: ${response.status} ${response.statusText}`);
      return { exists: false, entryCount: 0, complete: false };
    }
  } catch (err) {
    error(`Erreur lors de la vérification du fichier JSON: ${err.message}`);
    return { exists: false, entryCount: 0, complete: false, error: err.message };
  }
}

// Vérifier une clé spécifique dans le fichier JSON
async function checkHoroscopeKey(date, sign, edition) {
  const key = `${date}|${sign}|${edition}`;
  const url = `${baseUrl}/data/horoscopes/${date}.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { found: false, key };
    }
    
    const data = await response.json();
    const found = !!data[key];
    
    if (found) {
      log(`Clé trouvée: ${key}`);
      return { found: true, key, data: data[key] };
    } else {
      log(`Clé non trouvée: ${key}`);
      return { found: false, key };
    }
  } catch (err) {
    return { found: false, key, error: err.message };
  }
}

// Vérifier l'API
async function checkApi(sign, date, userHour) {
  const url = `${baseUrl}/api/horoscope/${sign}?date=${date}&userHour=${userHour}`;
  log(`Vérification API: ${url}`);
  
  try {
    const response = await fetch(url);
    const status = response.status;
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.source === 'mistral') {
        success(`API OK: ${sign} (source: mistral)`);
        return { ok: true, source: 'mistral', status };
      } else if (data.source === 'fallback') {
        warning(`API fallback: ${sign} (source: fallback)`);
        return { ok: true, source: 'fallback', status };
      } else if (data.source === 'generating') {
        warning(`API generating: ${sign} (source: generating)`);
        return { ok: true, source: 'generating', status };
      } else {
        success(`API OK: ${sign} (source: ${data.source})`);
        return { ok: true, source: data.source, status };
      }
    } else {
      error(`API Error: ${sign} (status: ${status})`);
      return { ok: false, status, error: `HTTP ${status}` };
    }
  } catch (err) {
    error(`API Network Error: ${sign} - ${err.message}`);
    return { ok: false, error: err.message };
  }
}

// Vérifier l'endpoint de santé
async function checkHealthEndpoint() {
  const url = `${baseUrl}/api/horoscope/health`;
  log(`Vérification endpoint de santé: ${url}`);
  
  try {
    const response = await fetch(url);
    const status = response.status;
    
    if (response.ok) {
      const data = await response.json();
      success(`Health endpoint OK: status=${data.status}, ${data.totalFound}/${data.totalExpected} trouvés`);
      return { ok: true, status: data.status, ...data };
    } else {
      error(`Health endpoint Error: ${status}`);
      return { ok: false, status, error: `HTTP ${status}` };
    }
  } catch (err) {
    error(`Health endpoint Network Error: ${err.message}`);
    return { ok: false, error: err.message };
  }
}

// Fonction principale
async function main() {
  console.log('🔍 ========== SCRIPT DE VÉRIFICATION POST-DÉPLOIEMENT ==========\n');
  console.log(`Base URL: ${baseUrl}`);
  
  const date = options.date || getToday();
  console.log(`Date à vérifier: ${date}\n`);
  
  let allOk = true;
  let errors = [];
  let warnings = [];
  
  // ============================================================
  // ÉTAPE 1: Vérifier le fichier JSON
  // ============================================================
  console.log('📁 ÉTAPE 1/4: Vérification du fichier JSON...');
  const jsonCheck = await checkJsonFile(date);
  
  if (!jsonCheck.exists) {
    error(`Fichier JSON manquant pour la date ${date}`);
    allOk = false;
    errors.push(`Fichier JSON manquant: ${date}.json`);
  } else if (!jsonCheck.complete) {
    warning(`Fichier JSON incomplet: ${jsonCheck.entryCount}/48 entrées`);
    allOk = false;
    warnings.push(`Fichier JSON incomplet: ${jsonCheck.entryCount} entrées`);
  } else {
    success(`Fichier JSON valide: ${jsonCheck.entryCount} entrées`);
  }
  console.log();
  
  // ============================================================
  // ÉTAPE 2: Vérifier quelques clés spécifiques
  // ============================================================
  console.log('🔑 ÉTAPE 2/4: Vérification des clés dans le fichier JSON...');
  
  // Vérifier le premier signe de chaque édition
  const testSign = SIGNS[0]; // belier
  let missingKeys = 0;
  
  for (const edition of EDITIONS) {
    const result = await checkHoroscopeKey(date, testSign, edition);
    if (!result.found) {
      error(`Clé manquante: ${result.key}`);
      missingKeys++;
      errors.push(`Clé manquante: ${result.key}`);
    }
  }
  
  if (missingKeys === 0) {
    success(`Toutes les clés vérifiées trouvées (${EDITIONS.length} pour ${testSign})`);
  } else {
    error(`${missingKeys} clés manquantes pour ${testSign}`);
    allOk = false;
  }
  console.log();
  
  // ============================================================
  // ÉTAPE 3: Vérifier l'API
  // ============================================================
  console.log('🌐 ÉTAPE 3/4: Vérification de l\'API...');
  
  // Tester l'API pour quelques signes
  const testSigns = SIGNS.slice(0, 3); // belier, taureau, gemeaux
  let fallbackCount = 0;
  let mistralCount = 0;
  let errorCount = 0;
  
  for (const sign of testSigns) {
    // Utiliser une heure différente pour chaque signe pour tester toutes les éditions
    const hour = testSigns.indexOf(sign) * 6; // 0, 6, 12
    const result = await checkApi(sign, date, hour);
    
    if (!result.ok) {
      errorCount++;
      errors.push(`API échouée pour ${sign}: ${result.error}`);
    } else if (result.source === 'fallback' || result.source === 'generating') {
      fallbackCount++;
      warnings.push(`API retourne ${result.source} pour ${sign}`);
    } else if (result.source === 'mistral') {
      mistralCount++;
    }
  }
  
  if (errorCount > 0) {
    error(`${errorCount} erreurs API`);
    allOk = false;
  } else if (fallbackCount > 0) {
    warning(`${fallbackCount} réponses en fallback/génération`);
  } else {
    success(`API fonctionne correctement (${mistralCount}/${testSigns.length} en mistral)`);
  }
  console.log();
  
  // ============================================================
  // ÉTAPE 4: Vérifier l'endpoint de santé
  // ============================================================
  console.log('🏥 ÉTAPE 4/4: Vérification de l\'endpoint de santé...');
  
  const healthCheck = await checkHealthEndpoint();
  
  if (!healthCheck.ok) {
    error(`Endpoint de santé en erreur: ${healthCheck.error}`);
    allOk = false;
    errors.push(`Health endpoint error: ${healthCheck.error}`);
  } else if (healthCheck.status !== 'ok') {
    warning(`Endpoint de santé: status=${healthCheck.status}`);
    warnings.push(`Health endpoint status: ${healthCheck.status}`);
  } else {
    success(`Endpoint de santé OK: ${healthCheck.totalFound}/${healthCheck.totalExpected}`);
  }
  console.log();
  
  // ============================================================
  // RÉSULTAT FINAL
  // ============================================================
  console.log('📊 ========== RÉSULTAT FINAL ==========');
  
  if (allOk) {
    success('✅ Toutes les vérifications ont réussi!');
    console.log('   Le déploiement semble correct.');
  } else {
    error('❌ Problèmes détectés lors de la vérification');
    
    if (errors.length > 0) {
      console.error('\n   ERREURS:');
      errors.forEach(e => console.error(`   - ${e}`));
    }
    
    if (warnings.length > 0) {
      console.warn('\n   AVERTISSEMENTS:');
      warnings.forEach(w => console.warn(`   - ${w}`));
    }
  }
  
  console.log(`\nDurée totale: ${Math.round((Date.now() - new Date().getTime()) / 1000)}s`);
  
  // Retourner le code d'erreur approprié
  process.exit(allOk ? 0 : 1);
}

// Exécuter
main().catch((err) => {
  error(`Erreur fatale: ${err.message}`);
  process.exit(1);
});

export default main;
