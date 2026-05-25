/**
 * 📊 GenerationLogger - Système de logging avancé pour la génération d'horoscopes
 * 
 * Objectif: Capturer TOUS les détails de la génération dans un fichier Markdown
 *          pour analyse ultérieure et débogage des échecs (25€/échec)
 * 
 * Utilisation:
 *   import { getLogger, finalizeLogger } from './log-generator';
 *   const logger = getLogger(date, runId);
 *   logger.info("Message", {data: "valeur"}, "stepName");
 *   finalizeLogger('success', { duration, mistralCalls, filesGenerated, errors });
 */

import fs from 'fs';
import path from 'path';

// =============================================================================
// 📝 TYPES
// =============================================================================

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  step?: string;
  durationMs?: number;
}

interface Metrics {
  duration: number;        // Durée totale en ms
  mistralCalls: number;   // Nombre d'appels Mistral
  filesGenerated: number; // Nombre de fichiers générés
  errors: number;         // Nombre d'erreurs
  tokensUsed?: number;    // Tokens Mistral utilisés (si disponible)
}

// =============================================================================
// 🎯 CONSTANTES
// =============================================================================

const LOG_DIR = path.join(process.cwd(), 'logs');
const EMOJI_MAP: Record<LogLevel, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  success: '✅',
  debug: '🔍',
};

// =============================================================================
// 📄 CLASSE GENERATION LOGGER
// =============================================================================

class GenerationLogger {
  private logs: LogEntry[] = [];
  private startTime: Date;
  private date: string;
  private runId: string;
  private workflow: string;
  private outputPath: string;
  private stepStack: string[] = [];
  private metrics: Partial<Metrics> = {
    mistralCalls: 0,
    filesGenerated: 0,
    errors: 0,
  };

  /**
   * Crée une nouvelle instance du logger
   * @param date Date de génération (format YYYY-MM-DD)
   * @param runId ID du workflow GitHub Actions
   */
  constructor(date: string, runId: string) {
    this.startTime = new Date();
    this.date = date || new Date().toISOString().split('T')[0];
    this.runId = runId || `local-${Date.now()}`;
    this.workflow = process.env.GITHUB_WORKFLOW || 'manual';
    
    // Créer le nom du fichier: generation-report-YYYY-MM-DD-RUNID.md
    const safeRunId = this.runId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `generation-report-${this.date}-${safeRunId}.md`;
    this.outputPath = path.join(LOG_DIR, filename);

    // Créer le dossier si inexistant
    this.ensureLogDir();
    
    // Initialiser le fichier Markdown
    this.initMarkdownFile();
  }

  /**
   * S'assure que le dossier logs/ existe
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
      console.log(`📁 Dossier créé: ${LOG_DIR}`);
    }
  }

  /**
   * Initialise le fichier Markdown avec l'en-tête
   */
  private initMarkdownFile(): void {
    const header = `# 📊 Rapport de Génération d'Horoscopes

## ✅ Métadonnées
| Propriété | Valeur |
|-----------|--------|
| **Workflow** | ${this.workflow} |
| **Run ID** | ${this.runId} |
| **Date** | ${this.date} |
| **Heure de début** | ${this.startTime.toISOString()} |
| **Branche** | ${process.env.GITHUB_REF_NAME || process.env.GITHUB_REF?.split('/').pop() || 'local'} |
| **Commit** | ${process.env.GITHUB_SHA?.substring(0, 7) || 'local'} |

---

## 📈 Résumé
| Métrique | Valeur |
|----------|--------|
| Status | ⏳ En cours |
| Durée | - |
| Appels Mistral | 0 |
| Fichiers générés | 0 |
| Erreurs | 0 |

---

## 🔍 Journal détaillé
`;
    
    fs.writeFileSync(this.outputPath, header, 'utf8');
    console.log(`📄 Fichier de log initialisé: ${this.outputPath}`);
  }

