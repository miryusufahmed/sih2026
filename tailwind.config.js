/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep institutional blue — primary
        governance: {
          50: '#eef4f9',
          100: '#d7e6f0',
          200: '#aecde1',
          300: '#7eafcd',
          400: '#4c8cb3',
          500: '#2c6d97',
          600: '#1c5177',
          700: '#123d5e',
          800: '#0c2d47',
          900: '#081f33',
          950: '#051422',
        },
        // Saffron accent — used sparingly for calls to action / national identity
        saffron: {
          50: '#fff8ec',
          100: '#ffedc9',
          200: '#ffd98d',
          300: '#ffbf50',
          400: '#ffa524',
          500: '#f98807',
          600: '#dd6702',
          700: '#b74a06',
          800: '#94390c',
          900: '#7a300d',
        },
        slate: {
          25: '#fbfcfd',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(8, 31, 51, 0.06), 0 1px 3px rgba(8, 31, 51, 0.08)',
        panel: '0 4px 24px rgba(8, 31, 51, 0.10)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(2400%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scan-line': 'scan-line 1.1s linear infinite',
      },
    },
  },
  plugins: [],
};
