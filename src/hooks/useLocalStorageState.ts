import { useState, useEffect, useCallback } from 'react'

/**
 * Хук для синхронизации состояния с localStorage
 * Автоматически сохраняет и загружает данные
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, state])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setState(defaultValue)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  }, [key, defaultValue])

  return [state, setState, remove]
}
