/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1A1A1D',
        'brand-secondary': '#2C2C34',
        'brand-accent': '#FFD700', // Gold
        'brand-text': '#F5F5F5',
        'brand-subtle': '#A9A9A9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}