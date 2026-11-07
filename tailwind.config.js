/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#0B2A8C', deep: '#071A5E', mid: '#0D2FA3', brand: '#172B4D' },
        cobalt: { DEFAULT: '#1848CC', lt: '#1E56E0' },
        gold:   { DEFAULT: '#C8900A', lt: '#D4A017', pale: '#E8C36B', faint: '#F5DFA0', muted: '#D5B16A' },
        ink:    '#0A0F2E',
        cream:  '#F0EFEA',
        ivory:  '#F8F6F0',
        canvas: '#FFFFFF',
        dark:   '#283444',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '10xl': ['10rem',  { lineHeight: '0.9' }],
        '11xl': ['12rem',  { lineHeight: '0.9' }],
        '12xl': ['14rem',  { lineHeight: '0.88' }],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C8900A 0%, #E8C36B 50%, #C8900A 100%)',
      },
      boxShadow: {
        'gold':    '0 0 24px rgba(200,144,10,0.35)',
        'gold-lg': '0 0 48px rgba(200,144,10,0.45)',
        'glow':    '0 8px 40px rgba(13,47,163,0.5)',
      },
      // Extend opacity scale to cover all custom fractions used in the codebase
      opacity: {
        '2':  '0.02',
        '3':  '0.03',
        '6':  '0.06',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '35': '0.35',
        '45': '0.45',
        '55': '0.55',
        '58': '0.58',
        '65': '0.65',
        '72': '0.72',
        '75': '0.75',
        '85': '0.85',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.7s ease-out forwards',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
