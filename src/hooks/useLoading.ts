import { useState, useEffect, useCallback, useRef } from 'react'

interface UseLoadingOptions {
  /** Начальное состояние загрузки */
  initialState?: boolean
  /** Минимальная длительность загрузки (мс) - для предотвращения мерцания */
  minDuration?: number
}

/**
 * Хук для управления состоянием загрузки
 * 
 * @example
 * ```tsx
 * const { isLoading, startLoading, stopLoading } = useLoading()
 * 
 * const fetchData = async () => {
 *   startLoading()
 *   try {
 *     await api.getData()
 *   } finally {
 *     stopLoading()
 *   }
 * }
 * ```
 */
export function useLoading({
  initialState = false,
  minDuration = 0
}: UseLoadingOptions = {}) {
  const [isLoading, setIsLoading] = useState(initialState)
  const startTimeRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    startTimeRef.current = Date.now()
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    
    if (elapsed >= minDuration) {
      setIsLoading(false)
      startTimeRef.current = null
    } else {
      // Ждём минимальную длительность
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false)
        startTimeRef.current = null
      }, minDuration - elapsed)
    }
  }, [minDuration])

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { isLoading, startLoading, stopLoading }
}

/**
 * Хук для отслеживания прогресса загрузки
 * 
 * @example
 * ```tsx
 * const { progress, start, update, complete } = useLoadingProgress()
 * 
 * const uploadFile = async () => {
 *   start()
 *   await uploadWithProgress((loaded, total) => {
 *     update((loaded / total) * 100)
 *   })
 *   complete()
 * }
 * ```
 */
export function useLoadingProgress(initialProgress: number = 0) {
  const [progress, setProgress] = useState(initialProgress)
  const [isComplete, setIsComplete] = useState(false)

  const start = useCallback(() => {
    setProgress(0)
    setIsComplete(false)
  }, [])

  const update = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)))
  }, [])

  const increment = useCallback((delta: number) => {
    setProgress(prev => Math.min(100, prev + delta))
  }, [])

  const complete = useCallback(() => {
    setProgress(100)
    setIsComplete(true)
  }, [])

  const reset = useCallback(() => {
    setProgress(initialProgress)
    setIsComplete(false)
  }, [initialProgress])

  return {
    progress,
    isComplete,
    start,
    update,
    increment,
    complete,
    reset
  }
}
