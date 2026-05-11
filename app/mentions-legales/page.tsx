import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales - Horoscope Karukera | Horoscope et Astrologie en Ligne',
  description: 'Découvrez les mentions légales de Horoscope Karukera. Informations légales, éditeur, hébergement et conditions d\'utilisation pour notre service d\'horoscope gratuit.',
  openGraph: {
    title: 'Mentions Légales - Horoscope Karukera | Horoscope et Astrologie en Ligne',
    description: 'Découvrez les mentions légales de Horoscope Karukera pour nos services d\'horoscope et d\'astrologie en ligne.',
    url: 'https://horoscope-karukera.botiran.news/mentions-legales',
    type: 'website',
  },
  alternates: {
    canonical: 'https://horoscope-karukera.botiran.news/mentions-legales',
  },
};

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ancestral-cream mb-6">Mentions Légales</h1>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Éditeur du Site</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Le site <strong className="text-ancestral-cream">Horoscope Karukera</strong> (ci-après « le Site ») est édité par :<br />
          <strong className="text-ancestral-cream">[Ton Nom ou Raison Sociale]</strong><br />
          [Adresse postale complète]<br />
          [Code postal, Ville, Pays]<br />
          Email : <a href="mailto:[ton-email]" className="text-ancestral-gold hover:underline">[ton-email]</a><br />
          <em className="text-ancestral-cream/60">Pour les professionnels :</em> SIRET [XXX XXX XXX] – RCS [Ville]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Hébergement</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Le Site est hébergé par :<br />
          <strong className="text-ancestral-cream">[Nom de l&apos;hébergeur, ex: Vercel, OVH, Hostinger]</strong><br />
          [Adresse de l&apos;hébergeur]<br />
          Site web : <a href="[lien-hebergeur]" target="_blank" rel="noopener noreferrer" className="text-ancestral-gold hover:underline">[lien-hebergeur]</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Propriété Intellectuelle</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Tous les contenus du Site (textes, images, logos, horoscopes, prédictions astrologiques, designs) sont protégés par le droit d&apos;auteur français et international.
          Toute reproduction, distribution ou modification non autorisée est strictement interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Responsabilité</h2>
        <p className="text-ancestral-cream/80 leading-relaxed mb-4">
          Les informations diffusées sur le Site (notamment les <strong className="text-ancestral-cream">horoscopes, prédictions astrologiques et conseils</strong>) sont fournies à titre indicatif et ne constituent en aucun cas :
        </p>
        <ul className="list-disc list-inside text-ancestral-cream/80 leading-relaxed space-y-2 ml-4">
          <li>Un avis médical, juridique ou financier ;</li>
          <li>Une garantie de résultats ;</li>
          <li>Un engagement de notre part.</li>
        </ul>
        <p className="text-ancestral-cream/80 leading-relaxed mt-4">
          L&apos;utilisateur reste seul responsable de l&apos;interprétation et de l&apos;utilisation des contenus.
          Nous déclinons toute responsabilité en cas de préjudice direct ou indirect lié à l&apos;utilisation du Site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Liens Hypertextes</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Le Site peut contenir des liens vers des sites tiers. Nous n&apos;exerçons aucun contrôle sur ces sites et déclinons toute responsabilité quant à leur contenu.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Droit Applicable</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Les présentes mentions légales sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de [Ville].
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">Contact</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Pour toute question : <a href="/contact" className="text-ancestral-gold hover:underline">nous contacter</a>.
        </p>
      </section>
    </main>
  );
}
