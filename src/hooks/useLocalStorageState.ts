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
    } catch {
      logger.warn('Operation failed in hooks/useLocalStorageState.ts')
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
    } catch {
      logger.warn('Operation failed in hooks/useLocalStorageState.ts')
      // Ignore save errors
    }
  }, [key, state])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setState(defaultValue)
    } catch {
      logger.warn('Operation failed in hooks/useLocalStorageState.ts')
      // Ignore remove errors
    }
  }, [key, defaultValue])

  return [state, setState, remove]
}

export default useLocalStorageState
