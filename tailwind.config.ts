import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'academic-crimson': {
          DEFAULT: '#7A1C29',
          light: '#9B1B30',
          dark: '#5E101D',
          soft: '#FDF2F4',
        },
        'academic-gold': {
          DEFAULT: '#C59B27',
          dark: '#B8860B',
          deep: '#997315',
          light: '#F7F2E6',
        },
        'academic-green': {
          DEFAULT: '#059669',
          light: '#ECFDF5',
          dark: '#065F46',
        },
        'academic-surface': {
          DEFAULT: '#F9FAFB',
          alt: '#F9F9FF',
          ivory: '#FAF9F6',
          card: '#FFFFFF',
          border: '#E5E7EB',
          subtle: '#E2E8F0',
        },
        ufm: {
          red: '#9B1B30',
          burgundy: '#7A1C29',
          redDark: '#5E101D',
          gold: '#C59B27',
          goldLight: '#F7F2E6',
          goldDark: '#B8860B',
          crimsonSoft: '#FDF2F4',
          navy: '#1A2332',
          cream: '#FAF9F6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Playfair Display"', 'Merriweather', 'Georgia', 'serif'],
        editorial: ['Merriweather', '"Playfair Display"', 'Georgia', 'serif'],
        crest: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
