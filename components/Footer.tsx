import Link from 'next/link';

const links = {
  Légal: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
    { label: 'CGU', href: '/cgu' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-10 px-4 pb-10">
      {/* Top gradient separator */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(210,105,30,0.3), rgba(255,215,0,0.2), transparent)',
        }}
      />

      <div className="max-w-5xl mx-auto pt-14">
        {/* Brand */}
        <div className="text-center mb-14">
          <div className="font-accent italic text-xl text-ancestral-cream/70 mb-2">
            🌿 Votre voyage ancestral dans la sagesse de Karukera
          </div>
          
          {/* Liens Vaudou - désactivés temporairement */}
        </div>

        {/* Legal links - centered and inline */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-14">
          {links.Légal.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-ancestral-cream/40 text-sm hover:text-ancestral-gold transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center"
          style={{ borderTop: '1px solid rgba(245,245,220,0.06)' }}
        >
          <p className="text-ancestral-cream/20 text-xs">
            © 2026 Horoscope Karukera. Tous droits réservés.
          </p>
          <p className="text-ancestral-cream/15 text-xs">
            🌿 Paroles portées par Fanchette, en hommage à nos ancêtres et à Maryse Condé
          </p>
        </div>
      </div>
    </footer>
  );
}
