import type { Metadata } from 'next';
import { signs } from '@/lib/signs-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign: signId } = await params;
  const sign = signs.find((s) => s.id === signId);

  if (!sign) {
    return { title: 'Horoscope, Zodyak Karukera' };
  }

  const title = `Horoscope ${sign.name} du jour, Zodyak Karukera`;
  const description = `${sign.spirituel} Horoscope ${sign.name} (${sign.dateRange}) ancré dans la sagesse guadeloupéenne par Fanchette.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Zodyak Karukera',
      url: `https://zodyak-karukera.com/horoscope/${signId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://zodyak-karukera.com/horoscope/${signId}`,
    },
  };
}

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
