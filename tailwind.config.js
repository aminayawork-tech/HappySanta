/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: scan all TS/TSX files
  content: [
    './App.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Christmas Brand Palette
        christmas: {
          red:    '#C41E3A',   // Deep Santa red
          green:  '#165B33',   // Deep forest green
          gold:   '#FFD700',   // Christmas gold
          silver: '#C0C0C0',   // Silver bells
          snow:   '#FFFAFA',   // Snow white
          dark:   '#1a0a2e',   // Midnight blue-black (festive dark bg)
          pine:   '#2d5a27',   // Pine tree green
          candy:  '#FF6B6B',   // Candy cane pink-red
          cream:  '#FFF8E7',   // Warm cream
          ember:  '#FF4500',   // Fire ember orange
        },
        primary:   '#C41E3A',
        secondary: '#165B33',
        accent:    '#FFD700',
        background: {
          DEFAULT: '#1a0a2e',
          card:    '#2a1a3e',
          input:   '#3a2a4e',
        },
      },
      fontFamily: {
        christmas: ['LobsterTwo_400Regular'],
        'christmas-bold': ['LobsterTwo_700Bold'],
        body: ['Nunito_400Regular'],
        'body-bold': ['Nunito_700Bold'],
        'body-semibold': ['Nunito_600SemiBold'],
      },
      borderRadius: {
        christmas: '20px',
        card: '16px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
