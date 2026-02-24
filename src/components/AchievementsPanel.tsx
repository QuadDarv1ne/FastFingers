import { useMemo } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'speed' | 'accuracy' | 'practice' | 'streak' | 'special'
  requirement: {
    type: 'wpm' | 'accuracy' | 'words' | 'sessions' | 'streak' | 'perfect-session'
    value: number
  }
  unlocked: boolean
  unlockedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementsPanelProps {
  onClose: () => void
  stats: {
    maxWpm: number
    maxAccuracy: number
    totalWords: number
    totalSessions: number
    currentStreak: number
    perfectSessions: number
  }
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Speed achievements
  {
    id: 'speed-10',
    title: 'Первые шаги',
    description: 'Достигните скорости 10 WPM',
    icon: '🐢',
    category: 'speed',
    requirement: { type: 'wpm', value: 10 },
    rarity: 'common',
  },
  {
    id: 'speed-30',
    title: 'Набираю темп',
    description: 'Достигните скорости 30 WPM',
    icon: '🚶',
    category: 'speed',
    requirement: { type: 'wpm', value: 30 },
    rarity: 'common',
  },
  {
    id: 'speed-50',
    title: 'Быстрые пальцы',
    description: 'Достигните скорости 50 WPM',
    icon: '🏃',
    category: 'speed',
    requirement: { type: 'wpm', value: 50 },
    rarity: 'rare',
  },
  {
    id: 'speed-70',
    title: 'Скоростной печатник',
    description: 'Достигните скорости 70 WPM',
    icon: '⚡',
    category: 'speed',
    requirement: { type: 'wpm', value: 70 },
    rarity: 'epic',
  },
  {
    id: 'speed-100',
    title: 'Мастер скорости',
    description: 'Достигните скорости 100 WPM',
    icon: '🚀',
    category: 'speed',
    requirement: { type: 'wpm', value: 100 },
    rarity: 'legendary',
  },

  // Accuracy achievements
  {
    id: 'accuracy-90',
    title: 'Точный стрелок',
    description: 'Достигните точности 90%',
    icon: '🎯',
    category: 'accuracy',
    requirement: { type: 'accuracy', value: 90 },
    rarity: 'common',
  },
  {
    id: 'accuracy-95',
    title: 'Снайпер',
    description: 'Достигните точности 95%',
    icon: '🎖️',
    category: 'accuracy',
    requirement: { type: 'accuracy', value: 95 },
    rarity: 'rare',
  },
  {
    id: 'accuracy-98',
    title: 'Перфекционист',
    description: 'Достигните точности 98%',
    icon: '💎',
    category: 'accuracy',
    requirement: { type: 'accuracy', value: 98 },
    rarity: 'epic',
  },
  {
    id: 'perfect-10',
    title: 'Безупречность',
    description: 'Завершите 10 сессий с точностью 100%',
    icon: '👑',
    category: 'accuracy',
    requirement: { type: 'perfect-session', value: 10 },
    rarity: 'legendary',
  },

  // Practice achievements
  {
    id: 'words-1000',
    title: 'Тысяча слов',
    description: 'Напечатайте 1000 слов',
    icon: '📝',
    category: 'practice',
    requirement: { type: 'words', value: 1000 },
    rarity: 'common',
  },
  {
    id: 'words-10000',
    title: 'Десять тысяч',
    description: 'Напечатайте 10000 слов',
    icon: '📚',
    category: 'practice',
    requirement: { type: 'words', value: 10000 },
    rarity: 'rare',
  },
  {
    id: 'words-50000',
    title: 'Писатель',
    description: 'Напечатайте 50000 слов',
    icon: '✍️',
    category: 'practice',
    requirement: { type: 'words', value: 50000 },
    rarity: 'epic',
  },
  {
    id: 'sessions-50',
    title: 'Постоянный ученик',
    description: 'Завершите 50 сессий',
    icon: '🎓',
    category: 'practice',
    requirement: { type: 'sessions', value: 50 },
    rarity: 'rare',
  },
  {
    id: 'sessions-100',
    title: 'Мастер практики',
    description: 'Завершите 100 сессий',
    icon: '🏆',
    category: 'practice',
    requirement: { type: 'sessions', value: 100 },
    rarity: 'epic',
  },

  // Streak achievements
  {
    id: 'streak-3',
    title: 'Начало серии',
    description: 'Тренируйтесь 3 дня подряд',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
    rarity: 'common',
  },
  {
    id: 'streak-7',
    title: 'Неделя силы',
    description: 'Тренируйтесь 7 дней подряд',
    icon: '💪',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
    rarity: 'rare',
  },
  {
    id: 'streak-30',
    title: 'Месяц дисциплины',
    description: 'Тренируйтесь 30 дней подряд',
    icon: '🌟',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
    rarity: 'epic',
  },
  {
    id: 'streak-100',
    title: 'Легенда постоянства',
    description: 'Тренируйтесь 100 дней подряд',
    icon: '👑',
    category: 'streak',
    requirement: { type: 'streak', value: 100 },
    rarity: 'legendary',
  },
]

