import { useState, useRef, useCallback, useEffect } from 'react'

interface UseCountdownOptions {
  /** Callback invoked when countdown reaches zero */
  onComplete: () => void
}

/**
 * Custom hook for countdown timer with proper cleanup on unmount.
 * Prevents memory leaks from setInterval in components that may unmount
 * during an active countdown.
 */
export function useCountdown({ onComplete }: UseCountdownOptions) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep ref in sync without adding onComplete to dependency arrays
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const start = useCallback((seconds: number) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setCountdown(seconds)

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          intervalRef.current = null
          onCompleteRef.current()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const cancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCountdown(null)
  }, [])

  return { countdown, start, cancel }
}
