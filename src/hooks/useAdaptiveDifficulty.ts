/**
 * FastFingers — Хук для адаптивной сложности
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useCallback, useRef } from 'react'
import type { TypingStats } from '../types'
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
  type DifficultyTrend,
} from '../utils/adaptiveDifficulty'
import type { PracticeText } from '../data/practiceTexts'
import { practiceTexts } from '../data/practiceTexts'
import { useLocalStorageState } from './useLocalStorageState'
import { STORAGE_KEYS } from '../constants/storageKeys'

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
  const [isEnabled, setIsEnabled] = useLocalStorageState(STORAGE_KEYS.ADAPTIVE_DIFFICULTY + '_enabled', true)
  const [state, setState] = useLocalStorageState<AdaptiveDifficultyState>(
    STORAGE_KEYS.ADAPTIVE_DIFFICULTY,
    createAdaptiveState()
  )

  const lastSessionStatsRef = useRef<TypingStats | null>(null)
  const [nextTextReason, setNextTextReason] = useState('')

  const level = state.currentLevel
  const levelDescription = getLevelDescription(level)
  const levelBadge = getLevelBadge(level)
  const multiplier = getDifficultyMultiplier(level)

  const trend = analyzeDifficultyHistory(state.history)

  const onSessionComplete = useCallback((stats: TypingStats) => {
    if (!enabled || !isEnabled) {
      lastSessionStatsRef.current = stats
      return
    }

    const sessionResult = evaluateSession(stats, state)
    const newState = updateAdaptiveState(state, sessionResult, stats)
    setState(newState)
    lastSessionStatsRef.current = stats
  }, [enabled, isEnabled, state, setState])

  const getNextText = useCallback((): PracticeText | null => {
    if (!enabled || !isEnabled) {
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

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev)
  }, [setIsEnabled])

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
}