export function AchievementsPanel({ onClose, stats }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useLocalStorageState<Achievement[]>(
    'fastfingers_achievements',
    []
  )

  // Initialize achievements
  if (achievements.length === 0) {
    const initialAchievements: Achievement[] = ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: false,
    }))
    setAchievements(initialAchievements)
  }

  // Check and unlock achievements
  useMemo(() => {
    const updated = achievements.map(ach => {
      if (ach.unlocked) return ach

      const isUnlocked = checkAchievement(ach, stats)
      if (isUnlocked) {
        return {
          ...ach,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        }
      }
      return ach
    })

    if (JSON.stringify(updated) !== JSON.stringify(achievements)) {
      setAchievements(updated)
    }
  }, [stats, achievements, setAchievements])

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  const statsByCategory = useMemo(() => {
    const categories = ['speed', 'accuracy', 'practice', 'streak', 'special'] as const
    return categories.map(cat => ({
      category: cat,
      total: achievements.filter(a => a.category === cat).length,
      unlocked: unlockedAchievements.filter(a => a.category === cat).length,
    }))
  }, [achievements, unlockedAchievements])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>🏆</span>
                Достижения
              </h2>
              <p className="text-dark-400 text-sm mt-1">
                {unlockedAchievements.length} из {achievements.length} разблокировано
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
              aria-label="Закрыть"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-dark-400">Общий прогресс</span>
              <span className="font-semibold">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                style={{
                  width: `${(unlockedAchievements.length / achievements.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Category stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {statsByCategory.map(({ category, total, unlocked }) => (
              <div key={category} className="card p-3">
                <div className="text-center">
                  <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                  <div className="text-xs text-dark-400 mb-1">{getCategoryName(category)}</div>
                  <div className="text-lg font-bold">
                    {unlocked}/{total}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Unlocked achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>✨</span>
                Разблокированные
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedAchievements.map(ach => (
                  <AchievementCard key={ach.id} achievement={ach} stats={stats} />
                ))}
              </div>
            </div>
          )}

          {/* Locked achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🔒</span>
                Заблокированные
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lockedAchievements.map(ach => (
                  <AchievementCard key={ach.id} achievement={ach} stats={stats} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AchievementCard({
  achievement,
  stats,
}: {
  achievement: Achievement
  stats: AchievementsPanelProps['stats']
}) {
  const progress = getAchievementProgress(achievement, stats)
  const rarityColors = {
    common: 'from-gray-600 to-gray-500',
    rare: 'from-blue-600 to-blue-500',
    epic: 'from-purple-600 to-purple-500',
    legendary: 'from-yellow-600 to-yellow-500',
  }

  return (
    <div
      className={`card p-4 ${achievement.unlocked ? 'border border-yellow-500/30 bg-yellow-500/5' : 'opacity-60'}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${rarityColors[achievement.rarity]}`}
        >
          {achievement.unlocked ? achievement.icon : '🔒'}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-white">{achievement.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityBadgeClass(achievement.rarity)}`}>
              {getRarityName(achievement.rarity)}
            </span>
          </div>
          <p className="text-sm text-dark-400 mb-2">{achievement.description}</p>

          {!achievement.unlocked && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-500">Прогресс</span>
                <span className="font-semibold">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${rarityColors[achievement.rarity]} transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {achievement.unlockedAt && (
            <p className="text-xs text-yellow-400 mt-2">
              Разблокировано {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function checkAchievement(
  achievement: Achievement,
  stats: AchievementsPanelProps['stats']
): boolean {
  const { type, value } = achievement.requirement

  switch (type) {
    case 'wpm':
      return stats.maxWpm >= value
    case 'accuracy':
      return stats.maxAccuracy >= value
    case 'words':
      return stats.totalWords >= value
    case 'sessions':
      return stats.totalSessions >= value
    case 'streak':
      return stats.currentStreak >= value
    case 'perfect-session':
      return stats.perfectSessions >= value
    default:
      return false
  }
}

function getAchievementProgress(
  achievement: Achievement,
  stats: AchievementsPanelProps['stats']
): number {
  const { type, value } = achievement.requirement
  let current = 0

  switch (type) {
    case 'wpm':
      current = stats.maxWpm
      break
    case 'accuracy':
      current = stats.maxAccuracy
      break
    case 'words':
      current = stats.totalWords
      break
    case 'sessions':
      current = stats.totalSessions
      break
    case 'streak':
      current = stats.currentStreak
      break
    case 'perfect-session':
      current = stats.perfectSessions
      break
  }

  return (current / value) * 100
}

function getCategoryIcon(category: Achievement['category']): string {
  const icons = {
    speed: '⚡',
    accuracy: '🎯',
    practice: '📚',
    streak: '🔥',
    special: '⭐',
  }
  return icons[category]
}

function getCategoryName(category: Achievement['category']): string {
  const names = {
    speed: 'Скорость',
    accuracy: 'Точность',
    practice: 'Практика',
    streak: 'Серии',
    special: 'Особые',
  }
  return names[category]
}

function getRarityName(rarity: Achievement['rarity']): string {
  const names = {
    common: 'Обычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное',
  }
  return names[rarity]
}

function getRarityBadgeClass(rarity: Achievement['rarity']): string {
  const classes = {
    common: 'bg-gray-500/20 text-gray-300',
    rare: 'bg-blue-500/20 text-blue-300',
    epic: 'bg-purple-500/20 text-purple-300',
    legendary: 'bg-yellow-500/20 text-yellow-300',
  }
  return classes[rarity]
}
