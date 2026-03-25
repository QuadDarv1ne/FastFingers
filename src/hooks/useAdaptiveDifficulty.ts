/**
 * FastFingers — Хук для адаптивной сложности
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useCallback, useRef } from 'react'
import { TypingStats } from '../types'
import {
  AdaptiveDifficultyState,
  createAdaptiveState,
  evaluateSession,
  updateAdaptiveState,
  selectAdaptiveText,
  getLevelDescription,
  getLevelBadge,
  getDifficultyMultiplier,
  analyzeDifficultyHistory,
  serializeAdaptiveState,
  deserializeAdaptiveState,
  DifficultyTrend,
} from '../utils/adaptiveDifficulty'
import { PracticeText, practiceTexts } from '../data/practiceTexts'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'fastfingers_adaptive_difficulty'

export interface UseAdaptiveDifficultyReturn {
  state: AdaptiveDifficultyState
  level: number
  levelDescription: string
  levelBadge: string
  multiplier: number
  trend: DifficultyTrend
  isEnabled: boolean
  toggleEnabled: () => void
  reset: () => void
  onSessionComplete: (stats: TypingStats) => void
  getNextText: () => PracticeText | null
  getNextTextReason: string
}

export function useAdaptiveDifficulty(
  enabled: boolean = true
): UseAdaptiveDifficultyReturn {
  const [isEnabled, setIsEnabled] = useLocalStorageState('fastfingers_adaptive_enabled', true)
  const [state, setState] = useLocalStorageState<AdaptiveDifficultyState>(
    STORAGE_KEY,
    createAdaptiveState()
  )

  const lastSessionStatsRef = useRef<TypingStats | null>(null)
  const [nextTextReason, setNextTextReason] = useState('')

  // Вычисляем производные значения
  const level = state.currentLevel
  const levelDescription = getLevelDescription(level)
  const levelBadge = getLevelBadge(level)
  const multiplier = getDifficultyMultiplier(level)

  // Анализируем тренд
  const trend = analyzeDifficultyHistory(state.history)

  // Обработка завершения сессии
  const onSessionComplete = useCallback((stats: TypingStats) => {
    if (!enabled || !isEnabled) {
      lastSessionStatsRef.current = stats
      return
    }

    // Оцениваем сессию
    const sessionResult = evaluateSession(stats, state)

    // Обновляем состояние
    const newState = updateAdaptiveState(state, sessionResult, stats)
    setState(newState)
    lastSessionStatsRef.current = stats
  }, [enabled, isEnabled, state, setState])

  // Получение следующего текста с учётом адаптивной сложности
  const getNextText = useCallback((): PracticeText | null => {
    if (!enabled || !isEnabled) {
      // Возвращаем случайный текст без учёта сложности
      const random = practiceTexts[Math.floor(Math.random() * practiceTexts.length)]
      return random || null
    }

    const recentPerformance = lastSessionStatsRef.current
      ? {
          wpm: lastSessionStatsRef.current.wpm,
          accuracy: lastSessionStatsRef.current.accuracy,
        }
      : undefined

    const result = selectAdaptiveText(practiceTexts, state, recentPerformance)
    setNextTextReason(result?.reason || '')
    return result?.text || null
  }, [enabled, isEnabled, state])

  const getNextTextReason = nextTextReason

  // Переключение включения/выключения
  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev)
  }, [setIsEnabled])

  // Сброс состояния
  const reset = useCallback(() => {
    setState(createAdaptiveState())
    lastSessionStatsRef.current = null
  }, [setState])

  return {
    state,
    level,
    levelDescription,
    levelBadge,
    multiplier,
    trend,
    isEnabled,
    toggleEnabled,
    reset,
    onSessionComplete,
    getNextText,
    getNextTextReason,
  }
}

export type { AdaptiveDifficultyState }
export {
  createAdaptiveState,
  serializeAdaptiveState,
  deserializeAdaptiveState,
}
