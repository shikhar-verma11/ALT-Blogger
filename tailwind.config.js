/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand': {
          'purple': '#9B5DE5',
          'yellow': '#FEE440',
        },
        'light': {
          'bg': '#FAF9F6',
          'card': '#FFFFFF',
          'text': '#121212',
          'subtle': '#666666',
        },
        'dark': {
          'bg': '#121212',
          'card': '#1E1E1E',
          'text': '#E0E0E0',
          'subtle': '#999999',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}