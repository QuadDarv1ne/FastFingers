import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { copyFileSync } from 'fs'

// Плагин для копирования _routes.json в dist
function copyRoutesPlugin() {
  return {
    name: 'copy-routes-plugin',
    closeBundle() {
      try {
        copyFileSync('_routes.json', 'dist/_routes.json')
        console.log('✓ Copied _routes.json to dist/')
      } catch (e) {
        console.warn('⚠ Could not copy _routes.json:', e)
      }
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'FastFingers — Тренажёр слепой печати',
        short_name: 'FastFingers',
        description: 'Современный тренажёр слепой десятипальцевой печати',
        theme_color: '#7c3aed',
        background_color: '#0f0f0f',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    copyRoutesPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@services': path.resolve(__dirname, './src/services'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: false,
    allowedHosts: ['fastfingers-whjy.onrender.com', '.onrender.com']
  },
  build: {
    target: 'esnext',
    // Включаем sourcemap только для production отладки
    sourcemap: false,
    // Сжимаем код на максимум
    minify: 'esbuild',
    cssMinify: true,
    // Ускоряем сборку
    cssCodeSplit: true,
    // Удаляем console.log в production
    esbuild: {
      drop: ['console'],
    },
    rollupOptions: {
      output: {
        // Включаем tree-shaking
        treeshake: true,
        // Оптимизируем чанки
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-is'],
          'pdf-vendor': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'animations-vendor': ['framer-motion'],
          'confetti-vendor': ['canvas-confetti'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'auth-vendor': ['@supabase/supabase-js'],
          'virtual-vendor': ['@tanstack/react-virtual'],
          'storage-vendor': ['zustand'],
          'monitoring-vendor': ['@sentry/react'],
          // Выносим тяжелые компоненты в отдельные чанки
          'typing-core': ['./src/components/TypingTrainer', './src/hooks/useTypingGame', './src/hooks/useTypingSound'],
          'game-modes': ['./src/components/SprintMode', './src/components/HardcoreMode', './src/components/SpeedTest', './src/components/ReactionGame'],
          'ui-components': ['./src/components/Keyboard', './src/components/Header'],
          'charts': ['./src/components/LazyRecharts', './src/components/SpiderChart', './src/components/PredictionCurve'],
          'auth-components': ['./src/components/auth/AuthWrapper', './src/components/auth/UserProfile'],
          'panels': ['./src/components/NotificationPanel', './src/components/AchievementsPanel', './src/components/TrainingHistory'],
          'settings': ['./src/components/ThemeToggle', './src/components/KeyboardSkinSelector', './src/components/MusicControls', './src/components/ExportImport'],
          'exercises': ['./src/components/CustomExerciseEditor', './src/components/DailyChallengeCard', './src/components/LearningMode'],
          'stats-pages': ['./src/components/StatisticsPage', './src/components/WeeklyProgress'],
          'rewards': ['./src/components/SessionSummary', './src/components/StreakRewardsPanel', './src/components/TypingTips', './src/components/Onboarding'],
          'widgets': ['./src/components/ClockWidget', './src/components/MotivationalQuote', './src/components/OnlineStatus'],
        },
      },
    },
    chunkSizeWarningLimit: 400, // Уменьшаем лимит до 400KB
  },
})
