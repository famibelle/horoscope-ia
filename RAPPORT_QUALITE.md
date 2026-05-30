# Rapport Qualité — Horoscopes Karukera
**Date des tests** : 2026-05-30 | **Édition** : matin  
**Signes** : Gémeaux, Lion, Capricorne | **Itérations** : 4 (3 sur 2026-05-29 + 1 finale sur 2026-05-30)  
**Code** : branche `vaudou` — commits locaux non poussés

---

## Résultats finaux

| Vérification | Gémeaux | Lion | Capricorne |
|---|:---:|:---:|:---:|
| Tiret cadratin `—` | ✅ | ✅ | ✅ |
| `tambour` → `ka` | ✅ | ✅ | ✅ |
| `le lajan` (article redondant) | ✅ | ✅ | ✅ |
| Apostrophes restaurées | ✅ | ✅ | ✅ |
| Bougie / flamme | ✅ | ✅ | ✅ |
| `vèvè` ≤ 1 occurrence | ✅ | ✅ | ✅ |
| Histoire absente d'argent | ✅ | ✅ | ✅ |
| Mois futur absent | ✅ | ✅ | ✅ |
| Loa unique (pas d'autre loa) | ✅ | ✅ | ✅ |
| Sève absente d'argent | ✅ | ✅ | ✅ |
| Artefact concat absent | ✅ | ✅ | ✅ |
| faune depuis la base | ✅ Fwou-fwou | ✅ Pélikan | ✅ Chouèt kabrit |
| flore depuis la base | ✅ Lavand wouj | ✅ Bèlizèl | ✅ Chadon béni |
| Données base dans le texte | ✅ | ✅ | ✅ |

---

## Corrections appliquées dans cette session

### Fuite de loa — Ezili dans Gémeaux, Damballa dans Gémeaux
**Itération 1 → 2** : Ezili (loa du Lion) apparaissait dans la section amour de Gémeaux. Damballa (sans `h`) contournait le filtre. Correction : règle prompt listant tous les loas interdits nommément, incluant Damballa/Damballah.

### Métaphore "sève" dans argent — 3/3 signes
**Itération 1 → 3** : `"Lajan circule comme la sève du [plante]"` utilisé pour les 3 signes avec des plantes différentes mais une structure identique. La prohibition prompt a été ignorée deux itérations consécutives. Solution finale : `removeSeve()` post-processing (regex capture jusqu'au point de fin de phrase).

**Résultat itération finale** :
- Capricorne argent : *"Lajan se déplace avec discernement aujourd'hui. Aujourd'hui, observe où l'argent s'infiltre dans ta vie, comme l'eau qui cherche les fissures"* ✅
- Gémeaux argent : *"Lajan circule aujourd'hui comme les graines de gommié blan emportées par le vent"* ✅ (modèle a trouvé sa propre métaphore)
- Lion argent : *"Lajan circule aujourd'hui comme les vagues sur les rochers de la côte"* ✅ (idem)

---

## Qualité générale observée

### Points forts
- **Ancrage dans la base de données** : les enrichissements faune/flore sont correctement utilisés dans le texte. Capricorne conseil utilise "chadon béni" (flore_enrichies), travail utilise "chouèt kabrit" et "fòmi kabrit" (faune_enrichies).
- **Loas assignés** : chaque signe cite son loa une seule fois, dans le bon contexte. Lion/Ezili dans amour ✅, Gémeaux/Legba dans ouverture ✅, Capricorne/Kafou dans conseil ✅.
- **Gémeaux amour** : *"Ton cœur bat comme les ailes du fwou-fwou, rapide et léger"* — métaphore issue directement de faune_enrichies.

### Observations résiduelles mineures

**1. "Lajan se déplace avec discernement aujourd'hui" est générique**
La phrase de substitution post-processing est neutre mais sans ancrage culturel. Elle remplace une mauvaise métaphore par une phrase acceptable mais sans caractère. À terme, une substitution sign-specific (basée sur l'animal) serait plus riche.

**2. Structure travail homogène**
Les 3 signes utilisent une construction similaire dans travail :
> *"Aujourd'hui, [verbe/animal/lieu comme comparant], [leçon]"*

Non bloquant — les comparants sont différents et propres à chaque signe.

**3. Taureau et Scorpion sans faune en base**
Le bœuf créole (Taureau) et le scarabée Hercule (Scorpion) sont absents de `faune-data`. Ces deux signes improviseront leurs symboles animaux depuis l'entraînement du modèle. Non corrigeable sans enrichir la base de données.

---

## Recommandations

| Priorité | Action | Type |
|---|---|---|
| Moyenne | Remplacer "Lajan se déplace avec discernement" par une métaphore sign-specific basée sur l'animal | Post-processing enrichi |
| Moyenne | Enrichir `faune-data` : bœuf créole (Taureau), scarabée Hercule (Scorpion) | Données |
| Basse | Varier la structure travail — éviter l'homogénéité des comparants | Prompt |
| Basse | Tester sur 12 signes complets pour vérifier que les corrections tiennent à l'échelle | Tests |
