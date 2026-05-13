# TODO - Optimisations & Améliorations

## 🎯 Priorités

### ✅ En cours / Terminé
- [x] **Option 1 : Cache en mémoire** pour les données culturelles dans `lib/cultural-context.ts`
  - `getMedicinalPlant`, `getResistancePratique`, `getResistanceObjet`
  - `getSignFaune`, `getSignFlore`, `getSignLieu`
  - `getAmbianceBienetre`, `getAmbianceBeaute`, `getAmbianceEsprit`, `getAmbianceMaison`, `getAmbianceJardinage`
  - Utilise une `Map<string, any>` pour éviter les recalculs inutiles

---

## 📋 Backlog

### 🔄 Optimisation Cache (Option 3)
**Objectif :** Pré-calculer les données culturelles lors de la génération programmée pour éviter TOUS les calculs à la volée.

- [ ] **Modifier `netlify/functions/generate-horoscopes.mts`**
  - Pré-calculer et stocker les données culturelles pour tous les signes de la journée
  - Structure : `{ date: string; signs: Record<signId, { medicinal, faune, flore, lieu, pratique, objet }> }`
  - Stocker dans Netlify Blobs avec clé `cultural|${date}`

- [ ] **Modifier `app/api/horoscope/[sign]/route.ts`**
  - Récupérer les données culturelles pré-calculées depuis Netlify Blobs
  - Fallback sur le cache en mémoire si non trouvé

- [ ] **Modifier `scripts/generate-horoscopes.ts`**
  - Même logique de pré-calcul pour la génération locale

**Bénéfices attendus :**
- ⚡ Éliminer 100% des calculs de hash à la volée
- 💰 Réduction des coûts Mistral (moins de temps d'attente)
- 🚀 Réponse API plus rapide

---

### 🎵 Audio / TTS
- [x] **Implémenté** `normalizeForTTS` dans `lib/tts-utils.ts`
  - Remplace `–`, `—` par `,`
  - Supprime `«`, `»`, `*`, `[`, `]`, `…`
  - Normalise `°C` → `degrés Celsius`, `°F` → `degrés Fahrenheit`
  - Nettoie espaces et ponctuation
- [x] Intégré dans `app/api/tts/route.ts`

### 🌙 Heure du navigateur
- [x] **Ajout de l'édition "nuit"** (0h-6h)
  - `EDITION_CONFIGS.nuit` avec `moment: 'cette nuit'`
  - `detectEditionWithNight()` pour détecter la nuit
  - `EDITION_LABELS` et `getDynamicEditionLabels` mis à jour
- [x] **Contexte temporel dans le prompt**
  - Date et heure du navigateur passées au backend
  - `buildHoroscopeUserPrompt` accepte `date` et `hour` optionnels
  - Frontend envoie `userDate` et `userHour` dans les requêtes
- [x] **Types mis à jour**
  - `HoroscopeResponse.edition` inclut `'nuit'`
  - `EditionWithNight` exporté depuis `lib/edition.ts`

---

### 📝 Configuration & Nettoyage
- [ ] Ajouter `data/` au `.gitignore`
- [ ] Vérifier que `data/horoscopes/` n'est pas commité
- [ ] Nettoyer les anciens fichiers de test dans `data/`

---

### 🧪 Tests & Validation
- [ ] Tester le cache en mémoire localement
- [ ] Vérifier que la génération des 36 horoscopes fonctionne toujours
- [ ] Tester l'API `GET /api/horoscope/[sign]` avec le cache
- [ ] Valider que les données culturelles sont bien réutilisées entre appels

---

### 🚀 Déploiement
- [ ] Pousser les changements sur GitHub pour déclencher Netlify
- [ ] Vérifier que la Netlify Scheduled Function fonctionne toujours
- [ ] Monitorer les logs pour détecter d'éventuelles erreurs de cache

---

## 📊 Métriques d'Amélioration

| Métrique | Avant | Après Option 1 | Après Option 3 |
|----------|-------|----------------|----------------|
| Calculs de hash | 11 × 36 × 3 = 1188/jour | ~0 (cache mémoire) | 0 (pré-calculé) |
| Temps CPU | ~X ms | ~X/2 ms | ~X/4 ms |
| Latence API | ~Y ms | ~Y-10ms | ~Y-20ms |

---

## 🔗 Liens Utiles

- [Netlify Blobs Documentation](https://docs.netlify.com/store/blobs/)
- [Map MDN Documentation](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map)
