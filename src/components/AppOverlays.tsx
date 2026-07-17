import { Suspense, lazy, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import LoadingFallback from './LoadingFallback'
import type { TypingStats, UserProgress } from '../types'

interface AchievementStats {
  maxWpm: number
  maxAccuracy: number
  totalWords: number
  totalSessions: number
  currentStreak: number
  perfectSessions: number
  duelsPlayed: number
  tournamentsPlayed: number
  customExercisesCreated: number
  dailyChallengesCompleted: number
  gameModesUsed: number
  level: number
}

const OnlineStatus = lazy(() => import('./OnlineStatus'))
const Onboarding = lazy(() => import('./Onboarding').then((module) => ({ default: module.Onboarding })))
const AchievementsPanel = lazy(() => import('./AchievementsPanel').then((module) => ({ default: module.AchievementsPanel })))
const SessionSummary = lazy(() => import('./SessionSummary').then((module) => ({ default: module.SessionSummary })))
const StreakRewardsPanel = lazy(() => import('./StreakRewardsPanel').then((module) => ({ default: module.StreakRewardsPanel })))
const UserProfile = lazy(() => import('./auth/UserProfile').then((module) => ({ default: module.UserProfile })))
const GoalsPanel = lazy(() => import('./GoalsPanel').then((module) => ({ default: module.GoalsPanel })))

interface AppOverlaysProps {
  showOnboarding: boolean
  showAchievements: boolean
  showSessionSummary: boolean
  showStreakRewards: boolean
  showProfile: boolean
  showGoals: boolean
  achievementStats: AchievementStats
  currentStats: TypingStats | null
  lastSessionXp: number
  streakCurrent: number
  totalSessions: number
  progress: UserProgress
  onOnboardingComplete: () => void
  onCloseAchievements: () => void
  onCloseSessionSummary: () => void
  onCloseStreakRewards: () => void
  onCloseProfile: () => void
  onCloseGoals: () => void
  onSessionRetry: () => void
  onNavigate: (v: string) => void
}

export function AppOverlays({
  showOnboarding,
  showAchievements,
  showSessionSummary,
  showStreakRewards,
  showProfile,
  showGoals,
  achievementStats,
  currentStats,
  lastSessionXp,
  streakCurrent,
  totalSessions,
  progress,
  onOnboardingComplete,
  onCloseAchievements,
  onCloseSessionSummary,
  onCloseStreakRewards,
  onCloseProfile,
  onCloseGoals,
  onSessionRetry,
  onNavigate,
}: AppOverlaysProps) {
  const goalsProgress = useMemo(() => ({
    wpm: progress.bestWpm,
    accuracy: progress.bestAccuracy,
    totalWords: progress.totalWordsTyped,
    totalSessions,
    streak: progress.streak,
  }), [progress.bestWpm, progress.bestAccuracy, progress.totalWordsTyped, totalSessions, progress.streak])

  return (
    <>
      <ErrorBoundary key="online-status" fallback={null}>
        <Suspense fallback={<LoadingFallback />}>
          <OnlineStatus />
        </Suspense>
      </ErrorBoundary>

      {showOnboarding && (
        <ErrorBoundary key="onboarding" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <Onboarding onComplete={onOnboardingComplete} />
          </Suspense>
        </ErrorBoundary>
      )}

      {showAchievements && (
        <ErrorBoundary key="achievements" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <AchievementsPanel
              stats={achievementStats}
              onClose={onCloseAchievements}
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
              onClose={onCloseSessionSummary}
              onRetry={onSessionRetry}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {showStreakRewards && (
        <ErrorBoundary key="streak-rewards" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <StreakRewardsPanel
              currentStreak={streakCurrent}
              onClose={onCloseStreakRewards}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {showProfile && (
        <ErrorBoundary key="user-profile" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <UserProfile
              onClose={onCloseProfile}
              onNavigate={onNavigate}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {showGoals && (
        <ErrorBoundary key="goals" fallback={null}>
          <Suspense fallback={<LoadingFallback />}>
            <GoalsPanel
              onClose={onCloseGoals}
              currentProgress={goalsProgress}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  )
}
