/**
 * Хук для управления навигацией по режимам игры
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useCallback } from 'react'
import { useGameMode, type SpeedTestDuration } from './useGameMode'

export interface ModeNavigationActions {
  goToPractice: () => void
  goToSprint: () => void
  goToHardcore: () => void
  goToSpeedTest: (duration?: SpeedTestDuration) => void
  goToReaction: () => void
  goToMarathon: () => void
  goToCode: () => void
  goToDuel: () => void
  goToTournament: () => void
  goToHistory: () => void
  goToCustomExercise: () => void
  goToTips: () => void
  goToWeekly: () => void
  goToStatistics: () => void
  goToLearning: () => void
  goToMain: () => void
  exitCurrentMode: () => void
}

export function useModeNavigation(): {
  gameMode: ReturnType<typeof useGameMode>['gameMode']
  view: ReturnType<typeof useGameMode>['view']
  speedTestDuration: SpeedTestDuration
  actions: ModeNavigationActions
  setGameMode: ReturnType<typeof useGameMode>['setGameMode']
  setView: ReturnType<typeof useGameMode>['setView']
} {
  const {
    gameMode,
    view,
    speedTestDuration,
    setGameMode,
    setView,
    setSpeedTestDuration,
    resetToPractice,
  } = useGameMode()

  const goToPractice = useCallback(() => {
    setGameMode('practice')
    setView('main')
  }, [setGameMode, setView])

  const goToSprint = useCallback(() => {
    setGameMode('sprint')
    setView('main')
  }, [setGameMode, setView])

  const goToHardcore = useCallback(() => {
    setGameMode('hardcore')
    setView('main')
  }, [setGameMode, setView])

  const goToSpeedTest = useCallback(
    (duration?: SpeedTestDuration) => {
      if (duration) {
        setSpeedTestDuration(duration)
      }
      setGameMode('speedtest')
      setView('main')
    },
    [setGameMode, setView, setSpeedTestDuration]
  )

  const goToReaction = useCallback(() => {
    setGameMode('reaction')
  }, [setGameMode])

  const goToMarathon = useCallback(() => {
    setGameMode('marathon')
  }, [setGameMode])

  const goToCode = useCallback(() => {
    setGameMode('code')
  }, [setGameMode])

  const goToDuel = useCallback(() => {
    setGameMode('duel')
  }, [setGameMode])

  const goToTournament = useCallback(() => {
    setGameMode('tournament')
  }, [setGameMode])

  const goToHistory = useCallback(() => {
    setView('history')
  }, [setView])

  const goToCustomExercise = useCallback(() => {
    setView('custom-exercise')
  }, [setView])

  const goToTips = useCallback(() => {
    setView('tips')
  }, [setView])

  const goToWeekly = useCallback(() => {
    setView('weekly')
  }, [setView])

  const goToStatistics = useCallback(() => {
    setView('statistics')
  }, [setView])

  const goToLearning = useCallback(() => {
    setView('learning')
  }, [setView])

  const goToMain = useCallback(() => {
    setView('main')
  }, [setView])

  const exitCurrentMode = useCallback(() => {
    resetToPractice()
  }, [resetToPractice])

  return {
    gameMode,
    view,
    speedTestDuration,
    actions: {
      goToPractice,
      goToSprint,
      goToHardcore,
      goToSpeedTest,
      goToReaction,
      goToMarathon,
      goToCode,
      goToDuel,
      goToTournament,
      goToHistory,
      goToCustomExercise,
      goToTips,
      goToWeekly,
      goToStatistics,
      goToLearning,
      goToMain,
      exitCurrentMode,
    },
    setGameMode,
    setView,
  }
}
