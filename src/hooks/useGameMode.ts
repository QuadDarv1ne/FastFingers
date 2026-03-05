import { useState, useCallback } from 'react'

export type GameMode = 'practice' | 'sprint' | 'challenge' | 'speedtest' | 'reaction'
export type View = 'main' | 'history' | 'custom-exercise' | 'tips' | 'weekly' | 'statistics' | 'learning'
export type SpeedTestDuration = 15 | 30 | 60

interface UseGameModeOptions {
  onModeChange?: (mode: GameMode) => void
  onViewChange?: (view: View) => void
}

export function useGameMode(options?: UseGameModeOptions) {
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [view, setView] = useState<View>('main')
  const [speedTestDuration, setSpeedTestDuration] = useState<SpeedTestDuration>(30)

  const handleGameModeChange = useCallback((mode: GameMode) => {
    setGameMode(mode)
    options?.onModeChange?.(mode)
  }, [options])

  const handleViewChange = useCallback((newView: View) => {
    setView(newView)
    options?.onViewChange?.(newView)
  }, [options])

  const handleSpeedTestDurationChange = useCallback((duration: SpeedTestDuration) => {
    setSpeedTestDuration(duration)
    setGameMode('speedtest')
  }, [])

  const resetToPractice = useCallback(() => {
    setGameMode('practice')
    setView('main')
  }, [])

  return {
    gameMode,
    view,
    speedTestDuration,
    setGameMode: handleGameModeChange,
    setView: handleViewChange,
    setSpeedTestDuration: handleSpeedTestDurationChange,
    resetToPractice,
  }
}
