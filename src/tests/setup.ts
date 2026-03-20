import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Очищать DOM после каждого теста
afterEach(() => {
  cleanup()
})

// Мок для localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  clear() {
    this.store = {}
  },
  getItem(key: string) {
    return this.store[key] || null
  },
  setItem(key: string, value: string) {
    this.store[key] = String(value)
  },
  removeItem(key: string) {
    delete this.store[key]
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Мок для matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Мок для IndexedDB
const indexedDBMock = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn(),
      })),
      objectStoreNames: {
        contains: vi.fn(() => false),
      },
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(() => ({ onsuccess: null, onerror: null })),
          get: vi.fn(() => ({ onsuccess: null, onerror: null })),
          put: vi.fn(() => ({ onsuccess: null, onerror: null })),
          delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
          getAll: vi.fn(() => ({ onsuccess: null, onerror: null })),
          clear: vi.fn(() => ({ onsuccess: null, onerror: null })),
        })),
      })),
    },
  })),
  deleteDatabase: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
  })),
}

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock,
})

// Мок для конфетти
vi.mock('../utils/confetti', () => ({
  triggerConfetti: vi.fn(),
}))
