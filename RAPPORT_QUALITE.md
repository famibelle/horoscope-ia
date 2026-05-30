# Rapport Qualité — Horoscopes Karukera
**Date des tests** : 2026-05-30 | **Édition** : matin  
**Signes** : Gémeaux, Lion, Capricorne  
**Code** : branche `vaudou` — commits locaux non poussés

---

## Résultats — correction structurelle

| Vérification | Gémeaux | Lion | Capricorne |
|---|:---:|:---:|:---:|
| Tiret cadratin `—` | ✅ | ✅ | ✅ |
| Bougie / flamme | ✅ | ✅ | ✅ |
| Loa unique | ✅ Legba | ✅ Ezili | ✅ Kafou |
| `vèvè` ≤ 1 occurrence | ✅ | ✅ | ✅ |
| `ka` ≤ 2 occurrences | ✅ 1 | ✅ 2 | ✅ 0 |
| Sève absente d'argent | ✅ | ✅ | ✅ |
| faune depuis la base | ✅ Fwou-fwou | ✅ Pélikan | ✅ Chouèt/Fòmi/Kabrit |
| flore depuis la base | ✅ Lavand wouj | ✅ Balisié | ✅ Chadon béni |
| **Données base citées dans argent** | ✅ | ✅ | ✅ |
| **Données base citées dans amour** | ✅ | ✅ | ✅ |

---

## Impact de la correction structurelle

### Avant → Après dans argent

| Signe | Avant (sève) | Après (sign-specific) |
|---|---|---|
| Capricorne | *"Lajan circule comme la sève du chadon béni"* | *"Le kabrit nwè sait qu'il faut parfois se sacrifier pour nourrir le troupeau"* |
| Gémeaux | *"Lajan circule comme la sève dans le gommier"* | *"Fwou-fwou ne stocke pas son nectar, il le récolte au jour le jour"* |
| Lion | *"Lajan circule comme la sève dans le flamboyant"* | *"Observe le gran pélikan plonger pour attraper son poisson, précis et déterminé"* |

Les trois métaphores sont maintenant différentes et propres à chaque signe.

### Avant → Après dans amour (Gémeaux)

- Avant : *"Ton cœur bat au rythme du ka, léger comme un fwou-fwou"* (ka générique)
- Après : *"Fwou-fwou danse dans l'Alpinia humide, ses ailes légères comme un cœur qui hésite entre deux fleurs"* (faune + flore du signe)

---

## Problèmes résiduels

### 1. Génériques "vent" et "danse" persistent — 2/3 signes

Le modèle utilise encore "vent" et "danse" malgré les interdictions. Deux cas :
- `vent` dans travail : *"le vent porte tes idées loin"* (Lion) — image générique
- `danse` dans amour : *"Fwou-fwou danse dans l'Alpinia"* (Gémeaux) — ici le mot est justifié (le colibri danse de fleur en fleur)

**Nuance importante** : "danse" dans le contexte du fwou-fwou est une métaphore propre au signe, pas une image générique. Mon checker est trop strict sur ce mot.

### 2. "la pluie trace un vèvè" — persiste pour Lion

Malgré l'interdiction explicite, Lion ouverture utilise encore : *"la pluie trace un vèvè d'Ezili Freda sur les feuilles de balisié"*. La phrase est enrichie (elle utilise balisié et Ezili) mais conserve le pattern interdit.

### 3. "comme les branches" remplace "comme les racines"

Capricorne amitie : *"Les amis sont comme les branches du gommié blan, solides mais flexibles"*. Le modèle a substitué "branches" à "racines" — même structure, autre mot. La règle a changé le vocabulaire mais pas la logique.

### 4. Teasers — nette amélioration

- Capricorne : *"la pluie trace sur ta peau les signes sacrés de Kafou"* — Kafou ✅
- Gémeaux : *"la pluie trace un kawoubouyé sous tes pas"* — symbole créole ✅
- Lion : *"le gran pélikan te murmure à l'oreille"* — animal du signe ✅
- **ka absent des 3 teasers** ✅ (était 7/12 signes avant)

---

## Observations générales

### Ce qui fonctionne maintenant
- **argent** : métaphores sign-specific dans 3/3 cas — le changement le plus visible
- **faune/flore en base utilisés** : chaque signe cite ses animaux/plantes assignés
- **ka** : réduit à 0-2 par signe (était 9/12 teasers avec "ka")
- **loas** : distribution correcte, un seul par signe

### Ce qui résiste
- Quelques images génériques (vent, vague, mer) persistent dans travail et prediction
- Le pattern "la pluie → symbole sacré" dans ouverture est très ancré
- "comme les [parties d'arbre]" dans amitie change de mot mais garde la structure

### Analyse du mécanisme
Le modèle a **un répertoire limité de structures narratives** qu'il applique par section :
- ouverture → "la pluie [verbe] [symbole vaudou]"  
- amitie → "les liens sont comme les [parties d'arbre]"
- travail → "Aujourd'hui, [verbe] comme [animal/force naturelle]"

Ces structures persistent même quand les mots changent. La vraie diversité nécessiterait de contraindre aussi les **structures syntaxiques**, pas seulement le vocabulaire.

---

## Recommandations

| Priorité | Action | Type |
|---|---|---|
| Moyenne | Interdire le pattern "la pluie [verbe] [symbole]" dans ouverture — imposer une image sans pluie | Prompt |
| Moyenne | Imposer une structure différente pour amitie (pas "comme les [parties d'arbre]") | Prompt |
| Basse | Affiner le checker : "danse" acceptable quand associé à un animal spécifique | Analyse |
| Basse | Tester sur 12 signes complets après push | Tests |
