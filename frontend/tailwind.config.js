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
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      heading: ['Montserrat-Bold', 'sans-serif'],
      black: ['Montserrat-Black', 'sans-serif'],

    },
    extend: {
      fontSize: {
        // при необходимости добавьте кастомные размеры
      },
    },
  },
  plugins: [],
}