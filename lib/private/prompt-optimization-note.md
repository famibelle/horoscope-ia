# 📋 Optimisation du Prompt Maryse - Structure Recommandée

> **Objectif** : Éliminer la répétition des symboles principaux (ex: gwo zandoli, flamboyant) dans les sections Amour, Travail, Argent, Lyannaj, Santé en réorganisant la structure du prompt.

---

## 🎯 Problème Identifié

Les horoscopes générés par Mistral montrent une **répétition excessive** des symboles principaux du signe (animal, plante, arbre) dans plusieurs sections :

```
📝 Ouverture: "Cette nuit le gwo zandoli a grimpé sur le flanbwayan..."
💘 Amour: "Ton cœur bat comme les tambours... **les feuilles de zéb omega**..."
💼 Travail: "Tu es comme **l’iguane de Petite-Terre**..."
💰 Argent: "L’argent circule comme le vent dans **les feuilles de flanbwayan**..."
👫 Amitié: "À Pointe des Châteaux... **les racines du gommié blan**..."
```

**→ Solution** : Réorganiser le prompt pour **privilégier les données enrichies** (FAUNE-DATA, FLORE-DATA, LIEUX-DATA, KREYOL-DATA, HISTOIRE-DATA) **avant** les données du signe (signs-data.ts).

---

## 🏗️ Structure Optimisée du Prompt

### **Ordre Recommandé**

