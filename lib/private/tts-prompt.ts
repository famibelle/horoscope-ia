import type { Sign } from '../signs-data';
import type { HoroscopeResponse } from '../horoscope-data';
import type { Edition } from './maryse-prompt';
import { todayGuadeloupe } from '../edition';
import { floreData, getFloreByNomCreole } from './flore-data';
import { fauneData, getFauneByNomCreole } from './faune-data';
import { lieuxData, getLieuByNom } from './lieux-data';
import { kreyolData, getKreyolByNom } from './kreyol-data';
import { histoireData, getHistoireByPeriode, getHistoireByMotCle } from './histoire-data';

/* ── Helper : Formater la date en français ──────────────────── */
function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/* ── Helper : Salutation selon l'édition ──────────────────── */
function getSalutation(edition: Edition): { greeting: string; moment: string } {
  const salutions: Record<Edition, { greeting: string; moment: string }> = {
    matin: { greeting: 'Bonjour', moment: 'Ce matin' },
    midi: { greeting: 'Bonjour', moment: 'Cet après-midi' },
    soir: { greeting: 'Bonsoir', moment: 'Ce soir' },
    nuit: { greeting: 'Bonsoir', moment: 'Cette nuit' },
  };
  return salutions[edition] || salutions.matin;
}

/* ── Helper : Enrichir les données flore avec flore-data.ts ──────── */
function getEnrichedFlore(signFlore?: {
  nom_creole?: string;
  nom_commun?: string;
  famille?: string;
  savoir?: string;
  typeResistance?: string;
  sacreSymbolique?: string;
}) {
  if (!signFlore) {
    return {
      nomCreole: 'non spécifiée',
      nomFrancais: 'non spécifié',
      categorie: 'non spécifiée',
      resistanceType: undefined,
      resistanceDescription: undefined,
      sacreSymbolique: undefined,
      dimensionCulturelle: '',
    };
  }

  // Chercher dans flore-data.ts par nom commun ou nom créole
  let floreEntry = getFloreByNomCreole(signFlore.nom_commun || '');
  if (!floreEntry) {
    floreEntry = getFloreByNomCreole(signFlore.nom_creole || '');
  }
  if (!floreEntry) {
    // Recherche par nom scientifique
    floreEntry = floreData.find(f => 
      f.nomScientifique.toLowerCase().includes((signFlore.nom_commun || '').toLowerCase()) ||
      f.nomScientifique.toLowerCase().includes((signFlore.nom_creole || '').toLowerCase())
    );
  }

  if (floreEntry) {
    return {
      nomCreole: floreEntry.nomCreole,
      nomFrancais: floreEntry.nomFrancais,
      categorie: floreEntry.categorie,
      resistanceType: floreEntry.resistanceType,
      resistanceDescription: floreEntry.resistanceDescription,
      sacreSymbolique: floreEntry.sacreSymbolique,
      dimensionCulturelle: floreEntry.dimensionCulturelle,
    };
  }

  // Retourner les données du signe si pas trouvé dans flore-data
  return {
    nomCreole: signFlore.nom_creole || 'non spécifiée',
    nomFrancais: signFlore.nom_commun || 'non spécifié',
    categorie: signFlore.famille || 'non spécifiée',
    resistanceType: signFlore.typeResistance,
    resistanceDescription: undefined,
    sacreSymbolique: signFlore.sacreSymbolique,
    dimensionCulturelle: signFlore.savoir || '',
  };
}

