/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-900': '#452829',
        'brand-700': '#57595B',
        'brand-200': '#E8D1C5',
        'brand-100': '#F3E8DF',
        'accent-600': '#2563EB',
        'accent-700': '#1D4ED8',
        'accent-100': '#DBEAFE',
      },
    },
  },
  plugins: [],
}