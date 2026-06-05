/**
 * Générateur de contenu pour la newsletter d'horoscope
 * Crée des newsletters complètes avec les données culturelles guadeloupéennes
 */

import { signs } from './signs-data';
import { todayGuadeloupe } from './edition';
import { getEditionFromDate } from './private/tts-prompt';
import NewsletterTemplates, { NewsletterData, PresageData, getHeaderTemplate, getPresageTemplate, getSignHtmlTemplate, getSignTextTemplate, getFooterTemplate, wrapHtml } from './newsletter-templates';
import { HoroscopeResponse } from './horoscope-data';
import { floreData } from './private/flore-data';
import { fauneData } from './private/faune-data';
import { lieuxData } from './private/lieux-data';
import { kreyolData } from './private/kreyol-data';
import { histoireData } from './private/histoire-data';

// Charger le présage du jour depuis Supabase
async function fetchPresageFromSupabase(date: string): Promise<PresageData | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !key) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/presages?date=eq.${date}&select=*&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Charger les horoscopes depuis Supabase via REST (sans SDK, compatible CI)
export async function fetchHoroscopesFromSupabase(date: string, edition: string): Promise<SignHoroscope[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !key) {
    console.warn('⚠️  SUPABASE_URL / clé absents — données simulées');
    return [];
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/horoscopes?date=eq.${date}&edition=eq.${edition}&select=*`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );

    if (!res.ok) {
      console.warn(`⚠️  Supabase ${res.status} — données simulées`);
      return [];
    }

    const rows: Record<string, any>[] = await res.json();

    const result: SignHoroscope[] = rows
      .map(row => {
        const sign = signs.find(s => s.id === row.sign_id);
        if (!sign) return null;
        return {
          sign,
          horoscope: {
            ouverture:  row.ouverture  ?? '',
            amour:      row.amour      ?? '',
            travail:    row.travail    ?? '',
            argent:     row.argent     ?? '',
            amitie:     row.amitie     ?? '',
            prediction: row.prediction ?? '',
            conseil:    row.conseil    ?? '',
            teaser:     row.teaser     ?? '',
            signFr:     row.sign_fr    ?? sign.name,
            weather:    row.weather    ?? '',
            edition:    row.edition,
            source:     row.source     ?? 'supabase',
          } as HoroscopeResponse,
        };
      })
      .filter((x): x is SignHoroscope => x !== null);

    // Conserver l'ordre canonique des signes
    result.sort((a, b) =>
      signs.findIndex(s => s.id === a.sign.id) - signs.findIndex(s => s.id === b.sign.id),
    );

    console.log(`✅ ${result.length}/12 horoscopes Supabase (${date} / ${edition})`);
    return result;
  } catch (err) {
    console.error('❌ Supabase fetch error:', err);
    return [];
  }
}

// Types pour la structure de la newsletter
interface SignHoroscope {
  sign: typeof signs[0];
  horoscope: HoroscopeResponse;
}

interface CulturalContent {
  title: string;
  content: string;
  type: 'flore' | 'faune' | 'lieu' | 'histoire' | 'kreyol' | 'rituel';
  imageUrl?: string;
}

interface Newsletter {
  subject: string;
  html: string;
  text: string;
  date: string;
  subscriberName?: string;
}

// Données culturelles pour les conseils et rituels
const culturalTips: Record<string, string[]> = {
  patience: [
    'Comme l\'igwann péyi qui attend patiemment sous le soleil de Karukera, apprends à laisser les choses venir à toi.',
    'La patience est une vertu sacrée, comme la Soufrière qui dort depuis des siècles.',
    'Rappelle-toi du manguier : il faut des années pour porter des fruits, mais le résultat en vaut la peine.'
  ],
  resistance: [
    'Comme le zandoli qui lâche sa queue pour échapper au danger, sache quand il faut te libérer.',
    'La résistance, c\'est comme le bois de gaïac : plus on le malmène, plus il devient fort.',
    'Les esclaves marrons nous ont appris que la liberté se gagne par la persévérance.'
  ],
  love: [
    'Comme le kolibri qui danse devant les fleurs pour attirer son amour, laisse ton cœur s\'exprimer librement.',
    'En amour, sois comme le flamant rose : élégant, fidèle, et toujours prêt à voler ensemble.',
    'Le secret d\'un amour durable ? La confiance, comme les racines du fromager qui s\'entrelaçent.'
  ],
  money: [
    'Comme le cocotier qui donne à la fois eau, nourriture et abri, fais fructifier tes ressources avec sagesse.',
    'L\'argent est comme la mer : il vient et il part avec les marées, ne t\'y attache pas trop.',
    'Investis comme on plante un manguier : avec patience et foi en l\'avenir.'
  ],
  work: [
    'Travaille comme la fourmi manmi : sans bruit, mais avec une efficacité redoutable.',
    'Le succès vient à ceux qui, comme le vent alizé, persistent jour après jour.',
    'Une tâche difficile ? Pense au morne qui a mis des siècles à se former : un pas à la fois.'
  ],
  health: [
    'Prends soin de toi comme le jardin créole : avec amour, patience, et les bons ingrédients.',
    'Bois une infusion de cerasee pour purifier ton corps et ton esprit.',
    'La santé, c\'est comme la terre de Grande-Terre : plus tu en prends soin, plus elle te rend.'
  ]
};

// Rituels traditionnels par jour de la semaine (en français)
const dailyRituals: Record<string, string> = {
  lundi: 'Allume une bougie blanche pour commencer la semaine avec pureté.',
  mardi: 'Mets une feuille de basilic sous ton oreiller pour attirer la chance.',
  mercredi: 'Boire une tisane de menthe poulet pour la clarté d\'esprit.',
  jeudi: 'Porte une pierre de rivière dans ta poche pour rester ancré.',
  vendredi: 'Lave tes mains avec de l\'eau de fleur d\'oranger pour attirer l\'abondance.',
  samedi: 'Balaye devant ta porte avec une branche de romarin pour chasser les mauvaises énergies.',
  dimanche: 'Allume de l\'encens de copal pour honorer tes ancêtres.'
};

// Thèmes culturels par jour de la semaine (en français)
const weeklyCulturalThemes: Record<string, { title: string; content: string }> = {
  lundi: {
    title: '🌿 La Flore Sacrée de Guadeloupe',
    content: 'La Guadeloupe regorge de plantes aux vertus méconnues. Le manguier, symbole de patience, nous rappelle que les meilleures choses prennent du temps. Le cerisier, utilisé en médecine traditionnelle, purifie le corps et l\'esprit. Et n\'oublions pas le corossol, dont les feuilles en infusion aident à trouver le sommeil.'
  },
  mardi: {
    title: '🦜 La Faune Symbolique',
    content: 'Le kolibri, cet oiseau minuscule qui butine sans relâche, symbolise la persévérance et la joie des petites choses. L\'igwann péyi, lui, incarne la sagesse et la capacité à se fondre dans son environnement. Quant à la manman dlo, cette créature mystérieuse des rivières, elle nous rappelle que la nature recèle encore bien des secrets.'
  },
  mercredi: {
    title: '⛰️ Lieux de Pouvoir en Guadeloupe',
    content: 'La Soufrière, cœur battant de la Guadeloupe, est bien plus qu\'un volcan : c\'est un lieu sacré où les Kalinagos vénéraient les esprits de la terre. Les chutes du Carbet, elles, représentent la purification et le renouveau. Et que dire de la Pointe des Châteaux, où les vents alizés apportent des messages du passé ?'
  },
  jeudi: {
    title: '📜 Pages d\'Histoire',
    content: 'Le 8 février 1802, Delgrès et ses compagnons ont choisi la mort plutôt que l\'esclavage. Leur sacrifice à Matouba reste gravé dans notre mémoire collective comme symbole de liberté absolue. Plus tôt, les Taïnos nous ont laissé un héritage de vie en harmonie avec la nature, que nous commençons seulement à redécouvrir.'
  },
  vendredi: {
    title: '🍛 Saveurs Traditionnelles',
    content: 'Le colombo, avec son mélange d\'épices venues d\'Inde, d\'Afrique et des Amériques, incarne la diversité de notre île. Le bokit, lui, est bien plus qu\'un simple sandwich : c\'est un symbole de partage. Et que dire du rhum arrangé, où chaque famille a sa propre recette secrète transmise de génération en génération ?'
  },
  samedi: {
    title: '🕯️ Spiritualité et Quimbois',
    content: 'Le quimbois n\'est pas de la magie noire, mais une science de l\'équilibre. Que ce soit pour protéger sa maison avec un bwa bandé, purifier son corps avec un bain de feuilles, ou honorer ses ancêtres avec une offrande, chaque geste a une signification profonde.'
  },
  dimanche: {
    title: '🌅 Légendes et Contes',
    content: 'La légende de la Soufrière raconte qu\'elle était autrefois une belle femme transformée en volcan par un sortilège. Celle du diable et du manguier nous rappelle que le mal peut parfois se cacher sous les apparences les plus innocentes. Ces histoires, transmises oralement, sont des trésors de notre patrimoine.'
  }
};

// Noms des jours en français
const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// Fonctions utilitaires
function getDayName(date: string): string {
  const d = new Date(date);
  return dayNames[d.getDay()];
}

function getRandomTip(category: string): string {
  const tips = culturalTips[category] || culturalTips['patience'];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getCulturalElementByType(type: string, index: number = 0): any {
  const datasets: Record<string, any[]> = {
    flore: floreData,
    faune: fauneData,
    lieu: lieuxData,
    kreyol: kreyolData,
    histoire: histoireData
  };

  const dataset = datasets[type] || [];
  return dataset[index % dataset.length];
}

// Générateur de conseils culturels pour un signe
function generateCulturalTip(sign: typeof signs[0], date: string): string {
  const day = getDayName(date);
  const ritual = dailyRituals[day] || '';
  
  // Analyser le thème principal de l'horoscope (simplifié)
  const themes = ['patience', 'resistance', 'love', 'money', 'work', 'health'];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  
  // Obtenir un conseil lié au thème
  let tip = getRandomTip(theme);
  
  // Ajouter une référence à l'élément du signe
  if (sign.element) {
    tip += ` Ton élément ${sign.element} te donne aujourd'hui une énergie particulière pour cela.`;
  }
  
  return tip;
}

