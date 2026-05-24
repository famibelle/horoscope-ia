/**
 * Script de pré-build pour générer les horoscopes du jour
 * 
 * Ce script s'exécute AVANT le build Next.js pour s'assurer que
 * les fichiers d'horoscopes du jour sont disponibles.
 * 
 * Si les fichiers sont manquants, le script les génère et bloque le build
 * jusqu'à ce qu'ils soient prêts.
 * 
 * Usage: node scripts/prebuild-horoscopes.mjs
 * 
 * Variables d'environnement:
 * - FORCE_GENERATE: Si 'true', force la régénération même si le fichier existe
 * - SKIP_PREBUILD: Si 'true', saute la vérification (pour dev)
 * - MISTRAL_API_KEY: Clé API Mistral pour la génération
 */

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Récupérer la date du jour au format YYYY-MM-DD
function getToday() {
  // Utiliser la date du système (c'est la date du serveur de build)
  // En production Netlify, c'est la date UTC
  return new Date().toISOString().split('T')[0];
}

// Vérifier si le fichier existe et est récent (moins de 24h)
function isFileValid(filePath) {
  try {
    const stats = statSync(filePath);
    const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
    
    // Fichier valide s'il existe et a moins de 24h
    return ageHours < 24;
  } catch {
    return false;
  }
}

// Vérifier les fichiers d'horoscopes pour une date donnée
function checkHoroscopeFiles(date) {
  const filePath = path.join(rootDir, 'public', 'data', 'horoscopes', `${date}.json`);
  const fileExists = existsSync(filePath);
  const isValid = fileExists && isFileValid(filePath);
  
  return {
    date,
    filePath,
    exists: fileExists,
    valid: isValid,
    ageHours: fileExists ? (Date.now() - statSync(filePath).mtimeMs) / (1000 * 60 * 60) : null,
  };
}

// Générer les horoscopes
function generateHoroscopes(date) {
  console.log(`🚀 Démarrage de la génération des horoscopes pour ${date}...`);
  
  try {
    // Exécuter le script de génération
    const command = `npx tsx scripts/generate-horoscopes.ts --date=${date} --force`;
    console.log(`   Commande: ${command}`);
    
    const output = execSync(command, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
    });
    
    console.log(`✅ Génération terminée avec succès!`);
    return true;
  } catch (error) {
    console.error(`❌ Échec de la génération:`, error);
    return false;
  }
}

// Fonction principale
function main() {
  console.log('🔍 ========== SCRIPT PREBUILD HOROSCOPES ==========\n');
  
  // Vérifier si on doit sauter
  if (process.env.SKIP_PREBUILD === 'true') {
    console.log('ℹ️  Prebuild sauté (SKIP_PREBUILD=true)');
    console.log('   → Passage au build normal\n');
    return;
  }
  
  const today = getToday();
  console.log(`📅 Date à vérifier: ${today}\n`);
  
  // Vérifier les fichiers
  const checkResult = checkHoroscopeFiles(today);
  console.log(`   Fichier: ${checkResult.filePath}`);
  console.log(`   Existe: ${checkResult.exists ? '✅' : '❌'}`);
  
  if (checkResult.exists) {
    console.log(`   Âge: ${checkResult.ageHours?.toFixed(1)} heures`);
    console.log(`   Valide: ${checkResult.valid ? '✅' : '❌'}`);
  }
  
  // Décider si on doit générer
  const forceGenerate = process.env.FORCE_GENERATE === 'true';
  const needsGeneration = !checkResult.exists || !checkResult.valid || forceGenerate;
  
  if (needsGeneration) {
    console.log(`\n${forceGenerate ? '⚡' : '⚠️ '} Fichiers manquants ou obsolètes pour ${today}`);
    console.log('   → Génération nécessaire\n');
    
    const success = generateHoroscopes(today);
    
    if (!success) {
      console.error('\n❌ ERREUR: Impossible de générer les horoscopes!');
      console.error('   → Le build va échouer');
      process.exit(1); // Bloquer le build
    }
    
    // Vérifier que le fichier a été créé
    const finalCheck = checkHoroscopeFiles(today);
    if (!finalCheck.exists) {
      console.error('\n❌ ERREUR: Fichier toujours manquant après génération!');
      console.error('   → Vérifiez les permissions et les chemins');
      process.exit(1);
    }
    
    console.log(`\n✅ Fichier généré: ${finalCheck.filePath}\n`);
  } else {
    console.log(`✅ Fichier existant et valide pour ${today}\n`);
  }
  
  console.log('🎉 Prebuild terminé avec succès!');
  console.log('   → Passage au build Next.js\n');
}

// Exécuter
try {
  main();
} catch (error) {
  console.error('\n❌ Erreur fatale dans le script prebuild:', error);
  process.exit(1);
}
