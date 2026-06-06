# ✅ Rapport Qualité — 7 jours glissants
**Période :** 2026-06-01 → 2026-06-01  
**Généré le :** 2026-06-01 21:36 UTC

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

Voici une analyse détaillée des 20 extraits d'horoscopes guadeloupéens générés par IA, avec des suggestions concrètes pour améliorer leur authenticité et leur qualité.

---

### **1. Tableau des problèmes trouvés**

| **Signe**  | **Édition** | **Type**                     | **Citation**                                                                                     | **Suggestion**                                                                                     |
|------------|-------------|------------------------------|-------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| Lion       | midi        | Répétition de métaphores     | *"Ce midi, le soleil tape sur les feuilles de sapotiyié comme Ezili Freda pose ses doigts roses sur ton front"* | Varier les références à Ezili (ex: Ezili Dantò, Erzulie, ou autres divinités vaudou).              |
| Bélier     | midi        | Répétition de "ka d'Ogoun"   | *"le ka bat sous ta peau comme un ka d’Ogoun, rouge et vert"*                                  | Remplacer par d'autres éléments liés à Ogoun (ex: "comme un marteau de forgeron", "comme un feu de bois"). |
| Lion       | nuit        | Répétition de "Route de la Traversée" | *"le ciel au-dessus de la Route de la Traversée s’étire comme une peau de balèn"*               | Utiliser d'autres lieux emblématiques (ex: "la Pointe des Châteaux", "les Grands Fonds").          |
| Bélier     | matin       | Répétition de "lucioles"     | *"Les lucioles de mai 67 brillent encore dans la nuit"*                                         | Varier avec d'autres symboles (ex: "les étoiles filantes", "les lucioles de la Soufrière").       |
| Bélier     | midi        | Répétition de "lucioles"     | *"Les lucioles de ce soir ne sont pas là par hasard"*                                           | Remplacer par des éléments plus spécifiques (ex: "les lucioles de la canne à sucre", "les lucioles des mornes"). |
| Gémeaux    | soir        | Répétition de "Legba"        | *"Legba ouvre les chemins ce soir"*                                                             | Varier avec d'autres loas (ex: "Simbi", "Baron Samedi", "Marinette").                              |
| Bélier     | midi        | Répétition de "palmis montagn" | *"l’alizé souffle comme un souffle d’Ogoun sur les mornes de Basse-Terre"*                      | Utiliser d'autres éléments naturels (ex: "les mangroves", "les ravines", "les mornes de la Grande Terre"). |
| Gémeaux    | matin       | Répétition de "Urakan"       | *"l'Urakan déploie ses ailes au-dessus de Petite-Terre"*                                        | Varier avec d'autres phénomènes naturels (ex: "l'ouragan qui danse", "le vent de l'Atlantique").     |
| Lion       | soir        | Répétition de "sapotiyié"   | *"la lune pleine danse sur les feuilles du sapotiyié"*                                         | Utiliser d'autres arbres (ex: "les balisiers", "les gommiers", "les flamboyants").                |
| Bélier     | soir        | Répétition de "lucioles"     | *"les lucioles ti flambeau dansent sur les mornes"*                                             | Remplacer par des éléments plus spécifiques (ex: "les lucioles de la canne à sucre", "les lucioles des mornes"). |
| Lion       | matin       | Répétition de "pié manyòk"  | *"l'alizé léger caresse les feuilles de pié manyòk"*                                          | Varier avec d'autres plantes (ex: "les feuilles de balisier", "les feuilles de gommier").         |
| Gémeaux    | soir        | Répétition de "Legba"        | *"Legba ouvre les chemins aujourd'hui"*                                                         | Varier avec d'autres loas (ex: "Simbi", "Baron Samedi", "Marinette").                              |
| Bélier     | nuit        | Répétition de "lucioles"     | *"les lucioles tracent des chemins de lumière"*                                                 | Remplacer par des éléments plus spécifiques (ex: "les lucioles de la canne à sucre", "les lucioles des mornes"). |
| Lion       | midi        | Répétition de "Gran Pélikan" | *"Gran Pélikan plane au-dessus des vagues"*                                                     | Utiliser d'autres animaux (ex: "le pélican des îles", "l'aigle de la Soufrière").                  |
| Gémeaux    | midi        | Répétition de "Urakan"       | *"l’Urakan plane au-dessus de Petite-Terre"*                                                   | Varier avec d'autres phénomènes naturels (ex: "l'ouragan qui danse", "le vent de l'Atlantique").     |
| **Fautes d'orthographe et de grammaire** |                                                                 |                                                                                                   |
| Bélier     | midi        | Faute de grammaire           | *"La pleine lune de mai 67 n’est pas loin,son ombre te suit"*                                   | Corriger : *"La pleine lune de mai 67 n’est pas loin, son ombre te suit"* (virgule manquante).      |
| Bélier     | soir        | Faute de grammaire           | *"les vérités que tu as enfouies sous la fatigue. Mai 67 murmure encore"*                       | Corriger : *"les vérités que tu as enfouies sous la fatigue. Mai 67 murmure encore"* (point manquant). |
| Gémeaux    | soir        | Faute de grammaire           | *"chaque carrefour cache une leçon. Dans les jours à venir"*                                    | Corriger : *"chaque carrefour cache une leçon. Dans les jours à venir"* (virgule manquante).        |
| **Qualité et authenticité du créole guadeloupéen** |                                                                 |                                                                                                   |
| Bélier     | matin       | Créole approximatif          | *"les ti flambeau s’allument dans l’ombre des palmis montagn"*                                  | Corriger : *"les ti flambeaux s’allument dans l’ombre des palmiers montagne"* (accord et orthographe). |
| Lion       | nuit        | Créole approximatif          | *"les esprits des Arawaks glissent entre les feuilles de pié manyòk"*                          | Corriger : *"les esprits des Arawaks glissent entre les feuilles de pié manyok"* (orthographe).     |
| Bélier     | soir        | Créole approximatif          | *"les lucioles ti flambeau dansent sur les mornes"*                                             | Corriger : *"les lucioles ti flambeaux dansent sur les mornes"* (accord).                          |