// Générateur de rituels pour un signe
function generateRitual(sign: typeof signs[0], date: string): string {
  const day = getDayName(date);
  const baseRitual = dailyRituals[day] || '';
  
  // Personnaliser en fonction du signe
  if (sign.faune?.nom_creole) {
    return `${baseRitual} Pense à l'esprit de ${sign.faune.nom_creole} pendant que tu le fais.`;
  } else if (sign.flore?.nom_creole) {
    return `${baseRitual} Utilise si possible une feuille de ${sign.flore.nom_creole}.`;
  }
  
  return baseRitual;
}

// Générateur de section culturelle du jour
function generateCulturalSection(date: string): CulturalContent {
  const day = getDayName(date);
  const theme = weeklyCulturalThemes[day];
  
  return {
    title: theme.title,
    content: theme.content,
    type: 'rituel',
    imageUrl: `/images/cultural/${day}.jpg` // À adapter selon vos assets
  };
}

// Générateur de prévisions spéciales
function generateSpecialPredictions(allSigns: SignHoroscope[]): {
  love: string;
  work: string;
  money: string;
  health: string;
} {
  // Trouver le signe le plus chanceux pour chaque catégorie (simplifié)
  const loveSign = allSigns[Math.floor(Math.random() * allSigns.length)];
  const workSign = allSigns[Math.floor(Math.random() * allSigns.length)];
  const moneySign = allSigns[Math.floor(Math.random() * allSigns.length)];
  const healthSign = allSigns[Math.floor(Math.random() * allSigns.length)];
  
  return {
    love: `${loveSign.sign.name} : ${getRandomTip('love')}`,
    work: `${workSign.sign.name} : ${getRandomTip('work')}`,
    money: `${moneySign.sign.name} : ${getRandomTip('money')}`,
    health: `${healthSign.sign.name} : ${getRandomTip('health')}`
  };
}