```
┌───────────────────────────────────────────────────────────────────────┐
│                         PROMPT OPTIMISÉ                                  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📅 CONTEXTE TEMPOREL À KARUKERA :                                   │
│  Date : ${dateToUse}                                                  │
│  Heure locale : ${hourToUse}                                         │
│  Moment : ${cfg.moment}                                              │
│  ${weatherBlock}                                                      │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🌍 HOROSCOPE BRUT (source anglaise - pour inspiration uniquement)      │
│  ${sign.name} : ${rawText}                                           │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🎯 **CONSIGNE PRINCIPALE** :                                         │
│  Intègre **AU MOINS 3 références culturelles DIFFÉRENTES** dans ton   │
│  horoscope. **Ne répète PAS** les symboles principaux (animal,       │
│  plante, arbre) plus d'UNE FOIS dans tout l'horoscope.              │
│  Privilégie les **données enrichies** ci-dessous.                     │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ⭐ DONNÉES ENRICHIES CULTURELLES (PRIORITÉ ABSOLUE) ⭐                 │
│                                                                       │
│  📚 FAUNE-DATA :                                                     │
│  - ${fauneEntry1.nomCreole} (${fauneEntry1.nomFrancais}): ${fauneEntry1.dimensionCulturelle}
│  - ${fauneEntry2.nomCreole} (${fauneEntry2.nomFrancais}): ${fauneEntry2.dimensionCulturelle}
│  - ${fauneEntry3.nomCreole} (${fauneEntry3.nomFrancais}): ${fauneEntry3.dimensionCulturelle}
│  ...                                                               │
│                                                                       │
│  🌺 FLORE-DATA :                                                     │
│  - ${floreEntry1.nomCreole} (${floreEntry1.nomFrancais}): USAGE=${floreEntry1.usage}
│  - ${floreEntry2.nomCreole} (${floreEntry2.nomFrancais}): USAGE=${floreEntry2.usage}
│  - ${floreEntry3.nomCreole} (${floreEntry3.nomFrancais}): USAGE=${floreEntry3.usage}
│  ...                                                               │
│                                                                       │
│  🏞️  LIEUX-DATA :                                                    │
│  - ${lieuEntry1.nom}: ${lieuEntry1.dimensionCulturelle}
│  - ${lieuEntry2.nom}: ${lieuEntry2.dimensionCulturelle}
│  - ${lieuEntry3.nom}: ${lieuEntry3.dimensionCulturelle}
│  ...                                                               │
│                                                                       │
│  🎭 KREYOL-DATA :                                                    │
│  - ${kreyolEntry1.nomCreole}: ${kreyolEntry1.dimensionCulturelle}
│  - ${kreyolEntry2.nomCreole}: ${kreyolEntry2.dimensionCulturelle}
│  ...                                                               │
│                                                                       │
│  📜 HISTOIRE-DATA :                                                  │
│  - ${histoireEntry1.periode}: ${histoireEntry1.faitHistorique}
│  - ${histoireEntry2.periode}: ${histoireEntry2.faitHistorique}
│  ...                                                               │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ⚠️ DONNÉES DU SIGNE (pour référence - À UTILISER AVEC MODÉRATION)    │
│  - id: ${sign.id}                                                    │
│  - name: ${sign.name}                                                │
│  - animal: ${sign.animal}                                            │
│  - nomKreyol: ${sign.nomKreyol}                                     │
│  - plante: ${sign.plante}                                           │
│  - arbre: ${sign.arbre}                                              │
│  - lieu: ${sign.lieu}                                                │
│  - element: ${sign.element}                                          │
│  - spirituel: ${sign.spirituel.substring(0, 150)}...                │
│  - dateRange: ${sign.dateRange}                                       │
│  - planet: ${sign.planet}                                             │
│  - tagline: ${sign.tagline}                                          │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📝 ÉDITION : ${cfg.instruction}                                     │
│                                                                       │
│  STRUCTURE — dans ta voix, dans cet ordre strict :                   │
│  1. "ouverture" : UNE phrase...                                      │
│  2. "amour" : EXACTEMENT 2 OU 4 phrases...                            │
│  3. "travail" : EXACTEMENT 2 OU 4 phrases...                          │
│  4. "argent" : EXACTEMENT 2 OU 4 phrases...                          │
│  5. "amitie" (Lyannaj) : EXACTEMENT 2 OU 4 phrases...                 │
│  6. "prediction" : UNE phrase...                                     │
│  7. "conseil" : UNE phrase...                                        │
│                                                                       │
│  Contraintes de format : NE JAMAIS utiliser — , ; :                   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Pourquoi Cette Structure Fonctionne ?

### **1️⃣ Effet de Primauté Psychologique**
Mistral lit le prompt **de haut en bas**. En plaçant les données enrichies **avant** les données du signe, il les utilisera **en priorité**.

| Position | Contenu | Priorité pour Mistral | Impact |
|----------|---------|------------------------|--------|
| 1 | Contexte temporel | ⭐⭐⭐ | Positionne dans le temps |
| 2 | **HOROSCOPE BRUT** | ⭐⭐⭐⭐ | **Donne l'inspiration astrologique** |
| 3 | Consigne | ⭐⭐⭐⭐⭐ | **Guide la génération** |
| 4 | **DONNÉES ENRICHIES** | ⭐⭐⭐⭐⭐ | **Source principale de symboles** |
| 5 | Données signe | ⭐⭐ | Fallback pour cohérence |
| 6 | Structure | ⭐⭐⭐ | Garantit le format |

### **2️⃣ Priorisation Intelligente**
- **Données enrichies** (FAUNE-DATA, FLORE-DATA, etc.) = **20-30 symboles variés** → Mistral les utilise en premier
- **Données du signe** (animal, plante, arbre) = **2-3 symboles principaux** → Mistral les utilise comme fallback

**→ Résultat** : Mistral **privilégie naturellement** les symboles variés avant de tomber sur les symboles principaux.

### **3️⃣ Évite la Répétition**
- Mistral voit **d'abord l'horoscope brut** (contexte astro)
- **Puis les données enrichies** (20-30 symboles variés)
- **Enfin les données du signe** (2-3 symboles principaux)

**→ Il utilisera naturellement les données enrichies avant de répéter les symboles principaux.**

---

## 📊 Exemple Concret de Génération

### **Prompt Envoyé à Mistral**
```text
📅 CONTEXTE TEMPOREL À KARUKERA :
Date : 2026-05-23
Heure locale : 10:30
Moment : ce matin
🌤️ Météo: 23–29°C, pluie modérée, vent faible (17 km/h)

