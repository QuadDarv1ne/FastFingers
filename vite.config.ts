/**
 * FastFingers — Vite конфигурация
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { copyFileSync, writeFileSync, readFileSync } from 'fs'
import { brotliCompressSync } from 'zlib'

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
    react({
      // Оптимизация React компонентов
      babel: {
        plugins: [],
      },
    }),
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
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: false
      },
      useCredentials: false,
      injectRegister: 'auto',
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    copyRoutesPlugin(),
    // Brotli compression plugin
    {
      name: 'brotli-compression',
      writeBundle(options, bundle) {
        const dir = options.dir || 'dist'
        for (const [fileName, asset] of Object.entries(bundle)) {
          if (fileName.endsWith('.js') || fileName.endsWith('.css')) {
            let content: Buffer
            if (asset.type === 'asset' && 'source' in asset) {
              content = Buffer.from(asset.source)
            } else {
              // For chunks, read from disk
              const filePath = `${dir}/${fileName}`
              content = readFileSync(filePath)
            }
            if (content.length > 0) {
              const compressed = brotliCompressSync(content)
              writeFileSync(`${dir}/${fileName}.br`, compressed)
            }
          }
        }
      },
    },
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
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    esbuild: {
      drop: ['console'],
      legalComments: 'none',
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
    },
    rollupOptions: {
      treeshake: {
        preset: 'safest',
        propertyReadSideEffects: false,
      },
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-is'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'animations-vendor': ['framer-motion'],
          'confetti-vendor': ['canvas-confetti'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'auth-vendor': ['@supabase/supabase-js'],
          'virtual-vendor': ['@tanstack/react-virtual'],
          'storage-vendor': ['zustand'],
          'monitoring-vendor': ['@sentry/react'],
          // jspdf не включаем в vendor - используется только динамически через import()
          // Компоненты по функциональности
          'typing-core': ['./src/components/TypingTrainer'],
          'game-modes': ['./src/components/SprintMode', './src/components/HardcoreMode', './src/components/SpeedTest', './src/components/ReactionGame'],
          'ui-components': ['./src/components/Keyboard', './src/components/Header'],
          'charts': ['./src/components/LazyRecharts', './src/components/SpiderChart', './src/components/PredictionCurve'],
          'auth-components': ['./src/components/auth/AuthWrapper', './src/components/auth/UserProfile'],
          'panels': ['./src/components/AchievementsPanel', './src/components/TrainingHistory'],
          'settings': ['./src/components/ThemeToggle', './src/components/KeyboardSkinSelector', './src/components/MusicControls', './src/components/ExportImport'],
          'exercises': ['./src/components/CustomExerciseEditor', './src/components/DailyChallengeCard', './src/components/LearningMode'],
          'stats-pages': ['./src/components/StatisticsPage', './src/components/WeeklyProgress'],
          'rewards': ['./src/components/SessionSummary', './src/components/StreakRewardsPanel', './src/components/TypingTips', './src/components/Onboarding'],
          'widgets': ['./src/components/ClockWidget', './src/components/MotivationalQuote', './src/components/OnlineStatus'],
          'certificate': ['./src/components/CertificateGenerator'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        sourcemap: false,
        hoistTransitiveImports: true,
      },
    },
    chunkSizeWarningLimit: 350,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-is', 'framer-motion', '@tanstack/react-query'],
    exclude: ['@sentry/react'],
  },
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
})
