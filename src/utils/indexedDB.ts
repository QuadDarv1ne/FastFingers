/**
 * IndexedDB — Утилиты для работы с IndexedDB
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { logger } from './logger'

const DB_NAME = 'fastfingers-db'
const DB_VERSION = 1
const STORES = {
  sessions: 'sessions',
  settings: 'settings',
  progress: 'progress',
  achievements: 'achievements',
}

interface DBStore {
  sessions: {
    id: string
    date: number
    wpm: number
    cpm: number
    accuracy: number
    errors: number
    correctChars: number
    totalChars: number
    timeElapsed: number
    mode: string
    rhythmScore?: number
    fingerBalance?: { left: number; right: number }
    errorRecoveryTime?: number
    sessionEfficiency?: number
  }
  settings: {
    key: string
    value: unknown
    updatedAt: number
  }
  progress: {
    userId: string
    xp: number
    level: number
    totalWordsTyped: number
    bestWpm: number
    bestAccuracy: number
    streak: number
    updatedAt: number
  }
  achievements: {
    id: string
    unlockedAt: number
    name?: string
    description?: string
  }
}

type StoreName = keyof DBStore

let dbInstance: IDBDatabase | null = null

/**
 * Открытие базы данных
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      try {
        resolve(dbInstance)
        return
      } catch {
        dbInstance = null
      }
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      dbInstance = null
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      dbInstance = request.result

      dbInstance.onerror = () => {
        dbInstance = null
      }

      dbInstance.onclose = () => {
        dbInstance = null
      }

      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Создаём хранилища если их нет
      if (!db.objectStoreNames.contains(STORES.sessions)) {
        const sessionStore = db.createObjectStore(STORES.sessions, { keyPath: 'id' })
        sessionStore.createIndex('date', 'date', { unique: false })
        sessionStore.createIndex('wpm', 'wpm', { unique: false })
        sessionStore.createIndex('mode', 'mode', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        const settingsStore = db.createObjectStore(STORES.settings, { keyPath: 'key' })
        settingsStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.progress)) {
        db.createObjectStore(STORES.progress, { keyPath: 'userId' })
      }

      if (!db.objectStoreNames.contains(STORES.achievements)) {
        const achievementsStore = db.createObjectStore(STORES.achievements, { keyPath: 'id' })
        achievementsStore.createIndex('unlockedAt', 'unlockedAt', { unique: false })
      }
    }
  })
}

/**
 * Добавление записи
 */
export async function add<T extends StoreName>(
  storeName: T,
  data: DBStore[T]
): Promise<string> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.add(data)

    request.onsuccess = () => {
      const id = 'id' in data ? String(data.id) : String(request.result)
      resolve(String(id))
    }

    request.onerror = () => {
      reject(new Error(`Failed to add to ${storeName}`))
    }
  })
}

/**
 * Получение записи по ключу
 */
export async function get<T extends StoreName>(
  storeName: T,
  key: string
): Promise<DBStore[T] | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)

    request.onsuccess = () => {
      resolve(request.result as DBStore[T] | undefined)
    }

    request.onerror = () => {
      reject(new Error(`Failed to get from ${storeName}`))
    }
  })
}

/**
 * Обновление записи
 */
export async function put<T extends StoreName>(
  storeName: T,
  data: DBStore[T]
): Promise<string> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onsuccess = () => {
      const id = 'id' in data ? String(data.id) : String(request.result)
      resolve(String(id))
    }

    request.onerror = () => {
      reject(new Error(`Failed to put to ${storeName}`))
    }
  })
}

/**
 * Удаление записи
 */
export async function remove<T extends StoreName>(
  storeName: T,
  key: string
): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error(`Failed to remove from ${storeName}`))
    }
  })
}

/**
 * Получение всех записей из хранилища
 */
export async function getAll<T extends StoreName>(
  storeName: T
): Promise<DBStore[T][]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result as DBStore[T][])
    }

    request.onerror = () => {
      reject(new Error(`Failed to get all from ${storeName}`))
    }
  })
}

/**
 * Очистка хранилища
 */
export async function clear<T extends StoreName>(storeName: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error(`Failed to clear ${storeName}`))
    }
  })
}

/**
 * Удаление базы данных
 */
export function deleteDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      dbInstance.close()
      dbInstance = null
    }

    const request = indexedDB.deleteDatabase(DB_NAME)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error('Failed to delete database'))
    }
  })
}

/**
 * Проверка доступности IndexedDB
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

/**
 * Миграция данных из LocalStorage в IndexedDB
 */
export async function migrateFromLocalStorage(
  localStorageKey: string,
  storeName: StoreName,
  transform?: (data: unknown) => DBStore[StoreName]
): Promise<number> {
  try {
    const data = localStorage.getItem(localStorageKey)
    if (!data) {
      return 0
    }

    const parsed = JSON.parse(data)
    const dataArray = Array.isArray(parsed) ? parsed : [parsed]

    let migrated = 0
    for (const item of dataArray) {
      const transformed: DBStore[StoreName] = transform ? transform(item) : item
      await add(storeName, transformed)
      migrated++
    }

    return migrated
  } catch (error) {
    logger.error('Migration error:', error)
    return 0
  }
}

// Экспортируем типы
export type { DBStore, StoreName }
