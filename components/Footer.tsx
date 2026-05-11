import Link from 'next/link';

const links = {
  Signes: [
    { label: 'Bélier · Taureau', href: '#' },
    { label: 'Gémeaux · Cancer', href: '#' },
    { label: 'Lion · Vierge', href: '#' },
    { label: 'Balance · Scorpion', href: '#' },
    { label: 'Sagittaire → Poissons', href: '#' },
  ],
  Légal: [
    { label: 'Mentions légales', href: '#' },
    { label: 'Politique de confidentialité', href: '#' },
    { label: 'CGU', href: '#' },
    { label: 'Contact', href: '#' },
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
          <div className="font-display text-2xl font-bold text-ancestral-cream mb-2">
            🌿 Votre voyage ancestral dans la sagesse de Karukera
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 mb-14">
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-ancestral-cream/50 text-xs uppercase tracking-[0.25em] font-semibold mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-ancestral-cream/30 text-sm hover:text-ancestral-gold transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
            🌿 Paroles inspirées par Maryse CondAI · pour honorer nos traditions
          </p>
        </div>
      </div>
    </footer>
  );
}
