/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E6F4FE',
          100: '#C0E2FC',
          200: '#80BEFF',
          300: '#4DA3FF',
          400: '#0070E0',
          500: '#208AEF',
          600: '#0060C0',
          700: '#0050A0',
          800: '#004080',
          900: '#003060',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
