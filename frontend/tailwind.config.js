/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        gold: '#FFD700',
        dark: {
          background: '#0d0d0d',
          surface: '#1a1a1a',
          border: '#333333'
        }
      }
    },
    extend: {
      colors: {
        gold: {
          50: '#fff9e6',
          100: '#fef2cc',
          200: '#fde699',
          300: '#fcd966',
          400: '#fbcc33',
          500: '#fabd00',
          600: '#c89700',
          700: '#967100',
          800: '#644c00',
          900: '#322600',
          contrast: '#ffd700',
          highlight: '#fff2b2'
        },
        dark: {
          50: '#f2f2f2',
          100: '#e6e6e6',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1a1a1a'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      spacing: {
        'section': '2.5rem',
        'subsection': '1.5rem',
        'element': '1rem'
      }
    },
  },
  plugins: [],
};