/* ── Helper : Enrichir les données faune avec faune-data.ts ──────── */
function getEnrichedFaune(signFaune?: {
  nom_creole?: string;
  nom_commun?: string;
  famille?: string;
  savoir?: string;
  typeResistance?: string;
  sacreSymbolique?: string;
}) {
  if (!signFaune) {
    return {
      nomCreole: 'non spécifié',
      nomFrancais: 'non spécifié',
      categorie: 'non spécifiée',
      sousCategorie: 'non spécifiée',
      resistanceType: undefined,
      resistanceDescription: undefined,
      sacreSymbolique: undefined,
      dimensionCulturelle: '',
    };
  }

  // Chercher dans faune-data.ts par nom commun ou nom créole
  let fauneEntry = getFauneByNomCreole(signFaune.nom_commun || '');
  if (!fauneEntry) {
    fauneEntry = getFauneByNomCreole(signFaune.nom_creole || '');
  }
  if (!fauneEntry) {
    // Recherche par nom scientifique
    fauneEntry = fauneData.find(f =>
      f.nomScientifique.toLowerCase().includes((signFaune.nom_commun || '').toLowerCase()) ||
      f.nomScientifique.toLowerCase().includes((signFaune.nom_creole || '').toLowerCase())
    );
  }

  if (fauneEntry) {
    return {
      nomCreole: fauneEntry.nomCreole,
      nomFrancais: fauneEntry.nomFrancais,
      categorie: fauneEntry.categorie,
      sousCategorie: fauneEntry.sousCategorie,
      resistanceType: fauneEntry.resistanceType,
      resistanceDescription: fauneEntry.resistanceDescription,
      sacreSymbolique: fauneEntry.sacreSymbolique,
      dimensionCulturelle: fauneEntry.dimensionCulturelle,
    };
  }

  // Retourner les données du signe si pas trouvé dans faune-data
  return {
    nomCreole: signFaune.nom_creole || 'non spécifié',
    nomFrancais: signFaune.nom_commun || 'non spécifié',
    categorie: signFaune.famille || 'non spécifiée',
    sousCategorie: 'non spécifiée',
    resistanceType: signFaune.typeResistance,
    resistanceDescription: undefined,
    sacreSymbolique: signFaune.sacreSymbolique,
    dimensionCulturelle: signFaune.savoir || '',
  };
}

/* ── Helper : Enrichir les données lieu avec lieux-data.ts ──────── */
function getEnrichedLieu(signLieu?: {
  localisation?: string;
  categorie?: string;
  sacreSymbolique?: string;
  symbolique?: string;
  description?: string;
}) {
  if (!signLieu) {
    return {
      nom: 'non spécifié',
      localisation: 'non spécifiée',
      categorie: 'non spécifiée',
      sousCategorie: 'non spécifiée',
      resistanceType: undefined,
      resistanceDescription: undefined,
      sacreSymbolique: undefined,
      dimensionCulturelle: '',
    };
  }

  // Chercher dans lieux-data.ts par localisation ou nom
  let lieuEntry = getLieuByNom(signLieu.localisation || '');
  if (!lieuEntry) {
    lieuEntry = getLieuByNom(signLieu.categorie || '');
  }

  if (lieuEntry) {
    return {
      nom: lieuEntry.nom,
      localisation: lieuEntry.localisation,
      categorie: lieuEntry.categorie,
      sousCategorie: lieuEntry.sousCategorie,
      resistanceType: lieuEntry.resistanceType,
      resistanceDescription: lieuEntry.resistanceDescription,
      sacreSymbolique: lieuEntry.sacreSymbolique,
      dimensionCulturelle: lieuEntry.dimensionCulturelle,
    };
  }

  // Retourner les données du signe si pas trouvé dans lieux-data
  return {
    nom: signLieu.localisation || 'non spécifié',
    localisation: signLieu.localisation || 'non spécifiée',
    categorie: signLieu.categorie || 'non spécifiée',
    sousCategorie: 'non spécifiée',
    resistanceType: undefined,
    resistanceDescription: undefined,
    sacreSymbolique: signLieu.sacreSymbolique,
    dimensionCulturelle: signLieu.symbolique || signLieu.description || '',
  };
}

/* ── Helper : Enrichir les données kreyol avec kreyol-data.ts ──── */
function getEnrichedKreyol(signSymbol?: {
  nom_creole?: string;
  nom_commun?: string;
  typeResistance?: string;
  famille?: string;
}) {
  if (!signSymbol) {
    return {
      nomCreole: 'non spécifié',
      nomFrancais: 'non spécifié',
      famille: 'non spécifiée',
      typeResistance: undefined,
      resistanceDescription: undefined,
      dimensionCulturelle: '',
    };
  }

  // Chercher dans kreyol-data.ts
  let kreyolEntry = getKreyolByNom(signSymbol.nom_creole || '');
  if (!kreyolEntry) {
    kreyolEntry = getKreyolByNom(signSymbol.nom_commun || '');
  }

  if (kreyolEntry) {
    return {
      nomCreole: kreyolEntry.nomCreole,
      nomFrancais: kreyolEntry.nomFrancais,
      famille: kreyolEntry.famille,
      typeResistance: kreyolEntry.typeResistance,
      resistanceDescription: kreyolEntry.resistanceDescription,
      dimensionCulturelle: kreyolEntry.dimensionCulturelle,
    };
  }

  return {
    nomCreole: signSymbol.nom_creole || 'non spécifié',
    nomFrancais: signSymbol.nom_commun || 'non spécifié',
    famille: signSymbol.famille || 'non spécifiée',
    typeResistance: signSymbol.typeResistance,
    resistanceDescription: undefined,
    dimensionCulturelle: '',
  };
}

