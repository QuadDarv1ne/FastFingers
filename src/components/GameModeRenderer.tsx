/**
 * GameModeRenderer — рендеринг игровых режимов и представлений
 * Вынесен из App.tsx для уменьшения его размера
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { type ReactNode, lazy, Suspense, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ErrorBoundary } from './ErrorBoundary'
import { useTypingSound } from '../hooks/useTypingSound'
import { useAppTranslation } from '../i18n/config'
import type { GameMode, View, SpeedTestDuration } from '../hooks/useGameMode'
import type { UserSettings, TypingStats, KeyHeatmapData, Exercise } from '../types'
import type { CustomExercise } from './CustomExerciseEditor'
import { lazyDefault } from '../utils/lazy'

// Lazy-load heavy components only used in practice/default mode
const TypingTrainer = lazyDefault(() => import('./TypingTrainer'), 'TypingTrainer')
const Keyboard = lazyDefault(() => import('./Keyboard'), 'Keyboard')

const ANIMATIONS = {
  stats: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  game: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.03, y: -10 },
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  hardcore: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.96, y: -8 },
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
}

function StatsMotion({ children }: { children: ReactNode }) {
  return <motion.div {...ANIMATIONS.stats}>{children}</motion.div>
}

function GameMotion({ children }: { children: ReactNode }) {
  return <motion.div {...ANIMATIONS.game}>{children}</motion.div>
}

function HardcoreMotion({ children }: { children: ReactNode }) {
  return <motion.div {...ANIMATIONS.hardcore}>{children}</motion.div>
}

const LazyFallback = () => {
  const { t } = useAppTranslation()
  return <div className="p-8 text-center">{t('action.loading')}</div>
}

const retryBtn = (onRetry?: () => void, retryLabel?: string) =>
  onRetry ? (
    <button onClick={onRetry} className="px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">
      {retryLabel}
    </button>
  ) : null

function SectionErrorFallback({ label, onRetry, retryLabel }: { label: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="glass rounded-xl p-8 text-center" role="alert">
      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm text-dark-300 mb-3">{label}</p>
      {retryBtn(onRetry, retryLabel)}
    </div>
  )
}

function LazyModeRenderer({ modeKey, MotionWrapper, errorLabel, onRetry, children }: {
  modeKey: string
  MotionWrapper: typeof StatsMotion | typeof GameMotion | typeof HardcoreMotion
  errorLabel: string
  onRetry: () => void
  children: ReactNode
}) {
  const { t } = useAppTranslation()
  return (
    <ErrorBoundary key={modeKey} onRetry={onRetry} fallback={<SectionErrorFallback label={errorLabel} onRetry={onRetry} retryLabel={t('action.retry', 'Try again')} />}>
      <MotionWrapper><Suspense fallback={<LazyFallback/>}>{children}</Suspense></MotionWrapper>
    </ErrorBoundary>
  )
}

const SprintMode = lazyDefault(() => import('./SprintMode'), 'SprintMode')
const SpeedTest = lazyDefault(() => import('./SpeedTest'), 'SpeedTest')
const ReactionGame = lazyDefault(() => import('./ReactionGame'), 'ReactionGame')
const HardcoreMode = lazyDefault(() => import('./HardcoreMode'), 'HardcoreMode')
const TrainingHistory = lazy(() => import('./TrainingHistory'))
const WeeklyProgress = lazyDefault(() => import('./WeeklyProgress'), 'WeeklyProgress')
const DailyChallengeCardLazy = lazyDefault(() => import('./DailyChallengeCard'), 'DailyChallengeCard')
const CustomExerciseEditor = lazyDefault(() => import('./CustomExerciseEditor'), 'CustomExerciseEditor')
const TypingTips = lazyDefault(() => import('./TypingTips'), 'TypingTips')
const LearningMode = lazyDefault(() => import('./LearningMode'), 'LearningMode')
const StatisticsPage = lazyDefault(() => import('./StatisticsPage'), 'StatisticsPage')
const MarathonMode = lazyDefault(() => import('./MarathonMode'), 'MarathonMode')
const CodeMode = lazyDefault(() => import('./CodeMode'), 'CodeMode')
const DuelMode = lazyDefault(() => import('./DuelMode'), 'DuelMode')
const TournamentMode = lazyDefault(() => import('./TournamentMode'), 'TournamentMode')
const AdminDashboard = lazyDefault(() => import('./admin/AdminDashboard'), 'AdminDashboard')
const StudentAnalyticsPage = lazyDefault(() => import('./admin/StudentAnalyticsPage'), 'StudentAnalyticsPage')

interface DailyChallengeData {
  id: string
  date: string
  text: string
  targetWpm: number
  targetAccuracy: number
  completed: boolean
  xpReward: number
}

interface GameModeRendererProps {
  gameMode: GameMode
  view: View
  speedTestDuration: SpeedTestDuration
  settings: UserSettings
  heatmap: KeyHeatmapData
  showHeatmap: boolean
  todayChallenge: DailyChallengeData | undefined
  customExercises: Exercise[]
  sound: ReturnType<typeof useTypingSound> | undefined
  streak: number
  // Callbacks
  onSetGameMode: (mode: GameMode) => void
  onSetView: (view: View) => void
  onCompleteChallenge: (_challengeId: string, wpm: number, accuracy: number) => void
  onSetShowHeatmap: (show: boolean) => void
  onSessionComplete: (stats: TypingStats) => void
  onKeyInput: (char: string, isCorrect: boolean) => void
  onSaveCustomExercise: (exercise: CustomExercise) => void
}

export function GameModeRenderer({
  gameMode,
  view,
  speedTestDuration,
  settings,
  heatmap,
  showHeatmap,
  todayChallenge,
  customExercises,
  sound,
  streak,
  onSetGameMode,
  onSetView,
  onSetShowHeatmap,
  onSessionComplete,
  onKeyInput,
  onSaveCustomExercise,
  onCompleteChallenge,
}: GameModeRendererProps) {
  const { t } = useAppTranslation()

  const retry = t('action.retry', 'Try again')
  const goToMain = useCallback(() => onSetView('main'), [onSetView])
  const goToAdmin = useCallback(() => onSetView('admin'), [onSetView])
  const exitToPractice = useCallback(() => { onSetGameMode('practice'); onSetView('main') }, [onSetGameMode, onSetView])

  // Views
  if (view === 'history') {
    return (
      <LazyModeRenderer modeKey="history" MotionWrapper={StatsMotion} errorLabel={t('error.historyFailed', 'Failed to load training history')} onRetry={goToMain}>
        <TrainingHistory onBack={goToMain} />
      </LazyModeRenderer>
    )
  }
  if (view === 'custom-exercise') {
    return (
      <LazyModeRenderer modeKey="custom-exercise" MotionWrapper={StatsMotion} errorLabel={t('error.exerciseEditorFailed', 'Failed to load exercise editor')} onRetry={goToMain}>
        <CustomExerciseEditor onSave={onSaveCustomExercise} onClose={goToMain} />
      </LazyModeRenderer>
    )
  }
  if (view === 'tips') {
    return (
      <LazyModeRenderer modeKey="tips" MotionWrapper={StatsMotion} errorLabel={t('error.tipsFailed', 'Failed to load tips')} onRetry={goToMain}>
        <TypingTips />
      </LazyModeRenderer>
    )
  }
  if (view === 'weekly') {
    return (
      <LazyModeRenderer modeKey="weekly" MotionWrapper={StatsMotion} errorLabel={t('error.weeklyStatsFailed', 'Failed to load weekly statistics')} onRetry={goToMain}>
        <WeeklyProgress />
      </LazyModeRenderer>
    )
  }
  if (view === 'statistics') {
    return (
      <LazyModeRenderer modeKey="statistics" MotionWrapper={StatsMotion} errorLabel={t('error.statisticsFailed', 'Failed to load statistics')} onRetry={goToMain}>
        <StatisticsPage onBack={goToMain} />
      </LazyModeRenderer>
    )
  }
  if (view === 'learning') {
    return (
      <LazyModeRenderer modeKey="learning" MotionWrapper={StatsMotion} errorLabel={t('error.learningFailed', 'Failed to load learning mode')} onRetry={goToMain}>
        <LearningMode onClose={goToMain} onStartLesson={goToMain} />
      </LazyModeRenderer>
    )
  }

  // Game modes

  if (view === 'admin') {
    return (
      <LazyModeRenderer modeKey="admin" MotionWrapper={StatsMotion} errorLabel={t('error.adminFailed', 'Failed to load admin panel')} onRetry={goToMain}>
        <AdminDashboard onClose={goToMain} onNavigate={(v: string) => onSetView(v as View)} />
      </LazyModeRenderer>
    )
  }

  if (view === 'student-analytics') {
    return (
      <LazyModeRenderer modeKey="student-analytics" MotionWrapper={StatsMotion} errorLabel={t('error.studentAnalyticsFailed', 'Failed to load student analytics')} onRetry={goToAdmin}>
        <StudentAnalyticsPage onBack={goToAdmin} />
      </LazyModeRenderer>
    )
  }

  if (gameMode === 'reaction') {
    return (
      <LazyModeRenderer modeKey="reaction" MotionWrapper={GameMotion} errorLabel={t('error.reactionFailed', 'Failed to load reaction game')} onRetry={exitToPractice}>
        <ReactionGame onExit={exitToPractice} onComplete={(score: number, accuracy: number) => onCompleteChallenge('', score, accuracy)} />
      </LazyModeRenderer>
    )
  }
  if (gameMode === 'duel') {
    return (
      <LazyModeRenderer modeKey="duel" MotionWrapper={GameMotion} errorLabel={t('error.duelFailed', 'Failed to load duel game')} onRetry={exitToPractice}>
        <DuelMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} />
      </LazyModeRenderer>
    )
  }
  if (gameMode === 'code') {
    return (
      <LazyModeRenderer modeKey="code" MotionWrapper={GameMotion} errorLabel={t('error.codeFailed', 'Failed to load code mode')} onRetry={exitToPractice}>
        <CodeMode onExit={exitToPractice} onComplete={onSessionComplete} />
      </LazyModeRenderer>
    )
  }
  if (gameMode === 'marathon') {
    return (
      <LazyModeRenderer modeKey="marathon" MotionWrapper={GameMotion} errorLabel={t('error.marathonFailed', 'Failed to load marathon mode')} onRetry={exitToPractice}>
        <MarathonMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} />
      </LazyModeRenderer>
    )
  }
  if (gameMode === 'tournament') {
    return (
      <LazyModeRenderer modeKey="tournament" MotionWrapper={GameMotion} errorLabel={t('error.tournamentFailed', 'Failed to load tournament')} onRetry={exitToPractice}>
        <TournamentMode onExit={exitToPractice} />
      </LazyModeRenderer>
    )
  }
  if (gameMode === 'sprint') {
    return (
      <LazyModeRenderer modeKey="sprint" MotionWrapper={GameMotion} errorLabel={t('error.sprintFailed', 'Failed to load sprint mode')} onRetry={exitToPractice}>
        <SprintMode duration={speedTestDuration} onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} />
      </LazyModeRenderer>
    )
  }
  if (gameMode === 'hardcore') {
    return (
      <LazyModeRenderer modeKey="hardcore" MotionWrapper={HardcoreMotion} errorLabel={t('error.hardcoreFailed', 'Failed to load hardcore mode')} onRetry={exitToPractice}>
        <HardcoreMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} />
      </LazyModeRenderer>
    )
  }
  if (gameMode === 'speedtest') {
    return (
      <LazyModeRenderer modeKey="speedtest" MotionWrapper={GameMotion} errorLabel={t('error.speedtestFailed', 'Failed to load speed test')} onRetry={exitToPractice}>
        <SpeedTest duration={speedTestDuration} onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} />
      </LazyModeRenderer>
    )
  }

  // Default: practice mode
  return (
    <ErrorBoundary
      key="practice"
      onRetry={() => { onSetView('main'); onSetGameMode('practice') }}
      fallback={<SectionErrorFallback label={t('error.practiceFailed', 'Failed to load practice')} onRetry={() => { onSetView('main'); onSetGameMode('practice') }} retryLabel={retry} />}
    >
      <GameMotion>
        {todayChallenge && gameMode !== 'challenge' && (
          <Suspense fallback={<LazyFallback/>}>
            <DailyChallengeCardLazy
              challenge={{
                id: todayChallenge.id,
                date: todayChallenge.date,
                title: t('challenge.daily', 'Daily Challenge'),
                description: todayChallenge.text,
                goal: { type: 'wpm' as const, target: 60, unit: 'WPM' },
                reward: { points: 100, badge: '🏆' },
                difficulty: 'medium' as const,
                completed: todayChallenge.completed,
                progress: 0,
              }}
              streak={streak}
              onComplete={onCompleteChallenge}
            />
          </Suspense>
        )}

        <Suspense fallback={<div className="text-center text-dark-400 py-8">{t('action.loading')}</div>}>
          <TypingTrainer
            onSessionComplete={onSessionComplete}
            onKeyInput={onKeyInput}
            sound={sound}
            customExercises={customExercises}
            isChallenge={gameMode === 'challenge'}
            challengeText={gameMode === 'challenge' && todayChallenge ? todayChallenge.text : undefined}
          />

          {settings.showKeyboard && (
            <Keyboard
              layout={settings.layout}
              highlightKey={null}
              heatmap={showHeatmap ? heatmap : undefined}
              showHeatmap={showHeatmap}
              onToggleHeatmap={onSetShowHeatmap}
              skin={settings.keyboardSkin}
            />
          )}
        </Suspense>
      </GameMotion>
    </ErrorBoundary>
  )
}
