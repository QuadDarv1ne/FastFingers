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
import { copyFileSync } from 'fs'
import net from 'net'

// Функция для проверки доступности порта
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port)
  })
}

// Автоопределение свободного порта
async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort
  while (!(await checkPort(port))) {
    port++
  }
  return port
}

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
    port: await findAvailablePort(3000),
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
      drop: ['console', 'debugger'],
      legalComments: 'none',
      target: 'esnext',
      loaders: {},
      keepNames: false,
      pure: ['console.log', 'console.warn', 'console.error'],
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      transformMixedEsModules: true,
      ignoreTryCatch: true,
      defaultIsModuleExports: (id) => {
        // Enable better tree-shaking for known libraries
        if (id.includes('recharts') || id.includes('d3')) return true
        return false
      },
    },
    rollupOptions: {
      treeshake: {
        preset: 'safest',
        propertyReadSideEffects: false,
        moduleSideEffects: 'no-external',
        annotations: true,
      },
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Vendor чанки
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-is')) {
              return 'react-vendor'
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'animations-vendor'
            }
            if (id.includes('canvas-confetti')) {
              return 'confetti-vendor'
            }
            if (id.includes('@tanstack')) {
              if (id.includes('react-query')) return 'query-vendor'
              if (id.includes('virtual')) return 'virtual-vendor'
            }
            if (id.includes('@supabase')) {
              return 'auth-vendor'
            }
            if (id.includes('zustand')) {
              return 'storage-vendor'
            }
            if (id.includes('@sentry')) {
              return 'monitoring-vendor'
            }
            if (id.includes('jspdf')) {
              return 'pdf-vendor'
            }
            if (id.includes('html2canvas')) {
              return 'html2canvas-vendor'
            }
            if (id.includes('recharts')) {
              // Recharts разделяем на под-чанки для лучшего tree-shaking
              if (id.includes('recharts-scale') || id.includes('d3-') || id.includes('victory-vendor')) {
                return 'charts-vendor' // D3 и другие зависимости
              }
              // Все компоненты Recharts в одном чанке для избежания циклических зависимостей
              return 'charts-core'
            }
          }

          // App чанки
          if (id.includes('src/components')) {
            if (id.includes('TypingTrainer')) return 'typing-core'
            // multiplayer должен быть перед Mode для избежания циклической зависимости
            if (id.includes('Leaderboard') || id.includes('Duel') || id.includes('Tournament')) return 'multiplayer'
            if (id.includes('Mode')) return 'game-modes'
            if (id.includes('Keyboard') || id.includes('Header')) return 'ui-components'
            if (id.includes('Recharts') || id.includes('Chart') || id.includes('LazyRecharts')) return 'charts'
            if (id.includes('auth/')) return 'auth-components'
            if (id.includes('Panel') || id.includes('History')) return 'panels'
            if (id.includes('Setting') || id.includes('Toggle') || id.includes('Selector')) return 'settings'
            if (id.includes('Exercise') || id.includes('Challenge') || id.includes('Learning')) return 'exercises'
            if (id.includes('Statistic') || id.includes('Weekly')) return 'stats-pages'
            if (id.includes('Summary') || id.includes('Streak') || id.includes('Tip') || id.includes('Onboarding')) return 'rewards'
            if (id.includes('Widget') || id.includes('Quote') || id.includes('Status')) return 'widgets'
            if (id.includes('Certificate')) return 'certificate'
            if (id.includes('ExportImport')) return 'export'
          }

          // Utils чанки
          if (id.includes('src/utils')) {
            if (id.includes('certificate')) return 'certificate-utils'
            // pdfExport используется только в тестах, не включаем в production чанки
          }

          // Default — main чанк
          return undefined
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        sourcemap: false,
        hoistTransitiveImports: false,
        inlineDynamicImports: false,
        intro: '',
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
