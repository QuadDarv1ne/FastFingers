/**
 * Утилиты для безопасной работы с localStorage
 */

type StorageValue = string | number | boolean | object | null | undefined

const handleStorageError = (operation: string, key?: string, error?: unknown) => {
  const context = key ? `: ${key}` : ''
  console.error(`Error ${operation}${context}`, error)
}

/**
 * Получить значение из localStorage
 */
export function getFromStorage<T extends StorageValue>(
  key: string,
  defaultValue?: T
): T | undefined {
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
