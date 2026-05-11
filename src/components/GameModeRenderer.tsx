/**
 * GameModeRenderer — рендеринг игровых режимов и представлений
 * Вынесен из App.tsx для уменьшения его размера
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { type ReactNode, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { TypingTrainer } from './TypingTrainer'
import { Keyboard } from './Keyboard'
import type { GameMode, View, SpeedTestDuration } from '../hooks/useGameMode'
import type { UserSettings, TypingStats, KeyHeatmapData, Exercise } from '../types'
import type { CustomExercise } from './CustomExerciseEditor'

const MODE_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
}

function ModeMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div {...MODE_ANIMATION}>{children}</motion.div>
  )
}

const LazyFallback = () => <div className="p-8 text-center">Loading...</div>

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sound: any
  streak: number
  // Callbacks
  onSetGameMode: (mode: GameMode) => void
  onSetView: (view: View) => void
  _onSetSpeedTestDuration: (duration: SpeedTestDuration) => void
  onSetShowHeatmap: (show: boolean) => void
  onSessionComplete: (stats: TypingStats) => void
  onKeyInput: (char: string, isCorrect: boolean) => void
  onSaveCustomExercise: (exercise: CustomExercise) => void
  onCompleteChallenge: () => void
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
  _onSetSpeedTestDuration: __onSetSpeedTestDuration,
}: GameModeRendererProps) {
  // Views
  if (view === 'history') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><TrainingHistory onBack={() => onSetView('main')} /></Suspense></ModeMotion>
  }
  if (view === 'custom-exercise') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><CustomExerciseEditor onSave={onSaveCustomExercise} onClose={() => onSetView('main')} /></Suspense></ModeMotion>
  }
  if (view === 'tips') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><TypingTips /></Suspense></ModeMotion>
  }
  if (view === 'weekly') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><WeeklyProgress /></Suspense></ModeMotion>
  }
  if (view === 'statistics') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><StatisticsPage onBack={() => onSetView('main')} /></Suspense></ModeMotion>
  }
  if (view === 'learning') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><LearningMode onBack={() => onSetView('main')} onClose={() => onSetView('main')} onStartLesson={() => {}} /></Suspense></ModeMotion>
  }

  // Game modes
  const exitToPractice = () => { onSetGameMode('practice'); onSetView('main') }

  if (gameMode === 'reaction') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><ReactionGame onExit={exitToPractice} onComplete={onCompleteChallenge} /></Suspense></ModeMotion>
  }
  if (gameMode === 'duel') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><DuelMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></ModeMotion>
  }
  if (gameMode === 'code') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><CodeMode onExit={exitToPractice} onComplete={onSessionComplete} /></Suspense></ModeMotion>
  }
  if (gameMode === 'marathon') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><MarathonMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></ModeMotion>
  }
  if (gameMode === 'tournament') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><TournamentMode onExit={exitToPractice} /></Suspense></ModeMotion>
  }
  if (gameMode === 'sprint') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><SprintMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></ModeMotion>
  }
  if (gameMode === 'hardcore') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><HardcoreMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></ModeMotion>
  }
  if (gameMode === 'speedtest') {
    return <ModeMotion><Suspense fallback={<LazyFallback/>}><SpeedTest duration={speedTestDuration} onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></ModeMotion>
  }

  // Default: practice mode
  return (
    <ModeMotion>
      {todayChallenge && gameMode !== 'challenge' && (
        <Suspense fallback={<LazyFallback/>}>
          <DailyChallengeCardLazy
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
            streak={streak}
            onComplete={onCompleteChallenge}
          />
        </Suspense>
      )}

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
          heatmap={heatmap}
          showHeatmap={showHeatmap}
          onToggleHeatmap={onSetShowHeatmap}
          skin={settings.keyboardSkin}
        />
      )}
    </ModeMotion>
  )
}
