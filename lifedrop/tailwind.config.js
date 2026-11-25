/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#D92332', dark: '#B91C2C', soft: '#FDF1F2' },
        ink: '#20232A',
        muted: '#737B87',
        line: '#E5E7EB',
        surface: '#F7F8FA',
        ok: '#16A34A',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
