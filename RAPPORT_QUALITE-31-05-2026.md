# Rapport Qualité — Horoscopes Karukera
**Date** : 2026-05-31 | **Éditions analysées** : nuit + matin + midi + soir | **48 entrées** (12 signes × 4 éditions)  
**Source** : table `horoscopes` Supabase | **Référence précédente** : RAPPORT_QUALITE.md (30-05-2026)

---

## Tableau de bord — Checks critiques (édition matin)

| Signe | Statut | Problème |
|---|:---:|---|
| Balance | ✅ | — |
| **Bélier** | ❌ | vent dans travail et amitie |
| Cancer | ✅ | — |
| **Capricorne** | ❌ | lajan circule dans argent |
| **Gémeaux** | ❌ | vèvè × 1 + colibri saturé (3–5×/édition) |
| Lion | ✅ | — |
| Poissons | ✅ | — |
| **Sagittaire** | ❌ | vent dans amitie |
| **Scorpion** | ❌ | vent dans amitie |
| **Taureau** | ❌ | ka × 3 dans amour (artefact "ka ka" persistant) |
| **Verseau** | ❌ | lajan circule + vent dans 4/4 éditions |
| **Vierge** | ❌ | vent + ka × 2 |

**4/12 signes propres** sur l'édition matin.

---

## Progression vs rapport 30-05-2026

| Symbole | 30-05 | 31-05 (48 éd.) | Tendance |
|---|:---:|:---:|:---:|
| vèvè | 12/12 signes | **2/48** | ✅ −10 |
| zandoli | 8/12 signes | **1/48** | ✅ −7 |
| comme les racines | 8/12 signes | **3/48** | ✅ −5 |
| tambour | ?/12 signes | **0/48** | ✅ éliminé |
| ka | 11/12 signes | **20/48** | 🔴 régression |
| laisse-toi porter | 5/12 signes | **9/48** | 🔴 +4 |
| lajan circule | 3/12 signes | **15/48** | 🔴 +12 |
| **vent** | non mesuré | **27/48** | 🔴 nouveau cliché majeur |

---

## Progrès validés

### vèvè — quasi-éliminé
Présent dans **2/48 éditions** seulement (Gémeaux matin, Lion nuit), contre 12/12 le jour précédent. `limitVeve()` fonctionne correctement.

### zandoli — quasi-éliminé
**1/48** (Scorpion soir uniquement). Le cliché "zandoli = résilience universelle" est contenu.

### tambour — éliminé
**0/48**. Transformation `tambour → ka` effective dans le post-processing.

### comme les racines
**3/48** contre 8/12. Tendance à la baisse confirmée.

---

## Problèmes résiduels

### 🔴 Vent — nouveau cliché dominant : 27/48 (56 %)

Le `vent` est devenu le cliché structurant du jour, présent dans **11 signes sur 12** et dans toutes les éditions pour Bélier et Verseau.

| Signe | Éditions touchées | Sections |
|---|---|---|
| Bélier | nuit, matin, midi, soir (4/4) | travail systématiquement |
| Verseau | nuit, matin, midi, soir (4/4) | ouverture, amour, teaser |
| Cancer | midi, nuit, soir | ouverture, amour, prediction |
| Gémeaux | midi, nuit, soir | amitie, travail |
| Lion | midi, nuit, soir | travail, amour, teaser |
| Sagittaire | matin, midi, soir | ouverture, amour, amitie |
| Scorpion | matin, midi | ouverture, amitie |

**Cause** : "vent alizé" est l'image naturelle la plus accessible du modèle pour les sections travail/prédiction. Le prompt ne l'interdit pas explicitement.

---

### 🔴 Lajan circule — régression massive : 15/48 (31 %)

La formule `lajan circule comme [X]` envahit la section argent.

| Pattern | Occurrences |
|---|---|
| `lajan circule comme l'eau` | Verseau matin, nuit (verbatim) |
| `lajan circule comme [animal]` | Capricorne, Scorpion, Poissons, Vierge |
| `lajan coule` | Cancer nuit, Lion midi |

**Nuance** : la diversification animale est réelle (kabrit, karet, poisson-lait, mangouste) mais la structure `lajan circule comme` reste mécanique. **20/48 éditions** utilisent une formule générique dans la section argent (`lajan circule`, `comme l'eau`, `la marée`).

