import { useMemo, useState, useEffect, useCallback } from 'react'
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

function readLocalStorageCounter(key: string): number {
  return safeParseInt(safeLocalStorageGet(key))
}

function readGameModesUsed(gameMode: string): number {
  const stored = safeLocalStorageGet(STORAGE_KEYS.USED_GAME_MODES) || ''
  return new Set([gameMode, ...stored.split(',').filter(Boolean)]).size
}

export function useAchievementStats(
  progress: UserProgress,
  history: HistoryData,
  customExercisesCount: number,
  gameMode: string,
): AchievementStats {
  const [, setStorageTick] = useState(0)

  const readCounters = useCallback(() => ({
    duelsPlayed: readLocalStorageCounter(STORAGE_KEYS.DUELS_PLAYED),
    tournamentsPlayed: readLocalStorageCounter(STORAGE_KEYS.TOURNAMENTS_PLAYED),
    dailyChallengesCompleted: readLocalStorageCounter(STORAGE_KEYS.DAILY_CHALLENGES_COMPLETED),
    gameModesUsed: readGameModesUsed(gameMode),
  }), [gameMode])

  const [counters, setCounters] = useState(readCounters)

  useEffect(() => {
    setCounters(readCounters())
  }, [readCounters])

  // Re-read localStorage when it changes (cross-tab or same-tab)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('fastfingers_')) {
        setCounters(readCounters())
        setStorageTick(t => t + 1)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [readCounters])

  return useMemo(() => ({
    maxWpm: progress.bestWpm,
    maxAccuracy: progress.bestAccuracy,
    totalWords: progress.totalWordsTyped,
    totalSessions: history.totalSessions,
    currentStreak: progress.streak,
    perfectSessions: history.sessions.filter(s => s.accuracy >= 99.99).length,
    ...counters,
    customExercisesCreated: customExercisesCount,
    level: progress.level,
  }), [progress, history, customExercisesCount, counters])
}