/* ── Helper : Enrichir avec histoire guadeloupeenne ──────────── */
function getEnrichedHistoire(texte?: string): {
  periode?: string;
  faitHistorique?: string;
  porteeSymbolique?: string;
} {
  if (!texte) {
    return {
      periode: undefined,
      faitHistorique: undefined,
      porteeSymbolique: undefined,
    };
  }

  // Chercher dans histoire-data.ts par mots-clés
  const histoireEntry = getHistoireByMotCle(texte);
  
  if (histoireEntry) {
    return {
      periode: histoireEntry.periode,
      faitHistorique: histoireEntry.faitHistorique,
      porteeSymbolique: histoireEntry.porteeSymbolique,
    };
  }

  return {
    periode: undefined,
    faitHistorique: undefined,
    porteeSymbolique: undefined,
  };
}

/**
 * Génère un prompt pour le LLM afin de produire un texte TTS riche et authentique,
 * intégrant TOUS les éléments culturels enrichis de culturalData :
 * - faune.typeResistance, faune.sacreSymbolique
 * - flore.typeResistance, flore.sacreSymbolique
 * - lieuDetails.categorie, lieuDetails.sacreSymbolique
 * - Et tous les autres champs traditionnels
 */
export function buildTTSPrompt(
  sign: Sign,
  horoscope: HoroscopeResponse,
  date?: string,
  edition?: Edition
): string {
  const dateToUse = date || todayGuadeloupe();
  const ed = edition || horoscope.edition || 'matin';
  const formattedDate = formatDateFr(dateToUse);
  const { greeting, moment } = getSalutation(ed);
  const { faune, flore, lieuDetails, element, spirituel, nomKreyol } = sign;

  // Enrichir les données avec les fichiers de référence
  const enrichedFlore = getEnrichedFlore(flore);
  const enrichedFaune = getEnrichedFaune(faune);
  const enrichedLieu = getEnrichedLieu(lieuDetails);
  // Enrichir kreyol à partir de la faune ou flore du signe
  const enrichedKreyol = getEnrichedKreyol(faune || flore);
  const enrichedHistoire = getEnrichedHistoire(element);

  return `Tu es Maryse Condé. Rédige un texte **oral** pour l'horoscope du ${sign.name} (${nomKreyol}), édition ${ed}, date du ${dateToUse}.
Le texte sera lu par TTS : **pas de JSON, pas de markdown**, uniquement du texte brut avec une ponctuation naturelle.

---

ÉLÉMENTS CULTURELS À INTÉGRER (obligatoire) :
- **Faune** : ${enrichedFaune.nomCreole} (${enrichedFaune.nomFrancais})
  → Catégorie : ${enrichedFaune.categorie}
  → Sous-catégorie : ${enrichedFaune.sousCategorie}
  → **Type de résistance** : ${enrichedFaune.resistanceType || faune?.typeResistance || 'non spécifié'}
  → **Sacré/Symbolique** : ${enrichedFaune.sacreSymbolique || faune?.sacreSymbolique || 'non spécifié'}
  → **Description de résistance** : ${enrichedFaune.resistanceDescription || ''}
  → Savoir traditionnel : ${enrichedFaune.dimensionCulturelle?.split('.')[0] || faune?.savoir?.split('.')[0] || ''}

- **Flore** : ${enrichedFlore.nomCreole} (${enrichedFlore.nomFrancais})
  → Catégorie : ${enrichedFlore.categorie}
  → **Type de résistance** : ${enrichedFlore.resistanceType || flore?.typeResistance || 'non spécifié'}
  → **Sacré/Symbolique** : ${enrichedFlore.sacreSymbolique || flore?.sacreSymbolique || 'non spécifié'}
  → **Description de résistance** : ${enrichedFlore.resistanceDescription || flore?.savoir?.split('.')[0] || ''}
  → Savoir traditionnel : ${enrichedFlore.dimensionCulturelle?.split('.')[0] || flore?.savoir?.split('.')[0] || ''}

- **Lieu sacré** : ${enrichedLieu.nom} (${enrichedLieu.localisation})
  → **Catégorie** : ${enrichedLieu.categorie || lieuDetails?.categorie || 'non spécifiée'}
  → Sous-catégorie : ${enrichedLieu.sousCategorie || ''}
  → **Sacré/Symbolique** : ${enrichedLieu.sacreSymbolique || lieuDetails?.sacreSymbolique || 'non spécifié'}
  → **Type de résistance** : ${enrichedLieu.resistanceType || ''}
  → **Description de résistance** : ${enrichedLieu.resistanceDescription || ''}
  → Symbolique : ${lieuDetails?.symbolique || ''}
  → Description : ${enrichedLieu.dimensionCulturelle?.split('.')[0] || lieuDetails?.description || ''}

- **Symbole de résistance** : ${enrichedKreyol.nomCreole} (${enrichedKreyol.nomFrancais})
  → Famille : ${enrichedKreyol.famille}
  → **Type de résistance** : ${enrichedKreyol.typeResistance || faune?.typeResistance || flore?.typeResistance || 'non spécifié'}
  → **Description de résistance** : ${enrichedKreyol.resistanceDescription || faune?.savoir?.split('.')[0] || flore?.savoir?.split('.')[0] || ''}
  → Dimension culturelle : ${enrichedKreyol.dimensionCulturelle?.split('.')[0] || ''}

- **Contexte historique** : ${enrichedHistoire.faitHistorique || ''}
  → Période : ${enrichedHistoire.periode || ''}
  → **Portée symbolique** : ${enrichedHistoire.porteeSymbolique || ''}

- **Autres** :
  → Élément : ${element}
  → Dimension spirituelle : ${spirituel}

---
HOROSCOPE DU JOUR (à reformuler à l'oral) :
- Ouverture : ${horoscope.ouverture}
- Amour : ${horoscope.amour}
- Travail : ${horoscope.travail}
- Argent : ${horoscope.argent}
- Amitié : ${horoscope.amitie}
- Prédiction : ${horoscope.prediction}

---
INSTRUCTIONS STRICTES :
1. **Structure** :
   - Commence **EXACTEMENT** par : *"${greeting}, c'est Maryse. ${moment}, nous sommes le ${formattedDate}."*
   - Intègre **tous les éléments culturels** ci-dessus de manière naturelle (ex: *"Comme l’igwann péyi, toi aussi tu sais attendre ton heure…"*).
   - Utilise les 6 phrases de l'horoscope comme **fil conducteur**, mais reformule-les en un récit fluide.
   - Termine par une **conclusion poétique** liée à la Guadeloupe (ex: *"Que la Soufrière veiller sur toi."*).

2. **Style** :
   - **Oral** : phrases courtes (15-20 mots max), rythme adapté à la lecture à voix haute.
   - **Authentique** : mots créoles **uniquement si naturels** (ex: *"un ti coup"* mais pas de traduction forcée).
   - **Riche** : utilise les **savoirs traditionnels** et les **symboles sacrés** pour donner de la profondeur.
   - **Engagé** : ton de Maryse Condé (libre, sans concession, ancré dans la résistance).

3. **Contraintes techniques** :
   - Longueur : **250-400 mots** (≈ 2-3 min à l'oral).
   - **Interdits** : JSON, markdown, listes à puces, titres.
   - Ponctuation : **naturelle** (points, virgules, points d’exclamation pour le rythme).
   - **À éviter** : répétitions, anglicismes, explications superflues.
   - **OBLIGATOIRE** : L'introduction doit utiliser EXACTEMENT le format : *"${greeting}, c'est Maryse. ${moment}, nous sommes le ${formattedDate}."*

4. **Exemple de sortie attendue** :
   *"${greeting}, c'est Maryse. ${moment}, nous sommes le ${formattedDate}.
   Le vent souffle fort comme sur la Pointe des Châteaux…
   L’igwann péyi, lui, ne craint pas les tempêtes : il attend, immobile, que l’urgence passe. Toi aussi, tu devras faire preuve de cette patience de la résistance.
   En amour, comme le colibri qui butine sans se lasser, ton cœur trouvera sa douceur…
   [etc.]"*
---`;
}
