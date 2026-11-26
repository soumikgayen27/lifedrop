/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy LifeDrop tokens are kept so every existing page keeps compiling,
        // but they now resolve to the new red + navy palette.
        brand: { DEFAULT: '#dc2626', dark: '#b91c1c', soft: '#fef2f2' },
        ink: '#172636',
        muted: '#4a6684',
        line: '#dbe5f1',
        surface: '#f5f8fc',
        ok: '#15803d',
        // New design-system scales
        primary: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
          500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
        },
        navy: {
          50: '#f0f4fa', 100: '#dbe5f1', 200: '#bfccdf', 300: '#93aac4', 400: '#6081a4',
          500: '#3e628a', 600: '#2e4d70', 700: '#263f5b', 800: '#1e3149', 900: '#172636', 950: '#0f1925',
        },
        success: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(15, 25, 37, 0.08), 0 4px 24px -4px rgba(15, 25, 37, 0.06)',
        card: '0 4px 24px -6px rgba(15, 25, 37, 0.10), 0 2px 8px -2px rgba(15, 25, 37, 0.06)',
        glow: '0 0 0 1px rgba(220, 38, 38, 0.12), 0 12px 40px -8px rgba(220, 38, 38, 0.35)',
        'glow-sm': '0 0 0 1px rgba(220, 38, 38, 0.10), 0 6px 20px -6px rgba(220, 38, 38, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
