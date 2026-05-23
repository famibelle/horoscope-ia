# Génération des Ambiance - Documentation Technique

## 📌 Contexte

### Problème initial
L'API `/api/ambiance/[sign]` appelait **Mistral à chaque requête**, entraînant un temps de réponse de **~4 secondes** pour les utilisateurs.

### Objectif
Réduire le temps de réponse à **~50-200ms** en pré-générant les ambiances comme les horoscopes.

---

## ✅ Solutions Implémentées

### 1. Script de Génération : `scripts/generate-ambiances.ts`

**Fonctionnement :**
- Génère **48 ambiances par jour** (12 signes × 4 éditions : nuit, matin, midi, soir)
- Appelle Mistral **mistral-small-latest** avec un délai de **5 secondes** entre chaque requête
- Stocke les résultats dans `public/data/ambiance/YYYY-MM-DD.json`

**Arguments CLI :**
```bash
# Générer pour aujourd'hui
npm run generate-ambiances -- --force

# Générer pour une date spécifique
npm run generate-ambiances -- --date=2026-05-23 --force

# Mode verbose
npm run generate-ambiances -- --verbose --force
```

**Temps estimé :** ~12-15 minutes (48 appels × 5s de délai + temps Mistral)

---

### 2. Intégration GitHub Actions

**Workflow :** `.github/workflows/generate-horoscopes.yml`

**Modifications :**
- Renommé : "Générer les horoscopes **et ambiances** quotidiens"
- Ajout d'une étape après la génération des horoscopes :
  ```yaml
  - name: Générer les ambiances
    env:
      MISTRAL_API_KEY: ${{ secrets.MISTRAL_API_KEY }}
    run: npx tsx scripts/generate-ambiances.ts $ARGS
  ```
- Commit des deux types de fichiers :
  ```yaml
  git add public/data/horoscopes/*.json public/data/ambiance/*.json
  ```

**Planification :** Tous les jours à 4h UTC (minuit heure Guadeloupe)

---

### 3. Optimisation de l'API : `/api/ambiance/[sign]/route.ts`

**Stratégie de cache à 3 niveaux :**

```
1️⃣  Fichier statique  →  ~50-200ms  (public/data/ambiance/YYYY-MM-DD.json)
     ↓ (si non trouvé)
2️⃣  Netlify Blobs     →  ~500ms     (cache persistant)
     ↓ (si non trouvé)
3️⃣  Cache mémoire      →  ~100ms     (dev local)
     ↓ (si non trouvé)
4️⃣  Appel Mistral      →  ~4 secondes (génération à la demande)
```

**Clé de cache :** `${date}|${signId}|${edition}` (ex: `2026-05-23|lion|midi`)

---

## 📊 Structure des Données Ambiance

### Format du fichier `public/data/ambiance/YYYY-MM-DD.json`

```json
{
  "2026-05-23|belier|nuit": {
    "ambiance": "2-3 phrases sur l'énergie du jour, ancrées dans les références culturelles...",
    "chiffrePorteBonheur": 47,
    "compatibilite": ["taureau", "vierge"],
    "lune": {
      "bienetre": "conseil bien-être ancré sur le rimèd razié du jour : [nomCr] ([nomFr]) — [usage]...",
      "beaute": "conseil beauté/soin naturel ancré sur la plante du jour : [nomCr] ([nomFr]) — [culture]...",
      "esprit": "conseil mental ou spirituel ancré sur l'objet ou lieu de résistance du jour : [nomCr] ([nomFr]) — [dimension]...",
      "maison": "conseil maison/espace de vie créole ancré sur l'objet ou pratique du jour : [nomCr] ([nomFr]) — [dimension]...",
      "jardinage": "conseil jardinage créole ancré sur la plante du jour : [nomCr] ([nomFr]) — [culture]..."
    },
    "scores": {
      "amour": 85,
      "travail": 72,
      "bienetre": 68,
      "vieSociale": 90,
      "finances": 55
    }
  },
  "2026-05-23|belier|matin": { ... },
  "2026-05-23|belier|midi": { ... },
  "2026-05-23|belier|soir": { ... },
  "2026-05-23|taureau|nuit": { ... },
  // ... 48 entrées total (12 signes × 4 éditions)
}
```

### Liste complète des rubriques

