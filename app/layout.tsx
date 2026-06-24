import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Outfit, IM_Fell_English } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import TabBar from '@/components/TabBar';
import MiniPlayer from '@/components/MiniPlayer';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
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
//   title: 'Horoscope Karukera, Votre énergie cosmique personnalisée',
//   description: "Découvrez votre horoscope du jour avec Maryse CondAI...",

export const metadata: Metadata = {
  metadataBase: new URL('https://zodyak-karukera.com'),
  title: 'La Voix de nos Ancêtres',
  other: {
    'google-adsense-account': 'ca-pub-3159683365493434',
  },
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
  verification: {
    google: 'P9_u-OUCY7E3WbVyDWNC676IxpUvOm0MQmjIIlwPA44',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Horoscope Karukera, Zodyak Karukera',
  url: 'https://zodyak-karukera.com',
  description:
    "Horoscopes quotidiens ancrés dans la sagesse ancestrale et la culture guadeloupéenne. Faune, flore et présages naturels de Karukera interprétés pour chaque signe astrologique.",
  publisher: {
    '@type': 'Organization',
    name: 'Zodyak Karukera',
    url: 'https://zodyak-karukera.com',
  },
  inLanguage: 'fr-FR',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${cormorant.variable} ${outfit.variable} ${imFell.variable} antialiased`} style={{ paddingBottom: '80px' }}>
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          strategy="afterInteractive"
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3159683365493434"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{page_path:window.location.pathname});`,
              }}
            />
          </>
        )}
        <AudioPlayerProvider>
          {children}
          <Footer />
          <MiniPlayer />
        </AudioPlayerProvider>
        <TabBar />
        <CookieBanner />
      </body>
    </html>
  );
}
