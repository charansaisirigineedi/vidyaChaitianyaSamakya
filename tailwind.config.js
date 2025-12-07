/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        'blue': {
          800: '#1E40AF',
          700: '#1E3A8A',
          600: '#2563EB',
        },
        'amber': {
          500: '#F59E0B',
          600: '#D97706',
        }
      }
    },
  },
  plugins: [],
}
