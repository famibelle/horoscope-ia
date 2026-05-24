# 📋 Notes de Debug - Session du 24 Mai 2026

## Contexte Initial

**Problème signalé** : Le message `⚠️ Les esprits de Karukera sont temporairement voilés pour ...` apparaît régulièrement, preuve que le JSON généré n'est pas pris en compte.

**Source complémentaire** : https://horoscope-karukera.netlify.app/data/horoscopes/2026-05-24.json

**Observation** : Le site est consulté partout dans le monde → **c'est l'heure du visiteur qui compte**, pas celle de la Guadeloupe.

---

## Diagnostic des Causes Racines

### ✅ Ce qui fonctionne
1. Le script `scripts/generate-horoscopes.ts` génère bien les fichiers JSON
2. Les fichiers sont sauvegardés dans `public/data/horoscopes/`
3. Le fichier `2026-05-24.json` existe et contient toutes les clés attendues
4. Format des clés : `{date}|{signId}|{edition}` ex: `2026-05-24|belier|nuit`

### ❌ Problèmes identifiés

#### 1. **Accès filesystem impossible en production (Netlify Serverless)**
- `horoscope-file-cache.ts` essaie `fs.access()` en premier
- **En production Netlify (serverless functions) : `fs` NE FONCTIONNE PAS**
- Résultat : Passage immédiat à l'étape 2 (fetch HTTP)
- **IMPACT** : En production, l'étape 1 échoue TOUJOURS

#### 2. **Fetch HTTP peut échouer**
- URL construite : `https://horoscope-karukera.netlify.app/data/horoscopes/2026-05-24.json`
- Causes d'échec possibles :
  - Fichier pas encore déployé (délai entre génération et déploiement)
  - Problème de cache CDN Netlify
  - Erreur 404 si le fichier n'existe pas
  - Timeout réseau
- **IMPACT** : Si le fetch échoue, passage à Netlify Blobs puis Mistral

#### 3. **Génération non synchronisée avec le déploiement**
- Le script `generate-horoscopes.ts` doit être exécuté AVANT le build
- Si le déploiement se fait sans les fichiers du jour → 404 garanti
- **IMPACT** : Les visiteurs voient le fallback

#### 4. **Pas de mécanisme de régénération automatique**
- Si le fichier du jour est manquant, pas de tentative de génération à la volée
- On tombe directement sur Mistral (lent, coûteux) puis sur le fallback
- **IMPACT** : Expérience utilisateur dégradée

#### 5. **Problème de timezone : Heure Guadeloupe vs Heure visiteur**
- Le code actuel utilise `todayGuadeloupe()` qui calcule UTC-4
- **MAIS** le site est consulté partout dans le monde
- **NOUVEAU REQUIS** : Utiliser l'heure du visiteur (passée dans les params ou détectée)
- La date dans l'URL doit correspondre à la date **locale du visiteur**

---

## Architecture Actuelle

```
Requête API → route.ts
   │
   ├─ 1. loadHoroscopeData() [filesystem + fetch HTTP]
   │     ├─ filesystem (dev seulement) → ÉCHOUERA en prod
   │     └─ fetch HTTP → peut échouer (404, cache, timeout)
   │
   ├─ 2. Netlify Blobs cache → peut être vide
   │
   ├─ 3. Appel Mistral → lent, coûteux, peut échouer
   │
   └─ 4. Fallback statique → "Les esprits de Karukera sont temporairement voilés"
```

---

## Solution Architecture Cible

```
Requête API (avec date du visiteur) → route.ts
   │
   ├─ 1. loadHoroscopeData(dateVisiteur) [fetch HTTP avec retry + exponential backoff]
   │     └─ 3 tentatives espacées
   │
   ├─ 2. Netlify Blobs cache
   │
   ├─ 3. Génération à la volée (si ENABLE_ON_DEMAND_GENERATION)
   │     └─ Appel Mistral + sauvegarde dans Blobs + fichier local (dev)
   │
   └─ 4. Fallback INTELLIGENT (pas statique)
         ├─ Message : "Génération en cours, rafraîchissez dans 30s"
         ├─ Cache-Control: no-store, max-age=30
         └─ Lance la génération en arrière-plan
```

---

## Notes Techniques Importantes

### 1. Chemins des fichiers
- **Dev local** : `public/data/horoscopes/{date}.json`
- **Production** : `/data/horoscopes/{date}.json` (servi par Next.js static)
- Next.js copie `public/` vers `.next/` automatiquement

### 2. Variables d'environnement nécessaires
```env
MISTRAL_API_KEY=sk_...
NETLIFY_URL=https://horoscope-karukera.netlify.app
ENABLE_ON_DEMAND_GENERATION=true
ENABLE_BACKGROUND_GENERATION=true
```

### 3. Problème de date identifié
- Actuellement : `todayGuadeloupe()` = date en UTC-4
- **NOUVEAU** : Doit accepter une date passés en paramètre (date du visiteur)
- Exemple : Un visiteur à Paris (UTC+2) à 23h voit la date du 24 mai
- Un visiteur à Tokyo (UTC+9) à 08h voit déjà le 25 mai
- **La date doit être celle du visiteur, pas de la Guadeloupe**

### 4. Structure des données
```json
{
  "2026-05-24|belier|nuit": {
    "ouverture": "...",
    "amour": "...",
    "travail": "...",
    "argent": "...",
    "amitie": "...",
    "sante": "",
    "prediction": "...",
    "conseil": "...",
    "signFr": "Bélier",
    "weather": "23–27°C, pluie modérée, vent faible (18 km/h)",
    "edition": "nuit",
    "teaser": "...",
    "source": "mistral"
  }
}
```

---

## Plan d'Action (10 étapes)

Voir le fichier `PLAN-DACTION-COMPLET.md` dans ce même dossier.

---

## État d'avancement

- [x] Analyse complète du code
- [x] Identification des causes racines
- [x] Création du dossier debug
- [ ] Implémentation Étape 1 (horoscope-file-cache.ts)
- [ ] Implémentation Étape 2 (prebuild script)
- [ ] Implémentation Étape 3 (route.ts avec génération à la volée)
- [ ] Implémentation Étape 4 (health endpoint)
- [ ] Implémentation Étape 5 (GitHub Actions)
- [ ] Implémentation Étape 6 (next.config.ts)
- [ ] Implémentation Étape 8 (netlify.toml)
- [ ] Implémentation Étape 9 (verify script)
- [ ] Implémentation Étape 10 (documentation)

---

## Commandes utiles pour tests

```bash
# Tester le fetch direct
curl https://horoscope-karukera.netlify.app/data/horoscopes/2026-05-24.json | jq 'keys | length'

# Tester l'API
curl https://horoscope-karukera.netlify.app/api/horoscope/belier

# Tester avec une date spécifique
curl "https://horoscope-karukera.netlify.app/api/horoscope/belier?date=2026-05-24"

# Générer les horoscopes
npm run generate-horoscopes -- --force --verbose

# Build complet
npm run build
```

---

*Notes prises à : 2026-05-24 (session de debug)*
*Contexte : Problème récurrent de fallback sur les horoscopes*
