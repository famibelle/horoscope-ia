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

// Pour revenir au thème cosmique, décommentez les titres ci-dessous et commentez ceux ci-dessus
// export const metadata: Metadata = {
//   title: 'Horoscope Karukera — Votre énergie cosmique personnalisée',
//   description: "Découvrez votre horoscope du jour avec Maryse CondAI...",

export const metadata: Metadata = {
  title: 'Horoscope Karukera — La voix des ancêtres de la Guadeloupe',
  description:
    "Écoutez les conseils de Maryse CondAI, inspirés par la sagesse ancestrale et les esprits de Karukera. Horoscopes ancrés dans la culture guadeloupéenne.",
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
    title: 'Horoscope Karukera — La voix des ancêtres',
    description: "Écoutez les conseils de Maryse CondAI, inspirés par les esprits de Karukera et la sagesse guadeloupéenne.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Horoscope Karukera',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horoscope Karukera — La voix des ancêtres',
    description: "Écoutez les conseils de Maryse CondAI, inspirés par les esprits de Karukera.",
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
    <html lang="fr" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3159683365493434"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-3159683365493434" />
      </head>
      {/* Thème ancestral activé - Pour revenir au thème cosmique, décommentez la ligne ci-dessous */}
      {/* <body className={`${inter.variable} ${playfair.variable} antialiased bg-cosmic`}> */}
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
