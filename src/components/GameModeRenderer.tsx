/**
 * GameModeRenderer — рендеринг игровых режимов и представлений
 * Вынесен из App.tsx для уменьшения его размера
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TypingTrainer } from './TypingTrainer'
import { Keyboard } from './Keyboard'
import type { GameMode, View, SpeedTestDuration } from '../hooks/useGameMode'
import type { UserSettings, TypingStats, KeyHeatmapData } from '../types'
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
  customExercises: CustomExercise[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sound: any
  streak: number
  // Callbacks
  onSetGameMode: (mode: GameMode) => void
  onSetView: (view: View) => void
  onSetSpeedTestDuration: (duration: SpeedTestDuration) => void
  onSetShowHeatmap: (show: boolean) => void
  onSessionComplete: (stats: TypingStats) => void
  onKeyInput: (char: string, isCorrect: boolean) => void
  onSaveCustomExercise: (exercise: CustomExercise) => void
  onCompleteChallenge: () => void
}

const SprintMode = /* @__PURE__ */ (() => import('./SprintMode').then((m) => ({ default: m.SprintMode })))()
const SpeedTest = /* @__PURE__ */ (() => import('./SpeedTest').then((m) => ({ default: m.SpeedTest })))()
const ReactionGame = /* @__PURE__ */ (() => import('./ReactionGame').then((m) => ({ default: m.ReactionGame })))()
const HardcoreMode = /* @__PURE__ */ (() => import('./HardcoreMode').then((m) => ({ default: m.HardcoreMode })))()
const TrainingHistory = /* @__PURE__ */ (() => import('./TrainingHistory').then((m) => ({ default: m.TrainingHistory })))()
const WeeklyProgress = /* @__PURE__ */ (() => import('./WeeklyProgress').then((m) => ({ default: m.WeeklyProgress })))()
const DailyChallengeCardLazy = /* @__PURE__ */ (() => import('./DailyChallengeCard').then((m) => ({ default: m.DailyChallengeCard })))()
const CustomExerciseEditor = /* @__PURE__ */ (() => import('./CustomExerciseEditor').then((m) => ({ default: m.CustomExerciseEditor })))()
const TypingTips = /* @__PURE__ */ (() => import('./TypingTips').then((m) => ({ default: m.TypingTips })))()
const LearningMode = /* @__PURE__ */ (() => import('./LearningMode').then((m) => ({ default: m.LearningMode })))()
const StatisticsPage = /* @__PURE__ */ (() => import('./StatisticsPage').then((m) => ({ default: m.StatisticsPage })))()
const MarathonMode = /* @__PURE__ */ (() => import('./MarathonMode').then((m) => ({ default: m.MarathonMode })))()
const CodeMode = /* @__PURE__ */ (() => import('./CodeMode').then((m) => ({ default: m.CodeMode })))()
const DuelMode = /* @__PURE__ */ (() => import('./DuelMode').then((m) => ({ default: m.DuelMode })))()
const TournamentMode = /* @__PURE__ */ (() => import('./TournamentMode').then((m) => ({ default: m.TournamentMode })))()

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
  onSetSpeedTestDuration,
  onSetShowHeatmap,
  onSessionComplete,
  onKeyInput,
  onSaveCustomExercise,
  onCompleteChallenge,
}: GameModeRendererProps) {
  // Views
  if (view === 'history') {
    return <ModeMotion><TrainingHistory onBack={() => onSetView('main')} /></ModeMotion>
  }
  if (view === 'custom-exercise') {
    return <ModeMotion><CustomExerciseEditor onSave={onSaveCustomExercise} onClose={() => onSetView('main')} /></ModeMotion>
  }
  if (view === 'tips') {
    return <ModeMotion><TypingTips /></ModeMotion>
  }
  if (view === 'weekly') {
    return <ModeMotion><WeeklyProgress /></ModeMotion>
  }
  if (view === 'statistics') {
    return <ModeMotion><StatisticsPage onBack={() => onSetView('main')} /></ModeMotion>
  }
  if (view === 'learning') {
    return <ModeMotion><LearningMode onBack={() => onSetView('main')} onClose={() => onSetView('main')} onStartLesson={() => {}} /></ModeMotion>
  }

  // Game modes
  const exitToPractice = () => { onSetGameMode('practice'); onSetView('main') }

  if (gameMode === 'reaction') {
    return <ModeMotion><ReactionGame onExit={exitToPractice} onComplete={onCompleteChallenge} /></ModeMotion>
  }
  if (gameMode === 'duel') {
    return <ModeMotion><DuelMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></ModeMotion>
  }
  if (gameMode === 'code') {
    return <ModeMotion><CodeMode onExit={exitToPractice} onComplete={onSessionComplete} /></ModeMotion>
  }
  if (gameMode === 'marathon') {
    return <ModeMotion><MarathonMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></ModeMotion>
  }
  if (gameMode === 'tournament') {
    return <ModeMotion><TournamentMode onExit={exitToPractice} /></ModeMotion>
  }
  if (gameMode === 'sprint') {
    return <ModeMotion><SprintMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></ModeMotion>
  }
  if (gameMode === 'hardcore') {
    return <ModeMotion><HardcoreMode onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></ModeMotion>
  }
  if (gameMode === 'speedtest') {
    return <ModeMotion><SpeedTest duration={speedTestDuration} onExit={exitToPractice} onComplete={onSessionComplete} sound={sound} /></ModeMotion>
  }

  // Default: practice mode
  return (
    <ModeMotion>
      {todayChallenge && gameMode !== 'challenge' && (
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
