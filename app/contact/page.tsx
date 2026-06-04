import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - Horoscope Karukera | Questions, Support et Collaboration',
  description: 'Contactez Horoscope Karukera pour toute question sur nos horoscopes, partenariats ou support technique. Réponse sous 48h.',
  openGraph: {
    title: 'Contact - Horoscope Karukera | Questions, Support et Collaboration',
    description: 'Contactez Horoscope Karukera pour toute question sur nos horoscopes, partenariats ou support technique. Réponse sous 48h.',
    url: 'https://zodyak-karukera.com/contact',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zodyak-karukera.com/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ancestral-cream mb-6">Contactez-Nous</h1>
      </header>

      <section className="mb-8">
        <p className="text-ancestral-cream/80 leading-relaxed mb-6">
          Vous avez une question sur nos <strong className="text-ancestral-cream">horoscopes</strong>, nos services astrologiques ou notre politique de confidentialité ?
          N&apos;hésitez pas à nous écrire !
        </p>

        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">📩 Formulaire de Contact</h2>
        <form action="#" method="POST" className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-ancestral-cream/80 mb-1">Nom *</label>
            <input 
              type="text" 
              id="nom" 
              name="nom" 
              required 
              placeholder="Votre nom"
              className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-ancestral-cream/80 mb-1">Email *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="votre@email.com"
              className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold"
            />
          </div>
          <div>
            <label htmlFor="signe" className="block text-ancestral-cream/80 mb-1">Votre signe astrologique (optionnel)</label>
            <select 
              id="signe" 
              name="signe"
              className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold"
            >
              <option value="">-- Sélectionnez votre signe --</option>
              <option value="bélier">Bélier</option>
              <option value="taureau">Taureau</option>
              <option value="gémeaux">Gémeaux</option>
              <option value="cancer">Cancer</option>
              <option value="lion">Lion</option>
              <option value="vierge">Vierge</option>
              <option value="balance">Balance</option>
              <option value="scorpion">Scorpion</option>
              <option value="sagittaire">Sagittaire</option>
              <option value="capricorne">Capricorne</option>
              <option value="verseau">Verseau</option>
              <option value="poissons">Poissons</option>
            </select>
          </div>
          <div>
            <label htmlFor="sujet" className="block text-ancestral-cream/80 mb-1">Sujet *</label>
            <select 
              id="sujet" 
              name="sujet" 
              required
              className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold"
            >
              <option value="">-- Sélectionnez un sujet --</option>
              <option value="question-horoscope">Question sur un horoscope</option>
              <option value="support-technique">Support technique</option>
              <option value="partenariat">Demande de partenariat</option>
              <option value="rgpd">Exercice de vos droits RGPD</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-ancestral-cream/80 mb-1">Message *</label>
            <textarea 
              id="message" 
              name="message" 
              required 
              placeholder="Votre message..."
              rows={5}
              className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold resize-none"
            />
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="consentement" 
              name="consentement" 
              required
              className="mr-2 accent-ancestral-gold"
            />
            <label htmlFor="consentement" className="text-ancestral-cream/80 text-sm">
              J&apos;accepte que mes données soient traitées conformément à la
              <a href="/politique-de-confidentialite" className="text-ancestral-gold hover:underline">Politique de Confidentialité</a>.
            </label>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-ancestral-gold text-ancestral-dark font-semibold rounded-lg hover:bg-ancestral-gold/90 transition-colors duration-200"
          >
            Envoyer
          </button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">📍 Autres Moyens de Contact</h2>
        <ul className="space-y-3">
          <li>
            <strong className="text-ancestral-cream">Email</strong> : 
            <a href="mailto:contact@botiran.news" className="text-ancestral-gold hover:underline">contact@botiran.news</a>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">⏰ Délai de Réponse</h2>
        <p className="text-ancestral-cream/80 leading-relaxed">
          Nous nous engageons à répondre à votre demande sous <strong className="text-ancestral-cream">48 heures</strong> (hors week-ends et jours fériés).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-ancestral-cream mb-4">💡 FAQ</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-ancestral-cream mb-2">❓ Pourquoi mes horoscopes ne s&apos;affichent pas correctement ?</h3>
            <p className="text-ancestral-cream/80 leading-relaxed">
              Vérifiez que votre navigateur est à jour et que JavaScript est activé.
              Si le problème persiste, contactez-nous via le formulaire ci-dessus.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-ancestral-cream mb-2">❓ Puis-je utiliser vos horoscopes sur mon site ?</h3>
            <p className="text-ancestral-cream/80 leading-relaxed">
              Nos contenus sont protégés par le droit d&apos;auteur.
              Pour une utilisation commerciale, <a href="/contact?sujet=partenariat" className="text-ancestral-gold hover:underline">contactez-nous</a>.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-ancestral-cream mb-2">❓ Comment me désabonner de la newsletter ?</h3>
            <p className="text-ancestral-cream/80 leading-relaxed">
              Un lien de désabonnement est présent en bas de chaque email.
              Vous pouvez aussi nous en faire la demande via ce formulaire.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
