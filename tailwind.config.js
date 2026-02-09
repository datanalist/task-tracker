/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        border: '#2a2a2a',
        accent: '#4ade80', // Зеленый как на скрине
      }
    },
  },
  plugins: [],
}
