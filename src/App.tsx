import { useState, useEffect, lazy, Suspense } from 'react'
import { TypingTrainer } from './components/TypingTrainer'
import { Header } from './components/Header'
import { Stats } from './components/Stats'
import { Keyboard } from './components/Keyboard'
import { ThemeToggle } from './components/ThemeToggle'
import { ClockWidget } from './components/ClockWidget'
import { MotivationalQuote } from './components/MotivationalQuote'
import { LoadingFallback } from './components/LoadingFallback'
import { SkipLink } from './components/SkipLink'
import { AriaAnnouncer } from './components/AriaAnnouncer'
import { OnlineStatus } from './components/OnlineStatus'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from '@hooks/useAuth'
import { NotificationProvider } from './contexts/NotificationContext'
import { useNotifications } from '@hooks/useNotifications'
import { createLevelUpNotification } from '@utils/notifications'
import { triggerConfetti } from './utils/confetti'
import { UserProgress, UserSettings, TypingStats as TypingStatsType, KeyHeatmapData } from './types'

// Ленивая загрузка крупных компонентов (с именованным экспортом)
const SprintMode = lazy(() => import('./components/SprintMode').then(module => ({ default: module.SprintMode })))
const SpeedTest = lazy(() => import('./components/SpeedTest').then(module => ({ default: module.SpeedTest })))
const ReactionGame = lazy(() => import('./components/ReactionGame').then(module => ({ default: module.ReactionGame })))
const TrainingHistory = lazy(() => import('./components/TrainingHistory').then(module => ({ default: module.TrainingHistory })))
const WeeklyProgress = lazy(() => import('./components/WeeklyProgress').then(module => ({ default: module.WeeklyProgress })))
const DailyChallengeCard = lazy(() => import('./components/DailyChallengeCard').then(module => ({ default: module.DailyChallengeCard })))
const CustomExerciseEditor = lazy(() => import('./components/CustomExerciseEditor').then(module => ({ default: module.CustomExerciseEditor })))
const ExportImport = lazy(() => import('./components/ExportImport').then(module => ({ default: module.ExportImport })))
const TypingTips = lazy(() => import('./components/TypingTips').then(module => ({ default: module.TypingTips })))
const Onboarding = lazy(() => import('./components/Onboarding').then(module => ({ default: module.Onboarding })))
const AchievementsPanel = lazy(() => import('./components/AchievementsPanel').then(module => ({ default: module.AchievementsPanel })))
const StreakRewardsPanel = lazy(() => import('./components/StreakRewardsPanel').then(module => ({ default: module.StreakRewardsPanel })))
const SessionSummary = lazy(() => import('./components/SessionSummary').then(module => ({ default: module.SessionSummary })))
const StatisticsPage = lazy(() => import('./components/StatisticsPage').then(module => ({ default: module.StatisticsPage })))
const LearningMode = lazy(() => import('./components/LearningMode').then(module => ({ default: module.LearningMode })))
const AuthWrapper = lazy(() => import('./components/auth/AuthWrapper').then(module => ({ default: module.AuthWrapper })))
const UserProfile = lazy(() => import('./components/auth/UserProfile').then(module => ({ default: module.UserProfile })))
const NotificationBell = lazy(() => import('./components/NotificationBell').then(module => ({ default: module.NotificationBell })))
const NotificationPanel = lazy(() => import('./components/NotificationBell').then(module => ({ default: module.NotificationPanel })))
import { useTypingSound } from './hooks/useTypingSound'
import { useTypingHistory } from './hooks/useTypingHistory'
import { useDailyChallenges } from './hooks/useDailyChallenges'
import { useTheme } from './hooks/useTheme'
import { useHotkeys } from './hooks/useHotkeys'
import { calculateSessionXp } from './utils/stats'
import { calculateStreakXpBonus } from '@utils/streakBonus'
import { Exercise } from './types'
import { SoundTheme } from './utils/soundThemes'

