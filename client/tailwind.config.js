/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#FAFAF8',
          100: '#F0F0EC',
          200: '#E5E5E0',
          300: '#D0D0CA',
          400: '#999990',
          500: '#777770',
          600: '#555550',
          700: '#333330',
          800: '#252520',
          900: '#1A1A18',
        },
        vert: {
          50:  '#E8EDEA',
          100: '#CCD9D1',
          200: '#A6BFAD',
          300: '#80A58A',
          400: '#598B66',
          500: '#337143',
          600: '#0D5727',
          700: '#004526',
          800: '#00331C',
          900: '#002212',
        },
        macaron: {
          pink:   '#F5E4E0',
          blue:   '#E0ECF5',
          yellow: '#F5F2E0',
          mint:   '#E0F2EB',
          orange: '#F5EBE0',
        },
      },
      fontFamily: {
        serif:  ['Noto Serif SC', 'Source Han Serif SC', 'Georgia', 'serif'],
        sans:   ['Noto Sans SC', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        script: ['Liu Jian Mao Cao', 'cursive'],
      },
      fontWeight: {
        light: '300',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      letterSpacing: {
        'widest-plus': '0.15em',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
