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
import { useTypingSound } from '../hooks/useTypingSound'
import type { GameMode, View, SpeedTestDuration } from '../hooks/useGameMode'
import type { UserSettings, TypingStats, KeyHeatmapData, Exercise } from '../types'
import type { CustomExercise } from './CustomExerciseEditor'

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
  // Views
  if (view === 'history') {
    return <StatsMotion><Suspense fallback={<LazyFallback/>}><TrainingHistory onBack={() => onSetView('main')} /></Suspense></StatsMotion>
  }
  if (view === 'custom-exercise') {
    return <StatsMotion><Suspense fallback={<LazyFallback/>}><CustomExerciseEditor onSave={onSaveCustomExercise} onClose={() => onSetView('main')} /></Suspense></StatsMotion>
  }
  if (view === 'tips') {
    return <StatsMotion><Suspense fallback={<LazyFallback/>}><TypingTips /></Suspense></StatsMotion>
  }
  if (view === 'weekly') {
    return <StatsMotion><Suspense fallback={<LazyFallback/>}><WeeklyProgress /></Suspense></StatsMotion>
  }
  if (view === 'statistics') {
    return <StatsMotion><Suspense fallback={<LazyFallback/>}><StatisticsPage onBack={() => onSetView('main')} /></Suspense></StatsMotion>
  }
  if (view === 'learning') {
    return <StatsMotion><Suspense fallback={<LazyFallback/>}><LearningMode onBack={() => onSetView('main')} onClose={() => onSetView('main')} onStartLesson={() => {}} /></Suspense></StatsMotion>
  }

  // Game modes
  const exitToPractice = () => { onSetGameMode('practice'); onSetView('main') }

  if (gameMode === 'reaction') {
    return <GameMotion><Suspense fallback={<LazyFallback/>}><ReactionGame onExit={exitToPractice} onComplete={(wpm, accuracy) => onCompleteChallenge('', wpm, accuracy)} /></Suspense></GameMotion>
  }
  if (gameMode === 'duel') {
    return <GameMotion><Suspense fallback={<LazyFallback/>}><DuelMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></GameMotion>
  }
  if (gameMode === 'code') {
    return <GameMotion><Suspense fallback={<LazyFallback/>}><CodeMode onExit={exitToPractice} onComplete={onSessionComplete} /></Suspense></GameMotion>
  }
  if (gameMode === 'marathon') {
    return <GameMotion><Suspense fallback={<LazyFallback/>}><MarathonMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></GameMotion>
  }
  if (gameMode === 'tournament') {
    return <GameMotion><Suspense fallback={<LazyFallback/>}><TournamentMode onExit={exitToPractice} /></Suspense></GameMotion>
  }
  if (gameMode === 'sprint') {
    return <GameMotion><Suspense fallback={<LazyFallback/>}><SprintMode duration={speedTestDuration} onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></GameMotion>
  }
  if (gameMode === 'hardcore') {
    return <HardcoreMotion><Suspense fallback={<LazyFallback/>}><HardcoreMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></HardcoreMotion>
  }
  if (gameMode === 'speedtest') {
    return <GameMotion><Suspense fallback={<LazyFallback/>}><SpeedTest duration={speedTestDuration} onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></Suspense></GameMotion>
  }

  // Default: practice mode
  return (
    <GameMotion>
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
          heatmap={showHeatmap ? heatmap : {}}
          showHeatmap={showHeatmap}
          onToggleHeatmap={onSetShowHeatmap}
          skin={settings.keyboardSkin}
        />
      )}
    </GameMotion>
  )
}
