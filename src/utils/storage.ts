/**
 * Утилиты для безопасной работы с localStorage
 */

type StorageValue = string | number | boolean | object | null | undefined

const handleStorageError = (_operation: string, _key?: string, _error?: unknown) => {
  // Ignore storage errors
}

/**
 * Проверка доступности localStorage (работает в приватных режимах и iframe)
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    if (typeof localStorage === 'undefined') return false
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
    if (typeof sessionStorage === 'undefined') return false
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
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    const parsed = JSON.parse(item) as T
    return parsed
  } catch {
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
  } catch {
    // Ignore write errors
  }
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
  } catch {
    // Ignore clear errors
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
  } catch {
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
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (key && localStorage.hasOwnProperty(key)) {
        totalSize += (key.length + localStorage[key].length) * 2
      }
    }
    return totalSize
  } catch {
    return 0
  }
}
