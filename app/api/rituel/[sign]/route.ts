import { NextRequest, NextResponse } from 'next/server';
import { signs } from '@/lib/signs-data';
import { todayGuadeloupe } from '@/lib/edition';
import {
  SIGN_TO_LOA,
  SIGN_TO_VAUDOU_CONTEXT,
  getVaudouContextForSign,
  getFullVaudouContext,
  RITUAL_DATES,
  isRitualDate,
  getRitualDateContext
} from '@/lib/private/vaudou-mappings';
import { loasData, rituelsData, plantesData, animauxData, objetsData, lieuxData } from '@/lib/private/vaudou-data';

const SIGN_EN: Record<string, string> = {
  belier: 'aries', taureau: 'taurus', gemeaux: 'gemini',
  cancer: 'cancer', lion: 'leo', vierge: 'virgo',
  balance: 'libra', scorpion: 'scorpio', sagittaire: 'sagittarius',
  capricorne: 'capricorn', verseau: 'aquarius', poissons: 'pisces',
};

// Types pour les données de rituel
export interface RituelPersonalise {
  signId: string;
  signFr: string;
  date: string;
  loaPrincipal: string;
  famille: 'Rada' | 'Petro' | 'Congo';
  energie: string;
  couleursSacrees: string[];
  planteSacree?: string;
  animalSacree?: string;
  objetRituel?: string;
  lieuSacree?: string;
  rituel: string;
  emoji: string;
  conseils: string[];
  offrandes: string[];
  contreIndications: string[];
  dateRituelle?: {
    nom: string;
    theme: string;
    loa: string;
  };
}

/**
 * Génère un rituel vaudou personnalisé pour un signe donné
 */
