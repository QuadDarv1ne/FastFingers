import { useState, useEffect, useCallback } from 'react'

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Ignore save errors
    }
  }, [key, state])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setState(defaultValue)
    } catch {
      // Ignore remove errors
    }
  }, [key, defaultValue])

  return [state, setState, remove]
}

export default useLocalStorageState
