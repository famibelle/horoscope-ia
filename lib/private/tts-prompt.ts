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

/* ── Helper : Rotation des éléments culturels pour éviter la répétition ──── */
function getRotatedCulturalElement(signName: string, dateStr: string, elements: any[]): any[] {
  // Utiliser le nom du signe et la date pour créer une rotation déterministe
  const seed = signName.length + new Date(dateStr).getDate();
  const rotationIndex = seed % Math.max(1, elements.length);
  
  // Réorganiser les éléments en fonction de la rotation
  return [...elements.slice(rotationIndex), ...elements.slice(0, rotationIndex)];
}

/* ── Helper : Salutation selon l'édition ──────────────────── */
function getSalutation(edition: Edition): { greeting: string; moment: string } {
  const salutions: Record<Edition, { greeting: string; moment: string }> = {
    matin: { greeting: 'Bonjour', moment: 'ce matin' },
    midi: { greeting: 'Bonjour', moment: 'cet après-midi' },
    soir: { greeting: 'Bonsoir', moment: 'ce soir' },
    nuit: { greeting: 'Bonsoir', moment: 'cette nuit' },
  };
  return salutions[edition] || salutions.matin;
}

/* ── Helper : Déterminer l'édition basée sur l'heure ──────── */
export function getEditionFromDate(dateStr: string): Edition {
  const date = new Date(dateStr);
  const hours = date.getHours();
  
  if (hours >= 6 && hours < 12) return 'matin';
  if (hours >= 12 && hours < 18) return 'midi';
  if (hours >= 18 && hours < 22) return 'soir';
  return 'nuit';
}

