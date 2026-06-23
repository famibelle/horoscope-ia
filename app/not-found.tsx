import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404, Page introuvable · Zodyak Karukera',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: '#0d0d1a' }}
    >
      <div className="max-w-md mx-auto">
        <p className="text-6xl mb-6">🌿</p>
        <p className="font-ui text-[12px] uppercase tracking-[0.3em] mb-4" style={{ color: '#D4AF50' }}>
          Erreur 404
        </p>
        <h1 className="font-display text-3xl font-bold mb-4" style={{ color: 'rgba(200,216,192,0.9)' }}>
          Les ancêtres ne trouvent pas cette page
        </h1>
        <p className="font-ui text-[15px] leading-relaxed mb-10" style={{ color: 'rgba(200,216,192,0.5)' }}>
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="font-ui font-medium text-[14px] px-6 py-3 rounded-xl"
            style={{ background: '#D4AF50', color: '#0d0d1a' }}
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/newsletter"
            className="font-ui font-medium text-[14px] px-6 py-3 rounded-xl"
            style={{ border: '1px solid rgba(212,175,80,0.3)', color: '#D4AF50' }}
          >
            S&apos;abonner à la newsletter
          </Link>
        </div>
      </div>
    </main>
  );
}
