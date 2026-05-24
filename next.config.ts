import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Configuration pour le déploiement sur Netlify
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Désactiver le cache pour les fichiers d'horoscopes
  // Ces fichiers doivent être frais à chaque requête
  async headers() {
    return [
      {
        // Ne pas cacher les fichiers JSON d'horoscopes
        source: '/data/horoscopes/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Ne pas cacher les fichiers JSON de signe-du-jour
        source: '/data/signe-du-jour/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Ne pas cacher les fichiers JSON d'ambiance
        source: '/data/ambiance/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Cache normal pour les autres assets
        source: '/:all*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  
  // Rediriger /health vers /api/horoscope/_health pour le monitoring
  // NOTE: _health évite le conflit avec la route dynamique [sign]
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/horoscope/_health',
        permanent: false,
        statusCode: 307,
      },
      {
        source: '/health/:path*',
        destination: '/api/horoscope/_health/:path*',
        permanent: false,
        statusCode: 307,
      },
    ];
  },
  
  // Configuration de l'asset prefix pour la production
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://horoscope-karukera.netlify.app' 
    : undefined,
  
  // Configuration pour les images (si utilisé)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'horoscope-karukera.netlify.app',
      },
    ],
  },
  
  // Configuration pour le build standalone (Netlify)
  // Permet de déployer sans serveur Node.js
  standaloneConfig: {
    // Copier les fichiers data/ dans le build
    fs: {
      // Ne pas inclure les fichiers data/ dans le build standalone
      // Ils seront servis comme assets statiques
      exclude: ['data/**'],
    },
  },
};

export default nextConfig;
