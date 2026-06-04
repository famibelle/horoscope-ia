import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - Horoscope Karukera | Données Personnelles et Cookies',
  description: 'Comment Horoscope Karukera protège vos données ? Découvrez notre politique de confidentialité, l\'utilisation des cookies et vos droits RGPD pour un horoscope sécurisé.',
  openGraph: {
    title: 'Politique de Confidentialité - Horoscope Karukera | Données Personnelles et Cookies',
    description: 'Comment Horoscope Karukera protège vos données ? Découvrez notre politique de confidentialité, l\'utilisation des cookies et vos droits RGPD.',
    url: 'https://zodyak-karukera.com/politique-de-confidentialite',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zodyak-karukera.com/politique-de-confidentialite',
  },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ancestral-cream mb-2">Politique de Confidentialité</h1>
        <p className="text-ancestral-cream/60 italic"><em>Dernière mise à jour : 11 mai 2026</em></p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Introduction</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Horoscope Karukera s&apos;engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données lorsque vous utilisez notre service d&apos;<strong className="text-ancestral-cream">horoscope gratuit</strong>, nos <strong className="text-ancestral-cream">prédictions astrologiques</strong> et nos outils en ligne.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Données Collectées</h2>
        <h3 className="text-xl font-medium text-ancestral-cream mb-3">1. Données que vous nous fournissez</h3>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">
          Lorsque vous utilisez notre Site, vous pouvez nous transmettre volontairement des informations, notamment :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Votre <strong className="text-ancestral-cream">adresse email</strong> (si vous vous abonnez à notre newsletter d&apos;horoscopes quotidiens) ;</li>
          <li>Votre <strong className="text-ancestral-cream">signe astrologique</strong> et date de naissance (pour personnaliser vos prédictions) ;</li>
          <li>Vos <strong className="text-ancestral-cream">commentaires</strong> ou messages via le formulaire de contact.</li>
        </ul>

        <h3 className="text-xl font-medium text-ancestral-cream mb-3 mt-6">2. Données collectées automatiquement</h3>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">
          Nous pouvons collecter des informations techniques, notamment :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Votre <strong className="text-ancestral-cream">adresse IP</strong> ;</li>
          <li>Le type de navigateur et d&apos;appareil utilisé ;</li>
          <li>Les pages visitées et la durée de la session (pour améliorer l&apos;expérience utilisateur) ;</li>
          <li>Les <strong className="text-ancestral-cream">cookies</strong> (voir section dédiée).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Utilisation des Données</h2>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">Vos données sont utilisées pour :</p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Fournir et personnaliser nos services (ex : <strong className="text-ancestral-cream">horoscope du jour</strong> adapté à votre signe) ;</li>
          <li>Améliorer la qualité du Site (analyse du trafic, optimisation SEO) ;</li>
          <li>Vous envoyer des communications (newsletters, alertes astrologiques) si vous y avez consenti ;</li>
          <li>Respecter nos obligations légales.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Cookies</h2>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">
          Nous utilisons des cookies pour :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li><strong className="text-ancestral-cream">Améliorer votre expérience</strong> (mémoriser vos préférences de signe astrologique) ;</li>
          <li><strong className="text-ancestral-cream">Analyser le trafic</strong> (via Google Analytics ou outils similaires) ;</li>
          <li><strong className="text-ancestral-cream">Afficher des publicités pertinentes</strong> (via Google AdSense).</li>
        </ul>
        <p className="text-ancestral-cream/80 leading-relaxed mt-4">
          Vous pouvez désactiver les cookies via les paramètres de votre navigateur, mais cela peut limiter certaines fonctionnalités du Site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Partage des Données</h2>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">
          Vos données ne sont <strong className="text-ancestral-cream">jamais vendues</strong>. Elles peuvent être partagées avec :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Nos partenaires techniques (hébergeurs, outils d&apos;analyse) ;</li>
          <li>Les autorités compétentes si la loi l&apos;exige.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Conservation des Données</h2>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">
          Vos données personnelles sont conservées pendant :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>3 ans pour les données de contact (email) ;</li>
          <li>26 mois pour les cookies (durée maximale légale).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Vos Droits RGPD</h2>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li><strong className="text-ancestral-cream">Droit d&apos;accès</strong> : Demander une copie de vos données ;</li>
          <li><strong className="text-ancestral-cream">Droit de rectification</strong> : Corriger vos informations ;</li>
          <li><strong className="text-ancestral-cream">Droit à l&apos;effacement</strong> : Supprimer vos données ;</li>
          <li><strong className="text-ancestral-cream">Droit à la portabilité</strong> : Récupérer vos données ;</li>
          <li><strong className="text-ancestral-cream">Droit d&apos;opposition</strong> : Refuser le traitement de vos données.</li>
        </ul>
        <p className="text-ancestral-cream/80 leading-relaxed mt-4">
          Pour exercer ces droits, contactez-nous via <a href="/contact" className="text-ancestral-gold hover:underline">ce formulaire</a> ou par email à <a href="mailto:contact@botiran.news" className="text-ancestral-gold hover:underline">contact@botiran.news</a>.
          Vous avez également le droit de déposer une réclamation auprès de la <a href="https://www.cnil.fr/" target="_blank" rel="noopener noreferrer" className="text-ancestral-gold hover:underline">CNIL</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Sécurité</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données contre les accès non autorisés, les pertes ou les fuites.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Modifications</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Nous nous réservons le droit de modifier cette politique. Les changements seront publiés sur cette page.
        </p>
      </section>
    </main>
  );
}
