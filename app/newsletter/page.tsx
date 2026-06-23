import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllNewsletters, type StoredNewsletter } from '@/lib/newsletter-storage';
import NewsletterSubscribeForm from '@/components/NewsletterSubscribeForm';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function cleanPreview(text: string): string {
  if (text.includes('<') && text.includes('>')) {
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return text;
}

function NewsletterCard({ newsletter, index }: { newsletter: StoredNewsletter; index: number }) {
  const cleanPreviewText = cleanPreview(newsletter.preview);

  return (
    <article
      className="relative bg-ancestral-dark/40 border border-ancestral-cream/10 rounded-2xl p-6
                hover:border-ancestral-gold/40 hover:bg-ancestral-dark/50
                transition-all duration-300 group cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link href={`/newsletter/${newsletter.id}/email-preview`} className="absolute inset-0 z-0 rounded-2xl" aria-label={newsletter.subject} />

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

      <p className="text-ancestral-cream/80 text-base sm:text-lg leading-[1.75] mb-6">
        {cleanPreviewText}
      </p>
    </article>
  );
}

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
      {benefits.map((benefit) => (
        <div
          key={benefit.title}
          className="bg-ancestral-dark/30 border border-ancestral-cream/10 rounded-xl p-5
                    hover:border-ancestral-gold/30 transition-colors duration-200"
        >
          <div className="text-3xl mb-3">{benefit.icon}</div>
          <h4 className="text-lg font-semibold text-ancestral-cream mb-2">{benefit.title}</h4>
          <p className="text-ancestral-cream/70 text-base">{benefit.desc}</p>
        </div>
      ))}
    </div>
  );
}

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
      {faqs.map((faq) => (
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

/* ── Liste newsletters — composant async isolé pour le streaming ─────────── */

async function NewsletterList() {
  let newsletters: StoredNewsletter[] = [];
  try {
    newsletters = await getAllNewsletters();
  } catch {
    newsletters = [];
  }

  if (newsletters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-2xl font-semibold text-ancestral-cream mb-2">
          Aucune newsletter disponible
        </h3>
        <p className="text-ancestral-cream/70">
          Revenez bientôt pour découvrir nos prochaines publications !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {newsletters.slice(0, 4).map((newsletter, index) => (
        <NewsletterCard key={newsletter.id} newsletter={newsletter} index={index} />
      ))}
    </div>
  );
}

function NewsletterListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-ancestral-dark/40 border border-ancestral-cream/10 p-6 h-48" />
      ))}
    </div>
  );
}

/* ── Métadonnées ─────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Newsletter - Horoscope Karukera | Horoscopes Quotidiens avec Sagesse Guadeloupéenne',
  description: 'Abonnez-vous à notre newsletter quotidienne pour recevoir votre horoscope personnalisé avec des conseils inspirés de la culture guadeloupéenne, des rituels traditionnels et des symboles ancestraux.',
  openGraph: {
    title: 'Newsletter - Horoscope Karukera | Horoscopes Quotidiens avec Sagesse Guadeloupéenne',
    description: 'Recevez chaque jour votre horoscope enrichi de la sagesse de Karukera, avec des conseils culturels, des rituels et des symboles guadeloupéens.',
    url: 'https://zodyak-karukera.com/newsletter',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zodyak-karukera.com/newsletter',
  },
};

/* ── Page — rendu immédiat, liste en streaming via Suspense ──────────────── */

export default function NewsletterPage() {
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
        <NewsletterSubscribeForm />
      </section>

      {/* ===== SECTION DERNIÈRES NEWSLETTERS — streaming ===== */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-ancestral-cream flex items-center gap-3">
            <span>📰</span> Dernières Newsletters
          </h2>
        </div>
        <Suspense fallback={<NewsletterListSkeleton />}>
          <NewsletterList />
        </Suspense>
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
            <p className="text-ancestral-cream/80 text-base">
              Livraison à 8h pile, heure de Guadeloupe, pour commencer votre journée du bon pied.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-ancestral-cream mb-3">100% sécurisé</h3>
            <p className="text-ancestral-cream/80 text-base">
              Vos données sont protégées et jamais partagées. Désabonnement en un clic.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🌿</div>
            <h3 className="text-xl font-semibold text-ancestral-cream mb-3">Authentique</h3>
            <p className="text-ancestral-cream/80 text-base">
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
