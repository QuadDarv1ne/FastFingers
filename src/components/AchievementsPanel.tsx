import { useMemo, useEffect, useRef, memo } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'
import i18n from 'i18next'
import { useAppTranslation } from '../i18n/config'
import { STORAGE_KEYS } from '../constants/storageKeys'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'speed' | 'accuracy' | 'practice' | 'streak' | 'special'
  requirement: {
    type: 'wpm' | 'accuracy' | 'words' | 'sessions' | 'streak' | 'perfect-session' | 'duels' | 'tournaments' | 'custom-exercises' | 'daily-challenges' | 'game-modes' | 'level'
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
    duelsPlayed?: number
    tournamentsPlayed?: number
    customExercisesCreated?: number
    dailyChallengesCompleted?: number
    gameModesUsed?: number
    level?: number
  }
}

export function AchievementsPanel({ onClose, stats }: AchievementsPanelProps) {
  const { t } = useAppTranslation()

  const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = useMemo(() => [
    { id: 'speed-10', title: t('achievement.speed10'), description: t('achievementDesc.speed10'), icon: '🐢', category: 'speed', requirement: { type: 'wpm', value: 10 }, rarity: 'common' },
    { id: 'speed-30', title: t('achievement.speed30'), description: t('achievementDesc.speed30'), icon: '🚶', category: 'speed', requirement: { type: 'wpm', value: 30 }, rarity: 'common' },
    { id: 'speed-50', title: t('achievement.speed50'), description: t('achievementDesc.speed50'), icon: '🏃', category: 'speed', requirement: { type: 'wpm', value: 50 }, rarity: 'rare' },
    { id: 'speed-70', title: t('achievement.speed70'), description: t('achievementDesc.speed70'), icon: '⚡', category: 'speed', requirement: { type: 'wpm', value: 70 }, rarity: 'epic' },
    { id: 'speed-100', title: t('achievement.speed100'), description: t('achievementDesc.speed100'), icon: '🚀', category: 'speed', requirement: { type: 'wpm', value: 100 }, rarity: 'legendary' },
    { id: 'accuracy-90', title: t('achievement.accuracy90'), description: t('achievementDesc.accuracy90'), icon: '🎯', category: 'accuracy', requirement: { type: 'accuracy', value: 90 }, rarity: 'common' },
    { id: 'accuracy-95', title: t('achievement.accuracy95'), description: t('achievementDesc.accuracy95'), icon: '🎖️', category: 'accuracy', requirement: { type: 'accuracy', value: 95 }, rarity: 'rare' },
    { id: 'accuracy-98', title: t('achievement.accuracy98'), description: t('achievementDesc.accuracy98'), icon: '💎', category: 'accuracy', requirement: { type: 'accuracy', value: 98 }, rarity: 'epic' },
    { id: 'perfect-10', title: t('achievement.perfect10'), description: t('achievementDesc.perfect10'), icon: '👑', category: 'accuracy', requirement: { type: 'perfect-session', value: 10 }, rarity: 'legendary' },
    { id: 'words-1000', title: t('achievement.words1000'), description: t('achievementDesc.words1000'), icon: '📝', category: 'practice', requirement: { type: 'words', value: 1000 }, rarity: 'common' },
    { id: 'words-10000', title: t('achievement.words10000'), description: t('achievementDesc.words10000'), icon: '📚', category: 'practice', requirement: { type: 'words', value: 10000 }, rarity: 'rare' },
    { id: 'words-50000', title: t('achievement.words50000'), description: t('achievementDesc.words50000'), icon: '✍️', category: 'practice', requirement: { type: 'words', value: 50000 }, rarity: 'epic' },
    { id: 'sessions-50', title: t('achievement.sessions50'), description: t('achievementDesc.sessions50'), icon: '🎓', category: 'practice', requirement: { type: 'sessions', value: 50 }, rarity: 'rare' },
    { id: 'sessions-100', title: t('achievement.sessions100'), description: t('achievementDesc.sessions100'), icon: '🏆', category: 'practice', requirement: { type: 'sessions', value: 100 }, rarity: 'epic' },
    { id: 'streak-3', title: t('achievement.streak3'), description: t('achievementDesc.streak3'), icon: '🔥', category: 'streak', requirement: { type: 'streak', value: 3 }, rarity: 'common' },
    { id: 'streak-7', title: t('achievement.streak7'), description: t('achievementDesc.streak7'), icon: '💪', category: 'streak', requirement: { type: 'streak', value: 7 }, rarity: 'rare' },
    { id: 'streak-30', title: t('achievement.streak30'), description: t('achievementDesc.streak30'), icon: '🌟', category: 'streak', requirement: { type: 'streak', value: 30 }, rarity: 'epic' },
    { id: 'streak-100', title: t('achievement.streak100'), description: t('achievementDesc.streak100'), icon: '👑', category: 'streak', requirement: { type: 'streak', value: 100 }, rarity: 'legendary' },
    { id: 'duel-1', title: t('achievement.duel1'), description: t('achievementDesc.duel1'), icon: '⚔️', category: 'special', requirement: { type: 'duels', value: 1 }, rarity: 'common' },
    { id: 'duel-10', title: t('achievement.duel10'), description: t('achievementDesc.duel10'), icon: '🥊', category: 'special', requirement: { type: 'duels', value: 10 }, rarity: 'rare' },
    { id: 'duel-50', title: t('achievement.duel50'), description: t('achievementDesc.duel50'), icon: '🏅', category: 'special', requirement: { type: 'duels', value: 50 }, rarity: 'epic' },
    { id: 'tournament-1', title: t('achievement.tournament1'), description: t('achievementDesc.tournament1'), icon: '🏟️', category: 'special', requirement: { type: 'tournaments', value: 1 }, rarity: 'rare' },
    { id: 'tournament-5', title: t('achievement.tournament5'), description: t('achievementDesc.tournament5'), icon: '🎖️', category: 'special', requirement: { type: 'tournaments', value: 5 }, rarity: 'epic' },
    { id: 'custom-1', title: t('achievement.custom1'), description: t('achievementDesc.custom1'), icon: '🛠️', category: 'special', requirement: { type: 'custom-exercises', value: 1 }, rarity: 'common' },
    { id: 'custom-10', title: t('achievement.custom10'), description: t('achievementDesc.custom10'), icon: '📝', category: 'special', requirement: { type: 'custom-exercises', value: 10 }, rarity: 'rare' },
    { id: 'daily-1', title: t('achievement.daily1'), description: t('achievementDesc.daily1'), icon: '📅', category: 'special', requirement: { type: 'daily-challenges', value: 1 }, rarity: 'common' },
    { id: 'daily-7', title: t('achievement.daily7'), description: t('achievementDesc.daily7'), icon: '🗓️', category: 'special', requirement: { type: 'daily-challenges', value: 7 }, rarity: 'rare' },
    { id: 'daily-30', title: t('achievement.daily30'), description: t('achievementDesc.daily30'), icon: '🏃', category: 'special', requirement: { type: 'daily-challenges', value: 30 }, rarity: 'epic' },
    { id: 'modes-all', title: t('achievement.modesAll'), description: t('achievementDesc.modesAll'), icon: '🎲', category: 'special', requirement: { type: 'game-modes', value: 1 }, rarity: 'rare' },
    { id: 'level-10', title: t('achievement.level10'), description: t('achievementDesc.level10'), icon: '🎓', category: 'special', requirement: { type: 'level', value: 10 }, rarity: 'rare' },
    { id: 'level-25', title: t('achievement.level25'), description: t('achievementDesc.level25'), icon: '⭐', category: 'special', requirement: { type: 'level', value: 25 }, rarity: 'epic' },
    { id: 'level-50', title: t('achievement.level50'), description: t('achievementDesc.level50'), icon: '👑', category: 'special', requirement: { type: 'level', value: 50 }, rarity: 'legendary' },
  ], [t])

  const [achievements, setAchievements] = useLocalStorageState<Achievement[]>(
    STORAGE_KEYS.ACHIEVEMENTS,
    []
  )

  const checkKeyRef = useRef('')

  // Initialize achievements
  useEffect(() => {
    if (achievements.length === 0) {
      const initialAchievements: Achievement[] = ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: false,
      }))
      setAchievements(initialAchievements)
    }
  }, [achievements.length, ACHIEVEMENTS, setAchievements])

  // Check and unlock achievements — only re-checks when relevant stats values change
  useEffect(() => {
    const checkKey = `${stats.maxWpm}|${stats.maxAccuracy}|${stats.totalWords}|${stats.totalSessions}|${stats.currentStreak}|${stats.perfectSessions}|${stats.duelsPlayed}|${stats.tournamentsPlayed}|${stats.customExercisesCreated}|${stats.dailyChallengesCompleted}|${stats.gameModesUsed}|${stats.level}`
    if (checkKeyRef.current === checkKey) return
    checkKeyRef.current = checkKey

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

    const hasChanges = updated.some((ach, i) => {
      const prev = achievements[i]
      return prev && (ach.unlocked !== prev.unlocked || ach.unlockedAt !== prev.unlockedAt)
    })
    if (hasChanges) {
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
                {t('stats.achievements')}
              </h2>
              <p className="text-dark-400 text-sm mt-1">
                {unlockedAchievements.length} / {achievements.length} {t('profile.achievementsUnlocked')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
              aria-label={t('action.close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-dark-400">{t('stats.progress')}</span>
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
                  <div className="text-xs text-dark-400 mb-1">{getCategoryName(category, t)}</div>
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
                {t('status.available')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedAchievements.map(ach => (
                  <AchievementCard key={ach.id} achievement={ach} stats={stats} t={t} />
                ))}
              </div>
            </div>
          )}

          {/* Locked achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🔒</span>
                {t('status.locked')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lockedAchievements.map(ach => (
                  <AchievementCard key={ach.id} achievement={ach} stats={stats} t={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const RARITY_COLORS: Record<Achievement['rarity'], string> = {
  common: 'from-gray-600 to-gray-500',
  rare: 'from-blue-600 to-blue-500',
  epic: 'from-purple-600 to-purple-500',
  legendary: 'from-yellow-600 to-yellow-500',
}

const AchievementCard = memo(function AchievementCard({
  achievement,
  stats,
  t,
}: {
  achievement: Achievement
  stats: AchievementsPanelProps['stats']
  t: (key: string) => string
}) {
  const progress = getAchievementProgress(achievement, stats)

  return (
    <div
      className={`card p-4 ${achievement.unlocked ? 'border border-yellow-500/30 bg-yellow-500/5' : 'opacity-60'}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}`}
        >
          {achievement.unlocked ? achievement.icon : '🔒'}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-white">{achievement.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityBadgeClass(achievement.rarity)}`}>
              {getRarityName(achievement.rarity, t)}
            </span>
          </div>
          <p className="text-sm text-dark-400 mb-2">{achievement.description}</p>

          {!achievement.unlocked && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-500">{t('stats.progress')}</span>
                <span className="font-semibold">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {achievement.unlockedAt && (
            <p className="text-xs text-yellow-400 mt-2">
              {t('notification.achievement')} {new Date(achievement.unlockedAt).toLocaleDateString(i18n.language)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

function getAchievementStatValue(
  type: Achievement['requirement']['type'],
  stats: AchievementsPanelProps['stats']
): number {
  switch (type) {
    case 'wpm': return stats.maxWpm
    case 'accuracy': return stats.maxAccuracy
    case 'words': return stats.totalWords
    case 'sessions': return stats.totalSessions
    case 'streak': return stats.currentStreak
    case 'perfect-session': return stats.perfectSessions
    case 'duels': return stats.duelsPlayed || 0
    case 'tournaments': return stats.tournamentsPlayed || 0
    case 'custom-exercises': return stats.customExercisesCreated || 0
    case 'daily-challenges': return stats.dailyChallengesCompleted || 0
    case 'game-modes': return stats.gameModesUsed || 0
    case 'level': return stats.level || 0
    default: return 0
  }
}

function checkAchievement(
  achievement: Achievement,
  stats: AchievementsPanelProps['stats']
): boolean {
  return getAchievementStatValue(achievement.requirement.type, stats) >= achievement.requirement.value
}

function getAchievementProgress(
  achievement: Achievement,
  stats: AchievementsPanelProps['stats']
): number {
  const current = getAchievementStatValue(achievement.requirement.type, stats)
  return (current / achievement.requirement.value) * 100
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

function getCategoryName(category: Achievement['category'], t: (key: string) => string): string {
  const keys: Record<Achievement['category'], string> = {
    speed: 'common.speed',
    accuracy: 'common.accuracy',
    practice: 'mode.practice',
    streak: 'common.streak',
    special: 'achievement.category.special',
  }
  return t(keys[category])
}

function getRarityName(rarity: Achievement['rarity'], t: (key: string) => string): string {
  const keys: Record<Achievement['rarity'], string> = {
    common: 'rarity.common',
    rare: 'rarity.rare',
    epic: 'rarity.epic',
    legendary: 'rarity.legendary',
  }
  return t(keys[rarity])
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