type GameMode = 'practice' | 'sprint' | 'challenge' | 'speedtest' | 'reaction'
type View = 'main' | 'history' | 'custom-exercise' | 'tips' | 'weekly' | 'statistics' | 'learning'
type SpeedTestDuration = 15 | 30 | 60

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()
  
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    layout: 'jcuken',
    soundEnabled: true,
    soundVolume: 0.5,
    soundTheme: 'default',
    fontSize: 'medium',
    theme: 'dark',
    showKeyboard: true,
    showStats: true,
  })

  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmap, setHeatmap] = useState<KeyHeatmapData>({})
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [view, setView] = useState<View>('main')
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [speedTestDuration, setSpeedTestDuration] = useState<SpeedTestDuration>(30)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [showStreakRewards, setShowStreakRewards] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [lastSessionXp, setLastSessionXp] = useState(0)

  const [progress, setProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalWordsTyped: 0,
    totalPracticeTime: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    streak: 0,
    lastPracticeDate: null,
  })

  const [currentStats, setCurrentStats] = useState<TypingStatsType | null>(null)
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)

  // Онбординг для новых пользователей
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const seen = localStorage.getItem('fastfingers_onboarding_seen')
      return !seen
    } catch {
      return true
    }
  })

  const handleOnboardingComplete = () => {
    localStorage.setItem('fastfingers_onboarding_seen', 'true')
    setShowOnboarding(false)
  }

  // Хуки должны быть вызваны до любых ранних return
  const sound = useTypingSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme
  })
  const { addSession } = useTypingHistory()
  const { todayChallenge, streak, stats: challengeStats, completeChallenge } = useDailyChallenges()
  const { theme, setTheme } = useTheme()

  // Горячие клавиши
  useHotkeys({
    'ctrl+1': () => { setGameMode('practice'); setView('main') },
    'ctrl+2': () => { setGameMode('sprint'); setView('main') },
    'ctrl+3': () => setView('statistics'),
    'ctrl+4': () => setView('learning'),
    'ctrl+5': () => setView('tips'),
    'ctrl+p': () => setShowProfile(true),
    'ctrl+n': () => {
      const button = document.querySelector('[data-action="new-exercise"]') as HTMLElement
      button?.click()
    },
  }, { enabled: !showOnboarding && !showAchievements && !showNotificationPanel && !showProfile })

  // Обработка начала челленджа
  useEffect(() => {
    const handleStartChallenge = (e: Event) => {
      const customEvent = e as CustomEvent<{ challenge: { id: string } }>
      setActiveChallenge(customEvent.detail.challenge.id)
      setGameMode('challenge')
    }

    window.addEventListener('startChallenge', handleStartChallenge as EventListener)
    return () => window.removeEventListener('startChallenge', handleStartChallenge as EventListener)
  }, [])

  // Показываем экран загрузки во время проверки аутентификации
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p className="text-dark-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Показываем экран аутентификации если пользователь не авторизован
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AuthWrapper onSuccess={() => {}} />
      </Suspense>
    )
  }

  const handleSessionComplete = (stats: TypingStatsType) => {
    setCurrentStats(stats)
    sound.playComplete()

    const xp = calculateSessionXp(stats)
    const streakBonus = calculateStreakXpBonus(streak.current)
    const totalXp = xp + streakBonus
    setLastSessionXp(totalXp)

    addSession(stats, totalXp)

    // Завершение челленджа если активен
    if (activeChallenge && todayChallenge) {
      completeChallenge(activeChallenge, stats.wpm, stats.accuracy)
      setActiveChallenge(null)
    }

    // Обновление прогресса
    setProgress(prev => {
      const newXp = prev.xp + totalXp
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1
      const prevLevel = Math.floor(Math.sqrt(prev.xp / 100)) + 1
      
      // Уведомление о повышении уровня
      if (newLevel > prevLevel) {
        addNotification(createLevelUpNotification(newLevel))
        triggerConfetti({ type: 'levelup', duration: 4000 })
      }
      
      // Показываем сводку сессии
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
  }

  const handleReactionGameComplete = (score: number, accuracy: number) => {
    const xp = Math.floor(score / 5) + Math.floor(accuracy / 10)
    setLastSessionXp(xp)
    
    setProgress(prev => {
      const newXp = prev.xp + xp
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1
      
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: Math.pow(newLevel + 1, 2) * 100,
      }
    })
  }

  const handleKeyInput = (key: string, isCorrect: boolean) => {
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
  }

  const handleSaveCustomExercise = (exercise: Exercise) => {
    setCustomExercises(prev => [...prev, exercise])
    setView('main')
    setGameMode('practice')
  }

  const handleImportProgress = (data: { progress: UserProgress }) => {
    setProgress(data.progress)
  }

  return (
    <div className="min-h-screen bg-dark-900 transition-colors duration-300">
      {/* Accessibility: Skip Links */}
      <SkipLink />

      {/* Accessibility: ARIA Announcer */}
      <AriaAnnouncer />

      <Header
        level={progress.level}
        xp={progress.xp}
        xpToNextLevel={progress.xpToNextLevel}
        onProfileClick={() => setShowProfile(true)}
      />

      {/* Колокольчик уведомлений */}
      <div className="fixed top-4 right-4 z-40">
        <Suspense fallback={null}>
          <NotificationBell onOpenPanel={() => setShowNotificationPanel(true)} />
        </Suspense>
      </div>

      {/* Панель уведомлений */}
      {showNotificationPanel && (
        <Suspense fallback={<LoadingFallback />}>
          <NotificationPanel onClose={() => setShowNotificationPanel(false)} />
        </Suspense>
      )}

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl" role="main">
        {/* Верхняя панель */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Переключатель режимов */}
          <nav className="card p-2 inline-flex flex-wrap gap-1" aria-label="Режимы тренировки">
            <button
              onClick={() => { setGameMode('practice'); setView('main') }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                gameMode === 'practice' && view === 'main'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="Свободная практика печати"
            >
              <span className="text-lg">📝</span>
              <span className="hidden sm:inline">Практика</span>
            </button>
            <button
              onClick={() => { setGameMode('sprint'); setView('main') }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                gameMode === 'sprint'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="60 секунд на максимальную скорость"
            >
              <span className="text-lg">⚡</span>
              <span className="hidden sm:inline">Спринт</span>
            </button>
            <div className="relative group">
              <button
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  gameMode === 'speedtest'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                }`}
                onClick={() => setGameMode('speedtest')}
                title="Тест скорости печати"
              >
                <span className="text-lg">🕐</span>
                <span className="hidden sm:inline">Тест</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Выпадающее меню */}
              <div className="absolute top-full left-0 mt-2 card p-2 hidden group-hover:block z-10 min-w-[160px] animate-scale-in">
                <button
                  onClick={() => { setSpeedTestDuration(15); setGameMode('speedtest') }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center justify-between"
                >
                  <span>15 секунд</span>
                  <span className="text-xs text-dark-500">⚡</span>
                </button>
                <button
                  onClick={() => { setSpeedTestDuration(30); setGameMode('speedtest') }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center justify-between"
                >
                  <span>30 секунд</span>
                  <span className="text-xs text-dark-500">⭐</span>
                </button>
                <button
                  onClick={() => { setSpeedTestDuration(60); setGameMode('speedtest') }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center justify-between"
                >
                  <span>60 секунд</span>
                  <span className="text-xs text-dark-500">🔥</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => setView('custom-exercise')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                view === 'custom-exercise'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="Создать своё упражнение"
            >
              <span className="text-lg">✏️</span>
              <span className="hidden sm:inline">Своё</span>
            </button>
            <button
              onClick={() => setView('tips')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                view === 'tips'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="Советы по слепой печати"
            >
              <span className="text-lg">💡</span>
              <span className="hidden sm:inline">Советы</span>
            </button>
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                view === 'weekly'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="Прогресс за неделю"
            >
              <span className="text-lg">📈</span>
              <span className="hidden sm:inline">Неделя</span>
            </button>
            <button
              onClick={() => setView('statistics')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                view === 'statistics'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="Детальная статистика"
            >
              <span className="text-lg">📊</span>
              <span className="hidden sm:inline">Статистика</span>
            </button>
            <button
              onClick={() => setView('learning')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                view === 'learning'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="Режим обучения"
            >
              <span className="text-lg">📚</span>
              <span className="hidden sm:inline">Обучение</span>
            </button>
            <button
              onClick={() => setGameMode('reaction')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                gameMode === 'reaction'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
              title="Игра на реакцию"
            >
              <span className="text-lg">🎮</span>
              <span className="hidden sm:inline">Игра</span>
            </button>
          </nav>

          {/* Переключатель темы */}
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная зона */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              {view === 'history' ? (
                <TrainingHistory onBack={() => setView('main')} />
              ) : view === 'custom-exercise' ? (
                <CustomExerciseEditor
                  onSave={handleSaveCustomExercise}
                  onCancel={() => setView('main')}
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
                <LearningMode onBack={() => setView('main')} />
              ) : gameMode === 'sprint' ? (
                <SprintMode
                  onExit={() => setGameMode('practice')}
                  onComplete={handleSessionComplete}
                  sound={sound}
                />
              ) : gameMode === 'speedtest' ? (
                <SpeedTest
                  duration={speedTestDuration}
                  onExit={() => setGameMode('practice')}
                  onComplete={handleSessionComplete}
                  sound={sound}
                />
              ) : (
                <>
                  {/* Карточка ежедневного челленджа */}
                  {todayChallenge && gameMode !== 'challenge' && (
                    <DailyChallengeCard
                      challenge={todayChallenge}
                      streak={streak}
                      onComplete={completeChallenge}
                    />
                  )}

                  <TypingTrainer
                    layout={settings.layout}
                    fontSize={settings.fontSize}
                    onSessionComplete={handleSessionComplete}
                    onKeyInput={handleKeyInput}
                    sound={sound}
                    customExercises={customExercises}
                    isChallenge={gameMode === 'challenge'}
                    challengeText={gameMode === 'challenge' && todayChallenge ? todayChallenge.text : undefined}
                  />

                  {settings.showKeyboard && (
                    <Keyboard
                      layout={settings.layout}
                      highlightKey={null}
                      heatmap={heatmap}
                      showHeatmap={showHeatmap}
                      onToggleHeatmap={setShowHeatmap}
                    />
                  )}
                </>
              )}
            </Suspense>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Виджет часов */}
            <ClockWidget />

            {/* Мотивационная цитата */}
            <MotivationalQuote />

            {settings.showStats && (
              <Stats
                progress={progress}
                currentStats={currentStats}
                onViewHistory={() => setView('history')}
                onViewAchievements={() => setShowAchievements(true)}
                challengeStats={challengeStats}
              />
            )}

            {/* Настройки */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Настройки</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">
                    Раскладка
                  </label>
                  <select
                    value={settings.layout}
                    onChange={(e) => setSettings({ ...settings, layout: e.target.value as 'qwerty' | 'jcuken' | 'dvorak' })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="jcuken">ЙЦУКЕН</option>
                    <option value="qwerty">QWERTY</option>
                    <option value="dvorak">Dvorak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-dark-400 mb-2">
                    Звуковая тема
                  </label>
                  <select
                    value={settings.soundTheme}
                    onChange={(e) => setSettings({ ...settings, soundTheme: e.target.value as SoundTheme })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="default">🔊 По умолчанию</option>
                    <option value="piano">🎹 Пианино</option>
                    <option value="mechanical">⌨️ Механическая</option>
                    <option value="soft">🌸 Мягкий</option>
                    <option value="retro">👾 Ретро</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-400">Звук</span>
                  <button
                    onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-primary-600' : 'bg-dark-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-400">Клавиатура</span>
                  <button
                    onClick={() => setSettings({ ...settings, showKeyboard: !settings.showKeyboard })}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.showKeyboard ? 'bg-primary-600' : 'bg-dark-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.showKeyboard ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <button
                  onClick={() => setShowStreakRewards(true)}
                  className="w-full py-2 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 hover:from-orange-600/30 hover:to-yellow-600/30 border border-orange-500/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔥</span>
                  Награды за серию ({streak.current} дн.)
                </button>
              </div>
            </div>

            {/* Экспорт/Импорт */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Данные</h3>
              <ExportImport progress={progress} onImport={handleImportProgress} />
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-dark-400 text-sm">
        <p>FastFingers © 2026 — Тренажёр слепой печати</p>
      </footer>

      {/* Индикатор онлайн/офлайн статуса */}
      <OnlineStatus />

      {/* Горячие клавиши */}
      <KeyboardShortcuts />

      {/* Онбординг для новых пользователей */}
      {showOnboarding && (
        <Suspense fallback={<LoadingFallback />}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </Suspense>
      )}

      {/* Панель достижений */}
      {showAchievements && (
        <Suspense fallback={<LoadingFallback />}>
          <AchievementsPanel
            progress={progress}
            onClose={() => setShowAchievements(false)}
          />
        </Suspense>
      )}

      {/* Сводка сессии */}
      {showSessionSummary && currentStats && (
        <Suspense fallback={<LoadingFallback />}>
          <SessionSummary
            stats={currentStats}
            xpEarned={lastSessionXp}
            onClose={() => setShowSessionSummary(false)}
            onRetry={() => {
              setShowSessionSummary(false)
              setGameMode('practice')
            }}
          />
        </Suspense>
      )}

      {/* Награды за серию */}
      {showStreakRewards && (
        <Suspense fallback={<LoadingFallback />}>
          <StreakRewardsPanel
            currentStreak={streak.current}
            onClose={() => setShowStreakRewards(false)}
          />
        </Suspense>
      )}

      {/* Профиль пользователя */}
      {showProfile && (
        <Suspense fallback={<LoadingFallback />}>
          <UserProfile onClose={() => setShowProfile(false)} />
        </Suspense>
      )}
    </div>
  )
}

// Главный компонент App с AuthProvider и NotificationProvider
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
