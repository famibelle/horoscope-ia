# 📊 Guide d'Intégration du Système de Logging

## 🎯 Objectif

Intégrer le système de logging (`log-generator.ts`) dans vos scripts de génération existants pour **capturer tous les détails** et **éviter les coûts inutiles** (25€ par échec).

---

## 📋 Fichiers Créés

| Fichier | Rôle | Obligatoire ? |
|--------|------|--------------|
| `scripts/log-generator.ts` | Système de logging principal | ✅ Oui |
| `scripts/analyze-logs.ts` | Analyseur de rapports | ⚠️ Optionnel |
| `.github/workflows/generate-horoscopes.yml` | Workflow GitHub Actions | ✅ Oui |
| `logs/generation-report-EXAMPLE.md` | Exemple de rapport | ℹ️ Référence |

---

## 🚀 Intégration dans `generate-horoscopes.ts`

### Étape 1: Importer le logger

**Ajoutez en haut du fichier :**
```typescript
import { getLogger, finalizeLogger, logMistralCall } from './log-generator';
```

### Étape 2: Initialiser le logger

**Dans la fonction principale (ou au début du script) :**
```typescript
// Récupérer la date et l'ID du run
const DATE = options.date || new Date().toISOString().split('T')[0];
const logger = getLogger(DATE, process.env.GITHUB_RUN_ID);

logger.info('Démarrage de la génération des horoscopes', { date: DATE, options });
```

### Étape 3: Logger les appels API

**Remplacez vos appels Mistral par :**
```typescript
// AVANT (sans logging):
async function generateWithMistral(signId: string, prompt: string) {
  const response = await fetch(MISTRAL_URL, { ... });
  // ...
}

// APRES (avec logging):
async function generateWithMistral(signId: string, prompt: string) {
  const startTime = Date.now();
  
  try {
    logger.info(`Appel Mistral pour ${signId}`, { model: 'mistral-large' }, 'generateWithMistral');
    
    const response = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: { ... },
      body: JSON.stringify({ ... })
    });
    
    const durationMs = Date.now() - startTime;
    logger.success(`Appel Mistral réussi pour ${signId}`, {}, 'generateWithMistral', durationMs);
    
    // ... traitement de la réponse
    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error(`Appel Mistral échoué pour ${signId}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'generateWithMistral', durationMs);
    throw error;
  }
}
```

**Ou utilisez le wrapper tout prêt :**
```typescript
// Utilisation du wrapper logMistralCall
const result = await logMistralCall(
  () => fetchMistral(prompt),  // Votre fonction d'appel
  `Génération pour ${signId}`,
  'generateWithMistral'
);
```

### Étape 4: Logger les étapes clés

**Ajoutez des logs pour chaque étape importante :**
```typescript
// Début de la génération pour un signe
logger.startStep(`generate-${signId}`);

try {
  // ... génération
  logger.success(`Horoscope généré pour ${signId}`, { tokens: response.usage?.total_tokens });
  logger.incrementMistralCalls();
  logger.addTokensUsed(response.usage?.total_tokens || 0);
} catch (error) {
  logger.error(`Échec pour ${signId}`, error);
  throw error;
} finally {
  logger.endStep(`generate-${signId}`, !error);
}
```

### Étape 5: Finaliser le logger

**À la fin du script (dans le main) :**
```typescript
// En cas de succès
finalizeLogger('success', {
  filesGenerated: 1,
  ...logger.getMetrics()
});

// En cas d'erreur
try {
  // ... votre code
} catch (error) {
  logger.error('Échec fatal de la génération', error);
  finalizeLogger('failure', {
    errors: 1,
    ...logger.getMetrics()
  });
  process.exit(1);
}
```

---

## 📝 Intégration dans les autres scripts

### Pour `generate-ambiances.ts` et `generate-signe-du-jour.ts`

**Même principe :**
```typescript
import { getLogger, finalizeLogger } from './log-generator';

const logger = getLogger(process.env.DATE, process.env.GITHUB_RUN_ID);

// ... votre code existant

