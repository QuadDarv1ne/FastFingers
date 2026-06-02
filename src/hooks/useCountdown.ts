import { useState, useRef, useCallback, useEffect } from 'react'

const COMPLETED = -1

interface UseCountdownOptions {
  onComplete: () => void
}

export function useCountdown({ onComplete }: UseCountdownOptions) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (countdown === COMPLETED) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setCountdown(null)
      onCompleteRef.current()
    }
  }, [countdown])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const start = useCallback((seconds: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setCountdown(seconds)

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          return COMPLETED
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
