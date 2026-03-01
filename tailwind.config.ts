import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nordic: {
          bg: '#f7f8f7',
          panel: '#ffffff',
          border: '#dde2df',
          text: '#2e3a47',
          muted: '#6f7b8a',
          accent: '#5a8d7b'
        }
      },
      boxShadow: {
        panel: '0 1px 2px rgba(17, 24, 39, 0.06)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
} satisfies Config;
