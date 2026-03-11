import { useEffect, useCallback, Suspense, memo, useState, lazy } from 'react'
import { TypingTrainer } from './components/TypingTrainer'
import { Header } from './components/Header'
import { Keyboard } from './components/Keyboard'
import { LoadingFallback } from './components/LoadingFallback'
import { SkipLink } from './components/SkipLink'
import { AriaAnnouncer } from './components/AriaAnnouncer'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from '@hooks/useAuth'
import { NotificationProvider } from './contexts/NotificationContext'
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

import { useGameMode, type SpeedTestDuration } from './hooks/useGameMode'
import { useUserProgress } from './hooks/useUserProgress'
import { useCustomExercises } from './hooks/useCustomExercises'
import { useTypingSound } from './hooks/useTypingSound'
import { useTypingHistory } from './hooks/useTypingHistory'
import { useDailyChallenges } from './hooks/useDailyChallenges'
import { useTheme } from './hooks/useTheme'
import { useHotkeys } from './hooks/useHotkeys'
import { useSessionHandlers } from '@hooks/useSessionHandlers'
import { useAppTranslation } from './i18n/config'

const SprintMode = lazy(() => import('./components/SprintMode').then((module) => ({ default: module.SprintMode })))
const SpeedTest = lazy(() => import('./components/SpeedTest').then((module) => ({ default: module.SpeedTest })))
const ReactionGame = lazy(() => import('./components/ReactionGame').then((module) => ({ default: module.ReactionGame })))
const HardcoreMode = lazy(() => import('./components/HardcoreMode').then((module) => ({ default: module.HardcoreMode })))
const TrainingHistory = lazy(() => import('./components/TrainingHistory').then((module) => ({ default: module.TrainingHistory })))
const WeeklyProgress = lazy(() => import('./components/WeeklyProgress').then((module) => ({ default: module.WeeklyProgress })))
const DailyChallengeCard = lazy(() => import('./components/DailyChallengeCard').then((module) => ({ default: module.DailyChallengeCard })))
const CustomExerciseEditor = lazy(() => import('./components/CustomExerciseEditor').then((module) => ({ default: module.CustomExerciseEditor })))
const ExportImport = lazy(() => import('./components/ExportImport').then((module) => ({ default: module.ExportImport })))
const TypingTips = lazy(() => import('./components/TypingTips').then((module) => ({ default: module.TypingTips })))
const Onboarding = lazy(() => import('./components/Onboarding').then((module) => ({ default: module.Onboarding })))
const AchievementsPanel = lazy(() => import('./components/AchievementsPanel').then((module) => ({ default: module.AchievementsPanel })))
const StreakRewardsPanel = lazy(() => import('./components/StreakRewardsPanel').then((module) => ({ default: module.StreakRewardsPanel })))
const SessionSummary = lazy(() => import('./components/SessionSummary').then((module) => ({ default: module.SessionSummary })))
const StatisticsPage = lazy(() => import('./components/StatisticsPage').then((module) => ({ default: module.StatisticsPage })))
const LearningMode = lazy(() => import('./components/LearningMode').then((module) => ({ default: module.LearningMode })))
const AuthWrapper = lazy(() => import('./components/auth/AuthWrapper').then((module) => ({ default: module.AuthWrapper })))
const UserProfile = lazy(() => import('./components/auth/UserProfile').then((module) => ({ default: module.UserProfile })))
const NotificationPanel = lazy(() => import('./components/NotificationPanel').then((module) => ({ default: module.NotificationPanel })))
const Stats = lazy(() => import('./components/Stats').then((module) => ({ default: module.Stats })))
const ThemeToggle = lazy(() => import('./components/ThemeToggle').then((module) => ({ default: module.ThemeToggle })))
const KeyboardSkinSelector = lazy(() => import('./components/KeyboardSkinSelector').then((module) => ({ default: module.KeyboardSkinSelector })))
const MusicControls = lazy(() => import('./components/MusicControls').then((module) => ({ default: module.MusicControls })))
const ClockWidget = lazy(() => import('./components/ClockWidget').then((module) => ({ default: module.ClockWidget })))
const MotivationalQuote = lazy(() => import('./components/MotivationalQuote').then((module) => ({ default: module.MotivationalQuote })))
const OnlineStatus = lazy(() => import('./components/OnlineStatus').then((module) => ({ default: module.OnlineStatus })))