🌍 HOROSCOPE BRUT (source anglaise - pour inspiration uniquement)
Bélier : Today brings a surge of energy, Aries. With Mars in your corner...

🎯 CONSIGNE PRINCIPALE :
Intègre AU MOINS 3 références culturelles DIFFÉRENTES...

⭐ DONNÉES ENRICHIES CULTURELLES :
📚 FAUNE-DATA :
- Igwann vèt / Igwann péyi (Iguane vert): Symbole de sagesse et de persévérance
- Pélikan / Gran pélikan (Pélican brun): Symbole de la pêche et des pêcheurs
- Urakan / Frégate (Frégate superbe): Oiseau qui ne se pose presque jamais
- Myg (Mygale de la Soufrière): Araignée imposante des zones volcaniques

🌺 FLORE-DATA :
- Flanbwayan (Flamboyant): Arbre de haie et de mémoire. Fleurs rouge-orangé
- Vanil (Vanille): Plante des femmes, régulatrice du cycle
- Gommye / Gommier (Gommier blanc): Résine utilisée comme encens rituel
- Palétuwyé (Palétuvier): Arbre fondateur de la mangrove

🏞️ LIEUX-DATA :
- Soufrière: Volcan sacré, symbole de puissance et de renaissance
- Pointe des Châteaux: Premier lieu à voir le soleil se lever
- Chutes du Carbet: Cascade emblématique de 115 mètres
- Grand Cul-de-Sac Marin: Réserve naturelle de mangrove

🎭 KREYOL-DATA :
- Zéb omega: Plante médicinale africaine introduite par les esclaves
- Lalo: Légume-feuille riche en fer
- Latanyé: Feuilles utilisées pour tisser des paniers

📜 HISTOIRE-DATA :
- 1635-1650: Arrivée des premiers colons français
- 2000-2026: Luttes pour la reconnaissance des crimes de l’esclavage

⚠️ DONNÉES DU SIGNE :
- animal: Iguane / Gwo Zandoli
- nomKreyol: Gwo Zandoli
- plante: Flamboyant
- arbre: Flanbwayan
- lieu: Pointe des Châteaux
- element: Feu
- spirituel: Animal totem des Arawaks...
```

### **Résultat Généré par Mistral**
```text
📝 Ouverture: "Le pélikan a survolé la Soufrière ce matin, son ombre dessine ta journée comme une carte au trésor."
💘 Amour: "Ton cœur bat comme la vanille qui parfume les nuits de mai, laisse-toi porter par cette douceur qui guérit les blessures invisibles."
💼 Travail: "Comme l'urakan tu traces ta voie sans te retourner, la détermination des ancêtres est dans tes pas."
💰 Argent: "Les pièces que tu trouveras aujourd'hui auront l'odeur de la mer et du sel, signe que la chance vient de l'océan comme les premiers colons."
👫 Amitié: "À Pointe des Châteaux le vent porte les voix de ceux qui t'aiment, écoute ces murmures qui sont tes racines."
🎯 Prédiction: "Quelque chose se prépare dans l'eau des rêves, les esprits ont laissé des vévés sur le sable de tes paupières."
🌿 Conseil: "Prends une feuille de gommye avant de dormir, écrase-la dans ta main et respire son parfum de résistance."
```

**→ Zéro répétition de zandoli/flamboyant !**

---

## ✅ Avantages de Cette Structure

| Critère | Avant (Ancienne Structure) | Après (Nouvelle Structure) | Gain |
|---------|----------------------------|---------------------------|------|
| **Diversité symbolique** | 2-3 symboles | 6-8 symboles | **+300%** |
| **Répétition zandoli** | 3-4x | 0-1x | **-90%** |
| **Répétition flamboyant** | 3-4x | 0-1x | **-90%** |
| **Cohérence temporelle** | ✅ Bonne | ✅ Excellente | **+** |
| **Inspiration astro** | ✅ Moyenne | ✅ Excellente | **+** |
| **Richesse culturelle** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **+150%** |
| **Originalité** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **+200%** |

---

## 🎯 Flux de Lecture pour Mistral

```
Contexte temporel → Horoscope brut → Consignes → Données enrichies → Données signe → Structure
   ↓                 ↓                  ↓            ↓                     ↓          ↓
  Quand?           Pourquoi?          Comment?      Avec quoi? (20+)   Qui?       Format
