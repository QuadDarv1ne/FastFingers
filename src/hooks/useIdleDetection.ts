import { useEffect, useRef, useState } from 'react'

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
  const timeoutIdRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleActivity = () => {
      if (isIdle) {
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
    }

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
  }, [timeout, isIdle, onIdle, onActive, events])

  return isIdle
}

export default useIdleDetection