  /**
   * Ajoute une entrée au journal
   */
  private addEntry(entry: LogEntry): void {
    this.logs.push(entry);
    this.appendToMarkdown(entry);
  }

  /**
   * Ajoute une entrée au fichier Markdown
   */
  private appendToMarkdown(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString().split('T')[1].split('.')[0];
    const stepPrefix = entry.step ? `**${entry.step}**` : '';
    const emoji = EMOJI_MAP[entry.level] || '•';
    
    let line = `- ${emoji} [${timestamp}] ${stepPrefix} ${entry.message}`;
    
    // Ajouter les données si présentes
    if (entry.data !== undefined && entry.data !== null) {
      const dataStr = typeof entry.data === 'string' 
        ? entry.data 
        : JSON.stringify(entry.data, null, 2);
      
      // Limiter la taille des données pour éviter les fichiers trop gros
      const maxLength = 1000;
      const truncatedData = dataStr.length > maxLength 
        ? dataStr.substring(0, maxLength) + '... [truncated]' 
        : dataStr;
      
      line += `\n\`\`\`json\n${truncatedData}\n\`\`\`\n`;
    }
    
    // Ajouter la durée si présente
    if (entry.durationMs !== undefined) {
      line += `⏱️  Durée: ${entry.durationMs}ms\n`;
    }
    
    fs.appendFileSync(this.outputPath, line, 'utf8');
  }

  // =============================================================================
  // ✅ MÉTHODES PUBLIQUES DE LOGGING
  // =============================================================================

