/**
 * Утилиты для безопасной работы с localStorage
 */

type StorageValue = string | number | boolean | object | null | undefined

const handleStorageError = (operation: string, key?: string, error?: unknown) => {
  const context = key ? `: ${key}` : ''
  console.error(`Error ${operation}${context}`, error)
}

/**
 * Проверка доступности localStorage (работает в приватных режимах и iframe)
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Проверка доступности sessionStorage
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    sessionStorage.setItem(testKey, testKey)
    sessionStorage.removeItem(testKey)
    return true
  } catch {
    return false
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
    console.warn('localStorage is not available, using default value')
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return item === null ? defaultValue : (JSON.parse(item) as T)
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
    console.warn('localStorage is not available, value not saved')
    return
  }

  try {
    value === null || value === undefined
      ? localStorage.removeItem(key)
      : localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    handleStorageError('writing to localStorage', key, error)
  }
}

/**
 * Удалить значение из localStorage
 */
export function removeFromStorage(key: string): void {
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
    console.warn('localStorage is not available, cannot clear')
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
    console.warn('localStorage is not available')
    return []
  }

  try {
    return Object.keys(localStorage)
  } catch (error) {
    handleStorageError('getting storage keys', undefined, error)
    return []
  }
}

/**
 * Получить размер localStorage в байтах
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available')
    return 0
  }

  try {
    let totalSize = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += (key.length + localStorage[key].length) * 2
      }
    }
    return totalSize
  } catch (error) {
    handleStorageError('calculating storage size', undefined, error)
    return 0
  }
}
