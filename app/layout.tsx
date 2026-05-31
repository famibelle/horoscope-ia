import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Outfit, IM_Fell_English } from 'next/font/google';
import './globals.css';
import TabBar from '@/components/TabBar';
import MiniPlayer from '@/components/MiniPlayer';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-ui',
  display: 'swap',
});

const imFell = IM_Fell_English({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-accent',
  display: 'swap',
});

// Pour revenir au thème cosmique, décommentez les titres ci-dessous et commentez ceux ci-dessus
// export const metadata: Metadata = {
//   title: 'Horoscope Karukera — Votre énergie cosmique personnalisée',
//   description: "Découvrez votre horoscope du jour avec Maryse CondAI...",

export const metadata: Metadata = {
  title: 'La Voix de nos Ancêtres',
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
  authors: [{ name: 'La Voix de nos Ancêtres' }],
  openGraph: {
    title: 'La Voix de nos Ancêtres',
    description: "Écoutez les conseils de Maryse CondAI, inspirés par les esprits de Karukera et la sagesse guadeloupéenne.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'La Voix de nos Ancêtres',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Voix de nos Ancêtres',
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
      <body className={`${cormorant.variable} ${outfit.variable} ${imFell.variable} antialiased`} style={{ paddingBottom: '80px' }}>
        <AudioPlayerProvider>
          {children}
          <MiniPlayer />
        </AudioPlayerProvider>
        <TabBar />
      </body>
    </html>
  );
}
