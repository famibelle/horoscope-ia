import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CGU - Horoscope Karukera | Conditions d\'Utilisation de l\'Horoscope en Ligne',
  description: 'Lisez les CGU de Horoscope Karukera : règles d\'utilisation, droits et obligations pour profiter de nos horoscopes gratuits et services astrologiques.',
  openGraph: {
    title: 'CGU - Horoscope Karukera | Conditions d\'Utilisation de l\'Horoscope en Ligne',
    description: 'Lisez les CGU de Horoscope Karukera : règles d\'utilisation, droits et obligations pour profiter de nos horoscopes gratuits.',
    url: 'https://horoscope-karukera.botiran.news/cgu',
    type: 'website',
  },
  alternates: {
    canonical: 'https://horoscope-karukera.botiran.news/cgu',
  },
};

export default function CGUPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ancestral-cream mb-2">Conditions Générales d&apos;Utilisation (CGU)</h1>
        <p className="text-ancestral-cream/60 italic"><em>Dernière mise à jour : 11 mai 2026</em></p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">1. Acceptation des CGU</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          En accédant au Site <strong className="text-ancestral-cream">Horoscope Karukera</strong> (ci-après « le Site »), vous acceptez sans réserve les présentes Conditions Générales d&apos;Utilisation.
          Si vous n&apos;êtes pas d&apos;accord avec ces CGU, nous vous invitons à ne pas utiliser le Site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">2. Accès au Site</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Le Site est accessible gratuitement, 24h/24 et 7j/7, sous réserve des pannes techniques ou des maintenance.
          L&apos;accès nécessite une connexion internet et un navigateur à jour.
          <strong className="text-ancestral-cream">Horoscope Karukera</strong> se réserve le droit de suspendre, modifier ou interrompre l&apos;accès au Site sans préavis.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">3. Utilisation du Service</h2>
        <h3 className="text-xl font-medium text-ancestral-cream mb-3">3.1. Services proposés</h3>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">
          Le Site propose les services suivants :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Consultation gratuite d&apos;<strong className="text-ancestral-cream">horoscopes quotidiens, hebdomadaires et mensuels</strong> ;</li>
          <li>Prédictions astrologiques personnalisées (selon votre signe et votre thème astral) ;</li>
          <li>Abonnement à des newsletters astrologiques ;</li>
          <li>Accès à des articles sur l&apos;astrologie, les signes du zodiaque et les conseils spirituels.</li>
        </ul>

        <h3 className="text-xl font-medium text-ancestral-cream mb-3 mt-6">3.2. Obligations de l&apos;utilisateur</h3>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">En utilisant le Site, vous vous engagez à :</p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Ne pas utiliser les contenus à des fins commerciales sans autorisation ;</li>
          <li>Ne pas copier, reproduire ou modifier les horoscopes ou autres contenus sans mention de la source ;</li>
          <li>Ne pas perturber le fonctionnement du Site (pas de spam, hacking, etc.) ;</li>
          <li>Respecter les lois en vigueur.</li>
        </ul>

        <h3 className="text-xl font-medium text-ancestral-cream mb-3 mt-6">3.3. Limites d&apos;âge</h3>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Le Site est destiné à un public de <strong className="text-ancestral-cream">plus de 13 ans</strong>.
          Les mineurs doivent obtenir l&apos;autorisation de leurs parents avant de s&apos;abonner à la newsletter ou de fournir des données personnelles.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">4. Propriété Intellectuelle</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Tous les contenus du Site (textes, images, designs, horoscopes, prédictions, logos) sont la propriété exclusive de <strong className="text-ancestral-cream">Horoscope Karukera</strong> ou de ses partenaires.
          Toute reproduction, représentation ou diffusion non autorisée est interdite et constituerait une contrefaçon passible de sanctions pénales.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">5. Responsabilité</h2>
        <h3 className="text-xl font-medium text-ancestral-cream mb-3">5.1. Responsabilité de Horoscope Karukera</h3>
        <p className="text-ancestral-cream/80 leading-relaxed mb-3">
          <strong className="text-ancestral-cream">Horoscope Karukera</strong> s&apos;engage à fournir des informations aussi précises que possible sur les horoscopes et l&apos;astrologie.
          Cependant :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Les prédictions astrologiques sont à titre <strong className="text-ancestral-cream">indicatif et divertissant</strong> ;</li>
          <li>Nous ne garantissons pas l&apos;exactitude, la complétude ou l&apos;actualité des informations ;</li>
          <li>Nous déclinons toute responsabilité en cas d&apos;erreur, omission ou dommage lié à l&apos;utilisation du Site.</li>
        </ul>

        <h3 className="text-xl font-medium text-ancestral-cream mb-3 mt-6">5.2. Responsabilité de l&apos;utilisateur</h3>
        <p className="text-ancestral-cream/80 leading-relaxed">
          L&apos;utilisateur est seul responsable de l&apos;interprétation et de l&apos;utilisation des horoscopes et conseils diffusés sur le Site.
          <strong className="text-ancestral-cream">Horoscope Karukera</strong> ne peut être tenu responsable des décisions prises par l&apos;utilisateur sur la base de ces informations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">6. Liens Externes</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Le Site peut contenir des liens vers des sites tiers (partenaires, annonceurs, etc.).
          <strong className="text-ancestral-cream">Horoscope Karukera</strong> n&apos;a aucun contrôle sur ces sites et déclinons toute responsabilité quant à leur contenu.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">7. Publicité et Partenariats</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Le Site peut afficher des publicités via des réseaux comme <strong className="text-ancestral-cream">Google AdSense</strong>.
          Ces publicités sont ciblées en fonction de votre navigation et de vos centres d&apos;intérêt.
          Nous ne contrôlons pas le contenu de ces annonces.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">8. Modification des CGU</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Nous nous réservons le droit de modifier les présentes CGU à tout moment.
          Les modifications seront publiées sur cette page et prendront effet immédiatement.
          Il est de votre responsabilité de consulter régulièrement les CGU.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">9. Droit Applicable et Litiges</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Les présentes CGU sont régies par le droit français.
          Tout litige sera soumis aux tribunaux compétents de Paris.
          Nous encourageons une résolution amiable des conflits avant toute action en justice.
        </p>
      </section>
    </main>
  );
}
