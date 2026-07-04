/**
 * Утилиты для безопасной работы с localStorage
 */

import { logger } from './logger'

type StorageValue = string | number | boolean | object | null | undefined

/** Event fired when localStorage quota is exceeded */
export const STORAGE_QUOTA_EXCEEDED = 'fastfingers:storage-quota-exceeded'

/** Result of a storage set operation with quota detection */
export interface StorageSetResult {
  success: boolean
  quotaExceeded: boolean
}

const handleStorageError = (operation: string, key?: string, error?: unknown) => {
  logger.warn(`Error ${operation}${key ? ` for key "${key}"` : ''}:`, error)
}

/**
 * Проверка доступности localStorage (работает в приватных режимах и iframe)
 * Результат кэшируется — повторные вызовы не выполняют disk I/O.
 */
let _localStorageAvailable: boolean | null = null
export function isLocalStorageAvailable(): boolean {
  if (_localStorageAvailable !== null) return _localStorageAvailable
  try {
    const testKey = '__storage_test__'
    if (typeof localStorage === 'undefined') { _localStorageAvailable = false; return false }
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    _localStorageAvailable = true
    return true
  } catch {
    _localStorageAvailable = false
    return false
  }
}

/** Reset cached availability check — for tests only */
export function _resetStorageAvailabilityCache(): void {
  _localStorageAvailable = null
}

/**
 * Проверка доступности sessionStorage
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    if (typeof sessionStorage === 'undefined') return false
    sessionStorage.setItem(testKey, testKey)
    sessionStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Получить сырое значение из localStorage без JSON-парсинга (с защитой от ошибок)
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Получить значение из localStorage
 */
export function getFromStorage<T extends StorageValue>(
  key: string,
  defaultValue?: T
): T | undefined {
  if (!isLocalStorageAvailable()) {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    const parsed = JSON.parse(item) as T
    return parsed
  } catch (error) {
    handleStorageError('reading from localStorage', key, error)
    return defaultValue
  }
}

/**
 * Сохранить значение в localStorage
 */
export function setToStorage<T extends StorageValue>(key: string, value: T): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch (error) {
    handleStorageError('saving to localStorage', key, error)
  }
}

/**
 * Сохранить значение в localStorage с определением ошибки переполнения квоты.
 * Возвращает результат операции для возможности реакции вызывающего кода.
 */
export function setToStorageWithQuotaHandling(key: string, value: StorageValue): StorageSetResult {
  if (!isLocalStorageAvailable()) {
    return { success: false, quotaExceeded: false }
  }

  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
    return { success: true, quotaExceeded: false }
  } catch (error) {
    const isQuotaExceeded = error instanceof DOMException
      ? error.name === 'QuotaExceededError' || error.code === 22
      : (error as Error & { code?: number })?.code === 22

    if (isQuotaExceeded) {
      logger.error('localStorage quota exceeded for key:', key)
      window.dispatchEvent(new CustomEvent(STORAGE_QUOTA_EXCEEDED, { detail: { key } }))
      return { success: false, quotaExceeded: true }
    }

    handleStorageError('saving to localStorage', key, error)
    return { success: false, quotaExceeded: false }
  }
}

/**
 * Получить массив из localStorage с fallback по умолчанию.
 * Заменяет паттерн: JSON.parse(localStorage.getItem(key) || '[]')
 */
export function getFromStorageAsArray<T>(
  key: string,
  defaultValue: T[] = []
): T[] {
  const result = getFromStorage<T[]>(key, defaultValue)
  return Array.isArray(result) ? result : defaultValue
}

/**
 * Получить объект из localStorage с fallback по умолчанию.
 * Заменяет паттерн: JSON.parse(localStorage.getItem(key) || '{}')
 */
export function getFromStorageAsObject<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T = {} as T
): T {
  const result = getFromStorage<T>(key, defaultValue)
  return result && typeof result === 'object' && !Array.isArray(result)
    ? result
    : defaultValue
}

/**
 * Удалить значение из localStorage
 */
export function removeFromStorage(key: string): void {
  if (!isLocalStorageAvailable()) {
    return
  }
  try {
    localStorage.removeItem(key)
  } catch (error) {
    handleStorageError('removing from localStorage', key, error)
  }
}

/**
 * Очистить всё localStorage
 */
export function clearStorage(): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.clear()
  } catch (error) {
    handleStorageError('clearing localStorage', undefined, error)
  }
}

/**
 * Получить все ключи из localStorage
 */
export function getStorageKeys(): string[] {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    return Object.keys(localStorage)
  } catch (error) {
    handleStorageError('reading localStorage keys', undefined, error)
    return []
  }
}

/**
 * Получить размер localStorage в байтах
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    return 0
  }

  try {
    let totalSize = 0
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      const value = localStorage.getItem(key)
      if (value) {
        totalSize += (key.length + value.length) * 2
      }
    }
    return totalSize
  } catch (error) {
    handleStorageError('calculating localStorage size', undefined, error)
    return 0
  }
}
