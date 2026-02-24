import { useState, useEffect } from 'react'
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

export function DailyChallengeCard() {
  const [progress] = useLocalStorageState<ChallengeProgress>(
    'fastfingers_challenge_progress',
    {}
  )
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const dailyChallenge = generateDailyChallenge(today)
    const challengeProgress = progress[dailyChallenge.id] || {
      completed: false,
      progress: 0,
    }

    setChallenge({
      ...dailyChallenge,
      completed: challengeProgress.completed,
      progress: challengeProgress.progress,
    })
  }, [progress])

  if (!challenge) return null

  const progressPercent = Math.min((challenge.progress / challenge.goal.target) * 100, 100)

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
              {challenge.completed && (
                <span className="text-green-400 text-xl">✓</span>
              )}
            </div>
            <p className="text-xs text-dark-400">
              Обновляется каждый день в полночь
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${difficultyColors[challenge.difficulty]}`}
          >
            {difficultyLabels[challenge.difficulty]}
          </span>
        </div>

        {/* Challenge info */}
        <div className="mb-4">
          <h4 className="font-semibold text-white mb-2">{challenge.title}</h4>
          <p className="text-sm text-dark-400">{challenge.description}</p>
        </div>

        {/* Goal */}
        <div className="p-4 bg-dark-800/50 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Цель</span>
            <span className="text-sm font-semibold">
              {challenge.progress} / {challenge.goal.target} {challenge.goal.unit}
            </span>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 bg-gradient-to-r ${difficultyColors[challenge.difficulty]}`}
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
                {challenge.reward.points} очков опыта
              </p>
            </div>
          </div>
          {challenge.reward.badge && (
            <span className="text-3xl">{challenge.reward.badge}</span>
          )}
        </div>

        {/* Completion message */}
        {challenge.completed && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
            <p className="text-sm text-green-400 font-semibold">
              🎉 Челлендж выполнен!
            </p>
            <p className="text-xs text-dark-400 mt-1">
              Возвращайтесь завтра за новым заданием
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function generateDailyChallenge(date: string): DailyChallenge {
  // Use date as seed for consistent daily challenges
  const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0)
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
  }

  const challenges = [
    {
      title: 'Спринтер',
      description: 'Достигните указанной скорости печати',
      type: 'wpm' as const,
      targets: { easy: 30, medium: 50, hard: 70 },
      unit: 'WPM',
      badge: '⚡',
    },
    {
      title: 'Снайпер',
      description: 'Достигните указанной точности',
      type: 'accuracy' as const,
      targets: { easy: 90, medium: 95, hard: 98 },
      unit: '%',
      badge: '🎯',
    },
    {
      title: 'Марафонец',
      description: 'Напечатайте указанное количество слов',
      type: 'words' as const,
      targets: { easy: 200, medium: 500, hard: 1000 },
      unit: 'слов',
      badge: '📝',
    },
    {
      title: 'Выносливость',
      description: 'Тренируйтесь указанное время',
      type: 'time' as const,
      targets: { easy: 10, medium: 20, hard: 30 },
      unit: 'мин',
      badge: '⏱️',
    },
    {
      title: 'Комбо мастер',
      description: 'Достигните указанного комбо',
      type: 'combo' as const,
      targets: { easy: 50, medium: 100, hard: 200 },
      unit: 'подряд',
      badge: '🔥',
    },
  ]

  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard']
  const challengeIndex = random(0, challenges.length - 1)
  const difficultyIndex = random(0, 2)
  const difficulty = difficulties[difficultyIndex]
  const template = challenges[challengeIndex]

  const points = { easy: 50, medium: 100, hard: 200 }

  return {
    id: `challenge-${date}`,
    date,
    title: template.title,
    description: template.description,
    goal: {
      type: template.type,
      target: template.targets[difficulty],
      unit: template.unit,
    },
    reward: {
      points: points[difficulty],
      badge: template.badge,
    },
    difficulty,
    completed: false,
    progress: 0,
  }
}

// Helper to update challenge progress
export function updateChallengeProgress(
  type: DailyChallenge['goal']['type'],
  value: number
) {
  const today = new Date().toISOString().split('T')[0]
  const challengeId = `challenge-${today}`
  
  const progressData = JSON.parse(
    localStorage.getItem('fastfingers_challenge_progress') || '{}'
  )

  const currentProgress = progressData[challengeId] || {
    completed: false,
    progress: 0,
  }

  if (currentProgress.completed) return

  const challenge = generateDailyChallenge(today)
  if (challenge.goal.type !== type) return

  const newProgress = Math.max(currentProgress.progress, value)
  const completed = newProgress >= challenge.goal.target

  progressData[challengeId] = {
    completed,
    progress: newProgress,
    completedAt: completed ? new Date().toISOString() : undefined,
  }

  localStorage.setItem(
    'fastfingers_challenge_progress',
    JSON.stringify(progressData)
  )

  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('challenge-updated'))
}
