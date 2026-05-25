/**
 * 📊 Log Analyzer - Analyseur de rapports de génération
 * 
 * Objectif: Analyser tous les rapports de logs Markdown pour identifier:
 *          - Les tendances (durée moyenne, nombre d'erreurs)
 *          - Les échecs récurrents
 *          - Les coûts évités
 *          - Les recommandations d'optimisation
 * 
 * Utilisation:
 *   npx tsx scripts/analyze-logs.ts
 *   # Ou pour une date spécifique:
 *   npx tsx scripts/analyze-logs.ts --date=2026-05-25
 */

import fs from 'fs';
import path from 'path';

// =============================================================================
// 📝 TYPES
// =============================================================================

interface LogReport {
  status: 'success' | 'failure' | 'partial';
  date: string;
  runId: string;
  workflow: string;
  duration: number;
  mistralCalls: number;
  filesGenerated: number;
  errors: number;
  tokensUsed?: number;
  timestamp?: string;
}

interface AnalysisReport {
  totalRuns: number;
  successCount: number;
  failureCount: number;
  partialCount: number;
  totalCostAvoided: number;
  avgDuration: number;
  avgMistralCalls: number;
  avgFilesGenerated: number;
  totalErrors: number;
  totalTokensUsed?: number;
  reports: LogReport[];
}

interface Recommendation {
  level: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: string;
}

// =============================================================================
// 🎯 CONSTANTES
// =============================================================================

const LOGS_DIR = path.join(process.cwd(), 'logs');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'logs-analysis');
const MAX_REPORTS = 100; // Limite pour éviter les analyses trop lourdes

// =============================================================================
// 🔍 FONCTIONS D'EXTRACTION
// =============================================================================

/**
 * Extrait les métadonnées du frontmatter d'un fichier Markdown
 */
function extractFrontmatter(filePath: string): Partial<LogReport> | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraire le frontmatter (entre ---)
    const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
    if (!frontmatterMatch) {
      return null;
    }
    
    const frontmatter = frontmatterMatch[1];
    const report: Partial<LogReport> = {};
    
    // Parser chaque ligne du frontmatter
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      const [key, value] = trimmedLine.split(':').map(s => s.trim());
      if (!key || value === undefined) continue;
      
      // Nettoyer la valeur
      const cleanValue = value
        .replace(/^['"]|['"]$/g, '') // Enlever les quotes
        .replace(/^\s+|\s+$/g, ''); // Trim
      
      // Convertir les types
      if (key === 'duration' || key === 'mistralCalls' || key === 'filesGenerated' || key === 'errors' || key === 'tokensUsed') {
        report[key as keyof LogReport] = parseInt(cleanValue, 10) || 0;
      } else {
        report[key as keyof LogReport] = cleanValue as any;
      }
    }
    
    return report;
  } catch (error) {
    console.error(`⚠️  Erreur lors de l'extraction du frontmatter: ${filePath}`, error);
    return null;
  }
}

/**
 * Extrait la date du nom de fichier
 */
