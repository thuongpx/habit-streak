/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0F0F1A',
          2: '#181828',
          3: '#1E1E32',
          card: '#242438',
        },
        brand: {
          red:    '#FF6B6B',
          orange: '#FFB347',
          teal:   '#4ECDC4',
          purple: '#A78BFA',
          yellow: '#F9CA24',
        },
        text: {
          DEFAULT: '#F0EFF8',
          muted:   '#9896B4',
          faint:   '#5E5C7A',
        },
      },
      fontFamily: {
        sans: ['Nunito_400Regular'],
        bold: ['Nunito_700Bold'],
        black: ['Nunito_900Black'],
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
};
