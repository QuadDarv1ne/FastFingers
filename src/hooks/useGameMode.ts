import { useState, useCallback, useRef, useEffect } from 'react'

export type GameMode = 'practice' | 'sprint' | 'challenge' | 'speedtest' | 'reaction' | 'hardcore' | 'marathon' | 'code' | 'duel' | 'tournament'
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

  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const handleGameModeChange = useCallback((mode: GameMode) => {
    setGameMode(mode)
    optionsRef.current?.onModeChange?.(mode)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setView(newView)
    optionsRef.current?.onViewChange?.(newView)
  }, [])

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
