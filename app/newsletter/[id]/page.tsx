import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNewsletter, getAllNewsletters, type StoredNewsletter } from '@/lib/newsletter-storage';
import { ShareButton } from '@/components/ShareButton';

// Fonction pour formater la date en français
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Fonction pour extraire le signe du sujet (ex: "🌿 Votre Horoscope du 14 Mai - Sagesse de Karukera pour le Bélier")
function extractSignFromSubject(subject: string): string | null {
  const signs = ['bélier', 'taureau', 'gémeaux', 'cancer', 'lion', 'vierge', 'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
  const lowerSubject = subject.toLowerCase();
  for (const sign of signs) {
    if (lowerSubject.includes(sign)) {
      return sign.charAt(0).toUpperCase() + sign.slice(1);
    }
  }
  return null;
}

// Fonction pour générer le HTML de l'iframe avec styles optimisés pour les tantes
function getIframeHtml(htmlContent: string, subject: string): string {
  // Extraire le contenu du body
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;
  
  // Extraire le signe si possible
  const sign = extractSignFromSubject(subject);
  const signEmoji = sign ? '✨' : '🌿';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* ===== VARIABLES DE COULEURS ===== */
    :root {
      --text-primary: #ffffff;
      --text-secondary: #ffe6cc;
      --text-muted: #d4af37;
      --bg-primary: #0a160a;
      --bg-secondary: #1a2e1a;
      --bg-tertiary: #0f240f;
      --accent: #d4af37;
      --accent-light: #f4d03f;
      --success: #2ecc71;
      --border: rgba(255, 255, 255, 0.1);
    }

    /* ===== RESET & BASE ===== */
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      color: var(--text-primary);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 18px;
      line-height: 1.8;
    }

    /* Supprimer tous les backgrounds blancs/clair par défaut */
    [style*="background"], [style*="background-color"] {
      background: transparent !important;
      background-color: transparent !important;
    }

    /* ===== CONTEUR PRINCIPAL ===== */
    .newsletter-wrapper {
      max-width: 680px;
      margin: 0 auto;
      background: var(--bg-primary);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    /* ===== EN-TÊTE ===== */
    .newsletter-header {
      background: linear-gradient(135deg, #1a4a2e 0%, #2d5a3d 50%, #1a4a2e 100%);
      color: var(--text-primary);
      padding: 40px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .newsletter-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23p)"/></svg>');
      opacity: 0.3;
    }

    .newsletter-header h1 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .newsletter-header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
      color: var(--text-secondary);
    }

    .header-icon {
      font-size: 40px;
      margin-bottom: 16px;
    }

    /* ===== CONTENU PRINCIPAL ===== */
    .newsletter-main {
      padding: 32px;
      background: var(--bg-secondary);
    }

    /* ===== SECTIONS ===== */
    section {
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--border);
    }

    section:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    /* ===== TITRES ===== */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-primary);
      font-weight: 600;
    }

    h2 {
      font-size: 22px;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--accent);
      display: inline-block;
    }

    h3 {
      font-size: 18px;
      margin-bottom: 14px;
      color: var(--text-secondary);
    }

    /* ===== PARAGRAPHES ===== */
    p {
      margin: 0 0 20px 0;
      line-height: 1.8;
      color: var(--text-secondary);
      text-align: justify;
    }

    p:last-child {
      margin-bottom: 0;
    }

    /* ===== LIENS ===== */
    a {
      color: var(--accent-light);
      text-decoration: none;
      font-weight: 500;
    }

    a:hover {
      text-decoration: underline;
    }

    /* ===== CONSEILS PAR DOMAINE (Grille) ===== */
    .domains-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .domain-card {
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      transition: transform 0.2s, border-color 0.2s;
    }

    .domain-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }

    .domain-card h3 {
      color: var(--accent);
      font-size: 17px;
      margin-bottom: 12px;
      border-bottom: none;
      padding-bottom: 0;
    }

    .domain-card p {
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    /* ===== BOX SPÉCIALES (Sagesse, Créole, Rituel) ===== */
    .special-box {
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
    }

    .wisdom-box {
      border-left: 4px solid var(--accent);
    }

    .creole-box {
      border-left: 4px solid var(--accent-light);
    }

    .ritual-box {
      background: linear-gradient(135deg, rgba(244, 208, 63, 0.15), rgba(212, 175, 55, 0.15));
      border-left: 4px solid var(--accent);
    }

    .special-box h3 {
      color: var(--accent-light);
      font-size: 17px;
      margin-bottom: 12px;
    }

    .special-box p {
      margin: 0 0 10px 0;
      font-size: 15px;
      line-height: 1.7;
    }

    .special-box strong {
      color: var(--accent);
    }

    /* ===== FOOTER ===== */
    .newsletter-footer {
      padding: 28px 32px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
      border-top: 1px solid var(--border);
      background: var(--bg-tertiary);
    }

    .newsletter-footer p {
      margin: 8px 0;
      color: var(--text-muted);
    }

    /* ===== EMOJIS & ICÔNES ===== */
    .emoji {
      display: inline-block;
      margin-right: 8px;
      font-size: 1.1em;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      body {
        font-size: 16px;
        line-height: 1.7;
      }

      .newsletter-header {
        padding: 32px 24px;
      }

      .newsletter-header h1 {
        font-size: 24px;
      }

      .newsletter-main {
        padding: 24px 20px;
      }

      section {
        margin-bottom: 32px;
        padding-bottom: 24px;
      }

      h2 {
        font-size: 20px;
      }

      .domains-grid {
        grid-template-columns: 1fr;
      }

      .newsletter-wrapper {
        border-radius: 8px;
      }

      .newsletter-footer {
        padding: 20px;
        font-size: 12px;
      }
    }

    @media (max-width: 480px) {
      .newsletter-header h1 {
        font-size: 22px;
      }

      h2 {
        font-size: 18px;
      }

      body {
        font-size: 15px;
      }
    }

    /* ===== ANIMATIONS SUBTILES ===== */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .newsletter-wrapper {
      animation: fadeIn 0.5s ease-out;
    }
  </style>
</head>
<body>
  <div class="newsletter-wrapper">
    <div class="newsletter-header">
      <div class="header-icon">${signEmoji}</div>
      <h1>${subject}</h1>
      <p>Sagesse de Karukera${sign ? ' pour le signe du ' + sign : ''}</p>
    </div>
    <main class="newsletter-main">
      ${bodyContent}
    </main>
  </div>
</body>
</html>`;
}



export async function generateMetadata(props: any): Promise<Metadata> {
  // Resolve params - Next.js may pass it as a Promise or as a plain object
  const params = props.params;
  const resolvedParams = params 
    ? typeof params === 'object' && 'then' in params
      ? await params
      : params
    : { id: '' };
  
  // Essayons de récupérer la newsletter depuis le stockage
  let newsletter: StoredNewsletter | null = null;
  
  try {
    newsletter = await getNewsletter(resolvedParams.id);
  } catch (error) {
    console.error('Erreur lors de la récupération de la newsletter:', error);
  }
  
  if (!newsletter) {
    return {
      title: 'Newsletter non trouvée - Horoscope Karukera',
    };
  }
  
  return {
    title: `${newsletter.subject} - Horoscope Karukera`,
    description: newsletter.preview,
    openGraph: {
      title: newsletter.subject,
      description: newsletter.preview,
      url: `https://zodyak-karukera.com/newsletter/${newsletter.id}`,
      type: 'article',
    },
  };
}