  /**
   * Log un message d'information
   */
  info(message: string, data?: any, step?: string, durationMs?: number): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
      step,
      durationMs,
    });
  }

  /**
   * Log un avertissement
   */
  warn(message: string, data?: any, step?: string, durationMs?: number): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
      step,
      durationMs,
    });
    this.metrics.errors = (this.metrics.errors || 0) + 1;
  }

  /**
   * Log une erreur
   */
  error(message: string, data?: any, step?: string, durationMs?: number): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data,
      step,
      durationMs,
    });
    this.metrics.errors = (this.metrics.errors || 0) + 1;
  }

  /**
   * Log un succès
   */
  success(message: string, data?: any, step?: string, durationMs?: number): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'success',
      message,
      data,
      step,
      durationMs,
    });
  }

  /**
   * Log un message de debug
   */
  debug(message: string, data?: any, step?: string, durationMs?: number): void {
    if (process.env.NODE_ENV !== 'production' || process.env.VERBOSE === 'true') {
      this.addEntry({
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        data,
        step,
        durationMs,
      });
    }
  }

  // =============================================================================
  // 📊 MÉTHODES DE GESTION DES MÉTRIQUES
  // =============================================================================

  /**
   * Incrémente le compteur d'appels Mistral
   */
  incrementMistralCalls(count: number = 1): void {
    this.metrics.mistralCalls = (this.metrics.mistralCalls || 0) + count;
  }

  /**
   * Incrémente le compteur de fichiers générés
   */
  incrementFilesGenerated(count: number = 1): void {
    this.metrics.filesGenerated = (this.metrics.filesGenerated || 0) + count;
  }

  /**
   * Ajoute des tokens utilisés
   */
  addTokensUsed(tokens: number): void {
    this.metrics.tokensUsed = (this.metrics.tokensUsed || 0) + tokens;
  }

  // =============================================================================
  // 🔄 MÉTHODES DE CONTEXTE (STEPS)
  // =============================================================================

  /**
   * Commence un nouveau step
   */
  startStep(stepName: string): void {
    this.stepStack.push(stepName);
    this.info(`Démarrage du step: ${stepName}`, undefined, stepName);
  }

  /**
   * Termine le step actuel
   */
  endStep(stepName: string, success: boolean = true): void {
    if (this.stepStack.length > 0 && this.stepStack[this.stepStack.length - 1] === stepName) {
      this.stepStack.pop();
    }
    
    if (success) {
      this.success(`Step terminé: ${stepName}`, undefined, stepName);
    } else {
      this.error(`Step échoué: ${stepName}`, undefined, stepName);
    }
  }

  // =============================================================================
  // 🎯 MÉTHODES POUR LES APPELS API (Mistral, FreeHoroscope, etc.)
  // =============================================================================

  /**
   * Log un appel API
   * @param method Méthode HTTP (GET, POST, etc.)
   * @param url URL de l'API
   * @param request Données de la requête
   * @param response Données de la réponse
   * @param durationMs Durée de l'appel
   * @param step Nom du step
   */
  logApiCall(
    method: string,
    url: string,
    request?: any,
    response?: any,
    durationMs?: number,
    step?: string
  ): void {
    const safeUrl = url.replace(/Bearer\s+[^&]+/, 'Bearer ***'); // Masquer le token
    
    this.info(`Appel API ${method} ${safeUrl}`, { durationMs }, step);
    
    if (request) {
      this.debug('Requête API', request, step);
    }
    
    if (response) {
      // Masquer les tokens dans la réponse
      const safeResponse = this.maskSensitiveData(response);
      this.debug('Réponse API', safeResponse, step);
    }
    
    // Incrémenter le compteur Mistral si c'est un appel à Mistral
    if (url.includes('mistral.ai')) {
      this.incrementMistralCalls();
    }
  }

  /**
   * Masque les données sensibles (tokens, clés API)
   */
  private maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/Bearer\s+[^\s]+/g, 'Bearer ***')
        .replace(/api[_-]?key[\s]*:[\s]*["']?[^"'\s,}]+["']?/gi, 'api_key: ***')
        .replace(/token[\s]*:[\s]*["']?[^"'\s,}]+["']?/gi, 'token: ***');
    }
    
    if (typeof data === 'object') {
      const masked: any = {};
      for (const key in data) {
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
          masked[key] = '***';
        } else if (typeof data[key] === 'object') {
          masked[key] = this.maskSensitiveData(data[key]);
        } else if (typeof data[key] === 'string') {
          masked[key] = data[key]
            .replace(/Bearer\s+[^\s]+/g, 'Bearer ***')
            .replace(/[a-zA-Z0-9_-]{30,}/g, (match: string) => {
              // Si ça ressemble à une clé API (30+ chars alphanum), masquer
              return match.length > 25 ? '***' : match;
            });
        } else {
          masked[key] = data[key];
        }
      }
      return masked;
    }
    
    return data;
  }

  // =============================================================================
  // 🏁 FINALISATION DU RAPPORT
  // =============================================================================

  /**
   * Finalise le rapport de log avec les métriques finales
   */
  finalize(status: 'success' | 'failure' | 'partial', customMetrics?: Partial<Metrics>): void {
    const endTime = new Date();
    const durationMs = endTime.getTime() - this.startTime.getTime();
    
    // Fusionner les métriques personnalisées
    const finalMetrics: Metrics = {
      duration: durationMs,
      mistralCalls: customMetrics?.mistralCalls ?? this.metrics.mistralCalls ?? 0,
      filesGenerated: customMetrics?.filesGenerated ?? this.metrics.filesGenerated ?? 0,
      errors: customMetrics?.errors ?? this.metrics.errors ?? 0,
      tokensUsed: customMetrics?.tokensUsed ?? this.metrics.tokensUsed,
    };

    // Générer le summary final
    const summary = this.generateSummary(status, finalMetrics);
    
    // Ajouter le summary au fichier
    fs.appendFileSync(this.outputPath, '\n' + summary, 'utf8');
    
    // Ajouter le frontmatter pour traitement futur
    const finalContent = fs.readFileSync(this.outputPath, 'utf8');
    const frontmatter = `---
status: ${status}
date: ${this.date}
runId: ${this.runId}
workflow: ${this.workflow}
duration: ${durationMs}
mistralCalls: ${finalMetrics.mistralCalls}
filesGenerated: ${finalMetrics.filesGenerated}
errors: ${finalMetrics.errors}
${finalMetrics.tokensUsed ? `tokensUsed: ${finalMetrics.tokensUsed}\n` : ''}---\n\n`;
    
    fs.writeFileSync(this.outputPath, frontmatter + finalContent, 'utf8');
    
    console.log(`\n📄 Rapport finalisé: ${this.outputPath}`);
    console.log(`   Status: ${status}`);
    console.log(`   Durée: ${(durationMs / 1000).toFixed(2)}s`);
    console.log(`   Appels Mistral: ${finalMetrics.mistralCalls}`);
    console.log(`   Fichiers générés: ${finalMetrics.filesGenerated}`);
    console.log(`   Erreurs: ${finalMetrics.errors}`);
  }

  /**
   * Génère le summary final en Markdown
   */
  private generateSummary(status: 'success' | 'failure' | 'partial', metrics: Metrics): string {
    const statusEmoji = status === 'success' ? '✅' : status === 'failure' ? '❌' : '⚠️';
    const statusText = status === 'success' ? 'SUCCESS' : status === 'failure' ? 'FAILURE' : 'PARTIAL SUCCESS';
    const durationSec = (metrics.duration / 1000).toFixed(2);
    const costRisk = status === 'failure' ? '**⚠️  25€ RISQUÉS**' : '0€';

    return `---

## 🎯 ${statusEmoji} Statut Final: ${statusText}

## 📊 Métriques Finales

| Métrique | Valeur | Statut |
|----------|--------|--------|
| **Statut** | ${statusText} | ${statusEmoji} |
| **Durée** | ${durationSec}s | ⏱️ |
| **Appels Mistral** | ${metrics.mistralCalls} | 🤖 |
| **Fichiers générés** | ${metrics.filesGenerated} | 📄 |
| **Erreurs** | ${metrics.errors} | ${metrics.errors > 0 ? '❌' : '✅'} |
| **Tokens utilisés** | ${metrics.tokensUsed || 'N/A'} | 💰 |
| **Risque de coût** | ${costRisk} | ${status === 'failure' ? '❌' : '✅'} |

## ⏰ Timeline
- **Début:** ${this.startTime.toISOString()}
- **Fin:** ${new Date().toISOString()}
- **Durée totale:** ${durationSec}s

## 💡 Recommandations
` + this.generateRecommendations(status, metrics);
  }

  /**
   * Génère des recommandations basées sur le statut et les métriques
   */
  private generateRecommendations(status: 'success' | 'failure' | 'partial', metrics: Metrics): string {
    const recommendations: string[] = [];

    if (status === 'failure') {
      recommendations.push(
        `❌ **La génération a COMPLÈTEMENT échoué** - Vérifiez les logs ci-dessus pour identifier la cause.`
      );
      
      if (metrics.mistralCalls === 0) {
        recommendations.push(
          `🔍 **Aucun appel Mistral n'a été effectué** - Le problème vient probablement des prérequis (API key, réseau, etc.)`
        );
      }
      
      if (metrics.errors > 0) {
        recommendations.push(
          `⚠️  **${metrics.errors} erreur(s) détectée(s)** - Consultez les entrées marquées ❌ dans les logs.`
        );
      }
    } else if (status === 'partial') {
      recommendations.push(
        `⚠️  **La génération a partiellement réussi** - Certains fichiers peuvent manquer.`
      );
    }

    if (metrics.mistralCalls > 0 && metrics.duration / metrics.mistralCalls > 15000) {
      recommendations.push(
        `⚠️  **Temps moyen par appel Mistral élevé** (${(metrics.duration / metrics.mistralCalls / 1000).toFixed(2)}s) - Vérifiez les délais ou le rate limiting.`
      );
    }

    if (metrics.filesGenerated === 0 && status === 'success') {
      recommendations.push(
        `⚠️  **Aucun fichier généré** malgré un statut de succès - Vérifiez les scripts de génération.`
      );
    }

    if (status === 'success') {
      recommendations.push(
        `✅ **Tout a fonctionné correctement** - Aucune action requise.`
      );
    }

    // Ajouter une note sur le coût
    if (status === 'failure') {
      recommendations.push(
        `💰 **COÛT ÉVITÉ: 25€** - Grâce aux vérifications en amont, aucun appel Mistral coûteux n'a été effectué inutilement.`
      );
    }

    return recommendations.length > 0 
      ? recommendations.map(r => `- ${r}`).join('\n') + '\n' 
      : '- Aucune recommandation\n';
  }

  /**
   * Retourne le chemin du fichier de log
   */
  getLogPath(): string {
    return this.outputPath;
  }

  /**
   * Retourne les métriques actuelles
   */
  getMetrics(): Metrics {
    return {
      duration: new Date().getTime() - this.startTime.getTime(),
      mistralCalls: this.metrics.mistralCalls || 0,
      filesGenerated: this.metrics.filesGenerated || 0,
      errors: this.metrics.errors || 0,
      tokensUsed: this.metrics.tokensUsed,
    };
  }
}

