/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: 'var(--color-primary)',
          700: 'var(--color-primary-hover)',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        dark: {
          50: 'var(--color-text)',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: 'var(--color-text-muted)',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: 'var(--color-surface)',
          900: 'var(--color-bg)',
        }
      },
      backgroundColor: {
        'app': 'var(--color-bg)',
        'surface': 'var(--color-surface)',
      },
      textColor: {
        'app': 'var(--color-text)',
        'muted': 'var(--color-text-muted)',
      },
      borderColor: {
        'app': 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slight': 'bounce-slight 0.3s ease-in-out',
      },
      keyframes: {
        'bounce-slight': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
