import type { Metadata } from 'next';
import Link from 'next/link';
import { generateDailyNewsletter } from '@/lib/newsletter-generator';
import { getAllNewsletters, saveNewsletter, type StoredNewsletter } from '@/lib/newsletter-storage';

// Fonction pour formater la date en français
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Fonction pour nettoyer le preview (au cas où il contiendrait du HTML)
function cleanPreview(text: string): string {
  if (text.includes('<') && text.includes('>')) {
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return text;
}

// Composant pour afficher une carte de newsletter avec animation
function NewsletterCard({ newsletter, index }: { newsletter: StoredNewsletter; index: number }) {
  const cleanPreviewText = cleanPreview(newsletter.preview);
  
  return (
    <article 
      className="bg-ancestral-dark/40 border border-ancestral-cream/10 rounded-2xl p-6 
                hover:border-ancestral-gold/40 hover:bg-ancestral-dark/50 
                transition-all duration-300 group"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* En-tête de la carte avec gradient subtil */}
      <header className="mb-5">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🌿</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-ancestral-cream mb-2 group-hover:text-ancestral-gold transition-colors duration-200">
              {newsletter.subject}
            </h3>
            <time className="text-ancestral-cream/60 text-sm">
              {formatDate(newsletter.date)}
            </time>
          </div>
        </div>
      </header>

      {/* Preview du contenu */}
      <p className="text-ancestral-cream/80 text-sm leading-7 mb-6">
        {cleanPreviewText}
      </p>

      {/* Bouton avec effet */}
      <div className="flex justify-end">
        <Link
          href={`/newsletter/${newsletter.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 
                    bg-gradient-to-r from-ancestral-gold/80 to-ancestral-gold 
                    text-ancestral-dark font-semibold rounded-xl 
                    hover:from-ancestral-gold hover:to-ancestral-gold/80 
                    transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Lire la newsletter →
        </Link>
      </div>
    </article>
  );
}

// Composant pour le formulaire d'abonnement
function SubscriptionForm() {
  return (
    <form action="#" method="POST" className="max-w-lg mx-auto space-y-5">
      <div>
        <label htmlFor="email" className="block text-ancestral-cream mb-2 text-sm font-medium">
          Adresse email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="ex: marie@email.com"
          className="w-full p-4 bg-ancestral-dark/50 border-2 border-ancestral-cream/15 rounded-xl 
                    text-ancestral-cream placeholder-ancestral-cream/50
                    focus:outline-none focus:border-ancestral-gold focus:bg-ancestral-dark/30
                    transition-all duration-200"
        />
      </div>
      
      <div>
        <label htmlFor="signe" className="block text-ancestral-cream mb-2 text-sm font-medium">
          Votre signe astrologique (optionnel)
        </label>
        <select
          id="signe"
          name="signe"
          className="w-full p-4 bg-ancestral-dark/50 border-2 border-ancestral-cream/15 rounded-xl 
                    text-ancestral-cream focus:outline-none focus:border-ancestral-gold focus:bg-ancestral-dark/30
                    transition-all duration-200"
        >
          <option value="">-- Sélectionnez votre signe --</option>
          <option value="bélier">🐏 Bélier</option>
          <option value="taureau">🐂 Taureau</option>
          <option value="gémeaux">👫 Gémeaux</option>
          <option value="cancer">🦀 Cancer</option>
          <option value="lion">🦁 Lion</option>
          <option value="vierge">👗 Vierge</option>
          <option value="balance">⚖️ Balance</option>
          <option value="scorpion">🦂 Scorpion</option>
          <option value="sagittaire">🏹 Sagittaire</option>
          <option value="capricorne">🐐 Capricorne</option>
          <option value="verseau">💧 Verseau</option>
          <option value="poissons">🐟 Poissons</option>
        </select>
      </div>

      <div className="flex items-start gap-3 p-4 bg-ancestral-dark/30 rounded-xl border border-ancestral-cream/10">
        <input
          type="checkbox"
          id="consentement"
          name="consentement"
          required
          className="mt-1 flex-shrink-0 w-5 h-5 accent-ancestral-gold rounded border-2 border-ancestral-gold/30"
        />
        <label htmlFor="consentement" className="text-ancestral-cream/80 text-sm">
          J&apos;accepte de recevoir la newsletter et j&apos;ai lu la
          <Link href="/politique-de-confidentialite" className="text-ancestral-gold hover:underline font-medium ml-1">
            Politique de Confidentialité
          </Link>.
        </label>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-ancestral-gold to-ancestral-gold/80 
                  text-ancestral-dark font-bold rounded-xl text-lg
                  hover:from-ancestral-gold/80 hover:to-ancestral-gold 
                  transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        S&apos;abonner gratuitement
      </button>
    </form>
  );
}

// Composant pour les avantages
function BenefitsSection() {
  const benefits = [
    { icon: '🌟', title: 'Horoscope personnalisé', desc: 'Basé sur votre signe astrologique' },
    { icon: '🌿', title: 'Sagesse ancestrale', desc: 'Inspirée des traditions guadeloupéennes' },
    { icon: '🕯️', title: 'Rituels quotidiens', desc: 'Conseils pratiques pour chaque jour' },
    { icon: '🌺', title: 'Découverte culturelle', desc: 'Flore, faune et lieux sacrés de Karukera' },
    { icon: '🗣️', title: 'Langue créole', desc: 'Mots et expressions avec traduction' },
    { icon: '✨', title: 'Prédictions spéciales', desc: 'Basées sur les symboles ancestraux' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {benefits.map((benefit, index) => (
        <div 
          key={benefit.title}
          className="bg-ancestral-dark/30 border border-ancestral-cream/10 rounded-xl p-5
                    hover:border-ancestral-gold/30 transition-colors duration-200"
        >
          <div className="text-3xl mb-3">{benefit.icon}</div>
          <h4 className="text-lg font-semibold text-ancestral-cream mb-2">{benefit.title}</h4>
          <p className="text-ancestral-cream/70 text-sm">{benefit.desc}</p>
        </div>
      ))}
    </div>
  );
}

// Composant FAQ
function FAQSection() {
  const faqs = [
    {
      question: 'À quelle fréquence reçois-je la newsletter ?',
      answer: 'Tous les matins à 8h (heure de Guadeloupe), directement dans votre boîte mail.'
    },
    {
      question: 'Puis-je me désabonner ?',
      answer: 'Oui, à tout moment. Un lien de désabonnement est présent en bas de chaque email.'
    },
    {
      question: 'Mes données sont-elles protégées ?',
      answer: 'Absolument. Vos informations sont chiffrées et ne sont jamais partagées avec des tiers.'
    },
    {
      question: 'Puis-je recevoir l\'horoscope pour un autre signe ?',
      answer: 'Oui ! Indiquez votre signe dans le formulaire d\'abonnement, ou contactez-nous pour le modifier.'
    },
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div 
          key={faq.question}
          className="bg-ancestral-dark/30 border border-ancestral-cream/10 rounded-xl p-5"
        >
          <h4 className="text-lg font-semibold text-ancestral-cream mb-2 flex items-start gap-2">
            <span className="text-2xl">❓</span>
            {faq.question}
          </h4>
          <p className="text-ancestral-cream/80 pl-7">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Newsletter - Horoscope Karukera | Horoscopes Quotidiens avec Sagesse Guadeloupéenne',
  description: 'Abonnez-vous à notre newsletter quotidienne pour recevoir votre horoscope personnalisé avec des conseils inspirés de la culture guadeloupéenne, des rituels traditionnels et des symboles ancestraux.',
  openGraph: {
    title: 'Newsletter - Horoscope Karukera | Horoscopes Quotidiens avec Sagesse Guadeloupéenne',
    description: 'Recevez chaque jour votre horoscope enrichi de la sagesse de Karukera, avec des conseils culturels, des rituels et des symboles guadeloupéens.',
    url: 'https://horoscope-karukera.botiran.news/newsletter',
    type: 'website',
  },
  alternates: {
    canonical: 'https://horoscope-karukera.botiran.news/newsletter',
  },
};

// Page principale - Rendering côté serveur pour récupérer les newsletters
export default async function NewsletterPage() {
  // Récupérer toutes les newsletters depuis le stockage
  let newsletters: StoredNewsletter[] = [];
  
  try {
    newsletters = await getAllNewsletters();
  } catch (error) {
    console.error('Erreur lors de la récupération des newsletters:', error);
    newsletters = [];
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* ===== EN-TÊTE ===== */}
      <header className="text-center mb-12 py-8">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="text-4xl md:text-5xl font-bold text-ancestral-cream mb-4">
          Newsletter Horoscope Karukera
        </h1>
        <p className="text-ancestral-cream/80 text-lg md:text-xl max-w-3xl mx-auto">
          Recevez chaque jour votre horoscope personnalisé, enrichi de la sagesse ancestrale de la Guadeloupe,
          des rituels traditionnels et des symboles qui honorent nos traditions.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="px-4 py-2 bg-ancestral-gold/20 text-ancestral-cream text-sm rounded-full border border-ancestral-gold/30">
            🌟 Gratuit
          </span>
          <span className="px-4 py-2 bg-ancestral-gold/20 text-ancestral-cream text-sm rounded-full border border-ancestral-gold/30">
            📧 Quotidien
          </span>
          <span className="px-4 py-2 bg-ancestral-gold/20 text-ancestral-cream text-sm rounded-full border border-ancestral-gold/30">
            🌿 Culture guadeloupéenne
          </span>
        </div>
      </header>

      {/* ===== SECTION ABONNEMENT ===== */}
      <section className="bg-gradient-to-br from-ancestral-dark/60 to-ancestral-dark/30 
                border border-ancestral-cream/10 rounded-2xl p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-ancestral-cream mb-3">📩 Abonnez-vous</h2>
          <p className="text-ancestral-cream/80">
            Inscrivez-vous pour recevoir gratuitement votre horoscope quotidien
          </p>
        </div>
        
        <SubscriptionForm />
      </section>

      {/* ===== SECTION DERNIÈRES NEWSLETTERS ===== */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-ancestral-cream flex items-center gap-3">
            <span>📰</span> Dernières Newsletters
          </h2>
          {newsletters.length > 3 && (
            <Link
              href="#"
              className="text-ancestral-gold hover:text-ancestral-cream/80 text-sm font-medium"
            >
              Voir tout l&apos;historique
            </Link>
          )}
        </div>
        
        {newsletters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-semibold text-ancestral-cream mb-2">
              Aucune newsletter disponible
            </h3>
            <p className="text-ancestral-cream/70">
              Revenez bientôt pour découvrir nos prochaines publications !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {newsletters.slice(0, 4).map((newsletter, index) => (
              <NewsletterCard 
                key={newsletter.id} 
                newsletter={newsletter} 
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== SECTION CE QUE VOUS RECEVREZ ===== */}
      <section className="bg-ancestral-dark/30 border border-ancestral-cream/10 rounded-2xl p-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-ancestral-cream mb-3">🌟 Ce que vous recevrez</h2>
          <p className="text-ancestral-cream/80">
            Chaque newsletter contient des éléments uniques pour vous connecter à la culture guadeloupéenne
          </p>
        </div>
        
        <BenefitsSection />
      </section>

      {/* ===== SECTION FAQ ===== */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-ancestral-cream mb-8 text-center flex items-center justify-center gap-3">
          <span>❓</span> Questions fréquentes
        </h2>
        <div className="max-w-4xl mx-auto">
          <FAQSection />
        </div>
      </section>

      {/* ===== SECTION À PROPOS ===== */}
      <section className="bg-ancestral-dark/40 border border-ancestral-cream/10 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-ancestral-cream mb-8 text-center">
          💌 Pourquoi s&apos;abonner ?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">🌅</div>
            <h3 className="text-xl font-semibold text-ancestral-cream mb-3">Tous les matins</h3>
            <p className="text-ancestral-cream/80 text-sm">
              Livraison à 8h pile, heure de Guadeloupe, pour commencer votre journée du bon pied.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-ancestral-cream mb-3">100% sécurisé</h3>
            <p className="text-ancestral-cream/80 text-sm">
              Vos données sont protégées et jamais partagées. Désabonnement en un clic.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🌿</div>
            <h3 className="text-xl font-semibold text-ancestral-cream mb-3">Authentique</h3>
            <p className="text-ancestral-cream/80 text-sm">
              Contenu inspiré des traditions guadeloupéennes et de la sagesse de Maryse CondAI.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER DE LA PAGE ===== */}
      <footer className="text-center py-8 border-t border-ancestral-cream/10">
        <p className="text-ancestral-cream/60 text-sm">
          © 2026 Horoscope Karukera. Tous droits réservés.
        </p>
        <p className="text-ancestral-cream/40 text-xs mt-2">
          Paroles inspirées par Maryse CondAI · pour honorer nos traditions
        </p>
      </footer>
    </main>
  );
}
