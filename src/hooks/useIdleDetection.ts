import { useEffect, useRef, useState, useCallback } from 'react'

const DEFAULT_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

interface UseIdleDetectionOptions {
  timeout?: number
  onIdle?: () => void
  onActive?: () => void
  events?: string[]
}

export function useIdleDetection({
  timeout = 60000,
  onIdle,
  onActive,
  events,
}: UseIdleDetectionOptions = {}) {
  const resolvedEvents = events ?? DEFAULT_EVENTS
  const [isIdle, setIsIdle] = useState(false)
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>()
  const isIdleRef = useRef(isIdle)
  isIdleRef.current = isIdle

  const handleActivity = useCallback(() => {
    if (isIdleRef.current) {
      setIsIdle(false)
      onActive?.()
    }

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }

    timeoutIdRef.current = setTimeout(() => {
      setIsIdle(true)
      onIdle?.()
    }, timeout)
  }, [timeout, onIdle, onActive])

  useEffect(() => {
    // Initialize the timer
    handleActivity()

    resolvedEvents.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
      resolvedEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [timeout, onIdle, onActive, resolvedEvents, handleActivity])

  return isIdle
}

export default useIdleDetection