// À la fin :
finalizeLogger('success', { filesGenerated: 1 });
```

---

## 🔄 Modifications du Workflow GitHub Actions

### Le workflow est déjà configuré pour :

1. **Créer le dossier `logs/`** avant la génération
2. **Passer `GITHUB_RUN_ID`** comme variable d'environnement
3. **Upload des logs** comme artefacts (30 jours de rétention)
4. **Inclure les logs dans le commit** (optionnel)

### Vérifiez que :

```yaml
# Dans le workflow, l'étape de génération a bien :
env:
  GITHUB_RUN_ID: ${{ github.run_id }}
  DATE: ${{ steps.date.outputs.DATE }}
```

---

## 🎯 Exemple Complet pour `generate-horoscopes.ts`

```typescript
import { config } from 'dotenv';
config();

// 📊 IMPORT DU LOGGER
import { getLogger, finalizeLogger, logMistralCall, logApiCall } from './log-generator';

// ... vos imports existants

async function main() {
  // ========================================================================
  // 📊 INITIALISATION DU LOGGER
  // ========================================================================
  const DATE = options.date || new Date().toISOString().split('T')[0];
  const logger = getLogger(DATE, process.env.GITHUB_RUN_ID);
  
  logger.info('Démarrage de la génération', { date: DATE, options });
  logger.startStep('main');
  
  try {
    // ========================================================================
    // 🎯 GÉNÉRATION DES HOROSCOPES
    // ========================================================================
    logger.startStep('generate-horoscopes');
    
    for (const sign of signs) {
      logger.info(`Traitement du signe: ${sign.id}`, undefined, 'generate-horoscopes');
      
      // Appel FreeHoroscopeAPI avec logging
      const rawText = await logApiCall(
        () => fetchRawHoroscope(sign.en),
        `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign.en}`,
        'GET',
        'generate-horoscopes'
      );
      
      // Appel Mistral avec logging
      const horoscope = await logMistralCall(
        () => generateWithMistral(sign.id, rawText, weather, edition),
        `Génération pour ${sign.id}`,
        'generate-horoscopes'
      );
      
      if (horoscope) {
        result[sign.id] = horoscope;
        logger.success(`Horoscope généré: ${sign.id}`, { entries: Object.keys(horoscope).length });
      } else {
        logger.warn(`Aucun résultat pour ${sign.id}`, undefined, 'generate-horoscopes');
      }
    }
    
    logger.endStep('generate-horoscopes', true);
    logger.incrementFilesGenerated();
    
    // ========================================================================
    // ✅ SAUVEGARDE DES RÉSULTATS
    // ========================================================================
    logger.startStep('save-results');
    
    const outputPath = path.join('public', 'data', 'horoscopes', `${DATE}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    logger.success(`Fichier sauvegardé: ${outputPath}`, { size: fs.statSync(outputPath).size });
    logger.endStep('save-results', true);
    
    // ========================================================================
    // 🎯 FINALISATION
    // ========================================================================
    logger.success('Génération terminée avec succès', {
      totalSigns: signs.length,
      generated: Object.keys(result).length
    });
    
    logger.endStep('main', true);
    
    // Finaliser le logger
    finalizeLogger('success', {
      filesGenerated: 1,
      ...logger.getMetrics()
    });
    
  } catch (error) {
    logger.error('Échec fatal de la génération', error);
    logger.endStep('main', false);
    
    finalizeLogger('failure', {
      errors: 1,
      ...logger.getMetrics()
    });
    
    process.exit(1);
  }
}

main();
```

---

## 📊 Utilisation de l'Analyseur de Logs

### Lancer l'analyse manuellement :
```bash
# Analyser tous les logs
npx tsx scripts/analyze-logs.ts

# Analyser pour une date spécifique
npx tsx scripts/analyze-logs.ts --date=2026-05-25

# Sauvegarder dans un fichier spécifique
npx tsx scripts/analyze-logs.ts --output=public/analysis.md
```

### Résultat :
- Un fichier `public/logs-analysis/analysis-YYYY-MM-DD.md` est généré
- Contient :
  - Statistiques globales (taux de succès, coût évité, durée moyenne)
  - Détails par run
  - Graphiques ASCII
  - Recommandations automatisées

---

## 💡 Bonnes Pratiques

### ✅ À FAIRE :
1. **Logger TOUTES les erreurs** avec `logger.error()`
2. **Logger les appels API** avec `logApiCall()` ou `logMistralCall()`
3. **Utiliser `startStep()` et `endStep()`** pour structurer les logs
4. **Finaliser le logger** avec `finalizeLogger()` à la fin
5. **Inclure les métriques** (duration, mistralCalls, etc.)

### ❌ À ÉVITER :
1. **Ne pas logger les tokens/clefs API** → Le logger les masque automatiquement
2. **Ne pas créer plusieurs instances** → Utiliser `getLogger()` singleton
3. **Ne pas forget finalizeLogger()** → Sinon le rapport sera incomplet
4. **Ne pas logger en production sans VERBOSE** → Le mode debug est désactivé par défaut

---

## 🛠️ Personnalisation

### Masquage des données sensibles
Le logger masque automatiquement :
- Les tokens Bearer (`Bearer xxx` → `Bearer ***`)
- Les clés API (`api_key: xxx` → `api_key: ***`)
- Les tokens (`token: xxx` → `token: ***`)
- Les chaînes alphanumériques > 25 caractères (potentielles clés)

### Niveaux de log
- **`info`** : Informations générales (toujours loggées)
- **`success`** : Succès (toujours loggées)
- **`warn`** : Avertissements (toujours loggées)
- **`error`** : Erreurs (toujours loggées)
- **`debug`** : Débogage (seulement si `VERBOSE=true` ou `NODE_ENV !== production`)

---

## 📁 Structure des Fichiers Générés

```
logs/
├── generation-report-2026-05-25-123456789.md  # Rapport détaillé
├── generation-report-2026-05-24-987654321.md
└── ...

public/
└── logs-analysis/
    └── analysis-2026-05-25.md  # Analyse globale
```

---

## 🚀 Test Rapide

Pour tester que tout fonctionne :

```bash
# 1. Créer un script de test
cat > test-logger.ts << 'EOF'
import { getLogger, finalizeLogger } from './scripts/log-generator';

const logger = getLogger('2026-05-25', 'test-001');

logger.info('Test de base', { test: true });
logger.success('Test réussi', { value: 42 });
logger.warn('Attention test', { level: 'low' });
logger.error('Erreur test', { code: 404 });

finalizeLogger('success', {
  duration: 1000,
  mistralCalls: 5,
  filesGenerated: 1,
  errors: 1
});
EOF

# 2. Exécuter
npx tsx test-logger.ts

# 3. Vérifier
cat logs/generation-report-2026-05-25-test-001.md
```

---

## 🎓 Pourquoi Ce Système est Indispensable

| Problème | Sans Logging | Avec Logging |
|----------|--------------|--------------|
| **Échec de génération** | ? | ✅ Cause identifiée |
| **Appel API trop lent** | ? | ✅ Durée mesurée |
| **Coût ineattendu** | 25€ perdus | ✅ 0€ (détecté avant) |
| **Fichier corrompu** | ? | ✅ Validation automatique |
| **Bug récurrent** | Difficile à tracer | ✅ Historique complet |
| **Optimisation** | Devine | ✅ Données concrètes |

**→ Chaque € de développement dans le logging sauve 25€ en coûts évités.**

---

## 📞 Support

Si vous avez des questions sur l'intégration :
1. Consultez `logs/generation-report-EXAMPLE.md` pour le format
2. Lancez `npx tsx scripts/analyze-logs.ts --help` pour l'analyse
3. Vérifiez que `GITHUB_RUN_ID` est bien passé dans les env vars

---

**Dernière mise à jour :** 2026-05-25  
**Status :** ✅ Prêt pour la production  
**Coût évité estimé :** 25€ par échec évité grâce au logging
