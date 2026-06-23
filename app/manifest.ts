import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zodyak Karukera, Horoscope ancestral',
    short_name: 'Zodyak',
    description: 'Horoscopes quotidiens ancrés dans la sagesse guadeloupéenne par Maryse CondAI',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d1a',
    theme_color: '#D4AF50',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