---

### 🔴 Ka — 20/48 (42 %), Taureau critique

| Signe | Problème |
|---|---|
| **Taureau matin** | ka × 3 dans amour + artefact **"ka ka"** (*"rythme du ka ka"*) |
| **Taureau midi** | ka × 1 amour + × 1 amitie |
| **Taureau nuit** | ka × 1 amour + × 1 amitie + × 1 teaser |
| Bélier soir | ka × 2 dans amitie |
| Vierge matin | ka × 1 travail + × 1 amitie |

Le Taureau génère "ka ka" car le post-processing `tambour → ka` s'applique à un texte qui contient déjà "ka" : `"rythme du tambour ka"` → `"rythme du ka ka"`. Doublon de substitution.

---

### 🔴 Ezili hors Lion — Lion 4/4 éditions

Le Lion (loa = **Ogoun**) cite Ezili dans **toutes ses éditions** :

| Édition | Sections concernées |
|---|---|
| matin | amour, prediction, teaser |
| midi | amour, teaser |
| nuit | ouverture, conseil |
| soir | amour, teaser |

Même constat que le 30-05. La correction prompt n'est pas absorbée pour ce signe.

---

### 🟡 Gémeaux — colibri saturé

Le colibri (animal totem du Gémeaux) apparaît **3 à 5 fois par édition**, dans ouverture, amour, argent, et teaser simultanément.

| Édition | Occurrences |
|---|---|
| nuit | 4 |
| matin | 3 |
| soir | 3 |
| midi | 5 |

La règle "ne pas répéter le totem plus d'une fois" n'est pas appliquée pour le colibri.

---

### 🟡 Laisse-toi porter — 9/48 (19 %)

Principalement dans **amour** (Balance, Gémeaux, Sagittaire, Verseau, Vierge nuit/soir) et **teaser** (Poissons, Verseau, Vierge). Concentration sur les éditions nuit et soir.

---

## Analyse

### Ce qui résiste et pourquoi

| Symbole | Persistance | Mécanisme |
|---|---|---|
| `vent` | 56 % | Image naturelle universelle, non interdite dans le prompt |
| `lajan circule comme` | 31 % | Structure mémorisée pour la section argent |
| `ka` (Taureau) | artefact | Bug post-processing : double substitution `tambour → ka` sur texte contenant déjà "ka" |
| `Ezili` (Lion) | 4/4 | Ezili = loa de l'amour → section amour du Lion, association plus forte que la règle loa |
| `laisse-toi porter` | 19 % | Formule de transition douce, absente des interdictions |
| `colibri` (Gémeaux) | 3–5× | Totem non limité dans le prompt |

### Dynamique globale

Les corrections du 30-05 ont été efficaces sur les clichés **structurels visuels** (vèvè, zandoli, fromager, tambour). Le modèle a compensé en renforçant les clichés **dynamiques** : vent (mouvement), lajan circule (flux), laisse-toi porter (abandon). Ce sont des images de mouvement, pas de forme — elles passent mieux les filtres existants.

---

## Recommandations

| Priorité | Action | Mécanisme |
|---|---|---|
| 🔴 Haute | `vent` → interdire dans prompt + post-processing alternatives sign-specific | regex sur structured, alternatives par élément (Feu → chaleur, Eau → courant, Air → souffle, Terre → racine) |
| 🔴 Haute | `lajan circule comme` → interdire la structure, garder `lajan` | regex `lajan circule comme` → rewriter post-processing |
| 🔴 Haute | Taureau / bug "ka ka" → détecter et supprimer les doublons de substitution | post-processing : `re.sub(r'\bka\s+ka\b', 'ka', text)` |
| 🟠 Moyenne | Gémeaux colibri → étendre `limitVeve()` à tous les totems | généraliser : `limitSymbol(text, sign.animal, max=1)` |
| 🟠 Moyenne | `laisse-toi porter` → ajouter aux interdictions du prompt | + post-processing vers alternatives |
| 🟡 Basse | Lion / Ezili → post-processing ciblé section amour | `if sign == 'lion': remove_ezili(parsed.amour)` |
| 🟡 Basse | `comme l'eau` dans argent → ajouter aux formules génériques interdites | regex argent |
