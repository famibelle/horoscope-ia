import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Horoscope IA — Votre énergie cosmique personnalisée',
  description:
    "Découvrez votre horoscope IA du jour. Prédictions personnalisées pour l'amour, le travail et la spiritualité. Votre guide astrologique quotidien alimenté par l'intelligence artificielle.",
  keywords: [
    'horoscope',
    'astrologie',
    'horoscope du jour',
    'intelligence artificielle',
    'signes astrologiques',
    'bélier',
    'taureau',
    'gémeaux',
    'cancer',
    'lion',
    'vierge',
    'balance',
    'scorpion',
    'sagittaire',
    'capricorne',
    'verseau',
    'poissons',
  ],
  authors: [{ name: 'Horoscope IA' }],
  openGraph: {
    title: 'Horoscope IA — Votre énergie cosmique personnalisée',
    description: "Découvrez votre horoscope IA du jour. Guidé par l'intelligence artificielle.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Horoscope IA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horoscope IA',
    description: "Découvrez votre horoscope IA du jour. Guidé par l'intelligence artificielle.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} antialiased bg-cosmic`}>
        {children}
      </body>
    </html>
  );
}
