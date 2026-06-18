import { useCallback } from 'react'
import type { TypingStats, ChallengeWithProgress } from '../types'
import { calculateSessionXp } from '../utils/stats'
import { calculateStreakXpBonus } from '../utils/streakBonus'

interface UseSessionHandlersOptions {
  addSession: (stats: TypingStats, xp: number) => void
  activeChallenge: string | null
  todayChallenge: ChallengeWithProgress | null
  completeChallenge: (id: string, wpm: number, accuracy: number) => void
  handleSessionComplete: (stats: TypingStats, totalXp: number) => void
  streak: { current: number }
  setLastSessionXp: (xp: number) => void
  setShowSessionSummary: (show: boolean) => void
}

export interface UseSessionHandlersReturn {
  handleSessionCompleteWithProgress: (stats: TypingStats) => void
  handleReactionGameComplete: (score: number, accuracy: number) => void
}

export function useSessionHandlers({
  addSession,
  activeChallenge,
  todayChallenge,
  completeChallenge,
  handleSessionComplete,
  streak: { current: currentStreak },
  setLastSessionXp,
  setShowSessionSummary,
}: UseSessionHandlersOptions): UseSessionHandlersReturn {
  const handleSessionCompleteWithProgress = useCallback(
    (stats: TypingStats) => {
      const xp = calculateSessionXp(stats)
      const streakBonus = calculateStreakXpBonus(currentStreak)
      const totalXp = xp + streakBonus
      setLastSessionXp(totalXp)

      addSession(stats, totalXp)

      if (activeChallenge && todayChallenge) {
        completeChallenge(activeChallenge, stats.wpm, stats.accuracy)
      }

      handleSessionComplete(stats, totalXp)
      setShowSessionSummary(true)
    },
    [
      addSession,
      activeChallenge,
      todayChallenge,
      completeChallenge,
      handleSessionComplete,
      currentStreak,
      setLastSessionXp,
      setShowSessionSummary,
    ]
  )

  const handleReactionGameComplete = useCallback((score: number, accuracy: number) => {
    const xp = Math.floor(score / 5) + Math.floor(accuracy / 10)
    setLastSessionXp(xp)

    const reactionStats: TypingStats = {
      wpm: 0,
      cpm: Math.round(score),
      accuracy,
      errors: 0,
      correctChars: score,
      totalChars: score,
      timeElapsed: 30,
      date: new Date().toISOString(),
    }

    addSession(reactionStats, xp)
    handleSessionComplete(reactionStats, xp)
    setShowSessionSummary(true)
  }, [addSession, handleSessionComplete, setLastSessionXp, setShowSessionSummary])

  return {
    handleSessionCompleteWithProgress,
    handleReactionGameComplete,
  }
}
