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
  title: 'Horoscope Karukera — Votre énergie cosmique personnalisée',
  description:
    "Découvrez votre horoscope du jour avec Maryse CondAI. Prédictions personnalisées pour l'amour, le travail et la spiritualité, ancrées dans la sagesse ancestrale de Karukera.",
  keywords: [
    'horoscope',
    'astrologie',
    'horoscope du jour',
    'Maryse CondAI',
    'sagesse ancestrale',
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
  authors: [{ name: 'Horoscope Karukera' }],
  openGraph: {
    title: 'Horoscope Karukera — Votre énergie cosmique personnalisée',
    description: "Découvrez votre horoscope du jour avec Maryse CondAI, ancrée dans la sagesse ancestrale de Karukera.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Horoscope Karukera',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horoscope Karukera',
    description: "Découvrez votre horoscope du jour avec Maryse CondAI, ancrée dans la sagesse ancestrale de Karukera.",
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3159683365493434"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased bg-cosmic`}>
        {children}
      </body>
    </html>
  );
}
