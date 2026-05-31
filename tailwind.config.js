/**
 * FastFingers — Tailwind CSS конфигурация
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

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
          50: 'color-mix(in srgb, var(--color-primary) 10%, white)',
          100: 'color-mix(in srgb, var(--color-primary) 20%, white)',
          200: 'color-mix(in srgb, var(--color-primary) 35%, white)',
          300: 'color-mix(in srgb, var(--color-primary) 55%, white)',
          400: 'color-mix(in srgb, var(--color-primary) 75%, white)',
          500: 'color-mix(in srgb, var(--color-primary) 90%, white)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary-hover)',
          800: 'color-mix(in srgb, var(--color-primary) 85%, black)',
          900: 'color-mix(in srgb, var(--color-primary) 92%, black)',
        },
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        dark: {
          50: 'var(--color-text)',
          100: 'var(--color-text)',
          200: 'var(--color-text-muted)',
          300: 'var(--color-text-muted)',
          400: 'var(--color-text-muted)',
          500: 'var(--color-text-muted)',
          600: 'var(--color-surface)',
          700: 'var(--color-surface)',
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
      },
      // Mobile-first breakpoints
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Touch-friendly spacing
      spacing: {
        'touch': '44px', // Apple HIG minimum tap target
        'touch-lg': '56px',
      },
    },
  },
  plugins: [],
}
