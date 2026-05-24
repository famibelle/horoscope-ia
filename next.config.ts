import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Désactiver la vérification TypeScript en production
  // (Netlify n'installe pas les devDependencies, donc @types/* ne sont pas disponibles)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Désactiver le mode standalone pour éviter les problèmes avec Netlify
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  output: undefined,
  
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
  
  // Rediriger /health vers /api/horoscope/health pour le monitoring
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/horoscope/health',
        permanent: false,
        statusCode: 307,
      },
      {
        source: '/health/:path*',
        destination: '/api/horoscope/health/:path*',
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
  
  // Configuration explicite des alias pour @/*
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
    };
    return config;
  },
};

export default nextConfig;
