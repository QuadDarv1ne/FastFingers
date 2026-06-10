import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '../utils/logger'

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (err) {
      logger.warn('Failed to parse stored state', { key }, err)
      return defaultValue
    }
  })

  const prevJsonRef = useRef<string | null>(null)

  useEffect(() => {
    try {
      const next = JSON.stringify(state)
      if (prevJsonRef.current !== next) {
        prevJsonRef.current = next
        localStorage.setItem(key, next)
      }
    } catch (err) {
      logger.warn('Failed to save state to localStorage', { key }, err)
    }
  }, [key, state])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setState(defaultValue)
    } catch (err) {
      logger.warn('Failed to remove state from localStorage', { key }, err)
    }
  }, [key, defaultValue])

  return [state, setState, remove]
}