function generatePersonalizedRitual(signId: string, date: string): RituelPersonalise {
  const sign = signs.find(s => s.id === signId);
  if (!sign) {
    throw new Error(`Signe non trouvé: ${signId}`);
  }

  const vaudouContext = getVaudouContextForSign(signId);
  const signVaudou = SIGN_TO_VAUDOU_CONTEXT[signId];
  const loa = SIGN_TO_LOA[signId];

  // Vérifier si c'est une date rituelle spéciale
  const ritualDate = getRitualDateContext(date);
  const isRitual = isRitualDate(date);

  // Trouver des éléments vaudou pertinents
  const relevantPlantes = plantesData.filter(p => 
    p.famille.toLowerCase() === signVaudou?.famille.toLowerCase()
  ).slice(0, 3);

  const relevantAnimaux = animauxData.filter(a => 
    a.famille.toLowerCase() === signVaudou?.famille.toLowerCase()
  ).slice(0, 3);

  const relevantObjets = objetsData.filter(o => 
    o.famille.toLowerCase() === signVaudou?.famille.toLowerCase()
  ).slice(0, 3);

  const relevantLieux = lieuxData.filter(l => 
    l.famille.toLowerCase() === signVaudou?.famille.toLowerCase()
  ).slice(0, 3);

  const relevantRituels = rituelsData.filter(r => 
    r.famille.toLowerCase() === signVaudou?.famille.toLowerCase()
  ).slice(0, 3);

  // Sélectionner des éléments aléatoires
  const plante = relevantPlantes[Math.floor(Math.random() * relevantPlantes.length)]?.nomCreole;
  const animal = relevantAnimaux[Math.floor(Math.random() * relevantAnimaux.length)]?.nomCreole;
  const objet = relevantObjets[Math.floor(Math.random() * relevantObjets.length)]?.nomCreole;
  const lieu = relevantLieux[Math.floor(Math.random() * relevantLieux.length)]?.nomCreole;
  const rituel = relevantRituels[Math.floor(Math.random() * relevantRituels.length)]?.nomCreole || signVaudou?.rituel;

  // Générer des conseils basés sur le loa
  const loaData = loasData.find(l => l.nomCreole === loa);
  
  // Conseils spécifiques par loa
  const loaConseils: Record<string, string[]> = {
    'Ogoun': [
      'Portez un objet en métal (clé, couteau, clou) pour canaliser votre force intérieure.',
      'Allumez une bougie rouge ou verte devant une image de Saint Georges.',
      'Boire une infusion de fey zepin (épinards) pour renforcer votre vitalité.',
      'Évitez les conflits inutiles aujourd’hui.',
    ],
    'Legba': [
      'Tracez un vèvè de Legba à l’entrée de votre maison avec de la poudre blanche.',
      'Allumez une bougie blanche pour ouvrir les chemins spirituels.',
      'Parlez à vos ancêtres avant de prendre une décision importante.',
      'Offrez du rhum blanc ou du tabac à Legba.',
    ],
    'Ezili Freda': [
      'Portez du rose ou du blanc pour attirer l’amour et la beauté.',
      'Allumez une bougie rose avec un miroir devant pour renforcer votre charme.',
      'Utilisez du parfum ou de l’eau de Cologne comme offrande.',
      'Méditez devant une image de la Vierge Marie.',
    ],
    'Baron Samedi': [
      'Portez du noir et du violet pour vous connecter aux esprits des ancêtres.',
      'Allumez une bougie noire dans un coin sombre de votre maison.',
      'Offrez du rhum brun ou du tabac noir au Baron.',
      'Réfléchissez à votre héritage familial aujourd’hui.',
    ],
    'Damballa': [
      'Portez du blanc pour la paix et la sagesse.',
      'Allumez une bougie blanche avec un œuf devant pour la purification.',
      'Méditez près d’une source d’eau ou sous un arc-en-ciel.',
      'Offrez du lait ou du maïs blanc.',
    ],
    'Mami Dlo': [
      'Portez du bleu ou du vert pour la protection.',
      'Allumez une bougie bleue près d’un récipient d’eau.',
      'Boire de l’eau de source ou de pluie pour la purification.',
      'Évitez de vous baigner seul(e) dans des eaux profondes.',
    ],
    'Azaka': [
      'Portez du vert et du jaune pour la prospérité agricole.',
      'Allumez une bougie verte près de vos plantes.',
      'Offrez des fruits de saison ou du maïs à Azaka.',
      'Travaillez la terre ou vos plantes aujourd’hui.',
    ],
    'Simbi': [
      'Portez du bleu pour la guérison.',
      'Allumez une bougie bleue près d’une source d’eau.',
      'Boire une infusion de feuilles sacrées.',
      'Méditez près d’une rivière ou d’une cascade.',
    ],
    'Gran Bwa': [
      'Portez du vert foncé pour la protection de la forêt.',
      'Allumez une bougie verte dans votre jardin.',
      'Offrez des feuilles ou des branches d’arbres sacrés.',
      'Marchez dans la nature aujourd’hui.',
    ],
    'Kafou': [
      'Portez du rouge et du noir pour la protection aux carrefours.',
      'Allumez une bougie rouge à un carrefour.',
      'Offrez du rhum ou du tabac à Kafou.',
      'Faites attention aux décisions rapides.',
    ],
    'La Sirène': [
      'Portez du vert ou de l’or pour la séduction.',
      'Allumez une bougie verte près d’un miroir.',
      'Offrez des coquillages ou des objets brillants.',
      'Chantez ou écoutez de la musique aujourd’hui.',
    ],
    'Marinette': [
      'Portez du bleu et du blanc pour la protection contre la sorcellerie.',
      'Allumez une bougie bleue avec du sel.',
      'Offrez des fleurs blanches ou des plumes.',
      'Protégez-vous des énergies négatives.',
    ],
  };

  // Offrandes spécifiques par loa
  const loaOffrandes: Record<string, string[]> = {
    'Ogoun': ['Rhum brun', 'Tabac', 'Viande grillée', 'Métal (clé, couteau)', 'Canne à sucre'],
    'Legba': ['Rhum blanc', 'Tabac', 'Canne à sucre', 'Bougie blanche', 'Fruits secs'],
    'Ezili Freda': ['Champagne', 'Parfum', 'Miroirs', 'Bijoux', 'Poulet blanc'],
    'Baron Samedi': ['Rhum brun', 'Tabac noir', 'Poisson séché', 'Bougie noire', 'Piment'],
    'Damballa': ['Lait', 'Œufs blancs', 'Maïs blanc', 'Bougie blanche', 'Eau fraîche'],
    'Mami Dlo': ['Eau de source', 'Bougie bleue', 'Poisson frais', 'Sel', 'Conchille'],
    'Azaka': ['Maïs', 'Fruits de saison', 'Légumes', 'Bougie verte', 'Tabac'],
    'Simbi': ['Eau de rivière', 'Bougie bleue', 'Feuilles sacrées', 'Herbes médicinales'],
    'Gran Bwa': ['Feuilles d’arbres', 'Branches', 'Bougie verte', 'Fruits de la forêt'],
    'Kafou': ['Rhum', 'Tabac', 'Bougie rouge', 'Objets de carrefour'],
    'La Sirène': ['Coquillages', 'Perles', 'Bougie verte', 'Parfum', 'Objets brillants'],
    'Marinette': ['Fleurs blanches', 'Plumes', 'Bougie bleue', 'Sel', 'Eau bénite'],
  };

  // Contre-indications par loa
  const loaContreIndications: Record<string, string[]> = {
    'Ogoun': ['Éviter les conflits violents', 'Ne pas porter du noir aujourd’hui'],
    'Legba': ['Ne pas bloquer les portes', 'Éviter de refuser l’aide'], 
    'Ezili Freda': ['Éviter la jalousie', 'Ne pas porter de noir'],
    'Baron Samedi': ['Éviter les lieux sombres seuls', 'Ne pas toucher aux objets des morts'],
    'Damballa': ['Éviter les pensées négatives', 'Ne pas crier ou élever la voix'],
    'Mami Dlo': ['Éviter de polluer l’eau', 'Ne pas nager seul dans des eaux profondes'],
    'Azaka': ['Éviter de gaspiller la nourriture', 'Ne pas négliger vos plantes'],
    'Simbi': ['Éviter de polluer les rivières', 'Ne pas refuser l’eau à un visiteur'],
    'Gran Bwa': ['Éviter de couper les arbres sacrés', 'Ne pasneglecter la nature'],
    'Kafou': ['Éviter les carrefours dangereux', 'Ne pas prendre de décisions hâtives'],
    'La Sirène': ['Éviter la vanité excessive', 'Ne pas mentir sur vos intentions'],
    'Marinette': ['Éviter les sorts et malédictions', 'Ne pas manquer de respect aux esprits'],
  };

  // Sélectionner des conseils, offrandes et contre-indications
  const conseils = loaConseils[loa] || [
    `Méditez sur l'énergie de ${loa} aujourd'hui.`,
    `Allumez une bougie blanche pour honorer les esprits.`,
    `Portez les couleurs sacrées de votre loa.`,
  ];

  const offrandes = loaOffrandes[loa] || ['Bougie blanche', 'Eau fraîche', 'Fruits de saison'];
  const contreIndications = loaContreIndications[loa] || ['Aucune contre-indication particulière'];

  return {
    signId: sign.id,
    signFr: sign.name,
    date,
    loaPrincipal: loa || 'Legba',
    famille: signVaudou?.famille || 'Rada',
    energie: signVaudou?.energie || 'Harmonie et équilibre',
    couleursSacrees: signVaudou?.couleurs || ['blanc'],
    planteSacree: plante,
    animalSacree: animal,
    objetRituel: objet,
    lieuSacree: lieu,
    rituel: rituel || 'Méditation quotidienne',
    emoji: signVaudou?.emoji || '🔮',
    conseils,
    offrandes,
    contreIndications,
    dateRituelle: isRitual && ritualDate ? {
      nom: ritualDate.nomFrancais || ritualDate.nomCreole || 'Date rituelle',
      theme: ritualDate.dimensionCulturelle.split('.')[0] || 'Célébration traditionnelle',
      loa: ritualDate.famille || loa,
    } : undefined,
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sign: string }> },
) {
  try {
    const { sign: signId } = await context.params;
    const sign = signs.find(s => s.id === signId);
    
    if (!sign) {
      return NextResponse.json({ error: 'Signe inconnu' }, { status: 404 });
    }

    const userDate = req.nextUrl.searchParams.get('date');
    const date = userDate || todayGuadeloupe();

    // Générer le rituel personnalisé
    const ritual = generatePersonalizedRitual(signId, date);

    return NextResponse.json(ritual, {
      headers: { 
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Rituel API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rituel' },
      { status: 500 }
    );
  }
}