function extractDateFromFilename(filename: string): string | null {
  const dateMatch = filename.match(/generation-report-(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : null;
}

/**
 * Extrait tous les rapports de logs du dossier
 */
function extractAllReports(logsDir: string = LOGS_DIR): LogReport[] {
  const reports: LogReport[] = [];
  
  if (!fs.existsSync(logsDir)) {
    console.log(`⚠️  Dossier non trouvé: ${logsDir}`);
    return reports;
  }
  
  // Lister tous les fichiers Markdown
  const files = fs.readdirSync(logsDir)
    .filter(file => file.endsWith('.md') && file.includes('generation-report'))
    .sort()
    .reverse() // Tri par date décroissante
    .slice(0, MAX_REPORTS); // Limiter le nombre de rapports
  
  for (const file of files) {
    const filePath = path.join(logsDir, file);
    const frontmatter = extractFrontmatter(filePath);
    
    if (!frontmatter) {
      console.log(`⚠️  Frontmatter introuvable: ${file}`);
      continue;
    }
    
    // Extraire la date depuis le nom de fichier si non présente dans le frontmatter
    if (!frontmatter.date) {
      const dateFromFilename = extractDateFromFilename(file);
      if (dateFromFilename) {
        frontmatter.date = dateFromFilename;
      }
    }
    
    // Ajouter le timestamp depuis le contenu du fichier
    if (!frontmatter.timestamp) {
      const content = fs.readFileSync(filePath, 'utf8');
      const timestampMatch = content.match(/Heure de début\s*\|\s*([^\n]+)/);
      if (timestampMatch) {
        frontmatter.timestamp = timestampMatch[1].trim();
      }
    }
    
    reports.push(frontmatter as LogReport);
  }
  
  return reports;
}

// =============================================================================
// 📊 FONCTIONS D'ANALYSE
// =============================================================================

/**
 * Calcule les statistiques globales à partir des rapports
 */
function calculateStatistics(reports: LogReport[]): AnalysisReport {
  const totalRuns = reports.length;
  const successCount = reports.filter(r => r.status === 'success').length;
  const failureCount = reports.filter(r => r.status === 'failure').length;
  const partialCount = reports.filter(r => r.status === 'partial').length;
  
  // Coût évité: 25€ par échec
  const totalCostAvoided = failureCount * 25;
  
  // Calculer les moyennes
  const validReports = reports.filter(r => r.duration > 0);
  const avgDuration = validReports.length > 0 
    ? validReports.reduce((sum, r) => sum + r.duration, 0) / validReports.length 
    : 0;
  
  const avgMistralCalls = validReports.length > 0 
    ? validReports.reduce((sum, r) => sum + (r.mistralCalls || 0), 0) / validReports.length 
    : 0;
  
  const avgFilesGenerated = validReports.length > 0 
    ? validReports.reduce((sum, r) => sum + (r.filesGenerated || 0), 0) / validReports.length 
    : 0;
  
  const totalErrors = reports.reduce((sum, r) => sum + (r.errors || 0), 0);
  const totalTokensUsed = reports.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
  
  return {
    totalRuns,
    successCount,
    failureCount,
    partialCount,
    totalCostAvoided,
    avgDuration,
    avgMistralCalls,
    avgFilesGenerated,
    totalErrors,
    totalTokensUsed: totalTokensUsed > 0 ? totalTokensUsed : undefined,
    reports,
  };
}

/**
 * Génère une liste de recommandations basées sur l'analyse
 */
function generateRecommendations(analysis: AnalysisReport): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // 1. Recommandations critiques (échecs)
  if (analysis.failureCount > 0) {
    recommendations.push({
      level: 'critical',
      title: `🚨 ${analysis.failureCount} échec(s) détecté(s)`,
      message: `**Coût total évité: ${analysis.totalCostAvoided}€** - Les vérifications en amont ont permis d'éviter des pertes financières.`,
      action: `Analyser les rapports d'échec pour identifier les causes racines.`
    });
    
    // Trouver les rapports d'échec récents
    const failureReports = analysis.reports.filter(r => r.status === 'failure');
    if (failureReports.length > 0) {
      const mostRecentFailure = failureReports[0];
      recommendations.push({
        level: 'critical',
        title: `⚠️  Dernier échec: ${mostRecentFailure.date}`,
        message: `Run ID: ${mostRecentFailure.runId} - ${mostRecentFailure.errors || 0} erreur(s)`,
        action: `Voir logs/generation-report-${mostRecentFailure.date}-${mostRecentFailure.runId}.md`
      });
    }
  }
  
  // 2. Recommandations d'optimisation
  if (analysis.avgDuration > 300000) { // 5 minutes
    recommendations.push({
      level: 'warning',
      title: `⚠️  Durée moyenne élevée`,
      message: `La génération prend en moyenne ${(analysis.avgDuration / 1000 / 60).toFixed(2)} minutes.`,
      action: `Optimiser les appels API ou vérifier les délais entre les requêtes.`
    });
  }
  
  if (analysis.avgMistralCalls > 50) {
    recommendations.push({
      level: 'warning',
      title: `⚠️  Nombre élevé d'appels Mistral`,
      message: `Moyenne de ${analysis.avgMistralCalls.toFixed(1)} appels par génération.`,
      action: `Vérifier si tous les appels sont nécessaires ou si certains peuvent être mis en cache.`
    });
  }
  
  // 3. Recommandations d'information
  if (analysis.totalRuns > 0 && analysis.failureCount === 0) {
    recommendations.push({
      level: 'success',
      title: `✅ Taux de succès: 100%`,
      message: `Aucun échec détecté dans les ${analysis.totalRuns} derniers runs.`,
      action: `Continuer à surveiller.`
    });
  }
  
  if (analysis.successCount > 0 && analysis.avgFilesGenerated === 0) {
    recommendations.push({
      level: 'warning',
      title: `⚠️  Aucun fichier généré`,
      message: `Les générations réussies ne produisent aucun fichier.`,
      action: `Vérifier les scripts de génération (generate-horoscopes.ts, etc.)`
    });
  }
  
  // 4. Statistiques générales
  if (analysis.totalTokensUsed) {
    recommendations.push({
      level: 'info',
      title: `📊 Tokens Mistral utilisés`,
      message: `Total: ${analysis.totalTokensUsed} tokens sur ${analysis.totalRuns} runs.`,
      action: `Estimer le coût mensuel: ~${Math.round(analysis.totalTokensUsed * 0.000025 * 100) / 100}€`
    });
  }
  
  return recommendations;
}

/**
 * Génère un rapport d'analyse complet en Markdown
 */
function generateAnalysisReport(analysis: AnalysisReport, filterDate?: string): string {
  const filteredReports = filterDate 
    ? analysis.reports.filter(r => r.date === filterDate)
    : analysis.reports;
  
  const filteredAnalysis = calculateStatistics(filteredReports);
  
  // Calculer les tendances
  const successRate = ((filteredAnalysis.successCount / filteredAnalysis.totalRuns) * 100).toFixed(2);
  const failureRate = ((filteredAnalysis.failureCount / filteredAnalysis.totalRuns) * 100).toFixed(2);
  
  // Générer le rapport Markdown
  let report = `# 📊 Analyse des Logs de Génération d'Horoscopes

`;
  
  // En-tête
  if (filterDate) {
    report += `## 📅 Filtre: Date = ${filterDate}\n\n`;
  }
  
  report += `---\n\n`;
  
  // Résumé global
  report += `## 🎯 Résumé Global\n\n`;
  report += `| Métrique | Valeur | Statut |\n`;
  report += `|----------|--------|--------|\n`;
  report += `| **Total des runs** | ${filteredAnalysis.totalRuns} | 📊 |\n`;
  report += `| **Réussites** | ${filteredAnalysis.successCount} (${successRate}%) | ✅ |\n`;
  report += `| **Échecs** | ${filteredAnalysis.failureCount} (${failureRate}%) | ${filteredAnalysis.failureCount > 0 ? '❌' : '✅'} |\n`;
  report += `| **Partiels** | ${filteredAnalysis.partialCount} | ⚠️ |\n`;
  report += `| **Coût évité** | **${filteredAnalysis.totalCostAvoided}€** | ${filteredAnalysis.failureCount > 0 ? '⚠️' : '✅'} |\n`;
  report += `| **Durée moyenne** | ${(filteredAnalysis.avgDuration / 1000).toFixed(2)}s | ⏱️ |\n`;
  report += `| **Appels Mistral (moy.)** | ${filteredAnalysis.avgMistralCalls.toFixed(1)} | 🤖 |\n`;
  report += `| **Fichiers générés (moy.)** | ${filteredAnalysis.avgFilesGenerated.toFixed(1)} | 📄 |\n`;
  report += `| **Erreurs totales** | ${filteredAnalysis.totalErrors} | ${filteredAnalysis.totalErrors > 0 ? '❌' : '✅'} |\n`;
  
  if (filteredAnalysis.totalTokensUsed) {
    report += `| **Tokens utilisés** | ${filteredAnalysis.totalTokensUsed} | 💰 |\n`;
  }
  
  report += `\n---\n\n`;
  
  // Graphique ASCII (simple)
  report += `## 📈 Tendances\n\n`;
  report += `### Taux de succès: ${successRate}%\n\n`;
  report += generateAsciiBarChart(filteredAnalysis);
  
  report += `---\n\n`;
  
  // Détails par run (si pas trop nombreux)
  if (filteredReports.length <= 20) {
    report += `## 📋 Détails par Run\n\n`;
    report += `| Date | Run ID | Statut | Durée | Appels | Fichiers | Erreurs | Coût |\n`;
    report += `|------|--------|--------|-------|--------|---------|--------|------|\n`;
    
    for (const reportData of filteredReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
      const durationSec = (reportData.duration / 1000).toFixed(2);
      const cost = reportData.status === 'failure' ? '25€' : '0€';
      const statusEmoji = reportData.status === 'success' ? '✅' : reportData.status === 'failure' ? '❌' : '⚠️';
      
      report += `| ${reportData.date} | [${reportData.runId}](logs/generation-report-${reportData.date}-${reportData.runId}.md) | ${statusEmoji} ${reportData.status} | ${durationSec}s | ${reportData.mistralCalls} | ${reportData.filesGenerated} | ${reportData.errors} | ${cost} |\n`;
    }
    report += `\n`;
  } else {
    report += `## 📋 Derniers ${filteredReports.slice(0, 10).length} Runs\n\n`;
    report += `| Date | Run ID | Statut | Durée | Appels |\n`;
    report += `|------|--------|--------|-------|--------|\n`;
    
    for (const reportData of filteredReports.slice(0, 10)) {
      const durationSec = (reportData.duration / 1000).toFixed(2);
      const statusEmoji = reportData.status === 'success' ? '✅' : reportData.status === 'failure' ? '❌' : '⚠️';
      
      report += `| ${reportData.date} | [${reportData.runId}](logs/generation-report-${reportData.date}-${reportData.runId}.md) | ${statusEmoji} | ${durationSec}s | ${reportData.mistralCalls} |\n`;
    }
    report += `\n`;
  }
  
  report += `---\n\n`;
  
  // Recommandations
  report += `## 💡 Recommandations\n\n`;
  
  const recommendations = generateRecommendations(filteredAnalysis);
  for (const rec of recommendations) {
    const emoji = rec.level === 'critical' ? '🚨' : 
                 rec.level === 'warning' ? '⚠️' : 
                 rec.level === 'success' ? '✅' : 'ℹ️';
    
    report += `${emoji} **${rec.title}**\n\n`;
    report += `${rec.message}\n\n`;
    if (rec.action) {
      report += `> 🎯 **Action:** ${rec.action}\n\n`;
    }
    report += `---\n\n`;
  }
  
  // Statistiques avancées
  if (filteredAnalysis.totalRuns > 1) {
    report += `## 📊 Statistiques Avancées\n\n`;
    
    // Calculer la tendance (derniers 5 vs tous)
    const recentReports = filteredReports.slice(0, 5);
    const recentAnalysis = calculateStatistics(recentReports);
    const recentSuccessRate = ((recentAnalysis.successCount / recentAnalysis.totalRuns) * 100).toFixed(2);
    const allSuccessRate = ((filteredAnalysis.successCount / filteredAnalysis.totalRuns) * 100).toFixed(2);
    
    report += `| Métrique | Derniers 5 | Tous | Tendances |\n`;
    report += `|----------|-----------|------|----------|\n`;
    report += `| Taux de succès | ${recentSuccessRate}% | ${allSuccessRate}% | ${recentSuccessRate > allSuccessRate ? '↑ Amélioration' : recentSuccessRate < allSuccessRate ? '↓ Dégradation' : '→ Stable'} |\n`;
    report += `| Durée moyenne | ${(recentAnalysis.avgDuration / 1000).toFixed(2)}s | ${(filteredAnalysis.avgDuration / 1000).toFixed(2)}s | ${recentAnalysis.avgDuration < filteredAnalysis.avgDuration ? '↑ Plus rapide' : '↓ Plus lent'} |\n`;
    report += `| Appels Mistral | ${recentAnalysis.avgMistralCalls.toFixed(1)} | ${filteredAnalysis.avgMistralCalls.toFixed(1)} | ${recentAnalysis.avgMistralCalls < filteredAnalysis.avgMistralCalls ? '↓ Moins d\'appels' : '↑ Plus d\'appels'} |\n`;
    
    report += `\n`;
  }
  
  // Estimation des coûts
  report += `## 💰 Estimation des Coûts\n\n`;
  report += `> ⚠️  **Hypothèse:** 25€ par échec (coût d'une génération Mistral inutile)\n\n`;
  report += `| Période | Échecs | Coût évité |\n`;
  report += `|---------|--------|-------------|\n`;
  report += `| Derniers ${filteredAnalysis.totalRuns} runs | ${filteredAnalysis.failureCount} | **${filteredAnalysis.totalCostAvoided}€** |\n`;
  
  if (filteredAnalysis.avgMistralCalls > 0 && filteredAnalysis.totalTokensUsed) {
    // Estimation du coût réel des tokens (0.000025€/token pour Mistral)
    const estimatedCost = filteredAnalysis.totalTokensUsed * 0.000025;
    report += `| Coût réel des tokens | - | ~${estimatedCost.toFixed(2)}€ |\n`;
  }
  
  report += `\n---\n\n`;
  report += `## ℹ️  Informations\n\n`;
  report += `- **Généré le:** ${new Date().toISOString()}\n`;
  report += `- **Nombre total de rapports analysés:** ${analysis.totalRuns}\n`;
  report += `- **Dossier des logs:** [./logs/](./logs/)\n`;
  
  return report;
}

/**
 * Génère un graphique ASCII simple
 */
function generateAsciiBarChart(analysis: AnalysisReport): string {
  const total = analysis.totalRuns;
  const success = analysis.successCount;
  const failure = analysis.failureCount;
  const partial = analysis.partialCount;
  
  const maxLength = 50;
  
  const successBar = '▰'.repeat(Math.round((success / total) * maxLength));
  const failureBar = '▱'.repeat(Math.round((failure / total) * maxLength));
  const partialBar = '▰'.repeat(Math.round((partial / total) * maxLength));
  
  return `✅ Succès:  ${successBar.padEnd(maxLength)} ${((success / total) * 100).toFixed(1)}%\n` +
         `❌ Échecs:  ${failureBar.padEnd(maxLength)} ${((failure / total) * 100).toFixed(1)}%\n` +
         `⚠️  Partiels: ${partialBar.padEnd(maxLength)} ${((partial / total) * 100).toFixed(1)}%\n`;
}

// =============================================================================
// 🎯 FONCTION PRINCIPALE
// =============================================================================

function main() {
  console.log('🔍 Analyse des logs de génération...\n');
  
  // Parser les arguments
  const args = process.argv.slice(2);
  const options: { date?: string; output?: string; help?: boolean } = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) {
      options.date = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      options.help = true;
    }
  }
  
  if (options.help) {
    console.log(`
Utilisation: npx tsx scripts/analyze-logs.ts [options]

Options:
  --date=YYYY-MM-DD    Analyser les logs pour une date spécifique
  --output=FILE.md     Sauvegarder le rapport dans un fichier spécifique
  --help, -h           Afficher cette aide

Exemples:
  npx tsx scripts/analyze-logs.ts
  npx tsx scripts/analyze-logs.ts --date=2026-05-25
  npx tsx scripts/analyze-logs.ts --output=public/analysis.md
`);
    process.exit(0);
  }
  
  // Extraire les rapports
  console.log('📂 Extraction des rapports de logs...');
  const reports = extractAllReports();
  
  if (reports.length === 0) {
    console.log('⚠️  Aucun rapport de log trouvé dans logs/');
    process.exit(1);
  }
  
  console.log(`✅ ${reports.length} rapport(s) trouvé(s)`);
  
  // Calculer les statistiques
  const analysis = calculateStatistics(reports);
  
  console.log(`📊 Statistiques:`);
  console.log(`   - Total: ${analysis.totalRuns} runs`);
  console.log(`   - Réussites: ${analysis.successCount}`);
  console.log(`   - Échecs: ${analysis.failureCount}`);
  console.log(`   - Coût évité: ${analysis.totalCostAvoided}€`);
  console.log();
  
  // Générer le rapport
  const reportContent = generateAnalysisReport(analysis, options.date);
  
  // Déterminer le chemin de sortie
  let outputPath: string;
  if (options.output) {
    outputPath = options.output;
  } else {
    // Créer le dossier si inexistant
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    outputPath = path.join(OUTPUT_DIR, `analysis-${timestamp}.md`);
  }
  
  // Sauvegarder le rapport
  fs.writeFileSync(outputPath, reportContent, 'utf8');
  console.log(`✅ Rapport d'analyse généré: ${outputPath}`);
  
  // Afficher un résumé
  console.log(`\n📊 Résumé:`);
  console.log(`   Taux de succès: ${((analysis.successCount / analysis.totalRuns) * 100).toFixed(2)}%`);
  console.log(`   Coût évité: ${analysis.totalCostAvoided}€`);
  console.log(`   Durée moyenne: ${(analysis.avgDuration / 1000).toFixed(2)}s`);
  
  if (analysis.failureCount > 0) {
    console.log(`\n⚠️  Attention: ${analysis.failureCount} échec(s) détecté(s)`);
    console.log(`   Vérifiez les rapports: ${path.join(LOGS_DIR, 'generation-report-*.md')}`);
  }
  
  console.log(`\n💡 Pour voir le rapport complet:`);
  console.log(`   cat ${outputPath}`);
}

// =============================================================================
// 🚀 EXÉCUTION
// =============================================================================

main();
