import { useState, useCallback } from 'react'
import { TypingStats } from '../types'
import { calculateStats, calculateSessionXp } from '../utils/stats'

interface UseTypingStatsOptions {
  onSaveStats?: (stats: TypingStats & { xp: number }) => void
}

interface UseTypingStatsReturn {
  currentStats: TypingStats | null
  isComplete: boolean
  startSession: () => void
  updateSession: (params: {
    correctChars: number
    totalChars: number
    errors: number
  }) => void
  completeSession: () => (TypingStats & { xp: number }) | undefined
  resetSession: () => void
}

/**
 * Хук для отслеживания статистики печати в реальном времени
 */
export function useTypingStats({
  onSaveStats,
}: UseTypingStatsOptions = {}): UseTypingStatsReturn {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [currentStats, setCurrentStats] = useState<TypingStats | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Начать сессию
  const startSession = useCallback(() => {
    setStartTime(Date.now())
    setCurrentStats(null)
    setIsComplete(false)
  }, [])

  // Обновить статистику сессии
  const updateSession = useCallback(
    ({
      correctChars,
      totalChars,
      errors,
    }: {
      correctChars: number
      totalChars: number
      errors: number
    }) => {
      if (!startTime) return

      const timeElapsed = (Date.now() - startTime) / 1000 // секунды
      const stats = calculateStats(correctChars, totalChars, errors, timeElapsed)
      setCurrentStats(stats)
    },
    [startTime]
  )

  // Завершить сессию
  const completeSession = useCallback(() => {
    if (!currentStats) return

    setIsComplete(true)
    const xp = calculateSessionXp(currentStats)

    if (onSaveStats) {
      onSaveStats({ ...currentStats, xp })
    }

    return { ...currentStats, xp }
  }, [currentStats, onSaveStats])

  // Сбросить сессию
  const resetSession = useCallback(() => {
    setStartTime(null)
    setCurrentStats(null)
    setIsComplete(false)
  }, [])

  return {
    currentStats,
    isComplete,
    startSession,
    updateSession,
    completeSession,
    resetSession,
  }
}