function AppContent() {
  const { t } = useAppTranslation()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()

  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [showStreakRewards, setShowStreakRewards] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [lastSessionXp, setLastSessionXp] = useState(0)
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const seen = localStorage.getItem('fastfingers_onboarding_seen')
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
    setProgress,
  } = useUserProgress({
    onLevelUp: (newLevel) => {
      addNotification(createLevelUpNotification(newLevel))
      triggerConfetti({ type: 'levelup', duration: 4000 })
    },
  })

  const { customExercises, addExercise } = useCustomExercises()

  const sound = useTypingSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  })

  const { addSession } = useTypingHistory()
  const { todayChallenge, streak, stats: challengeStats, completeChallenge } = useDailyChallenges()
  const { theme, setTheme } = useTheme()

  const { handleSessionCompleteWithProgress, handleReactionGameComplete } = useSessionHandlers({
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
    { enabled: !showOnboarding && !showAchievements && !showNotificationPanel && !showProfile }
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
    localStorage.setItem('fastfingers_onboarding_seen', 'true')
    setShowOnboarding(false)
  }, [])

  const handleSaveCustomExercise = useCallback(
    (exercise: CustomExercise) => {
      addExercise({
        ...exercise,
        description: 'Пользовательское упражнение',
        focusKeys: [],
      })
      setView('main')
      setGameMode('practice')
    },
    [addExercise, setView, setGameMode]
  )

  const handleImportProgress = useCallback(
    (data: { progress: UserProgress }) => {
      setProgress(data.progress)
    },
    [setProgress]
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
      <Suspense fallback={<LoadingFallback />}>
        <AuthWrapper onSuccess={() => {}} />
      </Suspense>
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
        onNotificationsClick={() => setShowNotificationPanel(true)}
      />

      {showNotificationPanel && (
        <Suspense fallback={<LoadingFallback />}>
          <NotificationPanel onClose={() => setShowNotificationPanel(false)} />
        </Suspense>
      )}

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl" role="main">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <nav className="card p-2 inline-flex flex-wrap gap-1" aria-label={t('stats.history')}>
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
              title="60 секунд на максимальную скорость"
            />
            <ModeButton
              isActive={gameMode === 'hardcore'}
              onClick={() => {
                setGameMode('hardcore')
                setView('main')
              }}
              icon="💀"
              label={t('mode.hardcore')}
              title="Режим без ошибок - любая ошибка завершает сессию"
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
          </nav>

          <div className="flex items-center gap-2">
            <Suspense fallback={<LoadingFallback />}>
              <KeyboardSkinSelector
                skin={settings.keyboardSkin}
                onSkinChange={(skin) => updateSetting('keyboardSkin', skin)}
              />
              <ThemeToggle theme={theme} onThemeChange={setTheme} />
            </Suspense>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              {view === 'history' ? (
                <TrainingHistory onBack={() => setView('main')} />
              ) : view === 'custom-exercise' ? (
                <CustomExerciseEditor
                  onSave={handleSaveCustomExercise}
                  onClose={() => setView('main')}
                />
              ) : view === 'tips' ? (
                <TypingTips />
              ) : view === 'weekly' ? (
                <WeeklyProgress />
              ) : gameMode === 'reaction' ? (
                <ReactionGame
                  onExit={() => setGameMode('practice')}
                  onComplete={handleReactionGameComplete}
                />
              ) : view === 'statistics' ? (
                <StatisticsPage onBack={() => setView('main')} />
              ) : view === 'learning' ? (
                <LearningMode
                  onBack={() => setView('main')}
                  onClose={() => setView('main')}
                  onStartLesson={() => {}}
                />
              ) : gameMode === 'sprint' ? (
                <SprintMode
                  onExit={() => setGameMode('practice')}
                  onComplete={handleSessionCompleteWithProgress}
                  sound={sound}
                />
              ) : gameMode === 'hardcore' ? (
                <HardcoreMode
                  onExit={() => setGameMode('practice')}
                  onComplete={handleSessionCompleteWithProgress}
                  sound={sound}
                />
              ) : gameMode === 'speedtest' ? (
                <SpeedTest
                  duration={speedTestDuration}
                  onExit={() => setGameMode('practice')}
                  onComplete={handleSessionCompleteWithProgress}
                  sound={sound}
                />
              ) : (
                <>
                  {todayChallenge && gameMode !== 'challenge' && (
                    <DailyChallengeCard
                      challenge={{
                        id: todayChallenge.id,
                        date: todayChallenge.date,
                        title: 'Челлендж дня',
                        description: todayChallenge.text,
                        goal: { type: 'wpm' as const, target: 60, unit: 'WPM' },
                        reward: { points: 100, badge: '🏆' },
                        difficulty: 'medium' as const,
                        completed: todayChallenge.completed,
                        progress: 0,
                      }}
                      streak={streak.current}
                      onComplete={completeChallenge}
                    />
                  )}

                  <TypingTrainer
                    layout={settings.layout}
                    onSessionComplete={handleSessionCompleteWithProgress}
                    onKeyInput={updateHeatmap}
                    sound={sound}
                    customExercises={customExercises}
                    isChallenge={gameMode === 'challenge'}
                    challengeText={
                      gameMode === 'challenge' && todayChallenge ? todayChallenge.text : undefined
                    }
                  />

                  {settings.showKeyboard && (
                    <Keyboard
                      layout={settings.layout}
                      highlightKey={null}
                      heatmap={heatmap}
                      showHeatmap={showHeatmap}
                      onToggleHeatmap={setShowHeatmap}
                      skin={settings.keyboardSkin}
                    />
                  )}
                </>
              )}
            </Suspense>
          </div>

          <div className="space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <ClockWidget />
              <MotivationalQuote />
              <MusicControls />
            </Suspense>

            {settings.showStats && (
              <Suspense fallback={<LoadingFallback />}>
                <Stats
                  progress={progress}
                  currentStats={currentStats}
                  onViewHistory={() => setView('history')}
                  onViewAchievements={() => setShowAchievements(true)}
                  challengeStats={challengeStats}
                />
              </Suspense>
            )}

            <SettingsPanel
              settings={settings}
              onSettingChange={updateSetting}
              onShowStreakRewards={() => setShowStreakRewards(true)}
              streak={streak.current}
            />

            <div className="glass rounded-xl p-6">
              <ExportImport progress={progress} onImport={handleImportProgress} />
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-dark-400 text-sm" role="contentinfo">
        <p>{t('misc.footer')}</p>
      </footer>

      <Suspense fallback={<LoadingFallback />}>
        <OnlineStatus />
      </Suspense>

      {showOnboarding && (
        <Suspense fallback={<LoadingFallback />}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </Suspense>
      )}

      {showAchievements && (
        <Suspense fallback={<LoadingFallback />}>
          <AchievementsPanel
            progress={progress}
            stats={{
              maxWpm: progress.bestWpm,
              maxAccuracy: progress.bestAccuracy,
              totalWords: progress.totalWordsTyped,
              totalSessions: 0,
              currentStreak: progress.streak,
              perfectSessions: 0,
            }}
            onClose={() => setShowAchievements(false)}
          />
        </Suspense>
      )}

      {showSessionSummary && currentStats && (
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
      )}

      {showStreakRewards && (
        <Suspense fallback={<LoadingFallback />}>
          <StreakRewardsPanel
            currentStreak={streak.current}
            onClose={() => setShowStreakRewards(false)}
          />
        </Suspense>
      )}

      {showProfile && (
        <Suspense fallback={<LoadingFallback />}>
          <UserProfile onClose={() => setShowProfile(false)} />
        </Suspense>
      )}
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
  const durationLabels: Record<SpeedTestDuration, string> = {
    15: '15 секунд',
    30: '30 секунд',
    60: '60 секунд',
  }

  const durationIcons: Record<SpeedTestDuration, string> = {
    15: '⚡',
    30: '⭐',
    60: '🔥',
  }

  return (
    <div className="relative group">
      <button
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
        }`}
        onClick={() => onGameModeChange('speedtest')}
        title="Тест скорости печати"
      >
        <span className="text-lg">🕐</span>
        <span className="hidden sm:inline">Тест</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute top-full left-0 mt-2 card p-2 hidden group-hover:block z-10 min-w-[160px] animate-scale-in">
        {(Object.keys(durationLabels) as unknown as SpeedTestDuration[]).map((d) => (
          <button
            key={d}
            onClick={() => onDurationChange(d)}
            className="w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center justify-between"
          >
            <span>{durationLabels[d]}</span>
            <span className="text-xs text-dark-500">{durationIcons[d]}</span>
          </button>
        ))}
      </div>
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
            <option value="jcuken">ЙЦУКЕН</option>
            <option value="qwerty">QWERTY</option>
            <option value="dvorak">Dvorak</option>
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
            <option value="piano">🎹 Пианино</option>
            <option value="mechanical">⌨️ Механическая</option>
            <option value="soft">🌸 Мягкий</option>
            <option value="retro">👾 Ретро</option>
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
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-dark-700'}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
})

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
