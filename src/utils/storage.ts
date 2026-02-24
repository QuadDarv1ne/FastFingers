type StorageValue = string | number | boolean | object | null | undefined

interface StorageOptions {
  serialize?: (value: StorageValue) => string
  deserialize?: (value: string) => StorageValue
}

const isSSR = typeof window === 'undefined'

const handleStorageError = (operation: string, key?: string, error?: unknown): Error | null => {
  const context = key ? `: ${key}` : ''
  const message = `Error ${operation}${context}`
  console.error(message, error)
  return error instanceof Error ? error : new Error(message)
}

export function getFromStorage<T extends StorageValue>(
  key: string,
  defaultValue?: T,
  options?: StorageOptions
): T | undefined {
  if (isSSR) return defaultValue

  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    
    if (options?.deserialize) {
      return options.deserialize(item) as T
    }
    return JSON.parse(item) as T
  } catch (error) {
    handleStorageError('reading from localStorage', key, error)
    return defaultValue
  }
}

export function setToStorage<T extends StorageValue>(
  key: string,
  value: T,
  options?: StorageOptions
): boolean {
  if (isSSR) return false

  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
    } else {
      const serialized = options?.serialize ? options.serialize(value) : JSON.stringify(value)
      localStorage.setItem(key, serialized)
    }
    return true
  } catch (error) {
    handleStorageError('writing to localStorage', key, error)
    return false
  }
}

export function removeFromStorage(key: string): boolean {
  if (isSSR) return false

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    handleStorageError('removing from localStorage', key, error)
    return false
  }
}

export function clearStorage(): boolean {
  if (isSSR) return false

  try {
    localStorage.clear()
    return true
  } catch (error) {
    handleStorageError('clearing localStorage', undefined, error)
    return false
  }
}

export function getStorageKeys(): string[] {
  if (isSSR) return []

  try {
    return Object.keys(localStorage)
  } catch (error) {
    handleStorageError('getting storage keys', undefined, error)
    return []
  }
}

export function getStorageSize(): number {
  if (isSSR) return 0

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

export function hasStorageKey(key: string): boolean {
  if (isSSR) return false
  try {
    return localStorage.hasOwnProperty(key)
  } catch {
    return false
  }
}

export function getStorageQuota(): { used: number; quota: number; percentUsed: number } {
  if (isSSR || !navigator.storage || !navigator.storage.estimate) {
    return { used: 0, quota: 0, percentUsed: 0 }
  }

  return {
    used: getStorageSize(),
    quota: 5 * 1024 * 1024,
    percentUsed: 0,
  }
}

export function batchGetFromStorage<T extends StorageValue>(
  keys: string[],
  options?: StorageOptions
): Record<string, T | undefined> {
  if (isSSR) return {}

  const result: Record<string, T | undefined> = {}
  for (const key of keys) {
    result[key] = getFromStorage(key, undefined, options)
  }
  return result
}

export function batchSetToStorage<T extends StorageValue>(
  items: Record<string, T>,
  options?: StorageOptions
): boolean {
  if (isSSR) return false

  try {
    for (const [key, value] of Object.entries(items)) {
      setToStorage(key, value, options)
    }
    return true
  } catch (error) {
    handleStorageError('batch writing to localStorage', undefined, error)
    return false
  }
}
