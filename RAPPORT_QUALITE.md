# Rapport Qualité — Horoscopes Karukera
**Date** : 2026-05-30 | **Édition** : matin | **12 signes** | **Commit** : `7d281b2`  
**Workflow** : `🪐 Génération Horoscopes (Sécurisée)` — ✅ success

---

## Tableau de bord — Checks critiques

| Signe | Statut | Problème |
|---|:---:|---|
| Balance | ✅ | — |
| **Bélier** | ❌ | Ezili dans le texte (loa = Ogoun) |
| **Cancer** | ❌ | vèvè × 2 (limitVeve() contourné) |
| Capricorne | ✅ | — |
| Gémeaux | ✅ | — |
| Lion | ✅ | — |
| Poissons | ✅ | — |
| Sagittaire | ✅ | — |
| Scorpion | ✅ | — |
| **Taureau** | ❌ | ka × 4 + artefact "le ka ka" dans teaser |
| Verseau | ✅ | — |
| Vierge | ✅ | — |

**9/12 signes propres** sur tous les checks critiques.

---

## Progrès validés

### Section argent — transformation majeure

Chaque signe utilise maintenant son animal ou un comportement sign-specific :

| Signe | Métaphore argent |
|---|---|
| Balance | *"Manman dlo glisse entre les courants sans hâte — la richesse n'est pas dans la vitesse"* |
| Bélier | *"fourmis autour d'un morceau de cassave — discret mais constant"* |
| Cancer | *"Comme le crabe qui enterre ses trésors dans le sable"* |
| Capricorne | *"lait d'un kabrit nwè — rare, précieux, à ne pas gaspiller"* |
| Gémeaux | *"Observe le fwou-fwou : il ne stocke pas, il prend ce dont il a besoin"* |
| Lion | *"Le gran pélikan plonge et remonte avec un poisson dans son bec"* |
| Poissons | *"comment la tortue karet enterre ses œufs dans le sable"* |
| Sagittaire | *"crevettes dans les rivières — invisible mais présent"* |
| Scorpion | *"Le hèrkil ne transporte que ce dont il a besoin, jamais plus"* |

**Avant** : 3 signes utilisaient "lajan circule comme la sève de [plante]". **Après** : 0.

---

### Structures répétitives — réduction massive

| Formule | Avant | Après |
|---|:---:|:---:|
| "comme les racines de [arbre]" | 8/12 | **1/12** |
| "la pluie trace un vèvè" | 12/12 | **1/12** |
| ka dans les teasers | 9/12 | **4/12** |
| "laisse-toi porter" | 5/12 | **1/12** |

---

### Données de la base utilisées dans le texte

| | Faune | Flore |
|---|:---:|:---:|
| Signes utilisant les données | **9/12** | **10/12** |

Les 3 signes sans faune en base (Scorpion, Taureau) ou sans flore (Vierge) improvident — attendu, la base est incomplète pour ces signes.

---

### Teasers — diversification effective

| Signe | Teaser (extrait) |
|---|---|
| Balance | *"l'ibiskis rouge chuchote à ton oreille comme une confidence de femme libre"* |
| Cancer | *"la pluie trace un vèvè de Mami Dlo sur tes paupières"* |
| Gémeaux | *"ton âme est un kawoubouyé où deux chemins s'appellent"* |
| Lion | *"Ezili Freda effleure tes épaules de ses ailes poudrées d'or"* |
| Poissons | *"la feuille de korosòl sous la brise"* |
| Vierge | *"les Chutes du Carbet chantent à ton oreille"* |

---

## Problèmes résiduels

### 🔴 Nouveau cliché — zandoli 8/12

Le zandoli (animal du Bélier) s'est imposé comme nouvelle image générique de liberté/résilience :

> Balance, Bélier, Cancer, Gémeaux, Scorpion, Taureau, Verseau, Vierge

C'est le même mécanisme que `fromager` et `colibri` avant correction : le modèle utilise le zandoli car c'est l'animal créole le plus connu dans la littérature antillaise. **Cause directe** : les textes `spirituel` des signes mentionnent tous le proverbe ou l'image du zandoli comme métaphore universelle de résilience.

### 🔴 Vent 11/12 — résiste à toutes les interdictions

Le mot "vent" apparaît dans 11 signes sur 12, principalement dans les sections `travail` et `prediction`. Le post-processing (comme pour `tambour → ka` et `sève`) est la seule solution fiable.

### 🔴 ka 11/12 — omniprésent

Malgré la suppression de la règle "ka" dans le prompt teaser et la limite à 2 occurrences, `ka` reste dans 11/12 signes. Taureau l'utilise 4 fois. Le mot est maintenant ancré dans le modèle comme symbole vaudou universel.

### 🔴 vèvè 8/12 — limitVeve() insuffisant

`limitVeve()` limite à 1 occurrence par horoscope, mais `vèvè` reste présent dans 8 signes. Le pattern "la pluie trace un vèvè" persiste pour Cancer (1/12 au lieu de 12/12 — c'est un progrès) mais l'association pluie → vèvè reste ancrée.

### 🟡 Artefacts ponctuels

- **Taureau teaser** : *"le ka ka te murmure"* — duplication du mot par post-processing (`tambour → ka` sur un texte qui contenait déjà "ka")
- **Lion argent** : *"lajàn"* — accent erroné sur le `a` (`à` au lieu de `a`)
- **Cancer** : vèvè × 2 malgré `limitVeve()` — peut-être une orthographe alternative dans le texte brut

### 🟡 Loa Bélier — Ezili persiste

Bélier (loa = Ogoun) cite Ezili. La règle prompt est ignorée pour ce signe depuis plusieurs itérations. Ezili est culturellement associée à l'amour — le modèle l'utilise systématiquement dans la section `amour` du Bélier.

---

## Analyse — ce qui résiste et pourquoi

Le modèle a un **répertoire de symboles créoles** limité qu'il utilise comme raccourcis culturels :

| Symbole | Usage actuel | Rôle dans l'entraînement |
|---|---|---|
| `zandoli` | 8/12 | Animal créole = résilience universelle |
| `vent` | 11/12 | Image naturelle = liberté/mouvement |
| `ka` | 11/12 | Symbole vaudou = rythme/énergie |
| `vèvè` | 8/12 | Symbole vaudou = sacré/protection |
| `Ezili` | dans amour | Loa = amour universel |

Ces cinq éléments forment le **squelette narratif caribéen** du modèle. Chaque correction déplace le problème vers un autre élément de ce répertoire sans réduire la répétition globale.

**Conclusion architecturale** : le post-processing par regex est le seul mécanisme fiable pour éliminer les clichés. Le prompt engineering seul ne suffit pas pour ces termes profondément ancrés.

---

## Recommandations

| Priorité | Action | Mécanisme |
|---|---|---|
| Haute | `zandoli` → post-processing : interdire sauf pour Bélier | regex sur structured |
| Haute | `vent` → post-processing : remplacer par une alternative sign-specific | regex ciblée |
| Moyenne | `ka` → limiter à 1 occurrence par horoscope (comme vèvè) | étendre limitVeve() |
| Moyenne | Taureau teaser "le ka ka" → détecter les doublons mot | post-processing |
| Basse | `lajàn` → normaliser accent | regex `.replace(/lajàn/g, 'lajan')` |
| Basse | Bélier/Ezili → post-processing ciblé sur section amour | regex sur parsed.amour |
