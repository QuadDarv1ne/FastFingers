/**
 * GameModeRenderer — рендеринг игровых режимов и представлений
 * Вынесен из App.tsx для уменьшения его размера
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { type ReactNode, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ErrorBoundary } from './ErrorBoundary'
import { useTypingSound } from '../hooks/useTypingSound'
import { useAppTranslation } from '../i18n/config'
import type { GameMode, View, SpeedTestDuration } from '../hooks/useGameMode'
import type { UserSettings, TypingStats, KeyHeatmapData, Exercise } from '../types'
import type { CustomExercise } from './CustomExerciseEditor'

// Lazy-load heavy components only used in practice/default mode
const TypingTrainer = lazy(() => import('./TypingTrainer').then(m => ({ default: m.TypingTrainer })))
const Keyboard = lazy(() => import('./Keyboard').then(m => ({ default: m.Keyboard })))

const ANIMATIONS = {
  // Stats/views — subtle slide up
  stats: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.18 },
  },
  // Game modes — slightly more dramatic
  game: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: { duration: 0.2 },
  },
  // Hardcore — quick snap in
  hardcore: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.15 },
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

const retryBtn = (onRetry?: () => void, retryLabel = 'Try again') =>
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

const SprintMode = lazy(() => import('./SprintMode').then(m => ({ default: m.SprintMode })))
const SpeedTest = lazy(() => import('./SpeedTest').then(m => ({ default: m.SpeedTest })))
const ReactionGame = lazy(() => import('./ReactionGame').then(m => ({ default: m.ReactionGame })))
const HardcoreMode = lazy(() => import('./HardcoreMode').then(m => ({ default: m.HardcoreMode })))
const TrainingHistory = lazy(() => import('./TrainingHistory').then(m => ({ default: m.TrainingHistory })))
const WeeklyProgress = lazy(() => import('./WeeklyProgress').then(m => ({ default: m.WeeklyProgress })))
const DailyChallengeCardLazy = lazy(() => import('./DailyChallengeCard').then(m => ({ default: m.DailyChallengeCard })))
const CustomExerciseEditor = lazy(() => import('./CustomExerciseEditor').then(m => ({ default: m.CustomExerciseEditor })))
const TypingTips = lazy(() => import('./TypingTips').then(m => ({ default: m.TypingTips })))
const LearningMode = lazy(() => import('./LearningMode').then(m => ({ default: m.LearningMode })))
const StatisticsPage = lazy(() => import('./StatisticsPage').then(m => ({ default: m.StatisticsPage })))
const MarathonMode = lazy(() => import('./MarathonMode').then(m => ({ default: m.MarathonMode })))
const CodeMode = lazy(() => import('./CodeMode').then(m => ({ default: m.CodeMode })))
const DuelMode = lazy(() => import('./DuelMode').then(m => ({ default: m.DuelMode })))
const TournamentMode = lazy(() => import('./TournamentMode').then(m => ({ default: m.TournamentMode })))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const StudentAnalyticsPage = lazy(() => import('./admin/StudentAnalyticsPage').then(m => ({ default: m.StudentAnalyticsPage })))

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
  // Views
  if (view === 'history') {
    return (
      <LazyModeRenderer modeKey="history" MotionWrapper={StatsMotion} errorLabel={t('error.historyFailed', 'Failed to load training history')} onRetry={() => onSetView('main')}>
        <TrainingHistory onBack={() => onSetView('main')} />
      </LazyModeRenderer>
    )
  }
  if (view === 'custom-exercise') {
    return (
      <LazyModeRenderer modeKey="custom-exercise" MotionWrapper={StatsMotion} errorLabel={t('error.exerciseEditorFailed', 'Failed to load exercise editor')} onRetry={() => onSetView('main')}>
        <CustomExerciseEditor onSave={onSaveCustomExercise} onClose={() => onSetView('main')} />
      </LazyModeRenderer>
    )
  }
  if (view === 'tips') {
    return (
      <LazyModeRenderer modeKey="tips" MotionWrapper={StatsMotion} errorLabel={t('error.tipsFailed', 'Failed to load tips')} onRetry={() => onSetView('main')}>
        <TypingTips />
      </LazyModeRenderer>
    )
  }
  if (view === 'weekly') {
    return (
      <LazyModeRenderer modeKey="weekly" MotionWrapper={StatsMotion} errorLabel={t('error.weeklyStatsFailed', 'Failed to load weekly statistics')} onRetry={() => onSetView('main')}>
        <WeeklyProgress />
      </LazyModeRenderer>
    )
  }
  if (view === 'statistics') {
    return (
      <LazyModeRenderer modeKey="statistics" MotionWrapper={StatsMotion} errorLabel={t('error.statisticsFailed', 'Failed to load statistics')} onRetry={() => onSetView('main')}>
        <StatisticsPage onBack={() => onSetView('main')} />
      </LazyModeRenderer>
    )
  }
  if (view === 'learning') {
    return (
      <LazyModeRenderer modeKey="learning" MotionWrapper={StatsMotion} errorLabel={t('error.learningFailed', 'Failed to load learning mode')} onRetry={() => onSetView('main')}>
        <LearningMode onBack={() => onSetView('main')} onClose={() => onSetView('main')} onStartLesson={() => {}} />
      </LazyModeRenderer>
    )
  }

  // Game modes
  const exitToPractice = () => { onSetGameMode('practice'); onSetView('main') }

  if (view === 'admin') {
    return (
      <LazyModeRenderer modeKey="admin" MotionWrapper={StatsMotion} errorLabel={t('error.adminFailed', 'Failed to load admin panel')} onRetry={() => onSetView('main')}>
        <AdminDashboard onClose={() => onSetView('main')} onNavigate={(v: string) => onSetView(v as View)} />
      </LazyModeRenderer>
    )
  }

  if (view === 'student-analytics') {
    return (
      <LazyModeRenderer modeKey="student-analytics" MotionWrapper={StatsMotion} errorLabel={t('error.studentAnalyticsFailed', 'Failed to load student analytics')} onRetry={() => onSetView('admin')}>
        <StudentAnalyticsPage onBack={() => onSetView('admin')} />
      </LazyModeRenderer>
    )
  }

  if (gameMode === 'reaction') {
    return (
      <LazyModeRenderer modeKey="reaction" MotionWrapper={GameMotion} errorLabel={t('error.reactionFailed', 'Failed to load reaction game')} onRetry={exitToPractice}>
        <ReactionGame onExit={exitToPractice} onComplete={(wpm, accuracy) => onCompleteChallenge('', wpm, accuracy)} />
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

        <Suspense fallback={<div className="text-center text-dark-400 py-8">Загрузка тренажёра...</div>}>
          <TypingTrainer
            layout={settings.layout}
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
              heatmap={showHeatmap ? heatmap : {}}
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
