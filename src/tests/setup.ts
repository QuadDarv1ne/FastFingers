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

// Мок для Web Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor() {
    // Имитируем асинхронную инициализацию
    setTimeout(() => {
      if (this.onmessage) {
        // Отправляем пустое сообщение для инициализации
        this.onmessage({ data: {} } as MessageEvent)
      }
    }, 0)
  }

  postMessage(message: any) {
    // Имитируем обработку сообщений
    setTimeout(() => {
      if (this.onmessage) {
        const { type, payload } = message
        let result: any

        try {
          switch (type) {
            case 'CALCULATE_RHYTHM':
              result = { type: 'RHYTHM_RESULT', payload: 75 }
              break
            case 'CALCULATE_FINGER_BALANCE':
              result = { type: 'FINGER_BALANCE_RESULT', payload: { left: 50, right: 50 } }
              break
            case 'CALCULATE_ERROR_RECOVERY':
              result = { type: 'ERROR_RECOVERY_RESULT', payload: 150 }
              break
            case 'ANALYZE_TIME_OF_DAY':
              result = {
                type: 'TIME_OF_DAY_RESULT',
                payload: [
                  { timeOfDay: 'morning', sessions: 1, avgWpm: 30, avgAccuracy: 85 },
                  { timeOfDay: 'afternoon', sessions: 1, avgWpm: 45, avgAccuracy: 90 },
                  { timeOfDay: 'evening', sessions: 1, avgWpm: 60, avgAccuracy: 95 },
                  { timeOfDay: 'night', sessions: 1, avgWpm: 50, avgAccuracy: 88 },
                ],
              }
              break
            case 'ANALYZE_FUNNEL':
              result = {
                type: 'FUNNEL_RESULT',
                payload: {
                  stages: [
                    { name: 'WPM ≥ 20', count: 4, percentage: 100 },
                    { name: 'WPM ≥ 40', count: 3, percentage: 75 },
                    { name: 'WPM ≥ 60', count: 1, percentage: 25 },
                  ],
                  conversionRates: [100, 75, 33],
                },
              }
              break
            case 'CALCULATE_CORRELATION':
              result = {
                type: 'CORRELATION_RESULT',
                payload: [
                  [1, 0.5, 0.3, -0.2],
                  [0.5, 1, 0.6, -0.1],
                  [0.3, 0.6, 1, -0.3],
                  [-0.2, -0.1, -0.3, 1],
                ],
              }
              break
            default:
              result = { type: 'ERROR', payload: 'Unknown message type' }
          }
          this.onmessage({ data: result } as MessageEvent)
        } catch (error) {
          this.onmessage({
            data: {
              type: 'ERROR',
              payload: error instanceof Error ? error.message : 'Unknown error',
            },
          } as MessageEvent)
        }
      }
    }, 10)
  }

  terminate() {
    this.onmessage = null
    this.onerror = null
  }
}

vi.mock('../workers/stats.worker.ts', () => ({}))

// Переопределяем глобальный Worker
const originalWorker = global.Worker
global.Worker = MockWorker as any