// Données d'exemple de secours
const exampleNewsletters: StoredNewsletter[] = [
  {
    id: 'newsletter-2026-05-14',
    date: '2026-05-14T08:00:00Z',
    subject: '🌿 Votre Horoscope du 14 Mai - Sagesse de Karukera',
    preview: 'Découvrez votre horoscope du jour enrichi de la sagesse ancestrale de la Guadeloupe...',
    htmlContent: `
      <div>
        <header>
          <h1>🌿 Votre Horoscope du 14 Mai 2026</h1>
          <p>Sagesse de Karukera pour le signe du Bélier</p>
        </header>
        
        <main>
          <section>
            <h2>🌟 Votre Horoscope du Jour</h2>
            <p>
              Aujourd'hui, le kolibri vous guide vers la persévérance. Comme cet oiseau minuscule 
              qui butine sans relâche, vous devez continuer à avancer malgré les obstacles. 
              La Soufrière, qui dort depuis des siècles, vous rappelle que la patience est une vertu sacrée.
            </p>
          </section>
          
          <section>
            <h2>💫 Conseils par Domaine</h2>
            <div class="domains-grid">
              <div class="domain-card">
                <h3>❤️ Amour</h3>
                <p>Sois comme le flamant rose : élégant et fidèle.</p>
              </div>
              <div class="domain-card">
                <h3>💼 Travail</h3>
                <p>Travaille comme la fourmi manmi : sans bruit mais efficacement.</p>
              </div>
              <div class="domain-card">
                <h3>💰 Argent</h3>
                <p>L'argent est comme la mer : il vient et il part avec les marées.</p>
              </div>
              <div class="domain-card">
                <h3>🤝 Amitié</h3>
                <p>Entoure-toi comme le fromager entrelace ses racines.</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2>🌿 Sagesse du Jour</h2>
            <div class="special-box wisdom-box">
              <h3>🌺 La Flore Sacrée de Guadeloupe</h3>
              <p>
                La Guadeloupe regorge de plantes aux vertus méconnues. Le manguier, symbole de patience, 
                nous rappelle que les meilleures choses prennent du temps. Le cerisier, utilisé en médecine 
                traditionnelle, purifie le corps et l'esprit.
              </p>
            </div>
          </section>
          
          <section>
            <h2>🗣️ Mot du Jour en Créole</h2>
            <div class="special-box creole-box">
              <p><strong>Zot</strong></p>
              <p>
                <strong>Prononciation:</strong> Zot<br/>
                <strong>Signification:</strong> Vous (pluriel respectueux)<br/>
                <strong>Exemple:</strong> &laquo;Zot ka fè sa ?&raquo; - &laquo;Que faites-vous ?&raquo;
              </p>
            </div>
          </section>
          
          <section>
            <h2>🕯️ Rituel du Jour</h2>
            <div class="special-box ritual-box">
              <p>
                <strong>Allumez une bougie blanche ce matin</strong> pour commencer la semaine avec pureté 
                et attirer les bonnes énergies dans votre vie.
              </p>
            </div>
          </section>
        </main>
        
        <footer class="newsletter-footer">
          <p>© 2026 Horoscope Karukera. Tous droits réservés.</p>
          <p>Paroles inspirées par Maryse CondAI · pour honorer nos traditions</p>
        </footer>
      </div>
    `,
    text: `Votre Horoscope du 14 Mai 2026 - Sagesse de Karukera pour le signe du Bélier

VOTRE HOROSCOPE DU JOUR
=======================
Aujourd'hui, le kolibri vous guide vers la persévérance. Comme cet oiseau minuscule qui butine sans relâche, vous devez continuer à avancer malgré les obstacles. La Soufrière, qui dort depuis des siècles, vous rappelle que la patience est une vertu sacrée.

CONSEILS PAR DOMAINE
====================
❤️ AMOUR: Sois comme le flamant rose : élégant et fidèle.
💼 TRAVAIL: Travaille comme la fourmi manmi : sans bruit mais efficacement.
💰 ARGENT: L'argent est comme la mer : il vient et il part avec les marées.
🤝 AMITIÉ: Entoure-toi comme le fromager entrelace ses racines.

SAGESSE DU JOUR
===============
La Flore Sacrée de Guadeloupe
La Guadeloupe regorge de plantes aux vertus méconnues. Le manguier, symbole de patience, nous rappelle que les meilleures choses prennent du temps.

MOT DU JOUR EN CRÉOLE
======================
Zot - Vous (pluriel respectueux)

RITUEL DU JOUR
==============
Allumez une bougie blanche ce matin pour commencer la semaine avec pureté.

© 2026 Horoscope Karukera. Tous droits réservés.
Paroles inspirées par Maryse CondAI · pour honorer nos traditions
`,
  },
  {
    id: 'newsletter-2026-05-13',
    date: '2026-05-13T08:00:00Z',
    subject: '🌺 Votre Horoscope du 13 Mai - Conseils Culturels',
    preview: "Aujourd'hui, l'igwann péyi vous invite à la patience...",
    htmlContent: `
      <div>
        <header>
          <h1>🌺 Votre Horoscope du 13 Mai 2026</h1>
          <p>Sagesse de Karukera pour tous les signes</p>
        </header>
        <main>
          <p>Contenu de la newsletter du 13 mai...</p>
        </main>
      </div>
    `,
    text: 'Votre Horoscope du 13 Mai 2026\n\nContenu de la newsletter...',
  },
  {
    id: 'newsletter-2026-05-12',
    date: '2026-05-12T08:00:00Z',
    subject: '⛰️ Votre Horoscope du 12 Mai - Rituels Traditionnels',
    preview: 'Allumez une bougie blanche ce matin pour purifier votre semaine...',
    htmlContent: `
      <div>
        <header>
          <h1>⛰️ Votre Horoscope du 12 Mai 2026</h1>
          <p>Sagesse de Karukera</p>
        </header>
        <main>
          <p>Contenu de la newsletter du 12 mai...</p>
        </main>
      </div>
    `,
    text: 'Votre Horoscope du 12 Mai 2026\n\nContenu de la newsletter...',
  },
];

