import { useState, useCallback } from 'react'
import { UserProgress, UserSettings, TypingStats, Exercise, KeyHeatmapData } from '../types'

type GameMode = 'practice' | 'sprint' | 'challenge' | 'speedtest' | 'reaction'
type View = 'main' | 'history' | 'custom-exercise' | 'tips' | 'weekly' | 'statistics' | 'learning'
type SpeedTestDuration = 15 | 30 | 60

interface AppState {
  settings: UserSettings
  gameMode: GameMode
  view: View
  customExercises: Exercise[]
  speedTestDuration: SpeedTestDuration
  showHeatmap: boolean
  heatmap: KeyHeatmapData
  showAchievements: boolean
  showSessionSummary: boolean
  showStreakRewards: boolean
  showProfile: boolean
  showNotificationPanel: boolean
  progress: UserProgress
  currentStats: TypingStats | null
  activeChallenge: string | null
  lastSessionXp: number
  showOnboarding: boolean
}

interface AppStateActions {
  setSettings: (settings: UserSettings) => void
  setGameMode: (mode: GameMode) => void
  setView: (view: View) => void
  setSpeedTestDuration: (duration: SpeedTestDuration) => void
  setShowHeatmap: (show: boolean) => void
  setShowAchievements: (show: boolean) => void
  setShowSessionSummary: (show: boolean) => void
  setShowStreakRewards: (show: boolean) => void
  setShowProfile: (show: boolean) => void
  setShowNotificationPanel: (show: boolean) => void
  setCustomExercises: (exercises: Exercise[]) => void
  setActiveChallenge: (id: string | null) => void
  setProgress: (progress: UserProgress) => void
  setCurrentStats: (stats: TypingStats | null) => void
  setLastSessionXp: (xp: number) => void
  setShowOnboarding: (show: boolean) => void
  handleSessionComplete: (stats: TypingStats) => void
  handleReactionGameComplete: (score: number, accuracy: number) => void
  handleKeyInput: (key: string, isCorrect: boolean) => void
  handleSaveCustomExercise: (exercise: Exercise) => void
  handleImportProgress: (data: { progress: UserProgress }) => void
  completeOnboarding: () => void
}

interface UseAppStateReturn extends AppState, AppStateActions {}

const DEFAULT_SETTINGS: UserSettings = {
  layout: 'jcuken',
  soundEnabled: true,
  soundVolume: 0.5,
  soundTheme: 'default',
  fontSize: 'medium',
  theme: 'dark',
  showKeyboard: true,
  showStats: true,
}

const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalWordsTyped: 0,
  totalPracticeTime: 0,
  bestWpm: 0,
  bestAccuracy: 0,
  streak: 0,
  lastPracticeDate: null,
}

export function useAppState(
  addNotification: (notification: unknown) => void,
  addSession: (stats: TypingStats, xp: number) => void,
  completeChallenge: (id: string, wpm: number, accuracy: number) => void,
  todayChallengeId?: string | null
): UseAppStateReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [view, setView] = useState<View>('main')
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [speedTestDuration, setSpeedTestDuration] = useState<SpeedTestDuration>(30)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmap, setHeatmap] = useState<KeyHeatmapData>({})
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [showStreakRewards, setShowStreakRewards] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [progress, setProgressState] = useState<UserProgress>(DEFAULT_PROGRESS)
  const [currentStats, setCurrentStats] = useState<TypingStats | null>(null)
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)
  const [lastSessionXp, setLastSessionXp] = useState(0)

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const seen = localStorage.getItem('fastfingers_onboarding_seen')
      return !seen
    } catch {
      return true
    }
  })

  const setSettingsState = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings)
  }, [])

  const setProgress = useCallback((newProgress: UserProgress) => {
    setProgressState(newProgress)
  }, [])

  const handleSessionComplete = useCallback((stats: TypingStats) => {
    setCurrentStats(stats)
    // Звук воспроизводится вне хука

    const xp = Math.floor(stats.wpm) + Math.floor(stats.accuracy / 10)
    setLastSessionXp(xp)
    addSession(stats, xp)

    if (activeChallenge && todayChallengeId) {
      completeChallenge(activeChallenge, stats.wpm, stats.accuracy)
      setActiveChallenge(null)
    }

    setProgressState(prev => {
      const newXp = prev.xp + xp
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1
      const prevLevel = Math.floor(Math.sqrt(prev.xp / 100)) + 1

      if (newLevel > prevLevel) {
        addNotification({
          type: 'level' as const,
          title: 'Уровень повышен!',
          message: `Вы достигли уровня ${newLevel}!`,
          icon: '🎉',
        })
      }

      setShowSessionSummary(true)

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: Math.pow(newLevel + 1, 2) * 100,
        totalWordsTyped: prev.totalWordsTyped + Math.floor(stats.correctChars / 5),
        bestWpm: Math.max(prev.bestWpm, stats.wpm),
        bestAccuracy: Math.max(prev.bestAccuracy, stats.accuracy),
      }
    })
  }, [activeChallenge, todayChallengeId, completeChallenge, addNotification, addSession])

  const handleReactionGameComplete = useCallback((score: number, accuracy: number) => {
    const xp = Math.floor(score / 5) + Math.floor(accuracy / 10)
    setLastSessionXp(xp)

    setProgressState(prev => {
      const newXp = prev.xp + xp
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: Math.pow(newLevel + 1, 2) * 100,
      }
    })
  }, [])

  const handleKeyInput = useCallback((key: string, isCorrect: boolean) => {
    setHeatmap(prev => {
      const newHeatmap = { ...prev }
      if (!newHeatmap[key]) {
        newHeatmap[key] = { errors: 0, total: 0, accuracy: 100 }
      }
      newHeatmap[key].total++
      if (!isCorrect) {
        newHeatmap[key].errors++
      }
      newHeatmap[key].accuracy = Math.round(
        ((newHeatmap[key].total - newHeatmap[key].errors) / newHeatmap[key].total) * 100
      )
      return newHeatmap
    })
  }, [])

  const handleSaveCustomExercise = useCallback((exercise: Exercise) => {
    setCustomExercises(prev => [...prev, exercise])
    setView('main')
    setGameMode('practice')
  }, [])

  const handleImportProgress = useCallback((data: { progress: UserProgress }) => {
    setProgressState(data.progress)
  }, [])

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('fastfingers_onboarding_seen', 'true')
    setShowOnboarding(false)
  }, [])

  return {
    settings,
    setSettings: setSettingsState,
    gameMode,
    setGameMode,
    view,
    setView,
    customExercises,
    setCustomExercises,
    speedTestDuration,
    setSpeedTestDuration,
    showHeatmap,
    setShowHeatmap,
    heatmap,
    showAchievements,
    setShowAchievements,
    showSessionSummary,
    setShowSessionSummary,
    showStreakRewards,
    setShowStreakRewards,
    showProfile,
    setShowProfile,
    showNotificationPanel,
    setShowNotificationPanel,
    progress,
    setProgress,
    currentStats,
    setCurrentStats,
    activeChallenge,
    setActiveChallenge,
    lastSessionXp,
    setLastSessionXp,
    showOnboarding,
    setShowOnboarding,
    handleSessionComplete,
    handleReactionGameComplete,
    handleKeyInput,
    handleSaveCustomExercise,
    handleImportProgress,
    completeOnboarding,
  }
}
