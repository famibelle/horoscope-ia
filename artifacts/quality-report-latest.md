# ✅ Rapport Qualité — 7 jours glissants
**Période :** 2026-06-01 → 2026-06-02  
**Généré le :** 2026-06-02 01:05 UTC

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Horoscopes analysés | 128 |
| Ambiances analysées | 48 |
| Présages analysés | 1 |
| ⚠️ Alertes structurelles | 0 |
| ℹ️ Informations | 1 |

---

# Pass 0 — Analyse du Master Prompt

## 🔬 Analyse du Master Prompt

### 🌀 Loas partagés entre signes

> Un même loa injecté chez plusieurs signes le même jour garantit une répétition si le seuil est atteint.

| Loa | Nb signes | Signes |
|-----|-----------|--------|

### 📜 Pool Histoire pour la période

> `histoireEnrichies` est injecté **sans rotation par signe** (même 3 entrées pour les 12 signes).

**0 entrée(s)** correspondent à la période juin 2026 :

> ⚠️ Aucune entrée histoire pour cette période — le champ sera vide pour tous les signes.


### 🦎 Pool Faune (SACRÉ/EMBLÉMATIQUE)

**38 entrées** dans le pool global (après exclusions).
Le prompt injecte **6 animaux** par signe via rotation déterministe.

> ✅ Pool suffisant pour tous les signes (min = 32 entrées après exclusion du totem).


### 🌿 Pools Flore & Lieux

| Pool | Taille totale | Injecté par signe |
|------|--------------|-------------------|
| Flore | 95 | jusqu'à 8 (filtre par plante du signe) |
| Lieux | 101 | jusqu'à 5 (filtre par lieu du signe) |

### 🚫 Interdictions actives dans le prompt

| Catégorie | Interdiction |
|-----------|-------------|
| Sécurité | bougie, flamme, feu, encens |
| Créatures | soukougnan, zombi, loup-garou dans amour/amitie |
| Métaphores génériques | mer, vent, vague, racines, danse, chemin, "laisse-toi porter" |
| Usage créole | "le lajan", "la lajan", "l'lajan" → "lajan" seul |
| Répétitions internes | totem du signe max 1×, lieu max 1×, loa max 1×, ka max 2× |

### ⚠️ Lacunes structurelles identifiées

- **Pas de contrainte inter-signes** : le modèle génère chaque signe en isolation et ne sait pas ce que les autres signes ont reçu — impossibilité de se diversifier mutuellement.

- **Pool histoire trop petit** (0 entrée(s) pour juin 2026) : tous les signes reçoivent les mêmes références historiques.

---

# Pass 1 — Analyse Structurelle

## 🪐 Horoscopes

### 📊 Fréquences globales sur la période

> Sur **128 horoscopes**. 🔴 ≥30% · 🟠 ≥15% · 🟡 <15%

**🦎 Faune**

| Élément | Occurrences | % horoscopes |
|---------|------------|--------------|
| 🟠 **Igwann vèt / Igwann péyi** | 32 | 25% |
| 🟠 **Igwann péyi** | 32 | 25% |
| 🟠 **Fwou-fwou / Kolibri** | 32 | 25% |
| 🟠 **Pélikan / Gran pélikan** | 28 | 22% |
| 🟡 **Manman dlo / Lamantin** | 4 | 3% |
| 🟡 **Touloulou / Itouloulou** | 4 | 3% |
| 🟡 **Chouèt kabrit** | 4 | 3% |
| 🟡 **Fòmi kabrit** | 4 | 3% |
| 🟡 **Kabrit nwè** | 4 | 3% |
| 🟡 **Tòti karé / Caret** | 4 | 3% |
| 🟡 **Wasou / Ouassou** | 4 | 3% |
| 🟡 **Lambi** | 4 | 3% |
| 🟡 **Mangouste / Mongos** | 4 | 3% |

**🌿 Flore**

