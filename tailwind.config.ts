import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#f8fafc',
        },
        accent: '#f97316',
      },
    },
  },
  plugins: [],
} satisfies Config;


