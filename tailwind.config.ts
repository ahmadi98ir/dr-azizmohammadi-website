import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#b8dcff',
          300: '#86c6ff',
          400: '#4aa9ff',
          500: '#1f8bff',
          600: '#0b6fff',
          700: '#0d59db',
          800: '#1349ad',
          900: '#143f89'
        }
      }
    }
  },
  plugins: []
} satisfies Config

