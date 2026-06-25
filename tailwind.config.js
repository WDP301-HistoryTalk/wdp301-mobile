/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        history: {
          bg: '#EFE9E1',
          surface: '#F7F1EA',
          text: '#322D29',
          muted: '#5F554E',
          border: 'rgba(50,45,41,0.14)',
          accent: '#72383D',
          accentSoft: '#8D4A50',
          darkBg: '#0e1a2b',
          darkSurface: '#1a2436',
          darkText: '#f7f1e8',
          darkMuted: '#dfdab5',
          darkAccent: '#EA7A0A',
          darkAccentSoft: '#e2c77a',
        },
        primary: {
          50:  '#F7F1EA',
          100: '#EFE9E1',
          200: '#D7B7A0',
          300: '#B97A67',
          400: '#9D5F5F',
          500: '#72383D',
          600: '#5F2E32',
          700: '#4B2529',
          800: '#3B2023',
          900: '#322D29',
        },
      },
      fontFamily: {
        sans: ['VL Outfit', 'Outfit', 'System'],
        display: ['VL ZOLINA', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
