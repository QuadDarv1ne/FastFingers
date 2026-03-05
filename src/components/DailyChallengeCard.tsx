import { useState, useEffect, useMemo } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'

export interface DailyChallenge {
  id: string
  date: string
  title: string
  description: string
  goal: {
    type: 'wpm' | 'accuracy' | 'words' | 'time' | 'combo'
    target: number
    unit: string
  }
  reward: {
    points: number
    badge?: string
  }
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
  progress: number
}

interface ChallengeProgress {
  [challengeId: string]: {
    completed: boolean
    progress: number
    completedAt?: string
  }
}

interface DailyChallengeCardProps {
  challenge: DailyChallenge
  streak: number
  onComplete: (challengeId: string, wpm: number, accuracy: number) => void
}

export function DailyChallengeCard({ challenge: challengeProp, streak, onComplete: _onComplete }: DailyChallengeCardProps) {
  const [progress] = useLocalStorageState<ChallengeProgress>(
    'fastfingers_challenge_progress',
    {}
  )
  const [localChallenge, setLocalChallenge] = useState<DailyChallenge | null>(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (!today) return
    const dailyChallenge = generateDailyChallenge(today)
    const challengeProgress = progress[dailyChallenge?.id] || {
      completed: false,
      progress: 0,
    }

    setLocalChallenge({
      ...dailyChallenge,
      completed: challengeProgress.completed,
      progress: challengeProgress.progress,
    })
  }, [progress])

  // Используем challengeProp если он передан (из App), иначе используем локальное состояние
  const activeChallenge = challengeProp ?? localChallenge

  const target = activeChallenge?.goal?.target ?? 100
  const progressPercent = useMemo(
    () => (activeChallenge ? Math.min((activeChallenge.progress / target) * 100, 100) : 0),
    [activeChallenge, target]
  )

  if (!activeChallenge) return null

  const difficultyColors = {
    easy: 'from-green-600 to-green-500',
    medium: 'from-yellow-600 to-yellow-500',
    hard: 'from-red-600 to-red-500',
  }

  const difficultyLabels = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно',
  }

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-8xl opacity-5 select-none">
        🎯
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">Челлендж дня</h3>
              {activeChallenge.completed && (
                <span className="text-green-400 text-xl">✓</span>
              )}
            </div>
            <p className="text-xs text-dark-400">
              Обновляется каждый день в полночь
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${difficultyColors[activeChallenge.difficulty]}`}
          >
            {difficultyLabels[activeChallenge.difficulty]}
          </span>
        </div>

        {/* Challenge info */}
        <div className="mb-4">
          <h4 className="font-semibold text-white mb-2">{activeChallenge.title}</h4>
          <p className="text-sm text-dark-400">{activeChallenge.description}</p>
        </div>

        {/* Goal */}
        <div className="p-4 bg-dark-800/50 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Цель</span>
            <span className="text-sm font-semibold">
              {activeChallenge.progress} / {activeChallenge.goal.target} {activeChallenge.goal.unit}
            </span>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 bg-gradient-to-r ${difficultyColors[activeChallenge.difficulty]}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-dark-500 text-right mt-1">
            {progressPercent.toFixed(0)}%
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-xl border border-yellow-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-semibold">Награда</p>
              <p className="text-xs text-dark-400">
                {activeChallenge.reward.points} очков опыта
              </p>
            </div>
          </div>
          {activeChallenge.reward.badge && (
            <span className="text-3xl">{activeChallenge.reward.badge}</span>
          )}
        </div>

        {/* Completion message */}
        {activeChallenge.completed && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
            <p className="text-sm text-green-400 font-semibold">
              🎉 Челлендж выполнен!
            </p>
            <p className="text-xs text-dark-400 mt-1">
              Возвращайтесь завтра за новым заданием
            </p>
          </div>
        )}

        {/* Streak info */}
        {streak > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-dark-400">Текущая серия</span>
            <span className="font-semibold text-orange-400">
              🔥 {streak} дн.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function generateDailyChallenge(date: string): DailyChallenge {
  const seed = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const challenges: Omit<DailyChallenge, 'completed' | 'progress'>[] = [
    {
      id: `daily-${date}-speed`,
      date,
      title: 'Скоростная печать',
      description: 'Достигните высокой скорости печати',
      goal: {
        type: 'wpm',
        target: 60 + (seed % 40),
        unit: 'WPM',
      },
      reward: {
        points: 100 + (seed % 50),
        badge: '⚡',
      },
      difficulty: seed % 3 === 0 ? 'hard' : seed % 2 === 0 ? 'medium' : 'easy',
    },
    {
      id: `daily-${date}-accuracy`,
      date,
      title: 'Точность',
      description: 'Напечатайте текст с минимальными ошибками',
      goal: {
        type: 'accuracy',
        target: 95 + (seed % 5),
        unit: '%',
      },
      reward: {
        points: 80 + (seed % 40),
        badge: '🎯',
      },
      difficulty: seed % 3 === 0 ? 'hard' : seed % 2 === 0 ? 'medium' : 'easy',
    },
    {
      id: `daily-${date}-endurance`,
      date,
      title: 'Выносливость',
      description: 'Напечатайте большое количество слов',
      goal: {
        type: 'words',
        target: 50 + (seed % 100),
        unit: 'слов',
      },
      reward: {
        points: 120 + (seed % 60),
        badge: '💪',
      },
      difficulty: seed % 3 === 0 ? 'hard' : seed % 2 === 0 ? 'medium' : 'easy',
    },
  ]

  const selected = challenges[seed % challenges.length]

  if (!selected) {
    return {
      id: 'default',
      date: new Date().toISOString(),
      title: 'Ежедневное испытание',
      description: 'Пройдите испытание дня',
      goal: { type: 'wpm' as const, target: 60, unit: 'WPM' },
      reward: { points: 100, badge: '🏆' },
      difficulty: 'medium' as const,
      completed: false,
      progress: 0,
    } as DailyChallenge
  }

  return {
    ...selected,
    completed: false,
    progress: 0,
  } as DailyChallenge
}
