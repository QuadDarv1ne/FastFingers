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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: { enabled: false },
      useCredentials: false,
      injectRegister: 'auto',
    }),
    // Visualizer только для анализа (отключён для ускорения сборки)
    // visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true, brotliSize: true }),
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
      keepNames: false,
      pure: ['console.log', 'console.warn', 'console.error'],
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      transformMixedEsModules: true,
      ignoreTryCatch: true,
    },
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        propertyReadSideEffects: false,
        moduleSideEffects: false,
      },
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Vendor чанки - явное разделение для ускорения сборки
          'react-vendor': ['react', 'react-dom', 'react-is'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'animations-vendor': ['framer-motion'],
          'confetti-vendor': ['canvas-confetti'],
          'query-vendor': ['@tanstack/react-query'],
          'virtual-vendor': ['@tanstack/react-virtual'],
          'auth-vendor': ['@supabase/supabase-js'],
          'storage-vendor': ['zustand'],
          'monitoring-vendor': ['@sentry/react'],
          'pdf-vendor': ['jspdf'],
          'html2canvas-vendor': ['html2canvas'],
          'charts-core': ['recharts'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        sourcemap: false,
        hoistTransitiveImports: false,
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
