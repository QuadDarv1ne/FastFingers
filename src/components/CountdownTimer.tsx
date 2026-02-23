import { useState, useEffect, useCallback } from 'react'
import './CountdownTimer.css'

interface CountdownTimerProps {
  duration: number // секунды
  onComplete?: () => void
  onTick?: (remaining: number) => void
  paused?: boolean
  label?: string
}

export function CountdownTimer({
  duration,
  onComplete,
  onTick,
  paused = false,
  label,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(!paused)

  // Сброс таймера
  const reset = useCallback(() => {
    setRemaining(duration)
    setIsRunning(!paused)
  }, [duration, paused])

  // Пауза/продолжение
  const togglePause = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  // Обновление таймера
  useEffect(() => {
    if (!isRunning || remaining <= 0) return

    const interval = setInterval(() => {
      setRemaining(prev => {
        const newRemaining = prev - 1
        onTick?.(newRemaining)
        
        if (newRemaining <= 0) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        
        return newRemaining
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, remaining, onComplete, onTick])

  // Сброс при изменении duration
  useEffect(() => {
    reset()
  }, [duration, reset])

  // Форматирование времени
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Прогресс
  const progress = ((duration - remaining) / duration) * 100

  return (
    <div className="countdown-timer">
      {label && <div className="countdown-timer__label">{label}</div>}
      
      <div className="countdown-timer__display">
        <span className={`countdown-timer__time ${remaining <= 10 ? 'countdown-timer__time--warning' : ''}`}>
          {formatTime(remaining)}
        </span>
        
        <button
          onClick={togglePause}
          className="countdown-timer__button"
          aria-label={isRunning ? 'Пауза' : 'Продолжить'}
        >
          {isRunning ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <button
          onClick={reset}
          className="countdown-timer__button"
          aria-label="Сбросить"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="countdown-timer__progress">
        <div
          className="countdown-timer__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