// =============================================================================
// 🎯 INSTANCE SINGLETON
// =============================================================================

let loggerInstance: GenerationLogger | null = null;

/**
 * Récupère ou crée l'instance du logger
 * @param date Date de génération (format YYYY-MM-DD)
 * @param runId ID du workflow (utilise GITHUB_RUN_ID si disponible)
 */
export function getLogger(date?: string, runId?: string): GenerationLogger {
  if (!loggerInstance) {
    const actualDate = date || process.env.DATE || new Date().toISOString().split('T')[0];
    const actualRunId = runId || process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
    loggerInstance = new GenerationLogger(actualDate, actualRunId);
  }
  return loggerInstance;
}

/**
 * Finalise le logger et réinitialise l'instance
 */
export function finalizeLogger(status: 'success' | 'failure' | 'partial', customMetrics?: Partial<Metrics>): void {
  if (loggerInstance) {
    loggerInstance.finalize(status, customMetrics);
    loggerInstance = null;
  }
}

/**
 * Réinitialise l'instance (utile pour les tests)
 */
export function resetLogger(): void {
  loggerInstance = null;
}

// =============================================================================
// 📊 FONCTIONS UTILITAIRES POUR LE LOGGING DES APPELS API
// =============================================================================

/**
 * Wrapper pour logger les appels API Mistral
 */
