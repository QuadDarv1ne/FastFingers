/**
 * FastFingers — Главный компонент приложения
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useEffect, useCallback, useMemo, Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import LoadingFallback from './components/LoadingFallback'
import SkipLink from './components/SkipLink'
import AriaAnnouncer from './components/AriaAnnouncer'
import { ToastContainer } from './components/ToastContainer'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import CookieConsentBanner from './components/CookieConsentBanner'
import { Footer } from './components/Footer'
import { GameModeRenderer } from './components/GameModeRenderer'
import { GameModeNavbar } from './components/GameModeNavbar'
import { AppSidebar } from './components/AppSidebar'
import { AppOverlays } from './components/AppOverlays'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from '@hooks/useAuth'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './contexts/ToastContext'
import { useNotifications } from '@hooks/useNotifications'
import { createLevelUpNotification } from '@utils/notifications'
import { triggerConfetti } from '@utils/confetti'
import type { KeyboardSkin } from './types'
import type { CustomExercise } from './components/CustomExerciseEditor'
import { logger } from '@utils/logger'

import { useGameMode } from '@hooks/useGameMode'
import { useUserProgress } from '@hooks/useUserProgress'
import { useAutoSave } from '@hooks/useAutoSave'
import { useCustomExercises } from '@hooks/useCustomExercises'
import { useTypingSound } from '@hooks/useTypingSound'
import { useTypingHistory } from '@hooks/useTypingHistory'
import { useDailyChallenges } from '@hooks/useDailyChallenges'
import { useThemeContext } from '@hooks/useThemeContext'
import { useHotkeys } from '@hooks/useHotkeys'
import { useSessionHandlers } from '@hooks/useSessionHandlers'
import { useModals } from '@hooks/useModals'
import { useAppTranslation } from '@i18n/config'
import { useAchievementStats } from '@hooks/useAchievementStats'
import type { GameMode, View } from '@hooks/useGameMode'

const AuthWrapper = lazy(() => import('./components/auth/AuthWrapper').then((module) => ({ default: module.AuthWrapper })))

function AppContent() {
  const { t } = useAppTranslation()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { addNotification } = useNotifications()

  const {
    showAchievements,
    showSessionSummary,
    showStreakRewards,
    showProfile,
    showGoals,
    showOnboarding,
    activeChallenge,
    lastSessionXp,
    setShowAchievements,
    setShowSessionSummary,
    setShowStreakRewards,
    setShowProfile,
    setShowGoals,
    setActiveChallenge,
    setLastSessionXp,
    handleOnboardingComplete,
  } = useModals()

  const userName = user?.name

  const handleAuthSuccess = useCallback(() => {
    if (userName) {
      addNotification({
        type: 'info',
        title: t('action.welcome'),
        message: `${t('auth.welcomeBack', { name: userName })}`,
        icon: '👋',
      })
    }
  }, [userName, addNotification, t])

  const {
    gameMode,
    view,
    speedTestDuration,
    setGameMode,
    setView,
    setSpeedTestDuration,
    resetToPractice,
  } = useGameMode()

  const handleLevelUp = useCallback((newLevel: number) => {
    addNotification(createLevelUpNotification(newLevel))
    void triggerConfetti({ type: 'levelup', duration: 4000 })
  }, [addNotification])

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
    onLevelUp: handleLevelUp,
  })

  useAutoSave({
    progress,
    currentSession: currentStats,
    heatmap,
    settings,
    onRestore: (data) => {
      if (data.progress) {
        importProgress(data.progress)
      }
      if (data.currentSession) {
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
  const { theme, themeOption, setTheme, setThemeOption } = useThemeContext()

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

  const hotkeyOptions = useMemo(
    () => ({ enabled: !showOnboarding && !showAchievements && !showProfile }),
    [showOnboarding, showAchievements, showProfile]
  )

  const hotkeyShortcuts = useMemo(
    () => ({
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
      'ctrl+n': () => setView('custom-exercise'),
    }),
    [setGameMode, setView, setShowProfile]
  )

  useHotkeys(hotkeyShortcuts, hotkeyOptions)

  useEffect(() => {
    const handleStartChallenge = (e: Event) => {
      const customEvent = e as CustomEvent<{ challenge: { id: string } }>
      setActiveChallenge(customEvent.detail.challenge.id)
      setGameMode('challenge')
    }

    window.addEventListener('startChallenge', handleStartChallenge as EventListener)
    return () => window.removeEventListener('startChallenge', handleStartChallenge as EventListener)
  }, [setGameMode, setActiveChallenge])

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

  const achievementStats = useAchievementStats(
    progress,
    history,
    customExercises.length,
    gameMode,
  )

  const handleProfileClick = useCallback(() => setShowProfile(true), [setShowProfile])
  const handlePracticeClick = useCallback(() => { setGameMode('practice'); setView('main') }, [setGameMode, setView])
  const handleSprintClick = useCallback(() => { setGameMode('sprint'); setView('main') }, [setGameMode, setView])
  const handleHardcoreClick = useCallback(() => { setGameMode('hardcore'); setView('main') }, [setGameMode, setView])
  const handleGameModeClick = useCallback((mode: string) => setGameMode(mode as GameMode), [setGameMode])
  const handleViewClick = useCallback((v: string) => setView(v as View), [setView])
  const handleSkinChange = useCallback((skin: string) => updateSetting('keyboardSkin', skin as KeyboardSkin), [updateSetting])
  const handleViewHistory = useCallback(() => setView('history'), [setView])
  const handleViewAchievements = useCallback(() => setShowAchievements(true), [setShowAchievements])
  const handleShowStreakRewards = useCallback(() => setShowStreakRewards(true), [setShowStreakRewards])
  const handleCloseAchievements = useCallback(() => setShowAchievements(false), [setShowAchievements])
  const handleCloseSessionSummary = useCallback(() => setShowSessionSummary(false), [setShowSessionSummary])
  const handleCloseStreakRewards = useCallback(() => setShowStreakRewards(false), [setShowStreakRewards])
  const handleCloseProfile = useCallback(() => setShowProfile(false), [setShowProfile])
  const handleCloseGoals = useCallback(() => setShowGoals(false), [setShowGoals])
  const handleSessionRetry = useCallback(() => { setShowSessionSummary(false); resetToPractice() }, [setShowSessionSummary, resetToPractice])
  const handleCompleteChallenge = useCallback(
    (_challengeId: string, wpm: number, accuracy: number) => {
      if (todayChallenge) {
        completeChallenge(todayChallenge.id, wpm, accuracy)
        setGameMode('practice')
        setView('main')
      }
    },
    [todayChallenge, completeChallenge, setGameMode, setView]
  )
  const handleNavigate = useCallback((v: string) => {
    setShowProfile(false)
    if (v === 'statistics') setView('statistics')
    else if (v === 'history') setView('history')
    else if (v === 'achievements') setShowAchievements(true)
    else if (v === 'goals') setShowGoals(true)
  }, [setView, setShowAchievements, setShowGoals, setShowProfile])

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
        onProfileClick={handleProfileClick}
      />

      <main id="main-content" className="container mx-auto px-4 py-6 max-w-6xl" role="main">
        <div className="flex flex-col gap-3 mb-6">
          <GameModeNavbar
            gameMode={gameMode}
            view={view}
            speedTestDuration={speedTestDuration}
            userRole={user?.role}
            keyboardSkin={settings.keyboardSkin}
            theme={theme}
            themeOption={themeOption}
            onPracticeClick={handlePracticeClick}
            onSprintClick={handleSprintClick}
            onHardcoreClick={handleHardcoreClick}
            onGameModeClick={handleGameModeClick}
            onViewClick={handleViewClick}
            onSpeedTestDurationChange={setSpeedTestDuration}
            onGameModeChange={setGameMode}
            onSkinChange={handleSkinChange}
            onThemeChange={setTheme}
            onThemeOptionChange={setThemeOption}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode="wait">
                <GameModeRenderer
                  key={gameMode}
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
                  onCompleteChallenge={handleCompleteChallenge}
                />
              </AnimatePresence>
            </Suspense>
          </div>

          <AppSidebar
            settings={settings}
            currentStats={currentStats}
            progress={progress}
            challengeStats={challengeStats}
            streak={streak.current}
            onSettingChange={updateSetting}
            onViewHistory={handleViewHistory}
            onViewAchievements={handleViewAchievements}
            onShowStreakRewards={handleShowStreakRewards}
          />
        </div>
      </main>

      <AppOverlays
        showOnboarding={showOnboarding}
        showAchievements={showAchievements}
        showSessionSummary={showSessionSummary}
        showStreakRewards={showStreakRewards}
        showProfile={showProfile}
        showGoals={showGoals}
        achievementStats={achievementStats}
        currentStats={currentStats}
        lastSessionXp={lastSessionXp}
        streakCurrent={streak.current}
        totalSessions={history.totalSessions}
        progress={progress}
        onOnboardingComplete={handleOnboardingComplete}
        onCloseAchievements={handleCloseAchievements}
        onCloseSessionSummary={handleCloseSessionSummary}
        onCloseStreakRewards={handleCloseStreakRewards}
        onCloseProfile={handleCloseProfile}
        onCloseGoals={handleCloseGoals}
        onSessionRetry={handleSessionRetry}
        onNavigate={handleNavigate}
      />

      <PWAInstallPrompt />
      <CookieConsentBanner />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <AppContent />
            <ToastContainer />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
