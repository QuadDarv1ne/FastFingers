import { useState, useEffect, useRef } from 'react'

interface UseTypingTimerOptions {
  mode: 'practice' | 'timed'
  duration: number
  isActive: boolean
}

interface UseTypingTimerReturn {
  timeLeft: number
  timeLeftRef: React.MutableRefObject<number>
  timeExpiredRef: React.MutableRefObject<boolean>
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>
}

export function useTypingTimer({
  mode,
  duration,
  isActive,
}: UseTypingTimerOptions): UseTypingTimerReturn {
  const [timeLeft, setTimeLeft] = useState(duration)
  const timeLeftRef = useRef(duration)
  const timeExpiredRef = useRef(false)

  useEffect(() => {
    if (mode !== 'timed' || !isActive) return

    const interval = window.setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [mode, isActive])

  useEffect(() => {
    if (timeLeft <= 0 && mode === 'timed' && isActive && !timeExpiredRef.current) {
      timeExpiredRef.current = true
    }
  }, [timeLeft, mode, isActive])

  useEffect(() => {
    if (mode === 'timed' && !isActive) {
      setTimeLeft(duration)
      timeExpiredRef.current = false
    }
  }, [duration, mode, isActive])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  return { timeLeft, timeLeftRef, timeExpiredRef, setTimeLeft }
}
