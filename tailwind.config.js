/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        stage: 'var(--color-stage)',
        panel: 'var(--color-panel)',
        panelHover: 'var(--color-panel-hover)',
        borderDark: 'var(--color-border)',
        cardBg: 'var(--color-card-bg)',
      },
    },
  },
  plugins: [],
}
