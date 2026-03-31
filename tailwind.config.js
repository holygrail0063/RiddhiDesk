/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fdfcfa',
          100: '#f7f4ef',
          200: '#ebe4d8',
          300: '#d9cfc0'
        },
        ink: {
          500: '#5c5348',
          700: '#3d3830',
          900: '#25221d'
        },
        sage: {
          400: '#8fa99a',
          500: '#6b8578',
          600: '#4f6b5e'
        },
        blush: {
          400: '#d4a5a5',
          500: '#c48989'
        }
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif']
      },
      boxShadow: {
        soft: '0 2px 12px rgba(61, 56, 48, 0.08)',
        card: '0 4px 20px rgba(61, 56, 48, 0.06)'
      }
    }
  },
  plugins: []
}