/* ── Helper : Score de pertinence culturelle ──────────────────── */
function getCulturalRelevanceScore(text: string, element: { resistanceType?: string; sacreSymbolique?: string; dimensionCulturelle?: string }): number {
  if (!element) return 0;
  
  let score = 0;
  
  // Score basé sur le type de résistance
  if (element.resistanceType) {
    if (element.resistanceType.includes('TOTEM') || element.resistanceType.includes('SACRÉ')) score += 3;
    else if (element.resistanceType.includes('Emblématique')) score += 2;
    else score += 1;
  }
  
  // Score basé sur la dimension culturelle
  if (element.dimensionCulturelle) {
    const lowerText = text.toLowerCase();
    const lowerDim = element.dimensionCulturelle.toLowerCase();
    
    // Mots clés de pertinence
    if (lowerDim.includes('patience') && lowerText.includes('attend')) score += 2;
    if (lowerDim.includes('résistance') && lowerText.includes('force')) score += 2;
    if (lowerDim.includes('liberté') && lowerText.includes('libre')) score += 2;
    if (lowerDim.includes('sagesse') && lowerText.includes('sage')) score += 2;
    if (lowerDim.includes('amour') && lowerText.includes('cœur')) score += 2;
  }
  
  return score;
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
 * Génère un prompt concis pour le LLM afin de produire un texte TTS
 * intégrant les éléments culturels essentiels sans dépasser les limites TTS
 */
export function buildTTSPrompt(
  sign: Sign,
  horoscope: HoroscopeResponse,
  date?: string,
  edition?: Edition
): string {
  const dateToUse = date || todayGuadeloupe();
  const ed = edition || getEditionFromDate(dateToUse);
  const formattedDate = formatDateFr(dateToUse);
  const { greeting, moment } = getSalutation(ed);
  const { faune, flore, lieuDetails, element, spirituel, nomKreyol } = sign;

  // Enrichir uniquement les éléments essentiels
  const enrichedFlore = getEnrichedFlore(flore);
  const enrichedFaune = getEnrichedFaune(faune);
  const enrichedLieu = getEnrichedLieu(lieuDetails);

  // Sélection intelligente des éléments culturels avec priorisation contextuelle
  const horoscopeText = Object.values(horoscope).filter(Boolean).join(' ');
  
  // Calculer les scores de pertinence pour chaque élément
  const scoredElements = [
    { 
      type: 'Faune', 
      data: enrichedFaune, 
      score: getCulturalRelevanceScore(horoscopeText, enrichedFaune),
      display: enrichedFaune.resistanceType ? `${enrichedFaune.nomCreole} (${enrichedFaune.resistanceType})` : null
    },
    { 
      type: 'Flore', 
      data: enrichedFlore, 
      score: getCulturalRelevanceScore(horoscopeText, enrichedFlore),
      display: enrichedFlore.resistanceType ? `${enrichedFlore.nomCreole} (${enrichedFlore.resistanceType})` : null
    },
    { 
      type: 'Lieu', 
      data: enrichedLieu, 
      score: getCulturalRelevanceScore(horoscopeText, enrichedLieu),
      display: enrichedLieu.sacreSymbolique ? `${enrichedLieu.nom} (${enrichedLieu.sacreSymbolique})` : null
    }
  ].filter(el => el.display !== null); // Filtrer les éléments sans données

  // Appliquer la rotation pour éviter la répétition
  const rotatedElements = getRotatedCulturalElement(sign.name, dateToUse, scoredElements);
  
  // Trier par score décroissant (après rotation)
  rotatedElements.sort((a, b) => b.score - a.score);
  
  // Sélectionner 1-3 éléments selon la longueur de l'horoscope
  const horoscopeWordCount = horoscopeText.split(' ').length;
  const maxElements = horoscopeWordCount < 50 ? 2 : 1; // Plus l'horoscope est court, plus on ajoute d'éléments culturels
  
  const culturalElements = rotatedElements.slice(0, maxElements).map(el => `${el.type}: ${el.display}`);

  // Générer des suggestions d'intégration contextuelle
  const integrationSuggestions = culturalElements.map(el => {
    if (el.includes('Faune') && el.includes('patience')) {
      return "Intègre la faune comme métaphore de patience (ex: 'Comme [animal] qui attend son heure...')";
    } else if (el.includes('Flore') && el.includes('résistance')) {
      return "Utilise la flore comme symbole de force (ex: 'Comme [plante] qui résiste au vent...')";
    } else if (el.includes('Lieu') && el.includes('SACRÉ')) {
      return "Évoque le lieu sacré pour une conclusion poétique (ex: 'Que [lieu] veille sur ton chemin...')";
    } else {
      return "Intègre naturellement: " + el.replace(':', ' comme');
    }
  }).join('; ');

  return `Tu es Maryse Condé. Rédige un texte **oral concis** (200-300 mots max) pour l'horoscope du ${sign.name} (${nomKreyol}).
Le texte sera lu par TTS : **pas de JSON, pas de markdown**, uniquement du texte brut avec ponctuation naturelle.

ÉLÉMENTS CULTURELS PRIORITAIRES (intégration intelligente) :
${culturalElements.map((el, i) => `${i+1}. ${el}`).join('\n')}

SUGGESTIONS D'INTÉGRATION CONTEXTUELLE:
${integrationSuggestions}

HOROSCOPE DU JOUR (à reformuler à l'oral) :
- Ouverture: ${horoscope.ouverture}
- Amour: ${horoscope.amour}
- Travail: ${horoscope.travail}
- Argent: ${horoscope.argent}
- Amitié: ${horoscope.amitie}
- Prédiction: ${horoscope.prediction}
- Conseil: ${horoscope.conseil}

INSTRUCTIONS STRICTES:
1. Commence EXACTEMENT par: "${greeting}, c'est Maryse. ${moment}, nous sommes le ${formattedDate}."
2. **PRIORITÉ CULTURELLE**: Intègre d'abord l'élément avec le score le plus élevé en lien direct avec le thème principal de l'horoscope
3. **INTÉGRATION NATURELLE**: Utilise les suggestions contextuelles pour créer des métaphores fluides
4. Reformule les 6 phrases d'horoscope en un récit fluide et oral (phrases courtes, 15-20 mots max)
5. Longueur: 200-300 mots MAX (≈ 1.5-2 min à l'oral)
6. Termine par une conclusion poétique liée à la Guadeloupe, en utilisant si possible un élément culturel
7. Style: ton de Maryse Condé - libre, engagé, ancré dans la résistance
8. **ADAPTATION DYNAMIQUE**: Si l'horoscope est court (<50 mots), développe davantage les éléments culturels pour enrichir le texte

EXEMPLE DE STRUCTURE:
"${greeting}, c'est Maryse. ${moment}, nous sommes le ${formattedDate}.
[INTRODUCTION AVEC ÉLÉMENT CULTUREL PRIORITAIRE - ex: 'Comme [faune] qui incarne la patience, aujourd'hui tu devras...']

[DÉVELOPPEMENT DES 6 THÈMES HOROSCOPE avec 1-2 autres références culturelles naturelles]

[CONCLUSION POÉTIQUE avec lieu sacré ou symbole de résistance - ex: 'Que [lieu sacré] guide tes pas sous le soleil de Karukera.']"

RÈGLES DE SÉLECTION APPLIQUÉES:
- Score de pertinence calculé en fonction du thème de l'horoscope
- Rotation quotidienne pour varier les références culturelles
- Adaptation dynamique: ${maxElements} élément(s) sélectionné(s) pour ${horoscopeWordCount} mots d'horoscope
`;
}

/**
 * Version détaillée pour les cas où on veut plus de contexte (non utilisée par défaut pour TTS)
 */
export function buildDetailedTTSPrompt(
  sign: Sign,
  horoscope: HoroscopeResponse,
  date?: string,
  edition?: Edition
): string {
  // ... (contenu détaillé original pour d'autres usages)
  return buildTTSPrompt(sign, horoscope, date, edition); // Fallback
}