| Élément | Occurrences | % horoscopes |
|---------|------------|--------------|
| 🟠 **Flanbwayan** | 32 | 25% |
| 🟠 **Bèlizèl / Balisié** | 32 | 25% |
| 🟠 **Lavand wouj / Alpinia** | 32 | 25% |
| 🟡 **Ibiskis / Zòsèy** | 4 | 3% |
| 🟡 **Dachine** | 4 | 3% |
| 🟡 **Piman végétarien** | 4 | 3% |
| 🟡 **Chadon béni** | 4 | 3% |
| 🟡 **Korossolié** | 4 | 3% |
| 🟡 **Marakoudja** | 4 | 3% |
| 🟡 **Alowes** | 4 | 3% |
| 🟡 **Vaniy** | 4 | 3% |
| 🟡 **Brizée** | 4 | 3% |
| 🟡 **Sitwonèl** | 4 | 3% |

**🏔️ Lieux sacrés**

| Élément | Occurrences | % horoscopes |
|---------|------------|--------------|
| 🟠 **Pointe des Châteaux** | 32 | 25% |
| 🟠 **Pointe de la Grande Vigie** | 28 | 22% |
| 🟡 **Rivière Salée** | 4 | 3% |
| 🟡 **Grotte de la Petite Rivière Salée** | 4 | 3% |
| 🟡 **Carrefour de la Petite Rivière Salée** | 4 | 3% |
| 🟡 **Forêt de la Petite Rivière Salée** | 4 | 3% |
| 🟡 **Morne de la Petite Rivière Salée** | 4 | 3% |
| 🟡 **Grand Cul-de-Sac Marin** | 4 | 3% |
| 🟡 **La Soufrière** | 4 | 3% |
| 🟡 **Bains Jaunes / Bains chauds de la Soufrière** | 4 | 3% |
| 🟡 **Morne de la Soufrière (flanc est)** | 4 | 3% |
| 🟡 **Pointe Allègre** | 4 | 3% |
| 🟡 **Chutes du Carbet** | 4 | 3% |

**🌀 Loa**

| Élément | Occurrences | % horoscopes |
|---------|------------|--------------|
| 🟠 **Ogoun** | 32 | 25% |
| 🟠 **Legba** | 32 | 25% |
| 🟠 **Ezili Freda** | 28 | 22% |
| 🟡 **Adja** | 4 | 3% |
| 🟡 **Mami Dlo** | 4 | 3% |
| 🟡 **Kafou** | 4 | 3% |
| 🟡 **Marinette** | 4 | 3% |
| 🟡 **Gran Bwa** | 4 | 3% |
| 🟡 **Baron Samedi** | 4 | 3% |
| 🟡 **Azaka** | 4 | 3% |
| 🟡 **La Sirène** | 4 | 3% |
| 🟡 **Simbi** | 4 | 3% |


✅ Aucune alerte répétition détectée.

## 🌈 Ambiances

✅ Aucune alerte structurelle détectée.

## 🌱 Présages du jour

### 📊 Distribution type

- 🌿 Flore : 0/7
- 🦎 Faune : 1/7

> ℹ️ Déséquilibre : 0 flore / 1 faune sur 7 jours.

---

# Pass 2 — Analyse Sémantique (Mistral)

> Échantillon : 20 horoscopes analysés.

Voici une analyse détaillée des extraits d'horoscopes guadeloupéens générés par IA, structurée selon vos demandes :

---

### **1. Tableau des problèmes trouvés**

