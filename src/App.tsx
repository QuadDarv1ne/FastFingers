/**
 * FastFingers — Главный компонент приложения
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useEffect, useCallback, Suspense, memo, useState, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { LoadingFallback } from './components/LoadingFallback'
import { SkipLink } from './components/SkipLink'
import { AriaAnnouncer } from './components/AriaAnnouncer'
import { ToastContainer } from './components/ToastContainer'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { CookieConsentBanner } from './components/CookieConsentBanner'
import { Footer } from './components/Footer'
import { GameModeRenderer } from './components/GameModeRenderer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from '@hooks/useAuth'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './contexts/ToastContext'
import { useNotifications } from '@hooks/useNotifications'
import { createLevelUpNotification } from '@utils/notifications'
import { triggerConfetti } from './utils/confetti'
import {
  SoundTheme,
  UserProgress,
  KeyboardLayout,
  UserSettings,
} from './types'
import type { CustomExercise } from './components/CustomExerciseEditor'
import { logger } from './utils/logger'

import { useGameMode, type SpeedTestDuration } from './hooks/useGameMode'
import { useUserProgress } from './hooks/useUserProgress'
import { useAutoSave } from './hooks/useAutoSave'
import { useCustomExercises } from './hooks/useCustomExercises'
import { useTypingSound } from './hooks/useTypingSound'
import { useTypingHistory } from './hooks/useTypingHistory'
import { useDailyChallenges } from './hooks/useDailyChallenges'
import { useTheme } from './hooks/useTheme'
import { useHotkeys } from './hooks/useHotkeys'
import { useSessionHandlers } from '@hooks/useSessionHandlers'
import { useAppTranslation } from './i18n/config'
import { STORAGE_KEYS } from './constants/storageKeys'

const ExportImport = lazy(() => import('./components/ExportImport').then((module) => ({ default: module.ExportImport })))
const Onboarding = lazy(() => import('./components/Onboarding').then((module) => ({ default: module.Onboarding })))
const AchievementsPanel = lazy(() => import('./components/AchievementsPanel').then((module) => ({ default: module.AchievementsPanel })))

/** Safely parse integer from string; returns 0 for invalid/missing values */
const safeParseInt = (getValue: () => string | null): number => {
  try {
    const value = getValue()
    if (!value) return 0
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  } catch {
    return 0
  }
}
const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const StreakRewardsPanel = lazy(() => import('./components/StreakRewardsPanel').then((module) => ({ default: module.StreakRewardsPanel })))
const SessionSummary = lazy(() => import('./components/SessionSummary').then((module) => ({ default: module.SessionSummary })))
const AuthWrapper = lazy(() => import('./components/auth/AuthWrapper').then((module) => ({ default: module.AuthWrapper })))
const UserProfile = lazy(() => import('./components/auth/UserProfile').then((module) => ({ default: module.UserProfile })))
const GoalsPanel = lazy(() => import('./components/GoalsPanel').then((module) => ({ default: module.GoalsPanel })))
const Stats = lazy(() => import('./components/Stats').then((module) => ({ default: module.Stats })))
const ThemeToggle = lazy(() => import('./components/ThemeToggle').then((module) => ({ default: module.ThemeToggle })))
const KeyboardSkinSelector = lazy(() => import('./components/KeyboardSkinSelector').then((module) => ({ default: module.KeyboardSkinSelector })))
const MusicControls = lazy(() => import('./components/MusicControls').then((module) => ({ default: module.MusicControls })))
const ClockWidget = lazy(() => import('./components/ClockWidget').then((module) => ({ default: module.ClockWidget })))
const MotivationalQuote = lazy(() => import('./components/MotivationalQuote').then((module) => ({ default: module.MotivationalQuote })))
const OnlineStatus = lazy(() => import('./components/OnlineStatus').then((module) => ({ default: module.OnlineStatus })))

