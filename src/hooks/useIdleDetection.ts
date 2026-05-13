import { useEffect, useRef, useState, useCallback } from 'react'

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
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
}: UseIdleDetectionOptions = {}) {
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

    events.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [timeout, onIdle, onActive, events, handleActivity])

  return isIdle
}

export default useIdleDetection
