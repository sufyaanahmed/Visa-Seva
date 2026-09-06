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
          DEFAULT: '#1E2A4F', // Deep indigo
          dark: '#131A31',
          light: '#2B4C7E', // Kalamkari blue
        },
        secondary: {
          DEFAULT: '#C84B31', // Terracotta
          dark: '#A63B24',
          accent: '#E37B40', // Saffron
        },
        accent: {
          gold: '#D4AF37', // Antique gold
          peacock: '#126E82', // Peacock blue
          green: '#2C5D3F', // Deep green
          vermilion: '#D96C4A', // Muted vermilion
        },
        background: '#FAF7F0',
        surface: {
          DEFAULT: '#FAF7F0',
          dark: '#EBE5D9'
        },
        text: {
          DEFAULT: '#222222',
          secondary: '#555555',
          muted: '#888888'
        },
        border: {
          DEFAULT: '#E6DFD3',
          dark: '#D4C9B8'
        },
        success: '#2C5D3F',
        error: '#C84B31'
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif']
      },
    },
  },
  plugins: [],
}