| **Signe**   | **Édition**       | **Type**                     | **Citation**                                                                                     | **Suggestion**                                                                                     |
|-------------|-------------------|------------------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| Gemeaux     | nuit (2026-06-01) | Répétition de tournure       | *"ses ailes légères comme un souffle d'ancêtre qui murmure à travers les kawoubouyé de ta vie"* | Varier les métaphores : *"comme un zéphyr qui caresse les feuilles de l'Alpinia"*               |
| Gemeaux     | midi (2026-06-03) | Répétition de faune          | *"l'Urakan plane au-dessus de Petite-Terre"* (x4)                                               | Limiter à 1-2 mentions par signe. Utiliser *"frégate"* ou *"mouette"* pour varier.                |
| Gemeaux     | nuit (2026-06-02) | Faute de grammaire           | *"Ce matin, l'Urakan plane..."* (devrait être *"Ce soir"*)                                      | Corriger les incohérences temporelles (*"matin"* vs *"soir"* dans la même édition).                |
| Vierge      | midi (2026-06-01) | Métaphore générique          | *"comme l'ouragan nettoie les champs avant les nouvelles pousses"*                              | Préférer : *"konm anba dlo ka balé déyè li, ka lavé tout bagay anba li"* (créole authentique).     |
| Bélier      | midi (2026-06-02) | Répétition de faune          | *"les lucioles dansent sur les mornes"* (x2)                                                   | Remplacer par *"les zandoli ka kouwi sou kay"* ou *"les papillons ka fléchi"*.                   |
| Verseau     | matin (2026-06-01) | Métaphore trop générique     | *"ton âme s’ouvre comme une conque sous la pluie fine"*                                        | Utiliser : *"ton zé pa ka ouvè konm yon lambi sou larivyè"* (plus caribéen).                       |
| Taureau     | soir (2026-06-01) | Faute de créole              | *"bèf a bos"* (orthographe incorrecte)                                                          | Corriger en *"bèf a bò"* ou *"bèf anba bwa"* (termes locaux).                                      |
| Sagittaire  | midi (2026-06-01) | Ponctuation incorrecte       | *"le jour est à toi, Sagittaire, si tu oses plonger."* (virgule manquante)                      | Ajouter : *"le jou ka pou ou, Sagitè, si ou osé plonjé."*                                         |
| Balance     | soir (2026-06-01) | Répétition de lieux sacrés  | *"Adja"* mentionné 2x dans le même extrait                                                     | Espacer les références aux loas pour éviter la redondance.                                         |
| Gemeaux     | nuit (2026-06-04) | Répétition de structure      | *"Les lucioles de cette nuit portent un message des ancêtres"* (x2)                            | Varier : *"Les zandoli ka kléré anba lalin, ka voyé yon bann zotobre."*                           |

---

### **2. Score qualité global /10**
**6,5/10**
- **Points forts** : Métaphores caribéennes bien choisies (ex. *"kawoubouyé"*, *"lambi"*), références aux loas et éléments naturels pertinents.
- **Points faibles** : Répétitions excessives (Urakan, lucioles, lucioles), fautes de créole et de français, métaphores parfois trop génériques.

---

### **3. 3 axes d'amélioration prioritaires**

#### **A. Éviter les répétitions**
- **Problème** : L'Urakan est mentionné **5 fois** en 20 extraits, les lucioles **4 fois**, et les "murmures des ancêtres" **3 fois**.
- **Solution** :
  - Varier les oiseaux : utiliser *"frégate"*, *"mouette"*, *"kolibri"* selon le contexte.
  - Remplacer *"lucioles"* par *"zandoli"* (lézard) ou *"papillons"* pour diversifier la faune.
  - Exemple corrigé :
    > *"Ce soir, les zandoli ka kouwi sou kay anba lalin, ka voyé yon bann zotobre."*

#### **B. Corriger les fautes de créole et de français**
- **Problème** :
  - *"bèf a bos"* → orthographe incorrecte.
  - *"le jour est à toi"* → trop français, peu naturel en créole.
  - *"les nuages s'accrocheront aux mornes comme des esprits"* → mélange de registres.
- **Solution** :
  - Utiliser des expressions locales :
    - *"bèf anba bwa"* (bœuf sous l'arbre) pour évoquer la force.
    - *"Jou ka pou ou"* (le jour est à toi) en créole.
  - Exemple corrigé :
    > *"Nij ka anmòdé mòn konm zanj ka rété, men pa gadé yo anba lalin."*

#### **C. Enrichir les métaphores caribéennes**
- **Problème** : Certaines comparaisons sont trop génériques (*"comme un souffle d'ancêtre"*).
- **Solution** :
  - Intégrer des éléments culturels spécifiques :
    - *"konm yon lambi sou larivyè"* (comme un lambi sur la rivière).
    - *"konm yon vèvè ki dresé anba lalin"* (comme un vèvè tracé sous la lune).
  - Exemple corrigé :
    > *"Gran Bwa ka chaché anba fey mapou konm yon ofrann ki ka tann ou."*

---
**Recommandation finale** :
Pour un horoscope authentique, privilégiez :
1. **1-2 références par signe** (loas, faune, flore).
2. **Un créole naturel** (éviter les calques du français).
3. **Des métaphores ancrées dans le paysage guadeloupéen** (mornes, cannes, mer des Caraïbes).

Exemple de réécriture optimale :
> *"Ce soir, Gran Bwa ka souflé anba fey gomye, epi ou ka santi yon dofé anba lapriyè. Demen, tout bagay ka klè konm dlo ki lavé tout bagay anba li."*