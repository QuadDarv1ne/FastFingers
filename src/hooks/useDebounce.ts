import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Хук для debouncing значений
 * @param value - Значение для debouncing
 * @param delay - Задержка в миллисекундах
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Хук для debouncing функций
 * @param fn - Функция для debouncing
 * @param delay - Задержка в миллисекундах
 */
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    },
    [fn, delay]
  ) as T
}
