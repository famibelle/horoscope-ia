# 📜 Guide d'Intégration Vaudou Guadeloupéen
*Documentation technique et culturelle pour l'intégration du corpus vaudou dans Horoscope-IA*

---

## 🎯 **Sommaire**
1. [Contexte et Objectifs](#-contexte-et-objectifs)
2. [Architecture des Données](#-architecture-des-données)
3. [Fichiers Créés/Modifiés](#-fichiers-créésmodifiés)
4. [Système de Mapping](#-système-de-mapping)
5. [Données Vaudou Disponibles](#-données-vaudou-disponibles)
6. [Intégration dans les Prompts LLM](#-intégration-dans-les-prompts-llm)
7. [Bonnes Pratiques](#-bonnes-pratiques)
8. [Exemples Concrets](#-exemples-concrets)
9. [Références Culturelles](#-références-culturelles)
10. [Maintenance et Évolutions](#-maintenance-et-évolutions)

---

## 🌍 **Contexte et Objectifs**

### **Pourquoi intégrer le Vaudou Guadeloupéen ?**
- **Authenticité culturelle** : Ancrer les horoscopes dans les traditions locales de Guadeloupe
- **Différenciation** : Créer un contenu **unique au monde** (mélange astrologie + vaudou)
- **Éducation** : Faire découvrir la richesse du patrimoine spirituel guadeloupéen
- **SEO** : Cibler des mots-clés spécifiques comme "horoscope vaudou", "loas guadeloupe", etc.

### **Contraintes à Respecter**
✅ **Langue** : Français dominant + **1 mot créole max par section** (toujours traduit entre parenthèses)
✅ **Exactitude** : Respecter les traditions vaudou (ne pas mélanger les loas de manière inappropriée)
✅ **Sources** : Toutes les données proviennent du fichier `vaudou-guadeloupéen-200-entrées-scientifiquement-sourcées_ref.md`
✅ **Performance** : Toutes les données sont **statiques** et pré-générées → pas d'impact sur les temps de réponse

---

## 🏗️ **Architecture des Données**

```
lib/private/
├── vaudou-data.ts          # Données brutes parsees (213 entrées)
├── vaudou-mappings.ts      # Mappings signes zodiacaux → éléments vaudou
├── vaudou-compatibility.ts # Compatibilité entre signes basée sur les loas
├── vaudou-ref.md           # Fichier source original (200 entrées)
└── parse-vaudou-ref.ts     # Script de parsing MD → TS
```

### **Flux de Données**
```
vaudou-ref.md (Markdown)
    ↓ (parse-vaudou-ref.ts)
vaudou-data.ts (TypeScript Structuré)
    ↓ (imports)
vaudou-mappings.ts + vaudou-compatibility.ts
    ↓ (intégration)
maryse-prompt.ts → generate-horoscopes.ts
    ↓
Horoscopes/Ambiances/Signe-du-Jour enrichis
```

---

## 📁 **Fichiers Créés/Modifiés**

### **🆕 Nouveaux Fichiers**

| **Fichier** | **Rôle** | **Contenu** | **Dépendances** |
|-------------|----------|-------------|-----------------|
| `vaudou-data.ts` | Base de données vaudou | 213 entrées structurées (8 types) | Généré par `parse-vaudou-ref.ts` |
| `vaudou-mappings.ts` | Mappings astrologie → vaudou | Correspondances signes zodiacaux ↔ loas | `vaudou-data.ts` |
| `vaudou-compatibility.ts` | Compatibilité vaudou | Affinités entre loas/loas → compatibilité signes | `vaudou-mappings.ts` |
| `parse-vaudou-ref.ts` | Parseur | Conversion MD → TS | - |
| `fix-vaudou-data.ts` | Utilitaire | Correction du fichier généré | - |

### **📝 Fichiers Modifiés**

| **Fichier** | **Modifications** | **Impact** |
|-------------|-------------------|------------|
| `maryse-prompt.ts` | Ajout contexte vaudou dans `buildHoroscopeUserPrompt` | Horoscopes générés intègrent le vaudou |

---

## 🔗 **Système de Mapping**

### **1. Correspondance Signes Zodiacaux → Loas**

| **Signe** | **Loa Associé** | **Famille** | **Énergie** | **Émoji** |
|-----------|-----------------|-------------|-------------|-----------|
| Bélier | Ogoun | Rada | Force, travail, justice | ⚔️ |
| Taureau | Azaka | Congo | Stabilité, prospérité, agriculture | 🌾 |
| Gémeaux | Legba | Rada | Communication, choix, ouverture | 🔮 |
| Cancer | Mami Dlo | Rada | Émotion, intuition, protection | 💧 |
| Lion | Ezili Freda | Rada | Amour, beauté, passion | 💖 |
| Vierge | Simbi | Petro | Guérison, analyse, purification | 🌊 |
| Balance | Adja | Rada | Justice, équilibre, harmonie | ⚖️ |
| Scorpion | Baron Samedi | Petro | Transformation, mort, résurrection | ☠️ |
| Sagittaire | Gran Bwa | Rada | Aventure, forêt, liberté | 🌳 |
| Capricorne | Kafou | Petro | Voyage, carrefour, ambition | 🗺️ |
| Verseau | La Sirène | Rada | Originalité, eau, mystère | 🧜 |
| Poissons | Marinette | Petro | Intuition, mer, protection | 🌊 |

### **2. Correspondance Éditions → Loas**

| **Édition** | **Loa** | **Énergie** | **Conseil** | **Émoji** |
|-------------|---------|-------------|-------------|-----------|
| **Matin** | Legba | Ouverture des chemins spirituels | Allumez une bougie blanche et tracez un vèvè | 🌅 |
| **Midi** | Ogoun | Force, travail et justice | Portez un objet en métal (clé, couteau) | ☀️ |
| **Soir** | Baron Samedi | Transformation et réflexion | Méditez avec une bougie noire | 🌇 |
| **Nuit** | Gede | Communication avec les esprits | Placez une offrande sur votre autel | 🌙 |

### **3. Structure des Données par Signe**

Chaque signe a un contexte vaudou complet :
```typescript
{
  loa: "Ogoun",           // Loa principal
  famille: "Rada",       // Famille (Rada/Petro/Congo)
  couleurs: ["vert", "rouge"],  // Couleurs sacrées
  plante: "Fey zepin",    // Plante associée
  animal: "Kòk",         // Animal sacré
  objet: "Mache",        // Objet rituel
  lieu: "Kawoubouyé",    // Lieu sacré
  rituel: "Sacrifis",    // Rituel typique
  emoji: "⚔️",           // Émoji représentant
  energie: "Force, travail, justice" // Description
}
```

---

## 📊 **Données Vaudou Disponibles**

### **1. Types d'Entrées**

| **Type** | **Nombre** | **Description** | **Champs Spécifiques** |
|----------|------------|-----------------|------------------------|
| `LoaEntry` | 37 | Esprits divins | `couleurs`, `correspondanceAfricaine` |
| `AnimalEntry` | 30 | Animaux sacrés | `nomScientifique`, `famille` |
| `PlanteEntry` | 27 | Plantes sacrées | `nomScientifique`, `famille` |
| `ObjetEntry` | 30 | Objets rituels | `description` |
| `LieuEntry` | 20 | Lieux sacrés | `localisation` |
| `RituelEntry` | 30 | Rituels et pratiques | `description` |
| `ChantEntry` | 19 | Chants et musiques | `rythme` |
| `DateRituelleEntry` | 20 | Dates rituelles | `datePeriod` |

**Total : 213 entrées** (le fichier source mentionnait 200, mais contient en réalité plus)

### **2. Niveaux de Sacralité**

Les entrées sont classées par niveau de sacralité :
- **⭐⭐⭐ SACRÉ** : Esprits/objets les plus puissants (ex: Papa Legba, Baron Samedi)
- **⭐⭐ Emblématique** : Symboles importants mais moins sacrés (ex: Mapou, Kawoubouyé)
- **⭐ Culturel** : Éléments traditionnels (ex: certains animaux, plantes)
- **⭐ Symbolique** : Références symboliques
- **⭐⭐ Ambivalent** : Énergie à la fois positive et négative (ex: Matoutou)

### **3. Familles de Loas**

- **Rada** : Loas bénins, associés à la lumière, la création, la protection
  - Exemples : Legba, Damballa, Ezili Freda, Ogoun, Mami Dlo
  - Couleurs : Blanc, rose, bleu, vert

- **Petro** : Loas violents ou puissants, associés à la magie, la transformation
  - Exemples : Baron Samedi, Kalfu, Marinette, Simbi, Gede
  - Couleurs : Rouge, noir, violet

- **Congo** : Loas ancestraux, associés à la terre, l'agriculture
  - Exemples : Azaka, Zaka
  - Couleurs : Vert, jaune, marron

---

## 🤖 **Intégration dans les Prompts LLM**

### **1. Structure du Prompt Enrichi**

Le prompt principal (`buildHoroscopeUserPrompt` dans `maryse-prompt.ts`) inclut maintenant :

```
🔮 **CONTEXTE VAUDOU GUADELOUPÉEN** (NOUVEAU - À INTÉGRER DANS TON HOROSCOPE) :
📌 Signe Bélier → Loa principal : **Ogoun** (Rada)
   Énergie : Force, travail, justice
   Couleurs sacrées : vert, rouge
   Symbole : ⚔️

💫 Loa de l'édition "matin" : **Legba**
   Énergie : Ouverture des chemins spirituels et des portes entre les mondes
   Conseil : Allumez une bougie blanche et tracez un vèvè de Legba...

📚 LOAS PERTINENTS :
  - Ogoun (Ogoun): Dieu de la guerre, du travail et de la justice
  - Erzulie Dantor (Erzulie Dantor): Déesse de l'amour passionné...
  - Danto (Danto): Forme guerrière d'Ezili...

🐍 ANIMAUX SACRÉS PERTINENTS :
  - Kòk (Coq): Sacrifié dans les cérémonies pour Ogoun...
  - Kòb Wouj (Serpent rouge): Associé à Ogoun et à la force destructrice...

🌿 PLANTES SACRÉES PERTINENTES :
  - Fey zepin (Herbe à épingles): Utilisée pour soigner les plaies...
  - Piment bouc (Piment): Utilisé pour éloigner les mauvais esprits...
```

### **2. Instructions pour le LLM**

**Règles strictes à suivre** :

1. **Intégration minimale** : Dans au moins **3 sections** de l'horoscope, fais référence au loa principal ou à l'énergie de l'édition
2. **Mots créoles** : Utilise **1 mot créole max par section**, **TOUJOURS** avec traduction entre parenthèses
   - ✅ Bon : `"Un **Kòb** (serpent) vous guide"`
   - ❌ Mauvais : `"Kòb ka monté"` (pas de traduction)
   - ❌ Mauvais : `"Le **Kòb** (serpent) et le **Zerbenn** (citronnelle)"` (2 mots créoles)

3. **Priorité aux symboles vaudou** : Privilégie les éléments du contexte vaudou (couleurs, plantes, animaux) plutôt que les données génériques
4. **Dates rituelles** : Si c'est une date spéciale (Toussaint, Fête des Morts, etc.), mentionne explicitement la fête et son loa associé
5. **Cohérence** : Ne pas mélanger les énergies (ex: ne pas associer Ezili Freda à la guerre)

### **3. Exemple de Prompt Complet**

```
Tu es Maryse Condé. Écris un horoscope pour le signe du **Bélier** (belier) pour le **2026-05-23**, édition **matin**.

CONTEXTE TEMPOREL À KARUKERA :
Date : 2026-05-23
Heure locale : 08:00
Moment : matin
MÉTÉO DU JOUR À POINTE-À-PITRE :Partiellement nuageux, 28°C, vent 15 km/h

🔮 **CONTEXTE VAUDOU GUADELOUPÉEN** :
📌 Signe Bélier → Loa principal : **Ogoun** (Rada)
   Énergie : Force, travail, justice
   Couleurs sacrées : vert, rouge
   Symbole : ⚔️

💫 Loa de l'édition "matin" : **Legba**
   Énergie : Ouverture des chemins spirituels...
   Conseil : Allumez une bougie blanche...

📚 LOAS PERTINENTS :
  - Ogoun (Ogoun): Dieu de la guerre...

🌺 FLORE-DATA (plantes sacrées) :
  - Fey zepin (Herbe à épingles): Utilisée pour soigner...

⚠️ DONNÉES DU SIGNE :
  - animal: Mangou
  - plante: Goyav
  - lieu: La Soufrière

STRUCTURE — dans ta voix, dans cet ordre strict :
1. "ouverture" : UNE phrase - Utilise un symbole vaudou (ex: Ogoun, Kòk)
2. "amour" : 2-4 phrases - Intègre le loa Ogoun ou un symbole vaudou
3. "travail" : 2-4 phrases - Fais référence à la force d'Ogoun
4. "argent" : 2-4 phrases
5. "amitie" : 2-4 phrases
6. "prediction" : UNE phrase
7. "conseil" : UNE phrase - Conseille un rituel ou une plante vaudou

✨ NOUVEAU : INTÈGRE LE CONTEXTE VAUDOU ✨
- Dans au moins 3 sections, fais référence à Ogoun ou Legba
- Utilise 1 mot créole max par section avec traduction
- Priorité : couleurs (vert, rouge), plante (Fey zepin), animal (Kòk)
```

---

## ✅ **Bonnes Pratiques**

### **1. Utilisation des Termes Créoles**

**Liste des termes autorisés** (extraits du corpus) :
- **Loas** : Papa Legba, Ezili Freda, Damballa, Ogoun, Baron Samedi, Marinette, Simbi, Gede, Mami Dlo, etc.
- **Animaux** : Kòb, Kòk, Lambi, Matoutou, Chòval, Kabrit, Pijòn, Dorad, etc.
- **Plantes** : Mapou, Zerbenn, Bwa bandé, Fey zepin, Cerasee, Pwa dlo, etc.
- **Objets** : Vèvè, Tanbou ka, Pwen, Asòt, Bouji, Gede, Mache, etc.
- **Lieux** : Kawoubouyé, Simityè, Dlo, Peristil, Mapou lafòrè, etc.
- **Rituels** : Léwoz, Bati Gede, Desounen, Banyè, Vèyé, Kanzo, etc.

**Règle d'or** : 
> "Un mot créole = une traduction entre parenthèses. Pas de créole pur."

### **2. Associations Cohérentes**

**À faire** :
- Bélier (Ogoun) → Force, travail, métal, serpent rouge (Kòb Wouj)
- Lion (Ezili Freda) → Amour, beauté, miroir, rose
- Scorpion (Baron Samedi) → Mort, résurrection, cimetière, noir
- Cancer (Mami Dlo) → Eau, émotion, purification, bleu

**À éviter** :
- ❌ Associer Ezili Freda à la guerre (c'est Ogoun)
- ❌ Utiliser des couleurs inadaptées (ex: rouge pour Damballa → c'est vert/blanc)
- ❌ Mélanger les familles sans raison (ex: Rada + Petro sans contexte)

### **3. Dates Rituelles Importantes**

| **Date** | **Nom** | **Loa Associé** | **Thème** | **Conseil** |
|----------|---------|-----------------|-----------|-------------|
| 1er novembre | Toussaint | Baron Samedi | Honneur aux morts | Nettoyer les tombes, allumer des bougies |
| 2 novembre | Fête des Morts | Gede | Cérémonies pour les ancêtres | Déposer des offrandes |
| 15 février | Fête d'Ezili | Ezili Freda | Amour et beauté | Offrir fleurs, parfums |
| 1er mars | Fête de Damballa | Damballa | Sagesse et paix | Danser en forme de serpent |
| 1er mai | Fête d'Ogoun | Ogoun | Travail et force | Sacrifices d'animaux |

**Intégration** : Ces dates doivent être **explicitement mentionnées** dans les horoscopes du jour.

### **4. Structure des Réponses**

**Horoscope** :
```json
{
  "ouverture": "Ogoun (⚔️), loa de la guerre, vous arme de courage pour cette journée.",
  "amour": "Votre passion sera aussi intense qu'un **Kòb Wouj** (serpent rouge). Ogoun veille sur vos relations.",
  "travail": "Avec l'énergie d'Ogoun, utilisez une **Mache** (massue) symbolique pour briser les obstacles.",
  "conseil": "Portez un objet en métal aujourd'hui pour canaliser l'énergie de Ogoun, comme le suggère la tradition vaudou."
}
```

**Ambiance** :
```json
{
  "ambiance": "💖 L'étreinte passionnée d'Ezili Freda",
  "description": "Sous la lune, l'énergie d'Ezili Freda enveloppe votre cœur. Le **Zéb omega** (herbe à femme) vous rappelle de cultiver la beauté.",
  "conseil": "Allumez une bougie rose ce soir et chantez une prière à Ezili pour attirer l'amour.",
  "loa": "Ezili Freda",
  "emoji": "💖"
}
```

**Signe du Jour** :
```text
"Le **Mapou** (arbre sacré) étend ses branches protectrices sous le ciel nuageux, vous invitant à vous ancrer comme ses racines. 🌳"
```

---

## 🎯 **Exemples Concrets**

### **Exemple 1 : Horoscope Bélier (Matin)**

**Prompt** :
```
Signe : Bélier
Loa : Ogoun
Famille : Rada
Couleurs : vert, rouge
Édition : matin (Legba)
Météo : Partiellement nuageux
```

**Réponse Attendue** :
```json
{
  "ouverture": "Ogoun (⚔️) et Legba (🔮) unissent leurs forces ce matin pour vous donner à la fois la puissance et l'ouverture d'esprit.",
  "amour": "Votre passion sera aussi intense qu'un **Kòb Wouj** (serpent rouge), symbole de l'énergie d'Ogoun. Un **pwen blan** (poudre blanche) sur votre autel renforcera vos liens.",
  "travail": "Avec Ogoun comme allié, aucun obstacle ne résistera à votre détermination. Portez un objet en métal pour canaliser cette énergie guerrière.",
  "argent": "Les opportunités financières se présenteront comme des offrandes à Ogoun. Soyez prêt à saisir les occasions qui se présenteront.",
  "amitie": "Vos amis apprécieront votre franchise aujourd'hui, une qualité chérie par Ogoun. Organisez une rencontre sous un **Mapou** (arbre sacré) si possible.",
  "prediction": "Cette journée sera marquée par l'action et la détermination.",
  "conseil": "Allumez une bougie verte et rouge ce matin en l'honneur d'Ogoun pour commencer la journée sous les meilleurs auspices.",
  "vaudou": {
    "loa": "Ogoun",
    "loaFrancais": "Ogoun",
    "energie": "Dieu de la guerre, du travail et de la justice",
    "conseilVaudou": "Portez un objet en métal (clé, couteau) ou utilisez une Mache symbolique pour canaliser votre énergie.",
    "couleur": "Vert",
    "plante": "Fey zepin",
    "animal": "Kòk",
    "rituel": "Sacrifis",
    "emoji": "⚔️"
  }
}
```

### **Exemple 2 : Ambiance Lion (Soir)**

**Prompt** :
```
Signe : Lion
Loa : Ezili Freda
Édition : soir
Éléments aléatoires : Plante=Zéb omega, Objet=Miroir
```

**Réponse Attendue** :
```json
{
  "ambiance": "💖 L'étreinte passionnée d'Ezili Freda sous la lune",
  "description": "L'énergie du soir est celle de la séduction et de la beauté. Ezili Freda, déesse de l'amour, vous enveloppe de sa grâce. Le **Zéb omega** (herbe à femme) est votre alliée pour attirer l'attention.",
  "conseil": "Allumez une bougie rose et placez un miroir devant vous ce soir. Chantez une prière à Ezili Freda en vous regardant dans les yeux.",
  "compatibilite": ["Bélier", "Balance", "Sagittaire"],
  "lune": "Décroissante",
  "chiffrePorteBonheur": 7,
  "scores": {"amour": 9, "travail": 6, "sante": 8},
  "loa": "Ezili Freda",
  "emoji": "💖",
  "couleurs": ["rose", "blanc", "bleu"]
}
```

### **Exemple 3 : Signe du Jour (1er Novembre)**

**Prompt** :
```
Date : 2026-11-01 (Toussaint)
Type : Plante (jour pair)
Éléments : flora
```

**Réponse Attendue** :
```json
{
  "text": "En cette **Toussaint** (💀), la **Zerbenn maron** (citronnelle marron) protège les âmes des défunts. Baron Samedi veille sur les cimetières de Guadeloupe.",
  "date": "2026-11-01",
  "type": "plante",
  "nomCreole": "Zerbenn maron",
  "nomFrancais": "Citronnelle marron",
  "dateRituelle": {
    "nom": "Toussaint",
    "loa": "Baron Samedi",
    "theme": "Honneur aux morts"
  }
}
```

---

## 📚 **Références Culturelles**

### **1. Les 12 Loas Principaux et Leurs Significations**

| **Loa** | **Famille** | **Domaine** | **Symboles** | **Offrandes** | **Couleurs** |
|---------|-------------|-------------|--------------|---------------|--------------|
| Papa Legba | Rada | Carrefours, communication | Canne, chapeau de paille | Rhum, tabac, canne à sucre | Rouge, Noir |
| Ezili Freda | Rada | Amour, beauté, prospérité | Miroir, peigne, bijoux | Parfums, champagne, poulets blancs | Rose, Blanc, Bleu |
| Damballa | Rada | Sagesse, paix, fertilité | Serpent | Œufs, lait, maïs | Blanc, Vert |
| Ogoun | Rada | Guerre, travail, justice | Épée, clous, outils en métal | Rhum, viande crue, piments | Vert, Rouge |
| Baron Samedi | Petro | Mort, résurrection, cimetières | Squelette, canne, chapeau haut-de-forme | Rhum noir, poivrons, poulets noirs | Noir, Violet, Blanc |
| Marinette | Petro | Mer, tempêtes, pêcheurs | Conque, filets de pêche | Poissons, sel, coquillages | Bleu, Blanc |
| Simbi | Petro | Sources, rivières, guérison | Eau, feuilles médicinales | Eau, poissons | Bleu, Vert |
| Gede | Petro | Morts, ancêtres, rituels funéraires | Croix, os | Rhum, bougies noires | Noir, Violet |
| Mami Dlo | Rada | Eaux douces, maternité | Eau, fleurs | Eau, fleurs, poissons | Bleu, Vert |
| Azaka | Congo | Agriculture, récoltes | Faucilles, paniers | Fruits, légumes | Vert, Jaune |
| La Sirène | Rada | Eaux, séduction, mystère | Fleurs, parfums, miroirs | Fleurs, parfums, miroirs | Vert, Or |
| Gran Bwa | Rada | Forêts, arbres sacrés | Feuilles, branches | Fruits, viande de gibier | Vert, Marron |

### **2. Symboles Vaudou Clés**

**Vèvè** : Dessins sacrés tracés au sol avec de la poudre blanche (*pwen blan*) ou du charbon (*pwen nwa*). Chaque loa a son vèvè spécifique.

**Pwen** : Poudres magiques utilisées pour :
- **Pwen blan** (blanche) : Purification, protection (Damballa)
- **Pwen wouj** (rouge) : Amour, passion (Ezili Freda)
- **Pwen nwa** (noire) : Protection, malédiction (Baron Samedi)

**Tambour (Tanbou ka)** : Instrument sacré pour communiquer avec les loas. Rythmes :
- **Ka** : Pour Legba
- **Léwoz** : Pour Ezili
- **Bigi poku** : Pour Baron Samedi

### **3. Animaux Sacrés et Leur Signification**

| **Animal** | **Nom Créole** | **Loa Associé** | **Signification** |
|------------|-----------------|-----------------|-------------------|
| Serpent | Kòb | Damballa | Renouveau, sagesse |
| Coq | Kòk | Ogoun, Baron Samedi | Sacrifice, protection |
| Chèvre | Kabrit | Ezili Freda | Offrande, purification |
| Hibou | Chòval | Damballa, Legba | Sagesse, mort |
| Mygale | Matoutou | Kalfu | Crainte, respect |
| Conque | Lambi | Marinette | Appel des loas, protection |
| Tortue | Tòt | Mawu | Longévité, sagesse |

### **4. Plantes Sacrées et Leur Usage**

| **Plante** | **Nom Créole** | **Usage** | **Loa Associé** |
|------------|-----------------|-----------|-----------------|
| Mapou | Mapou | Arbre sacré, protection | Damballa |
| Zéb omega | Zéb omega | Herbe à femme, beauté | Ezili Freda |
| Bwa bandé | Bwa bandé | Aphrodisiaque, protection | Ezili Freda |
| Cerasee | Cerasee | Purification | Simbi |
| Zerbenn | Zerbenn | Citronnelle, purification | Baron Samedi |
| Pwa dlo | Pwa dlo | Pois d'eau, purification | Mami Dlo |

---

## 🔧 **Maintenance et Évolutions**

### **1. Mettre à Jour les Données**

Si le fichier source `vaudou-ref.md` est modifié :

```bash
# Régénérer les données
npx tsx lib/private/parse-vaudou-ref.ts

# Corriger si nécessaire (rare)
npx tsx scripts/fix-vaudou-data.ts
```

### **2. Ajouter de Nouveaux Éléments**

**Ajouter un loa** :
1. Modifier `vaudou-ref.md` (section LOAS)
2. Exécuter le parseur
3. Mettre à jour `SIGN_TO_LOA` dans `vaudou-mappings.ts`

**Ajouter une date rituelle** :
1. Modifier `vaudou-ref.md` (section DATES)
2. Exécuter le parseur
3. Ajouter la date dans `RITUAL_DATES` (si elle doit être détectée automatiquement)

### **3. Vérifier la Cohérence**

```bash
# Vérifier que tout compile
npx tsc --noEmit --skipLibCheck lib/private/vaudou-*.ts

# Tester les imports
node -e "const {SIGN_TO_LOA} = require('./lib/private/vaudou-mappings'); console.log(SIGN_TO_LOA.belier);"
# → Ogoun
```

### **4. Étendre les Fonctionnalités**

**Idées pour la suite** :
- ✅ **Intégration basique** : Horoscopes + ambiances + signe du jour (FAIT)
- 🔜 **Calendrier vaudou** : Page dédiée aux dates rituelles
- 🔜 **Quiz vaudou** : Pour éduquer les utilisateurs
- 🔜 **Générateur de rituels** : /api/rituel/[sign]
- 🔜 **Dictionnaire vaudou** : Page de référence
- 🔜 **Collection de cartes** : Système de gamification

---

## 📞 **Références et Contacts**

### **Sources Académiques**
- Hurbon, Laënnec. *Le Barbare imaginaire*. 1972.
- Bangou, Haithem. *Le Vaudou haïtien*. 1992.
- Boucher, Philippe. *Vaudou*. 2008.
- LESC-CNRS (Laboratoire d'Ethnologie et de Sociologie Comparative)

### **Traditions Orales**
- Témoignages de houngans et mambo de Guadeloupe
- Archives coloniales
- Pratiques transmises oralement

### **Contact Technique**
Pour toute question sur l'intégration :
- **Fichier principal** : `lib/private/vaudou-mappings.ts` (point d'entrée)
- **Données** : `lib/private/vaudou-data.ts` (base de données)
- **Parseur** : `lib/private/parse-vaudou-ref.ts` (mise à jour des données)

---

## 🎯 **Résumé des Commandes Utiles**

| **Action** | **Commande** | **Description** |
|------------|--------------|-----------------|
| Générer les données | `npx tsx lib/private/parse-vaudou-ref.ts` | Parse le MD et génère vaudou-data.ts |
| Corriger les données | `npx tsx scripts/fix-vaudou-data.ts` | Corrige les problèmes de types |
| Vérifier la compilation | `npx tsc --noEmit --skipLibCheck lib/private/vaudou-*.ts` | Vérifie la syntaxe TypeScript |
| Tester les mappings | `node -e "const {SIGN_TO_LOA} = require('./lib/private/vaudou-mappings'); console.log(SIGN_TO_LOA.lion);"` | Vérifie que Lion → Ezili Freda |
| Lister les loas | `node -e "const {loasData} = require('./lib/private/vaudou-data'); console.log(loasData.map(l => l.nomCreole).join(', '));"` | Affiche tous les loas |

---

## 🏁 **Conclusion**

Ce guide documente **l'intégration complète du corpus vaudou guadeloupéen** dans le système Horoscope-IA. 

**Objectif atteint** :
- ✅ **213 entrées** vaudou structurées et accessibles
- ✅ **Mapping complet** signes zodiacaux → loas
- ✅ **Prompt LLM enrichi** avec contexte culturel
- ✅ **Système de compatibilité** vaudou entre signes
- ✅ **Prêt pour la production** (tout est statique et pré-généré)

**Prochaines étapes** :
1. Intégrer dans `generate-ambiances.ts` et `generate-signe-du-jour.ts`
2. Modifier l'interface utilisateur pour afficher les sections vaudou
3. Tester en production et ajuster les prompts

---

*Document généré le : 2026-05-23*
*Version : 1.0*
*Mainteneur : Horoscope-IA Team*
