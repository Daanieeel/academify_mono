/** @type {import('tailwindcss').Config} */
const typography = require('./themes/typography');

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    colors: {
      'neutral-900': 'var(--color-neutral-900)',
      'neutral-800': 'var(--color-neutral-800)',
      'neutral-700': 'var(--color-neutral-700)',
      'neutral-600': 'var(--color-neutral-600)',
      'neutral-500': 'var(--color-neutral-500)',
      'neutral-400': 'var(--color-neutral-400)',
      'neutral-300': 'var(--color-neutral-300)',
      'neutral-200': 'var(--color-neutral-200)',
      'neutral-100': 'var(--color-neutral-100)',
      'neutral-50': 'var(--color-neutral-50)',

      'primary-900': 'var(--color-primary-900)',
      'primary-800': 'var(--color-primary-800)',
      'primary-700': 'var(--color-primary-700)',
      'primary-600': 'var(--color-primary-600)',
      'primary-500': 'var(--color-primary-500)',
      'primary-400': 'var(--color-primary-400)',
      'primary-300': 'var(--color-primary-300)',
      'primary-200': 'var(--color-primary-200)',
      'primary-100': 'var(--color-primary-100)',
      'primary-50': 'var(--color-primary-50)',

      'green-900': 'var(--color-green-900)',
      'green-800': 'var(--color-green-800)',
      'green-700': 'var(--color-green-700)',
      'green-600': 'var(--color-green-600)',
      'green-500': 'var(--color-green-500)',
      'green-400': 'var(--color-green-400)',
      'green-300': 'var(--color-green-300)',
      'green-200': 'var(--color-green-200)',
      'green-100': 'var(--color-green-100)',
      'green-50': 'var(--color-green-50)',

      'red-900': 'var(--color-red-900)',
      'red-800': 'var(--color-red-800)',
      'red-700': 'var(--color-red-700)',
      'red-600': 'var(--color-red-600)',
      'red-500': 'var(--color-red-500)',
      'red-400': 'var(--color-red-400)',
      'red-300': 'var(--color-red-300)',
      'red-200': 'var(--color-red-200)',
      'red-100': 'var(--color-red-100)',
      'red-50': 'var(--color-red-50)',

      'blue-50': 'var(--color-blue-50)',
      'blue-100': 'var(--color-blue-100)',
      'blue-200': 'var(--color-blue-200)',
      'blue-300': 'var(--color-blue-300)',
      'blue-400': 'var(--color-blue-400)',
      'blue-500': 'var(--color-blue-500)',
      'blue-600': 'var(--color-blue-600)',
      'blue-700': 'var(--color-blue-700)',
      'blue-800': 'var(--color-blue-800)',
      'blue-900': 'var(--color-blue-900)',

      'yellow-900': 'var(--color-yellow-900)',
      'yellow-800': 'var(--color-yellow-800)',
      'yellow-700': 'var(--color-yellow-700)',
      'yellow-600': 'var(--color-yellow-600)',
      'yellow-500': 'var(--color-yellow-500)',
      'yellow-400': 'var(--color-yellow-400)',
      'yellow-300': 'var(--color-yellow-300)',
      'yellow-200': 'var(--color-yellow-200)',
      'yellow-100': 'var(--color-yellow-100)',
      'yellow-50': 'var(--color-yellow-50)',
    },
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: '#FFFFFF',
        card: 'var(--color-card)',
        'untis-orange': 'var(--color-untis-orange)',
      },
      fontFamily: {
        normalBlack: 'MartianGrotesk-NrBl',
        standardBlack: 'MartianGrotesk-StdBl',
        standardRegular: 'MartianGrotesk-StdRg',
        standardMedium: 'MartianGrotesk-StdMd',
        standardExtrabold: 'MartianGrotesk-StdxBd',
        superWideBlack: 'MartianGrotesk-sWdBl',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities(typography);
    },
  ],
};