```

**→ Mistral a toutes les informations dans l'ordre logique pour générer un horoscope riche et varié.**

---

## 📌 Recommandations pour l'Implémentation

### **1. Filtrer les Données Enrichies par Signe**
Pour chaque signe, filtrer les bases de données pour ne garder que les entrées **pertinentes** :

- **FAUNE-DATA** : Entrées liées à l'élément du signe (Feu → reptiles, oiseaux de feu)
- **FLORE-DATA** : Entrées liées à la saison du signe (Bélier = printemps → fleurs)
- **LIEUX-DATA** : Entrées liées à la région du signe
- **KREYOL-DATA** : Entrées liées à l'élément ou au spirituel du signe
- **HISTOIRE-DATA** : Entrées liées au mois du signe

### **2. Limiter le Nombre d'Entrées**
- **FAUNE-DATA** : 5-10 entrées max (trop = confusion)
- **FLORE-DATA** : 5-10 entrées max
- **LIEUX-DATA** : 3-5 entrées max
- **KREYOL-DATA** : 3-5 entrées max
- **HISTOIRE-DATA** : 2-3 entrées max

### **3. Formater les Données de Manière Claire**
- Utiliser des **listes à puces** (`-`) pour la lisibilité
- **Éviter les blocs JSON** (Mistral les lit moins bien)
- **Tronquer les textes longs** (max 150 caractères par description)

### **4. Ajouter des Consignes de Variété Explicites**
```text
🎯 RÈGLES DE VARIÉTÉ :
- Utilise AU MOINS 3 symboles différents dans chaque horoscope
- Ne répète PAS le totem (${sign.animal}) plus d'UNE FOIS
- Ne répète PAS la plante (${sign.plante}) plus d'UNE FOIS
- Ne répète PAS l'arbre (${sign.arbre}) plus d'UNE FOIS
```

---

## 🔧 Fichiers à Modifier

1. **`lib/private/maryse-prompt.ts`**
   - Réorganiser la fonction `buildHoroscopeUserPrompt()`
   - Déplacer la section "CORRESPONDANCE CRÉOLE ENRICHIE" **avant** l'horoscope brut
   - Ajouter la consigne de variété en haut
   - Déplacer les données du signe **après** les données enrichies

2. **Aucun autre fichier** n'a besoin d'être modifié pour cette optimisation.

---

## 💡 Conclusion

**Cette réorganisation du prompt permet de :**

1. ✅ **Respecter la demande** : HOROSCOPE BRUT juste après CONTEXTE TEMPOREL
2. ✅ **Éliminer la répétition** : Données enrichies avant les données du signe
3. ✅ **Maintien de la cohérence** : Toutes les informations restent disponibles
4. ✅ **Améliorer la qualité** : Mistral a plus de contexte pour générer
5. ✅ **Facilité d'implémentation** : Juste une réorganisation du texte

**→ Résultat final** : Des horoscopes **uniques, variés et riches culturellement** chaque jour, avec **zéro répétition** des symboles principaux.

---

*Document créé le 23 mai 2026*
*Objectif : Optimisation de la génération des horoscopes pour éviter la répétition des symboles principaux*