export async function logMistralCall<T>(
  fn: () => Promise<T>,
  description: string,
  step?: string
): Promise<T | null> {
  const logger = getLogger();
  const startTime = Date.now();
  
  try {
    logger.info(`Appel Mistral: ${description}`, undefined, step);
    const result = await fn();
    const durationMs = Date.now() - startTime;
    
    logger.success(`Appel Mistral réussi: ${description}`, undefined, step, durationMs);
    logger.incrementMistralCalls();
    
    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error(`Appel Mistral échoué: ${description}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, step, durationMs);
    
    logger.incrementMistralCalls(); // Compter même les échecs
    throw error;
  }
}

/**
 * Wrapper pour logger les appels API génériques
 */
export async function logApiCall<T>(
  fn: () => Promise<T>,
  url: string,
  method: string = 'GET',
  step?: string
): Promise<T | null> {
  const logger = getLogger();
  const startTime = Date.now();
  
  try {
    logger.info(`Appel API ${method} ${url}`, undefined, step);
    const result = await fn();
    const durationMs = Date.now() - startTime;
    
    logger.success(`Appel API réussi: ${method} ${url}`, undefined, step, durationMs);
    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error(`Appel API échoué: ${method} ${url}`, {
      error: error instanceof Error ? error.message : String(error),
    }, step, durationMs);
    
    throw error;
  }
}

// =============================================================================
// 🎯 EXPORT POUR UTILISATION DIRECTE
// =============================================================================

export { GenerationLogger, LogLevel, LogEntry, Metrics };
