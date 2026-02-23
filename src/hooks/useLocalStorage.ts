import { useState, useEffect, useCallback } from 'react'
import { getFromStorage, setToStorage } from './storage'

type SetValue<T> = T | ((val: T) => T)

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}

/**
 * Хук для работы с localStorage с реактивным обновлением
 * @param key - Ключ в localStorage
 * @param initialValue - Значение по умолчанию
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options

  // Получить начальное значение
  const readValue = useCallback((): T => {
    const item = getFromStorage<string>(key)
    
    if (!item) {
      return initialValue
    }

    try {
      return deserialize(item)
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key, deserialize])

  // Состояние для хранения значения
  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Синхронизация при изменении key или initialValue
  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Слушать изменения в других вкладках
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(deserialize(event.newValue))
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserialize])

  // Установить значение
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        setToStorage(key, serialize(valueToStore))

        // Отправить событие для синхронизации между вкладками
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: serialize(valueToStore),
          })
        )
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, serialize]
  )

  // Удалить значение
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      setToStorage(key, null)

      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
        })
      )
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
