import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '../utils/logger'

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
    } catch (err) {
      logger.warn('Failed to read from sessionStorage', { key }, err)
      return initialValue
    }
  }, [initialValue, key, deserialize])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  const prevKeyRef = useRef(key)

  useEffect(() => {
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key
      setStoredValue(readValue())
      return
    }
    // Only re-read on key change, not on initialValue change
  }, [key, readValue])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(deserialize(event.newValue))
        } catch (err) {
          logger.warn('Failed to deserialize sessionStorage change', { key }, err)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserialize])

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = typeof value === 'function' ? (value as (val: T) => T)(storedValue) : value
        setStoredValue(valueToStore)
        sessionStorage.setItem(key, serialize(valueToStore))

        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: serialize(valueToStore),
          })
        )
      } catch (err) {
        logger.warn('Failed to save to sessionStorage', { key }, err)
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
    } catch (err) {
      logger.warn('Failed to remove from sessionStorage', { key }, err)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
