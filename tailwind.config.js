/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          50: '#FBFAF8',
          100: '#F5F3EF',
          200: '#EDEAE3',
          300: '#DDD8CD',
        },
        ink: {
          900: '#2E2B27',
          700: '#4A4640',
          500: '#726C63',
          400: '#9A948A',
        },
        sage: {
          100: '#E7EEE3',
          200: '#D3E1CB',
          300: '#B7D0A8',
          400: '#9CBD8A',
          500: '#82A96E',
        },
        coral: {
          100: '#FBE7E2',
          200: '#F6CFC5',
          300: '#F0AC9C',
          400: '#E68C77',
          500: '#DB6F55',
        },
        powder: {
          100: '#E4EEF2',
          200: '#C9DCE4',
          300: '#A8C5D6',
          400: '#87ACC2',
          500: '#6892AB',
        },
        lilac: {
          100: '#EFE7F2',
          200: '#DDCCE5',
          300: '#C9B8D9',
          400: '#B29ECB',
          500: '#9A83B8',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"SF Pro Rounded"', 'ui-rounded', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(46, 43, 39, 0.06)',
        card: '0 4px 20px rgba(46, 43, 39, 0.08)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        ringFill: {
          '0%': { strokeDashoffset: 'var(--ring-start, 0)' },
          '100%': { strokeDashoffset: 'var(--ring-end, 0)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: 0, transform: 'scale(0.85)' },
          '60%': { opacity: 1, transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        pop: 'pop 0.35s ease-out',
        fadeUp: 'fadeUp 0.3s ease-out',
        bounceIn: 'bounceIn 0.4s cubic-bezier(.34,1.56,.64,1)',
      },
    },
  },
  plugins: [],
}