function AppContent() {
  const { t } = useAppTranslation()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { addNotification } = useNotifications()

  const handleAuthSuccess = useCallback(() => {
    if (user?.name) {
      addNotification({
        type: 'info',
        title: t('action.welcome'),
        message: `${t('auth.welcomeBack', { name: user.name })}`,
        icon: '👋',
      })
    }
  }, [user, addNotification, t])

  const [showAchievements, setShowAchievements] = useState(false)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [showStreakRewards, setShowStreakRewards] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [lastSessionXp, setLastSessionXp] = useState(0)
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEYS.ONBOARDING)
      return !seen
    } catch {
      return true
    }
  })

  const {
    gameMode,
    view,
    speedTestDuration,
    setGameMode,
    setView,
    setSpeedTestDuration,
    resetToPractice,
  } = useGameMode()

  const {
    progress,
    currentStats,
    heatmap,
    showHeatmap,
    settings,
    handleSessionComplete,
    updateHeatmap,
    setShowHeatmap,
    updateSetting,
    importProgress,
  } = useUserProgress({
    onLevelUp: (newLevel) => {
      addNotification(createLevelUpNotification(newLevel))
      triggerConfetti({ type: 'levelup', duration: 4000 })
    },
  })

  // Автосохранение прогресса при закрытии вкладки
  useAutoSave({
    progress,
    currentSession: currentStats,
    heatmap,
    settings,
    onRestore: (data) => {
      // Восстанавливаем сессию если она есть
      if (data.currentSession) {
        // Можно показать уведомление о восстановлении
        logger.log('[App] Session restored:', data.currentSession)
      }
    },
  })

  const { customExercises, addExercise } = useCustomExercises()

  const sound = useTypingSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  })

  const { addSession, history } = useTypingHistory()
  const { todayChallenge, streak, stats: challengeStats, completeChallenge } = useDailyChallenges()
  const { theme, themeOption, setTheme, setThemeOption } = useTheme()

  const { handleSessionCompleteWithProgress } = useSessionHandlers({
    addSession,
    activeChallenge,
    todayChallenge: todayChallenge || null,
    completeChallenge,
    handleSessionComplete,
    streak,
    setLastSessionXp,
    setShowSessionSummary,
  })

  useHotkeys(
    {
      'ctrl+1': () => {
        setGameMode('practice')
        setView('main')
      },
      'ctrl+2': () => {
        setGameMode('sprint')
        setView('main')
      },
      'ctrl+6': () => {
        setGameMode('hardcore')
        setView('main')
      },
      'ctrl+3': () => setView('statistics'),
      'ctrl+4': () => setView('learning'),
      'ctrl+5': () => setView('tips'),
      'ctrl+p': () => setShowProfile(true),
      'ctrl+n': () => {
        const button = document.querySelector('[data-action="new-exercise"]') as HTMLElement
        button?.click()
      },
    },
    { enabled: !showOnboarding && !showAchievements && !showProfile }
  )

  useEffect(() => {
    const handleStartChallenge = (e: Event) => {
      const customEvent = e as CustomEvent<{ challenge: { id: string } }>
      setActiveChallenge(customEvent.detail.challenge.id)
      setGameMode('challenge')
    }

    window.addEventListener('startChallenge', handleStartChallenge as EventListener)
    return () => window.removeEventListener('startChallenge', handleStartChallenge as EventListener)
  }, [setGameMode])

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true')
    setShowOnboarding(false)
  }, [])

  const handleSaveCustomExercise = useCallback(
    (exercise: CustomExercise) => {
      addExercise({
        ...exercise,
        description: t('exercise.custom'),
        focusKeys: [],
      })
      setView('main')
      setGameMode('practice')
    },
    [addExercise, setView, setGameMode, t]
  )

  const handleImportProgress = useCallback(
    (data: { progress: UserProgress }) => {
      importProgress(data.progress)
    },
    [importProgress]
  )

  if (authLoading) {
    return (
      <div
        className="min-h-screen bg-dark-900 flex items-center justify-center"
        role="alert"
        aria-busy="true"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <p className="text-dark-400">{t('action.loading')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary key="auth" fallback={
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
          <div className="glass rounded-xl p-8 max-w-md w-full text-center">
            <p className="text-dark-400">{t('error.authFailed', 'Failed to load authorization page')}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">
              {t('action.reload', 'Reload page')}
            </button>
          </div>
        </div>
      }>
        <Suspense fallback={<LoadingFallback />}>
          <AuthWrapper onSuccess={handleAuthSuccess} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 transition-colors duration-300">
      <SkipLink />
      <AriaAnnouncer />

      <Header
        level={progress.level}
        xp={progress.xp}
        xpToNextLevel={progress.xpToNextLevel}
        onProfileClick={() => setShowProfile(true)}
      />

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl" role="main">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <nav className="card p-2 inline-flex flex-wrap gap-1" aria-label={t('modes.select')}>
            <ModeButton
              isActive={gameMode === 'practice' && view === 'main'}
              onClick={() => {
                setGameMode('practice')
                setView('main')
              }}
              icon="📝"
              label={t('nav.practice')}
              title={t('mode.practice')}
            />
            <ModeButton
              isActive={gameMode === 'sprint'}
              onClick={() => {
                setGameMode('sprint')
                setView('main')
              }}
              icon="⚡"
              label={t('nav.sprint')}
              title={t('tooltip.sprint')}
            />
            <ModeButton
              isActive={gameMode === 'hardcore'}
              onClick={() => {
                setGameMode('hardcore')
                setView('main')
              }}
              icon="💀"
              label={t('mode.hardcore')}
              title={t('tooltip.hardcore')}
            />
            <SpeedTestDropdown
              isActive={gameMode === 'speedtest'}
              duration={speedTestDuration}
              onDurationChange={setSpeedTestDuration}
              onGameModeChange={setGameMode}
            />
            <ModeButton
              isActive={view === 'custom-exercise'}
              onClick={() => setView('custom-exercise')}
              icon="✏️"
              label={t('nav.custom')}
              title={t('exercise.custom')}
            />
            <ModeButton
              isActive={view === 'tips'}
              onClick={() => setView('tips')}
              icon="💡"
              label={t('nav.tips')}
              title={t('nav.tips')}
            />
            <ModeButton
              isActive={view === 'weekly'}
              onClick={() => setView('weekly')}
              icon="📈"
              label={t('nav.week')}
              title={t('stats.progress')}
            />
            <ModeButton
              isActive={view === 'statistics'}
              onClick={() => setView('statistics')}
              icon="📊"
              label={t('nav.statistics')}
              title={t('stats.title')}
            />
            <ModeButton
              isActive={view === 'learning'}
              onClick={() => setView('learning')}
              icon="📚"
              label={t('nav.learning')}
              title={t('nav.learning')}
            />
            <ModeButton
              isActive={gameMode === 'reaction'}
              onClick={() => setGameMode('reaction')}
              icon="🎮"
              label={t('nav.reaction')}
              title={t('mode.game')}
            />
            <ModeButton
              isActive={gameMode === 'marathon'}
              onClick={() => setGameMode('marathon')}
              icon="🏃"
              label={t('label.marathon')}
              title={t('tooltip.marathon')}
            />
            <ModeButton
              isActive={gameMode === 'code'}
              onClick={() => setGameMode('code')}
              icon="💻"
              label={t('label.code')}
              title={t('tooltip.code')}
            />
            <ModeButton
              isActive={gameMode === 'duel'}
              onClick={() => setGameMode('duel')}
              icon="⚔️"
              label={t('label.duel')}
              title={t('tooltip.duel')}
            />
            <ModeButton
              isActive={gameMode === 'tournament'}
              onClick={() => setGameMode('tournament')}
              icon="🏆"
              label={t('label.tournament')}
              title={t('tooltip.tournament')}
            />
            {user?.role === 'admin' && (
              <ModeButton
                isActive={view === 'admin'}
                onClick={() => setView('admin')}
                icon="⚙️"
                label={t('label.admin', 'Admin')}
                title={t('tooltip.admin', 'Панель администратора')}
              />
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Suspense fallback={<LoadingFallback />}>
              <KeyboardSkinSelector
                skin={settings.keyboardSkin}
                onSkinChange={(skin) => updateSetting('keyboardSkin', skin)}
              />
              <ThemeToggle theme={theme} themeOption={themeOption} onThemeChange={setTheme} onThemeOptionChange={setThemeOption} />
            </Suspense>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode="wait">
                <GameModeRenderer
                  gameMode={gameMode}
                  view={view}
                  speedTestDuration={speedTestDuration}
                  settings={settings}
                  heatmap={heatmap}
                  showHeatmap={showHeatmap}
                  todayChallenge={todayChallenge}
                  customExercises={customExercises}
                  sound={sound}
                  streak={streak.current}
                  onSetGameMode={setGameMode}
                  onSetView={setView}
                  onSetShowHeatmap={setShowHeatmap}
                  onSessionComplete={handleSessionCompleteWithProgress}
                  onKeyInput={updateHeatmap}
                  onSaveCustomExercise={handleSaveCustomExercise}
                  onCompleteChallenge={(_challengeId, wpm, accuracy) => {
                    if (todayChallenge) {
                      completeChallenge(todayChallenge.id, wpm, accuracy)
                      setGameMode('practice')
                      setView('main')
                    }
                  }}
                />
              </AnimatePresence>
            </Suspense>
          </div>

          <div className="space-y-6">
            <ErrorBoundary key="widgets" fallback={<SectionError message={t('error.widgetsFailed', 'Failed to load widgets')} />}>
              <Suspense fallback={<LoadingFallback />}>
                <ClockWidget />
                <MotivationalQuote />
                <MusicControls />
              </Suspense>
            </ErrorBoundary>

            {settings.showStats && (
              <ErrorBoundary key="stats-panel" fallback={<SectionError message={t('error.statsFailed', 'Failed to load statistics')} />}>
                <Suspense fallback={<LoadingFallback />}>
                  <Stats
                    progress={progress}
                    currentStats={currentStats}
                    onViewHistory={() => setView('history')}
                    onViewAchievements={() => setShowAchievements(true)}
                    challengeStats={challengeStats}
                  />
                </Suspense>
              </ErrorBoundary>
            )}

            <ErrorBoundary key="settings-panel" fallback={<SectionError message={t('error.settingsFailed', 'Failed to load settings')} />}>
              <SettingsPanel
                settings={settings}
                onSettingChange={updateSetting}
                onShowStreakRewards={() => setShowStreakRewards(true)}
                streak={streak.current}
              />
            </ErrorBoundary>

            <ErrorBoundary key="export-import" fallback={<SectionError message={t('error.exportImportFailed', 'Failed to load export/import')} />}>
              <div className="glass rounded-xl p-6">
                <ExportImport progress={progress} onImport={handleImportProgress} />
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <ErrorBoundary key="online-status" fallback={null}>
        <Suspense fallback={<LoadingFallback />}>
          <OnlineStatus />
        </Suspense>
      </ErrorBoundary>

      {showOnboarding && (
        <ErrorBoundary key="onboarding" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <Onboarding onComplete={handleOnboardingComplete} />
          </Suspense>
        </ErrorBoundary>
      )}

      {showAchievements && (
        <ErrorBoundary key="achievements" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <AchievementsPanel
              progress={progress}
              stats={{
                maxWpm: progress.bestWpm,
                maxAccuracy: progress.bestAccuracy,
                totalWords: progress.totalWordsTyped,
                totalSessions: history.totalSessions,
                currentStreak: progress.streak,
                perfectSessions: history.sessions.filter(s => s.accuracy >= 100).length,
                duelsPlayed: safeParseInt(() => localStorage.getItem(STORAGE_KEYS.DUELS_PLAYED)),
                tournamentsPlayed: safeParseInt(() => localStorage.getItem(STORAGE_KEYS.TOURNAMENTS_PLAYED)),
                customExercisesCreated: customExercises.length,
                dailyChallengesCompleted: safeParseInt(() => localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES_COMPLETED)),
                gameModesUsed: new Set([gameMode, ...(safeLocalStorageGet(STORAGE_KEYS.USED_GAME_MODES) || '')
                  .split(',')
                  .filter((m): m is string => m.length > 0)]).size,
                level: progress.level,
              }}
              onClose={() => setShowAchievements(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {showSessionSummary && currentStats && (
        <ErrorBoundary key="session-summary" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <SessionSummary
              stats={currentStats}
              xpEarned={lastSessionXp}
              onClose={() => setShowSessionSummary(false)}
              onRetry={() => {
                setShowSessionSummary(false)
                resetToPractice()
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {showStreakRewards && (
        <ErrorBoundary key="streak-rewards" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <StreakRewardsPanel
              currentStreak={streak.current}
              onClose={() => setShowStreakRewards(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {showProfile && (
        <ErrorBoundary key="user-profile" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <UserProfile
              onClose={() => setShowProfile(false)}
              onNavigate={(view) => {
                setShowProfile(false)
                if (view === 'statistics') setView('statistics')
                else if (view === 'history') setView('history')
                else if (view === 'achievements') setShowAchievements(true)
                else if (view === 'goals') setShowGoals(true)
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {showGoals && (
        <ErrorBoundary key="goals" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <GoalsPanel
              onClose={() => setShowGoals(false)}
              currentProgress={{
                wpm: progress.bestWpm,
                accuracy: progress.bestAccuracy,
                totalWords: progress.totalWordsTyped,
                totalSessions: history.totalSessions,
                streak: progress.streak,
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Footer */}
      <Footer />
    </div>
  )
}

interface ModeButtonProps {
  isActive: boolean
  onClick: () => void
  icon: string
  label: string
  title: string
}

const ModeButton = memo<ModeButtonProps>(function ModeButton({
  isActive,
  onClick,
  icon,
  label,
  title,
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
          : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
      }`}
      title={title}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
})

interface SpeedTestDropdownProps {
  isActive: boolean
  duration: SpeedTestDuration
  onDurationChange: (duration: SpeedTestDuration) => void
  onGameModeChange: (mode: 'speedtest') => void
}

const SpeedTestDropdown = memo<SpeedTestDropdownProps>(function SpeedTestDropdown({
  isActive,
  onDurationChange,
  onGameModeChange,
}) {
  const { t } = useAppTranslation()

  const durationLabels: Record<SpeedTestDuration, string> = {
    15: `15 ${t('common.seconds')}`,
    30: `30 ${t('common.seconds')}`,
    60: `60 ${t('common.seconds')}`,
  }

  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!showDropdown) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-speedtest-dropdown]')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showDropdown])

  const durationIcons: Record<SpeedTestDuration, string> = {
    15: '⚡',
    30: '⭐',
    60: '🔥',
  }

  return (
    <div className="relative">
      <button
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
        }`}
        onClick={() => {
          onGameModeChange('speedtest')
          setShowDropdown((prev) => !prev)
        }}
        aria-expanded={showDropdown}
        aria-haspopup="true"
        title={t('tooltip.speedtest')}
      >
        <span className="text-lg">🕐</span>
        <span className="hidden sm:inline">{t('label.test')}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showDropdown && (
        <div data-speedtest-dropdown className="absolute top-full left-0 mt-2 glass p-2 rounded-xl z-50 min-w-[160px] animate-scale-in shadow-xl border border-dark-700/50">
          {Object.entries(durationLabels).map(([key, label]) => {
            const d = Number(key) as SpeedTestDuration
            return (
            <button
              key={d}
              onClick={() => {
                onDurationChange(d)
                setShowDropdown(false)
              }}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center justify-between"
            >
              <span>{label}</span>
              <span className="text-xs text-dark-500">{durationIcons[d]}</span>
            </button>
            )
          })}
        </div>
      )}
    </div>
  )
})

interface SettingsPanelProps {
  settings: UserSettings
  onSettingChange: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
  onShowStreakRewards: () => void
  streak: number
}

const SettingsPanel = memo<SettingsPanelProps>(function SettingsPanel({
  settings,
  onSettingChange,
  onShowStreakRewards,
  streak,
}) {
  const { t } = useAppTranslation()
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{t('misc.settings')}</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="layout-select" className="block text-sm text-dark-400 mb-2">
            {t('misc.keyboard')}
          </label>
          <select
            id="layout-select"
            value={settings.layout}
            onChange={(e) => onSettingChange('layout', e.target.value as KeyboardLayout)}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('misc.keyboard')}
          >
            <option value="jcuken">{t('layout.jcuken')}</option>
            <option value="qwerty">{t('layout.qwerty')}</option>
            <option value="dvorak">{t('layout.dvorak')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="sound-theme-select" className="block text-sm text-dark-400 mb-2">
            {t('misc.sound')}
          </label>
          <select
            id="sound-theme-select"
            value={settings.soundTheme}
            onChange={(e) => onSettingChange('soundTheme', e.target.value as SoundTheme)}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('misc.sound')}
          >
            <option value="default">🔊 {t('misc.theme')}</option>
            <option value="piano">🎹 {t('sound.piano')}</option>
            <option value="mechanical">⌨️ {t('sound.mechanical')}</option>
            <option value="soft">🌸 {t('sound.soft')}</option>
            <option value="retro">👾 {t('sound.retro')}</option>
          </select>
        </div>

        <Toggle
          label={t('misc.sound')}
          checked={settings.soundEnabled}
          onChange={(checked) => onSettingChange('soundEnabled', checked)}
        />

        <Toggle
          label={t('misc.keyboard')}
          checked={settings.showKeyboard}
          onChange={(checked) => onSettingChange('showKeyboard', checked)}
        />

        <button
          onClick={onShowStreakRewards}
          className="w-full py-2 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 hover:from-orange-600/30 hover:to-yellow-600/30 border border-orange-500/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          aria-label={t('notification.streak')}
        >
          <span aria-hidden="true">🔥</span>
          {t('notification.streak')} ({streak} {t('common.days')})
        </button>
      </div>
    </div>
  )
})

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const Toggle = memo<ToggleProps>(function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-dark-400">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onChange(!checked)
          }
        }}
        className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-dark-700'}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
})

function SectionError({ message }: { message: string }) {
  return (
    <div className="glass rounded-xl p-6 text-center" role="alert">
      <p className="text-sm text-dark-400">{message}</p>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <AppContent />
          <ToastContainer />
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
