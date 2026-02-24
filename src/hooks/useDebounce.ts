import { useState, useEffect, useRef, useCallback } from 'react'

interface UseDebounceOptions {
  delay?: number
  immediate?: boolean
}

interface UseDebounceReturn<T> {
  debouncedValue: T
  isPending: boolean
  cancel: () => void
  flush: () => void
}

/**
 * Хук для debouncing значений с расширенными возможностями
 */
export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const { delay = 300, immediate = false } = options
  const [debouncedValue, setDebouncedValue] = useState<T>(immediate ? value : (undefined as T))
  const [isPending, setIsPending] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current && immediate) {
      setDebouncedValue(value)
      isFirstRender.current = false
      return
    }

    setIsPending(true)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
      setIsPending(false)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, immediate])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      setDebouncedValue(value)
      setIsPending(false)
      timeoutRef.current = null
    }
  }, [value])

  return { debouncedValue, isPending, cancel, flush }
}

export { useDebounce as default }