// Page de détail - Rendering côté serveur
export default async function NewsletterDetailPage(props: any) {
  // Resolve params - Next.js may pass it as a Promise or as a plain object
  const params = props.params;
  const resolvedParams = params 
    ? typeof params === 'object' && 'then' in params
      ? await params
      : params
    : { id: '' };
  
  // Récupérer la newsletter depuis le stockage
  let newsletter: StoredNewsletter | null = null;
  let allNewsletters: StoredNewsletter[] = [];
  
  try {
    newsletter = await getNewsletter(resolvedParams.id);
    allNewsletters = await getAllNewsletters();
  } catch (error) {
    console.error('Erreur lors de la récupération des newsletters:', error);
  }
  
  // Si la newsletter n'est pas trouvée, essayer avec les données d'exemple
  if (!newsletter) {
    newsletter = exampleNewsletters.find((n) => n.id === resolvedParams.id) ?? null;
    allNewsletters = exampleNewsletters;
  }
  
  if (!newsletter) {
    notFound();
  }

  // Trouver l'index actuel
  const currentIndex = allNewsletters.findIndex(n => n.id === resolvedParams.id);
  const prevId = currentIndex > 0 ? allNewsletters[currentIndex - 1].id : null;
  const nextId = currentIndex < allNewsletters.length - 1 ? allNewsletters[currentIndex + 1].id : null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête avec bouton retour amélioré */}
      <header className="mb-8">
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 px-6 py-4 bg-ancestral-gold text-ancestral-dark font-semibold rounded-xl hover:bg-ancestral-gold/90 transition-colors duration-200 text-lg mb-6"
        >
          ← Retour à toutes les newsletters
        </Link>
        
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-ancestral-cream mb-3">{newsletter.subject}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <time className="text-ancestral-cream/70 text-lg">{formatDate(newsletter.date)}</time>
            <span className="text-ancestral-cream/40 text-sm">· Version web de la newsletter</span>
            <ShareButton url={`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/newsletter/${newsletter.id}`} />
          </div>
        </div>
      </header>

      {/* Affiche le contenu HTML de la newsletter dans un iframe avec styles optimisés */}
      <section className="bg-ancestral-dark/30 border border-ancestral-cream/10 rounded-xl overflow-hidden mb-8">
        <iframe
          srcDoc={getIframeHtml(newsletter.htmlContent, newsletter.subject)}
          className="w-full min-h-[800px] border-0"
          title={newsletter.subject}
          loading="lazy"
        />
      </section>

      {/* Version texte alternative */}
      <section className="bg-ancestral-dark/30 border border-ancestral-cream/10 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-ancestral-cream mb-4 flex items-center gap-2">
          📄 Version Texte
        </h2>
        <pre className="text-ancestral-cream/80 text-base whitespace-pre-wrap overflow-x-auto leading-relaxed">
          {newsletter.text}
        </pre>
      </section>

      {/* Navigation entre les newsletters - AMÉLIORÉE */}
      <nav className="mt-8 pt-8 border-t border-ancestral-cream/10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            {prevId && (
              <Link
                href={`/newsletter/${prevId}`}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-ancestral-dark/50 border-2 border-ancestral-gold/50 rounded-xl text-ancestral-cream hover:bg-ancestral-gold/20 hover:border-ancestral-gold transition-all duration-200 text-lg font-medium"
              >
                ← Précédente
              </Link>
            )}
            
            {nextId && (
              <Link
                href={`/newsletter/${nextId}`}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-ancestral-dark/50 border-2 border-ancestral-gold/50 rounded-xl text-ancestral-cream hover:bg-ancestral-gold/20 hover:border-ancestral-gold transition-all duration-200 text-lg font-medium"
              >
                Suivante →
              </Link>
            )}
          </div>
          
          <Link
            href="/newsletter"
            className="px-8 py-4 bg-ancestral-gold/90 text-ancestral-dark font-semibold rounded-xl hover:bg-ancestral-gold transition-colors duration-200 text-lg"
          >
            Voir toutes les newsletters
          </Link>
        </div>
      </nav>
    </main>
  );
}
