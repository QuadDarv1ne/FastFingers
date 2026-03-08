import { useState, useCallback, useRef } from 'react'
import { TypingStats, KeystrokeData } from '../types'
import {
  calculateStats,
  calculateSessionXp,
  calculateRhythmScore,
  calculateFingerBalance,
  calculateErrorRecoveryTime,
  calculateSessionEfficiency,
} from '../utils/stats'

interface UseTypingStatsOptions {
  onSaveStats?: (stats: TypingStats & { xp: number }) => void
  getKeyFinger?: (key: string) => string // Функция для определения пальца для клавиши
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
  recordKeystroke: (key: string, isCorrect: boolean) => void
  completeSession: () => (TypingStats & { xp: number }) | undefined
  resetSession: () => void
  getKeystrokes: () => KeystrokeData[]
}

/**
 * Хук для отслеживания статистики печати в реальном времени
 * с поддержкой новых расширенных метрик
 */
export function useTypingStats({
  onSaveStats,
  getKeyFinger,
}: UseTypingStatsOptions = {}): UseTypingStatsReturn {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [currentStats, setCurrentStats] = useState<TypingStats | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const keystrokesRef = useRef<KeystrokeData[]>([])

  // Определить, какая рука используется для клавиши
  const getHand = useCallback((finger: string): 'left' | 'right' => {
    const leftFingers = ['left-pinky', 'left-ring', 'left-middle', 'left-index']
    return leftFingers.includes(finger) ? 'left' : 'right'
  }, [])

  // Начать сессию
  const startSession = useCallback(() => {
    setStartTime(Date.now())
    setCurrentStats(null)
    setIsComplete(false)
    keystrokesRef.current = []
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
      const baseStats = calculateStats(correctChars, totalChars, errors, timeElapsed)

      // Расчёт расширенных метрик
      const keystrokes = keystrokesRef.current
      const rhythmScore = calculateRhythmScore(keystrokes)
      const fingerBalance = calculateFingerBalance(keystrokes)
      const errorRecoveryTime = calculateErrorRecoveryTime(keystrokes)
      const sessionEfficiency = calculateSessionEfficiency(baseStats)

      const stats: TypingStats = {
        ...baseStats,
        rhythmScore,
        fingerBalance,
        errorRecoveryTime,
        sessionEfficiency,
      }

      setCurrentStats(stats)
    },
    [startTime]
  )

  // Записать нажатие клавиши
  const recordKeystroke = useCallback(
    (key: string, isCorrect: boolean) => {
      if (!startTime) return

      const finger = getKeyFinger?.(key) || 'unknown'
      const hand = getHand(finger)

      keystrokesRef.current.push({
        key,
        timestamp: Date.now(),
        isCorrect,
        finger,
        hand,
      })
    },
    [startTime, getKeyFinger, getHand]
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
    keystrokesRef.current = []
  }, [])

  // Получить все нажатия клавиш
  const getKeystrokes = useCallback(() => {
    return [...keystrokesRef.current]
  }, [])

  return {
    currentStats,
    isComplete,
    startSession,
    updateSession,
    recordKeystroke,
    completeSession,
    resetSession,
    getKeystrokes,
  }
}
