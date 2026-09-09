/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2f9f1',
          100: '#e1f3e0',
          200: '#c5e7c2',
          300: '#99d595',
          400: '#67bc62',
          500: '#43a03d',
          600: '#32822d',
          700: '#296726',
          800: '#245222',
          900: '#1e441d',
          950: '#0c250c',
        }
      }
    },
  },
  plugins: [],
};
