import { useMemo } from 'react'
import type { UserProgress } from '../types'
import { safeLocalStorageGet } from '../utils/storage'
import { safeParseInt } from '../utils/number'
import { STORAGE_KEYS } from '../constants/storageKeys'

interface HistoryData {
  sessions: Array<{ accuracy: number }>
  totalSessions: number
}

interface AchievementStats {
  maxWpm: number
  maxAccuracy: number
  totalWords: number
  totalSessions: number
  currentStreak: number
  perfectSessions: number
  duelsPlayed: number
  tournamentsPlayed: number
  customExercisesCreated: number
  dailyChallengesCompleted: number
  gameModesUsed: number
  level: number
}

export function useAchievementStats(
  progress: UserProgress,
  history: HistoryData,
  customExercisesCount: number,
  gameMode: string,
): AchievementStats {
  return useMemo(() => ({
    maxWpm: progress.bestWpm,
    maxAccuracy: progress.bestAccuracy,
    totalWords: progress.totalWordsTyped,
    totalSessions: history.totalSessions,
    currentStreak: progress.streak,
    perfectSessions: history.sessions.filter(s => s.accuracy >= 99.99).length,
    duelsPlayed: safeParseInt(safeLocalStorageGet(STORAGE_KEYS.DUELS_PLAYED)),
    tournamentsPlayed: safeParseInt(safeLocalStorageGet(STORAGE_KEYS.TOURNAMENTS_PLAYED)),
    customExercisesCreated: customExercisesCount,
    dailyChallengesCompleted: safeParseInt(safeLocalStorageGet(STORAGE_KEYS.DAILY_CHALLENGES_COMPLETED)),
    gameModesUsed: new Set([gameMode, ...(safeLocalStorageGet(STORAGE_KEYS.USED_GAME_MODES) || '')
      .split(',')
      .filter(Boolean)]).size,
    level: progress.level,
  }), [progress, history, customExercisesCount, gameMode])
}
