import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: { extend: {
    colors: {
      primary: { DEFAULT: '#0E7C66', dark: '#0A5C4C', light: '#E6F4F1' },
      accent: '#2E86AB',
    },
    borderRadius: { xl2: '1.25rem' },
    boxShadow: { soft: '0 8px 30px rgba(14,124,102,0.08)' },
  }},
  plugins: [],
} satisfies Config;
