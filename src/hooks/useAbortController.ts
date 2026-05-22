import { useEffect, useRef, useCallback } from 'react'

/**
 * Хук для управления AbortController в React компонентах.
 * Автоматически отменяет запросы при unmount компонента.
 *
 * @example
 * const { getSignal, abort } = useAbortController()
 *
 * useEffect(() => {
 *   fetch('/api/data', { signal: getSignal() })
 *     .then(res => res.json())
 *     .catch(err => {
 *       if (err.name === 'AbortError') return // Игнорируем отмену
 *       handleError(err)
 *     })
 * }, [])
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null)

  const getSignal = useCallback(() => {
    // Создаём новый AbortController если предыдущий был отменён
    if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = new AbortController()
    }
    return abortControllerRef.current.signal
  }, [])

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Отменяем все запросы при unmount
  useEffect(() => {
    return () => {
      abort()
    }
  }, [abort])

  return { getSignal, abort }
}

export default useAbortController
