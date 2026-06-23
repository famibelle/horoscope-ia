import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Désabonnement, Zodyak Karukera',
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; email?: string }>;
}) {
  const params = await searchParams;
  const success = params.success === '1';
  const error = params.error;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: '#0d0d1a' }}
    >
      <div className="max-w-md mx-auto">
        {success ? (
          <>
            <p className="text-4xl mb-6">🌿</p>
            <h1 className="font-display text-2xl font-bold mb-4" style={{ color: '#D4AF50' }}>
              Désabonnement confirmé
            </h1>
            <p className="font-ui text-[15px] leading-relaxed mb-8" style={{ color: 'rgba(200,216,192,0.7)' }}>
              Vous ne recevrez plus notre newsletter. Nous respectons votre choix.
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl mb-6">⚠️</p>
            <h1 className="font-display text-2xl font-bold mb-4" style={{ color: '#D4AF50' }}>
              Une erreur est survenue
            </h1>
            <p className="font-ui text-[15px] leading-relaxed mb-8" style={{ color: 'rgba(200,216,192,0.7)' }}>
              Impossible de traiter votre demande de désabonnement.
              Contactez-nous via le formulaire de contact.
            </p>
          </>
        )}
        <Link
          href="/"
          className="font-ui text-[13px]"
          style={{ color: 'rgba(200,216,192,0.4)', textDecoration: 'underline' }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