#### 📍 **Niveau racine** (5 champs)
| Rubrique | Type | Description |
|---------|------|-------------|
| `ambiance` | string | Texte de 2-3 phrases sur l'énergie du jour |
| `chiffrePorteBonheur` | number | Entier 1-99 (préférence nombres premiers) |
| `compatibilite` | string[] | Tableau de 2 signes astrologiques compatibles |
| `lune` | object | 5 conseils basés sur les cycles lunaires |
| `scores` | object | 5 scores énergétiques (0-100) |

#### 🌙 **Sous-rubrique `lune`** (5 champs)
| Rubrique | Type | Source culturelle | Description |
|---------|------|-------------------|-------------|
| `bienetre` | string | rimèd razié du jour | Conseil bien-être avec nom créole, nom français et usage pour le corps |
| `beaute` | string | plante du jour | Conseil beauté/soin naturel avec nom créole, nom français et dimension culturelle |
| `esprit` | string | objet/lieu de résistance | Conseil mental/spirituel avec nom créole, nom français et dimension |
| `maison` | string | objet/pratique du jour | Conseil maison/espace de vie avec nom créole, nom français et dimension |
| `jardinage` | string | plante du jour | Conseil jardinage avec nom créole, nom français et culture |

#### 📈 **Sous-rubrique `scores`** (5 champs)
| Rubrique | Type | Description |
|---------|------|-------------|
| `amour` | number | Score énergétique amour (0-100) |
| `travail` | number | Score énergétique travail (0-100) |
| `bienetre` | number | Score énergétique bien-être (0-100) |
| `vieSociale` | number | Score énergétique vie sociale (0-100) |
| `finances` | number | Score énergétique finances (0-100) |

**Total : 15 champs par ambiance**

---

## 🔧 Configuration Requise

### Variables d'environnement
- `MISTRAL_API_KEY` : Clé API Mistral (déjà configurée dans GitHub Secrets)

### Dependencies
- `@netlify/blobs` : Pour le cache de fallback (déjà installé)
- `fs/promises`, `path` : Modules Node.js natifs

---

## 🚀 Impact sur les Performances

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Temps 1ère requête | ~4 secondes | ~50-200ms | **95% plus rapide** |
| Appels Mistral/jour | 1 par requête | 48 par jour | **Réduction massive** |
| Fiabilité | Dépend de Mistral | Fichiers statiques | **100% disponible** |
| Coût | Variable | Fixe (48 appels/jour) | **Optimisé** |

---

## 🧪 Test et Débogage

### Tester localement

```bash
# Générer les ambiances pour une date
npx tsx scripts/generate-ambiances.ts --date=2026-05-23 --force --verbose

# Vérifier le fichier généré
ls -lh public/data/ambiance/2026-05-23.json

# Compter les entrées
node -e "const d=require('./public/data/ambiance/2026-05-23.json'); console.log(Object.keys(d).length, 'entrées')"
```

### Vérifier le format

```bash
# Afficher la structure d'une entrée
node -e "const d=require('./public/data/ambiance/2026-05-23.json'); console.log(JSON.stringify(d['2026-05-23|belier|nuit'], null, 2))"
```

---

## 📝 Notes Techniques

1. **Délai entre appels Mistral** : 5 secondes pour éviter le rate limiting
2. **Modèle utilisé** : `mistral-small-latest` (plus rapide et moins cher que large)
3. **Température** : 0.8 (équilibre entre créativité et cohérence)
4. **Max tokens** : 900 (suffisant pour toutes les rubriques)
5. **Format de réponse** : `response_format: { type: 'json_object' }` (JSON valide garanti)

---

## 🔄 Backwards Compatibility

L'API `/api/ambiance/[sign]` conserve une **stratégie de fallback** :
1. Fichier statique (nouveau)
2. Netlify Blobs (cache existant)
3. Cache mémoire (dev local)
4. Appel Mistral (dernier recours)

Cela garantit que le site continue de fonctionner même si :
- Le fichier statique est manquant
- Netlify Blobs est indisponible
- Le script de génération échoue

---

## 📅 Maintenance

### Pour ajouter une nouvelle rubrique
1. Modifier le prompt dans `scripts/generate-ambiances.ts`
2. Mettre à jour la structure dans cette documentation
3. Tester avec `--force` pour régénérer

### Pour modifier le format
1. Modifier le prompt et le parsing dans le script
2. Vérifier que l'API `/api/ambiance/[sign]` retourne le bon format
3. Tester avec une date spécifique

---

*Documentation générée par Mistral Vibe - 2026-05-23*
