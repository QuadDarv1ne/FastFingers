import { useState, useEffect, useMemo, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import { useLocalStorageState } from '@hooks/useLocalStorageState'
import { useAppTranslation } from '../i18n/config'
import { STORAGE_KEYS } from '../constants/storageKeys'

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

const difficultyConfig = {
  easy: { bar: 'from-green-600 to-emerald-500', label: 'challenge.easy', accent: 'border-green-500/20 bg-green-500/5' },
  medium: { bar: 'from-yellow-600 to-orange-500', label: 'challenge.medium', accent: 'border-yellow-500/20 bg-yellow-500/5' },
  hard: { bar: 'from-red-600 to-rose-500', label: 'challenge.hard', accent: 'border-red-500/20 bg-red-500/5' },
}

export const DailyChallengeCard = memo(function DailyChallengeCard({ challenge: challengeProp, streak, onComplete }: DailyChallengeCardProps) {
  const { t } = useAppTranslation()
  const [progress] = useLocalStorageState<ChallengeProgress>(
    STORAGE_KEYS.CHALLENGE_PROGRESS,
    {}
  )
  const [localChallenge, setLocalChallenge] = useState<DailyChallenge | null>(null)
  const completedRef = useRef<string | null>(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (!today) return
    const dailyChallenge = generateDailyChallenge(today, t)
    const challengeProgress = progress[dailyChallenge?.id] || { completed: false, progress: 0 }
    setLocalChallenge({ ...dailyChallenge, completed: challengeProgress.completed, progress: challengeProgress.progress })
  }, [progress, t])

  useEffect(() => {
    const active = challengeProp ?? localChallenge
    if (active?.completed && active.progress >= active.goal.target && completedRef.current !== active.id) {
      completedRef.current = active.id
      onComplete(active.id, 0, 0)
    }
  }, [challengeProp, localChallenge, onComplete])

  const activeChallenge = challengeProp ?? localChallenge
  const target = activeChallenge?.goal?.target ?? 100
  const progressPercent = useMemo(
    () => (activeChallenge ? Math.min((activeChallenge.progress / target) * 100, 100) : 0),
    [activeChallenge, target]
  )

  if (!activeChallenge) return null

  const diff = difficultyConfig[activeChallenge.difficulty]

  return (
    <div className="glass rounded-xl p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 text-6xl opacity-5 select-none" aria-hidden="true">🎯</div>

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-dark-200">{t('challenge.daily')}</h3>
              {activeChallenge.completed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="text-green-400 text-sm"
                >
                  ✓
                </motion.span>
              )}
            </div>
            <p className="text-[10px] text-dark-500 font-medium">{t('challenge.refreshesDaily')}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${diff.bar} text-white`}>
            {t(diff.label)}
          </span>
        </div>

        <div className="mb-3">
          <h4 className="text-xs font-semibold text-dark-300 mb-1">{activeChallenge.title}</h4>
          <p className="text-[11px] text-dark-500 leading-relaxed">{activeChallenge.description}</p>
        </div>

        <div className="bg-dark-800/40 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-dark-500 font-medium uppercase tracking-wider">{t('challenge.goal')}</span>
            <span className="text-xs font-semibold text-dark-200">{activeChallenge.progress} / {target} {activeChallenge.goal.unit}</span>
          </div>
          <div className="w-full h-1.5 bg-dark-800/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${diff.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="text-[10px] text-dark-500 text-right mt-0.5 font-medium">{progressPercent.toFixed(0)}%</div>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-yellow-600/10 to-yellow-500/10 rounded-xl border border-yellow-500/20">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🏆</span>
            <div>
              <p className="text-xs font-semibold text-dark-200">{t('challenge.reward')}</p>
              <p className="text-[10px] text-dark-500">{activeChallenge.reward.points} {t('common.xp')}</p>
            </div>
          </div>
          {activeChallenge.reward.badge && (
            <span className="text-2xl">{activeChallenge.reward.badge}</span>
          )}
        </div>

        {activeChallenge.completed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
          >
            <p className="text-xs text-green-400 font-semibold">🎉 {t('challenge.completed')}</p>
            <p className="text-[10px] text-dark-500 mt-0.5">{t('challenge.comeBackTomorrow')}</p>
          </motion.div>
        )}

        {streak > 0 && (
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-dark-500 font-medium">{t('challenge.streak')}</span>
            <span className="font-semibold text-orange-400">🔥 {streak} {t('common.days')}</span>
          </div>
        )}
      </div>
    </div>
  )
})

function generateDailyChallenge(date: string, t: (key: string) => string): DailyChallenge {
  const seed = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const challenges: Omit<DailyChallenge, 'completed' | 'progress'>[] = [
    {
      id: `daily-${date}-speed`,
      date,
      title: t('challenge.speedTitle'),
      description: t('challenge.speedDesc'),
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
      title: t('challenge.accuracyTitle'),
      description: t('challenge.accuracyDesc'),
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
      title: t('challenge.enduranceTitle'),
      description: t('challenge.enduranceDesc'),
      goal: {
        type: 'words',
        target: 50 + (seed % 100),
        unit: t('common.words'),
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
      title: t('challenge.fallbackTitle'),
      description: t('challenge.fallbackDesc'),
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
