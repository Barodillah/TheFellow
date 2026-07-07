/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A2744',
          light: '#2D4070',
          muted: '#4A6099'
        },
        accent: {
          DEFAULT: '#C9A84C',
          light: '#E8C875',
          dark: '#9E7A2C'
        },
        surface: {
          deep: '#0E1726',
          card: '#F8F5EF',
          warm: '#EDE8DF'
        },
        danger: '#922B21'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        accent: ['"Cormorant Infant"', 'serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
