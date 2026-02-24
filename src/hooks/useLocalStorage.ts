import { useState, useEffect, useCallback, useRef } from 'react'
import { getFromStorage, setToStorage } from '../utils/storage'

type SetValue<T> = T | ((val: T) => T)

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
  onError?: (error: Error) => void
}

interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: SetValue<T>) => void
  removeValue: () => void
  isLoading: boolean
  error: Error | null
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError,
  } = options

  const isInitialMount = useRef(true)
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = getFromStorage<string>(key)
      if (!item) {
        return initialValue
      }
      return deserialize(item)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to read from localStorage')
      setError(error)
      onError?.(error)
      return initialValue
    }
  }, [initialValue, key, deserialize, onError])

  useEffect(() => {
    const value = readValue()
    setStoredValue(value)
    setIsLoading(false)
  }, [readValue])

  // Синхронизация между вкладками
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || event.newValue === null) return

      try {
        setStoredValue(deserialize(event.newValue))
        setError(null)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to parse storage event')
        setError(error)
        onError?.(error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserialize, onError])

  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') return

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        setToStorage(key, serialize(valueToStore))

        if (!isInitialMount.current) {
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serialize(valueToStore),
            })
          )
        }
        setError(null)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to write to localStorage')
        setError(error)
        onError?.(error)
      }
    },
    [key, storedValue, serialize, onError]
  )

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      setStoredValue(initialValue)
      setToStorage(key, null)
      setError(null)

      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
        })
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove from localStorage')
      setError(error)
      onError?.(error)
    }
  }, [key, initialValue, onError])

  useEffect(() => {
    isInitialMount.current = false
  }, [])

  return { value: storedValue, setValue, removeValue, isLoading, error }
}
