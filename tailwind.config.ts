import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: '#020617',
        // Thème ancestral (Karukera/Guadeloupe)
        ancestral: {
          earth: '#8B4513',      // Terre de Guadeloupe
          forest: '#228B22',      // Vert mangrove
          gold: '#FFD700',        // Or sacré
          terracotta: '#CD5C5C',  // Rouge terre
          cream: '#F5F5DC',      // Beige clair
          deepBrown: '#5C4033',   // Brun profond
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'slide-in': 'slideIn 0.6s ease-out',
        'ancestral-pulse': 'ancestralPulse 3s ease-in-out infinite', // Nouveau: souffle des ancêtres
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.15', transform: 'scale(0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        ancestralPulse: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
      backgroundImage: {
        'cosmic-radial':
          'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #020617 60%)',
        // Nouveau: fond ancestral
        'ancestral-radial':
          'radial-gradient(ellipse at 50% 0%, #5C4033 0%, #8B4513 60%)',
        'madras-pattern':
          'linear-gradient(135deg, #FFD700 25%, #CD5C5C 25%, #CD5C5C 50%, #FFD700 50%, #FFD700 75%, #CD5C5C 75%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
