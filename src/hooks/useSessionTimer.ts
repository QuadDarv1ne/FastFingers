import { useState, useEffect, useRef, useCallback } from 'react'

export interface SessionTimerOptions {
  breakInterval?: number // Интервал для напоминания о перерыве (в секундах)
  breakDuration?: number // Рекомендуемая длительность перерыва (в секундах)
  onBreakReminder?: () => void
  enabled?: boolean
}

export interface SessionTimerState {
  sessionTime: number // Время текущей сессии в секундах
  totalTime: number // Общее время за день в секундах
  isActive: boolean
  needsBreak: boolean
  lastBreakTime: number | null
}

/**
 * Хук для отслеживания времени сессии и напоминаний о перерывах
 */
export function useSessionTimer(options: SessionTimerOptions = {}) {
  const {
    breakInterval = 600, // 10 минут по умолчанию
    breakDuration = 60, // 1 минута по умолчанию
    onBreakReminder,
    enabled = true,
  } = options

  const [state, setState] = useState<SessionTimerState>(() => {
    // Загружаем из localStorage
    try {
      const saved = localStorage.getItem('fastfingers_session_timer')
      if (saved) {
        const parsed = JSON.parse(saved)
        const today = new Date().toDateString()
        const savedDate = new Date(parsed.date).toDateString()

        // Если это новый день, сбрасываем totalTime
        if (today !== savedDate) {
          return {
            sessionTime: 0,
            totalTime: 0,
            isActive: false,
            needsBreak: false,
            lastBreakTime: null,
          }
        }

        return {
          sessionTime: 0,
          totalTime: parsed.totalTime || 0,
          isActive: false,
          needsBreak: false,
          lastBreakTime: parsed.lastBreakTime || null,
        }
      }
    } catch (error) {
      console.error('Error loading session timer:', error)
    }

    return {
      sessionTime: 0,
      totalTime: 0,
      isActive: false,
      needsBreak: false,
      lastBreakTime: null,
    }
  })

  const intervalRef = useRef<NodeJS.Timeout>()

  // Сохранение в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'fastfingers_session_timer',
        JSON.stringify({
          totalTime: state.totalTime,
          lastBreakTime: state.lastBreakTime,
          date: new Date().toISOString(),
        })
      )
    } catch (error) {
      console.error('Error saving session timer:', error)
    }
  }, [state.totalTime, state.lastBreakTime])

  // Таймер
  useEffect(() => {
    if (!enabled || !state.isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const newSessionTime = prev.sessionTime + 1
        const newTotalTime = prev.totalTime + 1

        // Проверка на необходимость перерыва
        const timeSinceBreak = prev.lastBreakTime
          ? newTotalTime - prev.lastBreakTime
          : newTotalTime

        const needsBreak = timeSinceBreak >= breakInterval

        if (needsBreak && !prev.needsBreak) {
          onBreakReminder?.()
        }

        return {
          ...prev,
          sessionTime: newSessionTime,
          totalTime: newTotalTime,
          needsBreak,
        }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, state.isActive, breakInterval, onBreakReminder])

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }))
  }, [])

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      sessionTime: 0,
      isActive: false,
    }))
  }, [])

  const takeBreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      needsBreak: false,
      lastBreakTime: prev.totalTime,
      isActive: false,
    }))
  }, [])

  const skipBreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      needsBreak: false,
      lastBreakTime: prev.totalTime,
    }))
  }, [])

  return {
    ...state,
    start,
    pause,
    reset,
    takeBreak,
    skipBreak,
    breakInterval,
    breakDuration,
    formatTime: (seconds: number) => formatTime(seconds),
  }
}

/**
 * Форматирование времени в читаемый формат
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
