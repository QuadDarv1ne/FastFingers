/**
 * Утилиты для безопасной работы с localStorage
 */

type StorageValue = string | number | boolean | object | null | undefined

/**
 * Получить значение из localStorage
 * @param key - Ключ
 * @param defaultValue - Значение по умолчанию
 */
export function getFromStorage<T extends StorageValue>(
  key: string,
  defaultValue?: T
): T | undefined {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error)
    return defaultValue
  }
}

/**
 * Сохранить значение в localStorage
 * @param key - Ключ
 * @param value - Значение
 */
export function setToStorage<T extends StorageValue>(key: string, value: T): void {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error)
  }
}

/**
 * Удалить значение из localStorage
 * @param key - Ключ
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error)
  }
}

/**
 * Очистить всё localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Error clearing localStorage', error)
  }
}

/**
 * Получить все ключи из localStorage
 */
export function getStorageKeys(): string[] {
  try {
    return Object.keys(localStorage)
  } catch (error) {
    console.error('Error getting storage keys', error)
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
        totalSize += (key.length + localStorage[key].length) * 2 // 2 bytes per character
      }
    }
    return totalSize
  } catch (error) {
    console.error('Error calculating storage size', error)
    return 0
  }
}

/**
 * Хук для работы с localStorage (для React компонентов)
 * Пример использования:
 * const [value, setValue] = useStorage('key', defaultValue)
 */
