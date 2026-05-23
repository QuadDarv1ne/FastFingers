/**
 * FastFingers — Vitest конфигурация
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import fg from 'fast-glob'

// Workaround for vitest 4 glob resolution bug on Windows/Git Bash
const testFiles = fg.sync('src/**/*.test.{ts,tsx}', {
  cwd: process.cwd(),
  ignore: ['**/e2e/**', '**/indexedDB.test.ts'],
}).map(f => f.replace(/\\/g, '/'))

export default defineConfig({
  cacheDir: './node_modules/.vitest',
  plugins: [react()],
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
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    include: testFiles,
    exclude: ['**/e2e/**', '**/node_modules/**', '**/indexedDB.test.ts'],
    pool: 'forks',
    minThreads: 6,
    maxThreads: 12,
    useAtomics: true,
    bail: 0,
    retry: 0,
    testTimeout: 10000,
    hookTimeout: 5000,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        branches: 65,
        functions: 70,
        statements: 70,
      },
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/e2e/**',
        '**/indexedDB.ts',
      ],
    },
  },
})
