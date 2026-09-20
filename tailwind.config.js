/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#16866f', soft: '#dcf5eb', dark: '#0d6957' },
        success: { DEFAULT: '#238766', soft: '#e0f4eb' },
        warning: { DEFAULT: '#b76b11', soft: '#fff0d5' },
        danger: { DEFAULT: '#c94b4b', soft: '#fde8e7' },
        commitment: '#7058b5',
        activity: '#16866f',
        surface: { DEFAULT: '#ffffff', muted: '#f4f6f3' },
        border: '#e4e9e3',
        ink: { DEFAULT: '#17211e', secondary: '#65706c' },
      },
      borderRadius: { card: '1.5rem', control: '0.9rem' },
      boxShadow: { card: '0 12px 32px rgba(31, 55, 47, 0.07)' },
      spacing: { page: '1.25rem', section: '1.5rem' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
