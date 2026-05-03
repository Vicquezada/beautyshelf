/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFAF7',
          100: '#F5EDE3',
          200: '#EDE0D4',
          300: '#D9C4AE',
          400: '#C9A98A',
          500: '#A8845E',
          600: '#7A5F42',
          700: '#4A3A28',
          800: '#2A2018',
          900: '#1A1210',
        },
        warm: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: { app: '480px' },
    },
  },
  plugins: [],
}
