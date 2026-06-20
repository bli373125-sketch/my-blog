/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#FDFAF5',
          100: '#F5F0E8',
          200: '#E8E1D5',
          300: '#D4CCC0',
          400: '#A0998F',
          500: '#7A7065',
          600: '#5C554A',
          700: '#3D3730',
          800: '#2C241A',
          900: '#1A140E',
        },
        rust: {
          50:  '#FDF2EC',
          100: '#FBE0CF',
          200: '#F2C4A4',
          300: '#E8A87A',
          400: '#D4875E',
          500: '#C56A42',
          600: '#B0552E',
          700: '#8C3F20',
          800: '#6A2E16',
          900: '#4A1E0E',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'Source Han Serif SC', 'Georgia', 'serif'],
        sans:  ['Noto Sans SC', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
