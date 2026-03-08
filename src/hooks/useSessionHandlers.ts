import { useCallback } from 'react'
import { TypingStats, ChallengeWithProgress } from '../types'
import { calculateSessionXp } from '../utils/stats'
import { calculateStreakXpBonus } from '../utils/streakBonus'

interface UseSessionHandlersOptions {
  addSession: (stats: TypingStats, xp: number) => void
  activeChallenge: string | null
  todayChallenge: ChallengeWithProgress | null
  completeChallenge: (id: string, wpm: number, accuracy: number) => void
  handleSessionComplete: (stats: TypingStats, streak: number) => void
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
  streak,
  setLastSessionXp,
  setShowSessionSummary,
}: UseSessionHandlersOptions): UseSessionHandlersReturn {
  const handleSessionCompleteWithProgress = useCallback(
    (stats: TypingStats) => {
      const xp = calculateSessionXp(stats)
      const streakBonus = calculateStreakXpBonus(streak.current)
      const totalXp = xp + streakBonus
      setLastSessionXp(totalXp)

      addSession(stats, totalXp)

      if (activeChallenge && todayChallenge) {
        completeChallenge(activeChallenge, stats.wpm, stats.accuracy)
      }

      handleSessionComplete(stats, streak.current)
      setShowSessionSummary(true)
    },
    [
      addSession,
      activeChallenge,
      todayChallenge,
      completeChallenge,
      handleSessionComplete,
      streak,
      setLastSessionXp,
      setShowSessionSummary,
    ]
  )

  const handleReactionGameComplete = useCallback((score: number, accuracy: number) => {
    const xp = Math.floor(score / 5) + Math.floor(accuracy / 10)
    setLastSessionXp(xp)
  }, [setLastSessionXp])

  return {
    handleSessionCompleteWithProgress,
    handleReactionGameComplete,
  }
}