// Fonction principale : Générer une newsletter complète
async function generateNewsletter(
  date: string = todayGuadeloupe(),
  allSignsData: SignHoroscope[] = [],
  subscriberName?: string
): Promise<Newsletter> {
  try {
    // Si aucune donnée fournie, utiliser des données par défaut
    if (allSignsData.length === 0) {
      // Simuler des données pour chaque signe
      allSignsData = signs.map(sign => ({
        sign,
        horoscope: {
          ouverture: `Une journée ${['favorable', 'intéressante', 'challengante', 'inspirante'][Math.floor(Math.random() * 4)]} pour les natifs du ${sign.name}.`,
          amour: `En amour, ${['soyez ouvert', 'prenez votre temps', 'exprimez vos sentiments', 'écoutez votre cœur'][Math.floor(Math.random() * 4)]}.`,
          travail: `Au travail, ${['votre créativité', 'votre persévérance', 'votre intuition', 'votre expérience'][Math.floor(Math.random() * 4)]} sera votre atout.`,
          argent: `Côté finances, ${['évitez les dépenses inutiles', 'une opportunité pourrait se présenter', 'soyez prudent', 'investissez avec sagesse'][Math.floor(Math.random() * 4)]}.`,
          amitie: `Vos amis ${['vous soutiendront', 'auront besoin de vous', 'vous apporteront de la joie', 'vous donneront de bons conseils'][Math.floor(Math.random() * 4)]} aujourd'hui.`,
          prediction: `Prédiction : ${['un changement positif', 'une bonne nouvelle', 'une rencontre importante', 'une prise de conscience'][Math.floor(Math.random() * 4)]} vous attend.`,
          conseil: `Conseil : ${['écoutez votre intuition', 'suivez le rythme de Karukera', 'utilisez les plantes locales', 'honorez vos ancêtres'][Math.floor(Math.random() * 4)]}.`,
          sante: `Votre santé est bonne, ${['prenez soin de vous', 'écoutez votre corps'][Math.floor(Math.random() * 2)]}.`,
          signFr: sign.name,
          weather: 'Ensoleillé',
          source: 'fallback'
        }
      }));
    }

    const edition = getEditionFromDate(date);
    const dayName = getDayName(date);
    const culturalSection = generateCulturalSection(date);
    const specialPredictions = generateSpecialPredictions(allSignsData);
    
    // Générer le sujet de l'email
    const subject = subscriberName 
      ? `🌟 ${subscriberName}, voici votre horoscope guadeloupéen pour le ${date}`
      : `🌟 Horoscope Guadeloupéen - ${date}`;

    // Générer le contenu HTML
    let htmlContent = '';
    let textContent = '';

    // Ajouter l'en-tête
    htmlContent += NewsletterTemplates.getHeaderTemplate(date);
    textContent += `HOROSCOPE GUADELOUPÉEN - ${date}\n`;
    textContent += `"Les esprits de Karukera vous parlent"\n\n`;

    // Ajouter l'introduction (rotation quotidienne)
    const introductions = [
      `Chers amis, aujourd'hui les étoiles de Karukera s'alignent pour vous apporter des messages importants. Voici ce que la journée vous réserve.`,
      `Bonjour à tous ! Que les alizés portent jusqu'à vous les conseils de Maryse pour cette belle journée.`,
      `La Soufrière veille sur nous aujourd'hui. Découvrez ce que les esprits ont à vous dire.`,
      `En ce ${dayName}, prenons un moment pour écouter les messages que la nature et les ancêtres nous envoient.`
    ];
    const intro = introductions[Math.floor(Math.random() * introductions.length)];
    
    htmlContent += `
<div style="
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #4a5568;
  line-height: 1.6;
">
  <p style="font-size: 16px;">${intro}</p>
</div>
    `;
    textContent += `${intro}\n\n`;

    // Ajouter la section culturelle du jour
    htmlContent += NewsletterTemplates.getCulturalSectionTemplate(
      culturalSection.title,
      culturalSection.content,
      culturalSection.imageUrl
    );
    textContent += `\n=== ${culturalSection.title} ===\n${culturalSection.content}\n\n`;

    // Ajouter les prévisions spéciales
    htmlContent += NewsletterTemplates.getSpecialPredictionsTemplate(specialPredictions);
    textContent += `\n=== PRÉDICTIONS SPÉCIALES ===\nAmour: ${specialPredictions.love}\nTravail: ${specialPredictions.work}\nArgent: ${specialPredictions.money}\nSanté: ${specialPredictions.health}\n\n`;

    // Ajouter les horoscopes par signe
    htmlContent += `<div style="padding: 8px 24px;">
      <h2 style="
        color: #2d3748;
        font-size: 20px;
        margin: 24px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #7c3aed;
        text-align: center;
      ">
        🔮 Horoscopes par Signe
      </h2>
    </div>`;
    textContent += `\n=== HOROSCOPES PAR SIGNE ===\n\n`;

    for (const signData of allSignsData) {
      const newsletterData: NewsletterData = {
        date,
        sign: signData.sign,
        horoscope: signData.horoscope,
        culturalTip: generateCulturalTip(signData.sign, date),
        ritual: generateRitual(signData.sign, date)
      };

      htmlContent += NewsletterTemplates.getSignHtmlTemplate(newsletterData);
      textContent += NewsletterTemplates.getSignTextTemplate(newsletterData);
    }

    // Ajouter le pied de page
    htmlContent += NewsletterTemplates.getFooterTemplate();
    textContent += `\n\n${NewsletterTemplates.getFooterTemplate().replace(/<[^>]*>/g, '')}`;

    // Personnaliser avec le nom du destinataire si disponible
    if (subscriberName) {
      // Ajouter une salutation personnalisée en haut
      htmlContent = `
<div style="
  padding: 16px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
  color: white;
  border-radius: 12px 12px 0 0;
">
  <p style="margin: 0; font-size: 16px;">Bonjour ${subscriberName},</p>
  <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Voici votre horoscope guadeloupéen pour aujourd'hui.</p>
</div>
      ` + htmlContent;
      
      textContent = `Bonjour ${subscriberName},

Voici votre horoscope guadeloupéen pour aujourd'hui.

` + textContent;
    }

    return {
      subject,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    ${htmlContent}
  </div>
</body>
</html>`,
      text: textContent,
      date
    };

  } catch (error) {
    console.error('Erreur lors de la génération de la newsletter:', error);
    throw new Error('Échec de la génération de la newsletter');
  }
}

// Générateur de newsletter pour un signe spécifique
async function generateEmailSubject(signName: string, horoscope: Partial<HoroscopeResponse>): Promise<string> {
  const fallback = `✦ ${signName} — les ancêtres de Karukera ont un message pour toi`;
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return fallback;

  const context = [horoscope.ouverture, horoscope.prediction, horoscope.conseil]
    .filter(Boolean).join(' ').substring(0, 400);

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        temperature: 0.9,
        max_tokens: 60,
        messages: [
          {
            role: 'system',
            content: `Tu es Maryse CondAI. Génère UN objet d'email accrocheur (max 70 caractères) pour la newsletter horoscope du signe ${signName}. L'objet doit être mystérieux, ancré dans la culture guadeloupéenne et ancestrale, donner envie d'ouvrir le mail. Réponds uniquement avec l'objet, sans guillemets ni ponctuation finale.`,
          },
          { role: 'user', content: context || signName },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    const generated = data.choices?.[0]?.message?.content?.trim() ?? '';
    return generated.length > 10 ? generated : fallback;
  } catch {
    return fallback;
  }
}

async function generateSignNewsletter(
  signId: string,
  date: string = todayGuadeloupe(),
  horoscopeData: Partial<HoroscopeResponse> = {},
): Promise<Newsletter> {
  const sign = signs.find(s => s.id === signId);
  if (!sign) throw new Error(`Signe non trouvé: ${signId}`);

  const presage = await fetchPresageFromSupabase(date);

  const subject = await generateEmailSubject(sign.name, horoscopeData);

  let htmlBody = '';
  let text = `${sign.name} — ${date}\n${'═'.repeat(50)}\n`;

  if (presage) {
    htmlBody += getPresageTemplate(presage);
    text += `\nSIGNE DU JOUR : ${presage.nom_creole} (${presage.nom_commun})\n"${presage.presage_naturel}"\n`;
  }

  const horoscope: HoroscopeResponse = {
    ouverture: '', amour: '', travail: '', argent: '',
    amitie: '', prediction: '', conseil: '', teaser: '',
    signFr: sign.name, weather: '', edition: 'matin', source: 'supabase',
    ...horoscopeData,
  };

  const data: NewsletterData = { date, sign, horoscope };
  htmlBody += getSignHtmlTemplate(data);
  text += getSignTextTemplate(data);
  htmlBody += getFooterTemplate();

  // Preview text : teaser injecté en div invisible pour les clients mail (Gmail, Apple Mail)
  const previewDiv = horoscope.teaser
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${horoscope.teaser}</div>`
    : '';

  return {
    subject,
    html: wrapHtml(subject, previewDiv + htmlBody),
    text,
    date,
  };
}

// Générateur de newsletter quotidienne complète
export async function generateDailyNewsletter(
  date: string = todayGuadeloupe(),
  subscriberName?: string
): Promise<Newsletter> {
  // Charger les vrais horoscopes depuis Supabase (édition matin — newsletter lue au réveil)
  const horoscopes = await fetchHoroscopesFromSupabase(date, 'matin');
  const presage    = await fetchPresageFromSupabase(date);

  const subject = `✦ Horoscope Karukera — ${new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`;

  let htmlBody = getHeaderTemplate(date);
  let text = `HOROSCOPE KARUKERA — ${date}\n${'═'.repeat(50)}\n`;

  if (presage) {
    htmlBody += getPresageTemplate(presage);
    text += `\nSIGNE DU JOUR : ${presage.nom_creole} (${presage.nom_commun})\n`;
    text += `"${presage.presage_naturel}"\n`;
  }

  // Signes — vrais ou simulés
  const allSignsData: SignHoroscope[] = horoscopes.length > 0
    ? horoscopes
    : signs.map(sign => ({
        sign,
        horoscope: {
          ouverture:  `Les esprits de Karukera accompagnent les natifs du ${sign.name} aujourd'hui.`,
          amour:      'Le cœur sait où aller, laissez-le guider.',
          travail:    'Votre persévérance porte ses fruits.',
          argent:     'Gérez avec sagesse ce qui vous est confié.',
          amitie:     'Le lyannaj est votre force ce jour.',
          prediction: 'Un présage favorable se dessine à l\'horizon.',
          conseil:    'Écoutez la voix des ancêtres en vous.',
          signFr:     sign.name,
          weather:    '',
          edition:    'matin',
          source:     'fallback',
        } as HoroscopeResponse,
      }));

  for (const { sign, horoscope } of allSignsData) {
    const data: NewsletterData = { date, sign, horoscope };
    htmlBody += getSignHtmlTemplate(data);
    text     += getSignTextTemplate(data);
  }

  htmlBody += getFooterTemplate();

  return {
    subject,
    html: wrapHtml(subject, htmlBody),
    text,
    date,
  };
}

// Générateur de newsletter pour un signe spécifique
export async function generatePersonalizedNewsletter(
  signId: string,
  date: string = todayGuadeloupe(),
  horoscopeData: Partial<HoroscopeResponse> = {},
  subscriberName?: string
): Promise<Newsletter> {
  return generateSignNewsletter(signId, date, horoscopeData, subscriberName);
}

export type { Newsletter, NewsletterData, CulturalContent, SignHoroscope };
export { generateCulturalSection, generateSpecialPredictions, generateCulturalTip, generateRitual };