---

### **2. Score qualité global /10**
**6,5/10**
- **Points forts** : Richesse des références culturelles (Ezili Freda, Ogoun, Legba, lieux emblématiques), métaphores poétiques.
- **Points faibles** : Répétitions excessives de tournures, de symboles et de lieux ; fautes d'orthographe et de grammaire ; créole parfois approximatif.

---

### **3. Les 3 axes d'amélioration prioritaires**

#### **1. Éviter les répétitions de tournures et de symboles**
- **Problème** : Les horoscopes utilisent trop souvent les mêmes métaphores (ex: "ka d'Ogoun", "lucioles", "Urakan", "Legba", "Route de la Traversée", "sapotiyié").
- **Solution** :
  - Varier les références aux divinités (ex: Ezili Dantò, Simbi, Baron Samedi).
  - Utiliser d'autres lieux emblématiques (ex: "Pointe des Châteaux", "Grands Fonds", "Soufrière").
  - Diversifier les éléments naturels (ex: "mangroves", "ravines", "balisiers", "gommiers").

#### **2. Corriger les fautes d'orthographe et de grammaire**
- **Problème** : Virgules manquantes, accords incorrects, orthographe approximative du créole.
- **Solution** :
  - Relire attentivement pour ajouter les virgules manquantes.
  - Vérifier les accords (ex: "ti flambeau" → "ti flambeaux").
  - Utiliser un correcteur orthographique ou un locuteur natif pour valider le créole.

#### **3. Améliorer l'authenticité du créole guadeloupéen**
- **Problème** : Certaines tournures sonnent artificielles ou mal orthographiées.
- **Solution** :
  - Collaborer avec un locuteur natif pour valider les expressions en créole.
  - Utiliser des expressions courantes (ex: "ka" pour "feu", "ti flambeau" pour "lucioles", "mornes" pour "collines").
  - Éviter les anglicismes ou les tournures trop littérales.

---
### **Exemple de réécriture améliorée**
**Original** :
*"Ce midi, le ka bat sous ta peau comme un ka d’Ogoun, rouge et vert, tandis que les ti flambeau s’allument dans l’ombre des palmis montagn."*

**Amélioré** :
*"Ce midi, le feu d’Ogoun brûle en toi, rouge et vert comme les braises de la forge, tandis que les lucioles s’allument dans l’ombre des palmiers montagne. Écoute : le vent te murmure des secrets."*

---
En appliquant ces corrections, les horoscopes gagneront en authenticité, en variété et en qualité linguistique.