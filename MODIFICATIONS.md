# Journal des modifications — branche `vaudou`

> Modifications non encore poussées sur le remote. Code testé localement avec génération sur 3 signes (Gémeaux, Lion, Capricorne, date 2026-05-29).

---

## Post-processing — ajouts récents (generate-horoscopes.ts)

| Fonction | Effet |
|---|---|
| `removeSeve()` | Remplace "lajan circule/coule comme la sève [plante]." par "Lajan se déplace avec discernement aujourd'hui." — prohibition prompt ignorée par le modèle |

---

## Post-processing — historique (generate-horoscopes.ts)

| Fonction | Effet |
|---|---|
| `tambour → ka` | Remplace "tambour(s)" par "ka" dans corps + teaser |
| `— → ,` | Remplace le tiret cadratin par une virgule |
| `Le/La lajan → Lajan` | Supprime l'article redondant devant "lajan" |
| `restoreApostrophes()` | Réinsère `l'`, `d'`, `j'`, `c'est`, `s'il`, `aujourd'hui` |
| `limitVeve()` | Limite "vèvè" à 1 occurrence par horoscope (2e+ → "signe sacré") |

---

## Prompt système — ajouts récents (maryse-prompt.ts)

| Règle ajoutée | Problème corrigé |
|---|---|
| INTERDIT tout loa autre que `vaudouContext.loa` dans toutes les sections | Ezili dans Gémeaux amour (fuite thématique amour → Ezili) |
| INTERDIT dans argent : métaphore "lajan circule/coule comme la sève" | Structure identique pour les 3 signes testés |

---

## Prompt système — historique (maryse-prompt.ts)

| Règle ajoutée | Problème corrigé |
|---|---|
| Contrainte de format : autoriser `'` explicitement | Apostrophes supprimées par le modèle |
| Élisions obligatoires : `l'arbre`, `d'Ogoun` | Apostrophes manquantes dans le texte |
| `HISTOIRE-DATA` interdit dans "argent" | Référence à l'esclavage dans une section financière |
| Ne citer aucun mois autre que le mois en cours | "en juillet" dans un horoscope de mai |
| `lajan` sans article | "le lajan" = "le l'argent" |
| `vèvè` : 1 max par horoscope | Nouveau cliché de remplacement des bougies |
| `INTERDIT dans "amour"/"amitie"` : soukougnan, volant, zombi | Créatures de terreur dans sections affectives |
| `INTERDIT dans "conseil"` : Legba + bougie | Legba dans 12/12 signes, bougies sans surveillance |
| Symboles propres au signe (pas fromager/colibri) | fromager 8/12 signes, colibri 7/12 signes |
| Sécurité étendue à toutes sections (pas seulement "conseil") | Bougies dans ambiances lune.esprit, lune.bienetre |

---

## Filtres de données (maryse-prompt.ts)

| Correction | Problème corrigé |
|---|---|
| `splitTokens()` : découpe sur `/` et `()` | "Colibri huppé / Foufou" non trouvé → fauneEnrichies vide pour 10/12 signes |
| `splitTokens()` : inclut `nomFrancais` dans filtre faune | "iguane" dans nomFrancais non cherché → Bélier sans faune |
| `CREOLE_VARIANTS` : `balizié → balisié` | Lion sans flore (écart d'accentuation z/s) |
| `isLongPeriod()` : exclut les périodes "2000-2026" | Faux positifs sur l'année en cours dans histoireEnrichies |
| `HISTOIRE-DATA` restreint à `ouverture` et `prediction` | "luttes de 2000-2026" dans section argent |

---

## Scripts annexes (generate-presage-du-jour.ts, generate-ambiances.ts)

| Fichier | Modification |
|---|---|
| `generate-presage-du-jour.ts` | Interdit bougie/flamme dans PRESAGE_SYSTEM + "ka" vs "tambour" |
| `generate-ambiances.ts` | Supprime fallback `loa \|\| 'Legba'` + règle bougie/Legba/ka dans bloc lune |

---

## Glossaire (glossaire.ts)

| Correction | Effet |
|---|---|
| `GLOSSARY_STOP_WORDS` : rejeter clés < 3 chars | Faux termes "k", "b", "s", "Ind", "pi" |
| Déduplication intra-run dans `extractGlossaryTerms` | "gribyoz" auto-conflits x4 dans un seul run |
