import { Bold } from 'lucide-react';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif']
    },
    extend: {
      fontWeight: {
        black: '900',
        extraBold: '800',
        bold: '700',
        semiBold: '600',
        medium: '500',
        normal: '400',
      },
      fontSize: {
        // Добавьте кастомные размеры, если нужно
      },
    },
  },
  plugins: [],
};