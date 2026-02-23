import { useState, useEffect, useCallback } from 'react'

type SetValue<T> = T | ((val: T) => T)

interface UseSessionStorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}

/**
 * Хук для работы с sessionStorage с реактивным обновлением
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: UseSessionStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options

  const readValue = useCallback((): T => {
    try {
      const item = sessionStorage.getItem(key)
      if (!item) return initialValue
      return deserialize(item)
    } catch {
      return initialValue
    }
  }, [initialValue, key, deserialize])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  useEffect(() => {
    setStoredValue(readValue())
  }, [key, readValue])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(deserialize(event.newValue))
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserialize])

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        sessionStorage.setItem(key, serialize(valueToStore))

        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: serialize(valueToStore),
          })
        )
      } catch {
        // ignore
      }
    },
    [key, storedValue, serialize]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      sessionStorage.removeItem(key)

      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
        })
      )
    } catch {
      // ignore
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
