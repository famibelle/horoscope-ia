# Rapport Qualité — Horoscopes Karukera
**Date des tests** : 2026-05-29 | **Édition** : matin  
**Signes** : Gémeaux, Lion, Capricorne | **Itérations** : 3  
**Code** : branche `vaudou` — commits locaux non poussés

---

## Résultats finaux — Itération 3

| Vérification | Gémeaux | Lion | Capricorne |
|---|:---:|:---:|:---:|
| Tiret cadratin `—` | ✅ | ✅ | ✅ |
| `tambour` → `ka` | ✅ | ✅ | ✅ |
| `le lajan` | ✅ | ✅ | ✅ |
| Apostrophes | ✅ | ✅ | ✅ |
| Bougie / flamme | ✅ | ✅ | ✅ |
| `vèvè` ≤ 1 occurrence | ✅ | ✅ | ✅ |
| Histoire dans argent | ✅ | ✅ | ✅ |
| Mois futur | ✅ | ✅ | ✅ |
| Legba dans son signe | ✅ | ✅ | ✅ |
| faune depuis la base | ✅ Fwou-fwou | ✅ Pélikan | ✅ Chouèt kabrit |
| flore depuis la base | ✅ Lavand wouj | ✅ Bèlizèl | ✅ Chadon béni |
| Données base utilisées dans le texte | ✅ alpinia | ✅ balisier | ✅ chadon béni, fòmi kabrit |

---

## Corrections validées sur les 3 itérations

### Itération 1 → 2
- **`fromager` et `colibri`** sur-représentés : cause trouvée (exemples nommés dans le prompt), supprimés. Résultat : fromager absent de Lion et Capricorne, colibri uniquement dans Gémeaux (son animal).
- **faune/floreEnrichies vides** pour 10/12 signes : `splitTokens()` ne gérait pas les noms composés avec `/` ni les parenthèses. Corrigé + `nomFrancais` ajouté au filtre faune. Lion passe de `floreEnrichies: []` à `['Bèlizèl / Balisié']`.
- **Legba dans 12/12 signes** : fallback `loa || 'Legba'` supprimé, règle prompt renforcée. Résultat : Legba uniquement dans Gémeaux.
- **Bougie dans 10/12 conseils** : règle étendue à toutes les sections (pas seulement "conseil").

### Itération 2 → 3
- **`vèvè` × 2 par horoscope** (Capricorne, Gémeaux) : règle prompt + `limitVeve()` post-processing. Résultat : 1 occurrence max, la 2e devient "signe sacré".
- **Lion sans flore** : `CREOLE_VARIANTS` corrige `balizié → balisié` (écart consonantique z/s).

---

## Observations résiduelles

### 1. Fuite de loa — Ezili dans Gémeaux (amour)

> *"comme si Ezili Freda y avait posé ses doigts de miel"* — Gémeaux, section amour

Ezili Freda est le loa du Lion, pas du Gémeaux (Legba). Le modèle associe Ezili à l'amour indépendamment du signe. La règle "un seul loa" est respectée pour Legba (cité dans ouverture), mais Ezili s'infiltre dans amour.

**Cause** : Ezili est culturellement liée à l'amour dans le vaudou — le modèle fait l'association thématique amour → Ezili sans consulter le contexte du signe.

---

### 2. Métaphore "sève" répétée dans argent sur les 3 signes

| Signe | Argent |
|---|---|
| Capricorne | *"Lajan circule comme la sève du chadon béni"* |
| Gémeaux | *"Lajan circule aujourd'hui comme la sève dans l'alpinia"* |
| Lion | *"Lajan coule aujourd'hui comme la sève du gommier blanc"* |

La structure `Lajan [verbe] comme la sève de [plante]` est utilisée pour les 3 signes. Les plantes sont différentes (données de la base), mais la métaphore est identique. Un lecteur qui lit plusieurs signes percevra la répétition.

---

### 3. Structure répétitive dans travail

Les 3 signes utilisent la même construction dans travail :
> *"Aujourd'hui, [verbe] comme [animal/nature], [leçon courte]"*

- Capricorne : *"sois comme la fòmi kabrit, travailleuse infatigable"*
- Gémeaux : *"ton esprit est vif comme le vent"*
- Lion : *"plane comme le gran pélikan"*

---

### 4. Taureau et Scorpion sans faune (absence réelle en base)

Le bœuf créole (Taureau) et le scarabée Hercule (Scorpion) ne sont pas dans `faune-data`. Ces signes improviseront leurs symboles animaux depuis l'entraînement du modèle. Non corrigeable sans enrichir la base.

---

## Recommandations prioritaires

| Priorité | Action | Type |
|---|---|---|
| Haute | Interdire Ezili dans les signes non-Lion (amour → loa du signe uniquement) | Prompt |
| Moyenne | Varier la métaphore argent — interdire "sève" comme image unique | Prompt |
| Moyenne | Enrichir `faune-data` : bœuf créole (Taureau), scarabée Hercule (Scorpion) | Données |
| Basse | Varier la structure travail — éviter "Aujourd'hui, [verbe] comme [X]" systématique | Prompt |
