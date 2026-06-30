import { memo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { UserProgress, TypingStats as TypingStatsType } from '../types'
import { formatDuration } from '../utils/number'
import { useAppTranslation } from '../i18n/config'
import { StatCard } from './ui/StatCard'

interface StatsProps {
  progress: UserProgress
  currentStats: TypingStatsType | null
  onViewHistory?: () => void
  onViewAchievements?: () => void
  challengeStats?: {
    total: number
    completed: number
    completionRate: number
  }
}

const SESSION_ICON = (
  <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PROGRESS_ICON = (
  <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ACHIEVEMENT_ICON = (
  <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const CHALLENGE_ICON = (
  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const SectionHeader = memo(function SectionHeader({ icon, label, color = 'primary' }: { icon: ReactNode; label: string; color?: string }) {
  const bgColor = color === 'yellow' ? 'bg-yellow-500/15' : 'bg-primary-500/15'

  return (
    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
      <div className={`w-6 h-6 ${bgColor} rounded-lg flex items-center justify-center`}>
        <span className="text-xs">{icon}</span>
      </div>
      <span className="text-dark-200">{label}</span>
    </h3>
  )
})

const AchievementBadge = memo(function AchievementBadge({
  icon,
  title,
  description,
  unlocked,
}: {
  icon: string
  title: string
  description: string
  unlocked: boolean
}) {
  return (
    <motion.div
      className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${unlocked ? 'bg-dark-800/60 hover:bg-dark-700/60 border border-dark-700/30' : 'bg-dark-800/20 opacity-40'}`}
      whileHover={unlocked ? { x: 3 } : {}}
      role="listitem"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' : 'bg-dark-700/50'}`} aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${unlocked ? 'text-dark-200' : 'text-dark-500'}`}>{title}</p>
        <p className="text-[10px] text-dark-500 truncate">{description}</p>
      </div>
      {unlocked && (
        <motion.div
          className="w-5 h-5 bg-green-500/15 rounded-full flex items-center justify-center flex-shrink-0"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
})

export const Stats = memo(function Stats({ progress, currentStats, onViewHistory, onViewAchievements, challengeStats }: StatsProps) {
  const { t } = useAppTranslation()
  return (
    <div className="space-y-4">
      {/* Current session */}
      {currentStats && (
        <motion.div
          className="card animate-slide-up-fade"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          role="region"
          aria-label={t('stats.session')}
        >
          <SectionHeader
            icon={SESSION_ICON}
            label={t('stats.session')}
          />

          <div className="grid grid-cols-2 gap-2">
            <StatCard label={t('common.wpm')} value={currentStats.wpm.toString()} color="text-gradient" icon="⚡" size="sm" />
            <StatCard label={t('common.cpm')} value={currentStats.cpm.toString()} color="text-gradient" icon="🚀" size="sm" />
            <StatCard label={t('common.accuracy')} value={`${currentStats.accuracy}%`} color={currentStats.accuracy >= 95 ? 'text-green-400' : currentStats.accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'} icon="🎯" size="sm" />
            <StatCard label={t('common.errors')} value={currentStats.errors.toString()} color={currentStats.errors === 0 ? 'text-green-400' : 'text-red-400'} icon={currentStats.errors === 0 ? '✅' : '❌'} size="sm" />
          </div>

          <div className="mt-3 pt-3 border-t border-dark-700/30 grid grid-cols-2 gap-3">
            <div className="bg-dark-800/30 rounded-lg p-2.5">
              <p className="text-[10px] text-dark-500 mb-0.5 font-medium">{t('common.time')}</p>
              <p className="text-sm font-bold text-dark-200 font-mono">{formatDuration(currentStats.timeElapsed)}</p>
            </div>
            <div className="bg-dark-800/30 rounded-lg p-2.5">
              <p className="text-[10px] text-dark-500 mb-0.5 font-medium">{t('common.chars')}</p>
              <p className="text-sm font-bold text-dark-200 font-mono">{currentStats.correctChars}/{currentStats.totalChars}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Global progress */}
      <div className="card" role="region" aria-label={t('stats.progress')}>
        <SectionHeader
          icon={PROGRESS_ICON}
          label={t('stats.progress')}
        />

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatCard label={t('common.best') + ' ' + t('common.wpm')} value={progress.bestWpm.toString()} color="text-gradient" icon="🏆" size="sm" />
            <StatCard label={t('common.best') + ' ' + t('common.accuracy')} value={`${progress.bestAccuracy}%`} color="text-green-400" icon="💯" size="sm" />
          </div>

          <div className="relative p-3 bg-gradient-to-br from-primary-500/8 to-purple-500/8 rounded-xl border border-primary-500/8 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
            <p className="text-[10px] text-dark-500 mb-0.5 font-medium relative">{t('common.total')} {t('common.words')}</p>
            <p className="text-2xl font-bold text-gradient relative" aria-live="polite">{progress.totalWordsTyped.toLocaleString()}</p>
          </div>

          <div className="pt-3 border-t border-dark-700/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-dark-300">{t('common.level')} {progress.level}</span>
              <span className="text-xs font-semibold text-primary-400">{progress.xp} XP</span>
            </div>
            <div className="w-full h-2 bg-dark-800/60 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={progress.xp} aria-valuemin={0} aria-valuemax={progress.xpToNextLevel} aria-label={`${t('common.level')} ${progress.level}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full relative overflow-hidden"
                style={{ width: `${(progress.xp / progress.xpToNextLevel) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(progress.xp / progress.xpToNextLevel) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
              </motion.div>
            </div>
            <p className="text-[10px] text-dark-500 mt-1.5 text-right font-medium">{progress.xpToNextLevel - progress.xp} XP {t('common.level')} {progress.level + 1}</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card" role="region" aria-label={t('stats.achievements')}>
        <SectionHeader
          icon={ACHIEVEMENT_ICON}
          label={t('stats.achievements')}
          color="yellow"
        />

        <div className="space-y-1.5">
          <AchievementBadge icon="🚀" title={t('notification.achievement')} description={`${t('common.wpm')} 10+`} unlocked={progress.bestWpm >= 10} />
          <AchievementBadge icon="⚡" title={t('mode.sprint')} description={`${t('common.wpm')} 40+`} unlocked={progress.bestWpm >= 40} />
          <AchievementBadge icon="🎯" title={t('common.accuracy')} description="95%" unlocked={progress.bestAccuracy >= 95} />
          <AchievementBadge icon="📚" title={t('common.words')} description="1000" unlocked={progress.totalWordsTyped >= 1000} />
        </div>
      </div>

      {/* Challenge stats */}
      {challengeStats && challengeStats.total > 0 && (
        <div className="card" role="region" aria-label={t('stats.challenges')}>
          <SectionHeader
            icon={CHALLENGE_ICON}
            label={t('stats.challenges')}
          />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-400 font-medium">{t('status.completed')}</span>
              <span className="text-xl font-bold text-gradient-success" aria-live="polite">
                {challengeStats.completed} / {challengeStats.total}
              </span>
            </div>
            <div className="w-full h-2 bg-dark-800/60 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={challengeStats.completionRate} aria-valuemin={0} aria-valuemax={100} aria-label={`${t('status.completed')} ${challengeStats.completionRate}%`}>
              <motion.div
                className="h-full bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 rounded-full"
                style={{ width: `${challengeStats.completionRate}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${challengeStats.completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-dark-500 text-right font-medium">{challengeStats.completionRate}% {t('common.accuracy')}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2" role="group" aria-label={t('action.view')}>
        {onViewHistory && (
          <motion.button
            onClick={onViewHistory}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-primary-500/25 text-sm"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            aria-label={t('stats.history')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('stats.history')}
          </motion.button>
        )}

        {onViewAchievements && (
          <motion.button
            onClick={onViewAchievements}
            className="w-full py-2.5 bg-gradient-to-r from-yellow-600/15 to-orange-600/15 hover:from-yellow-600/25 hover:to-orange-600/25 border border-yellow-600/40 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            aria-label={t('stats.achievements')}
          >
            <span className="text-sm" aria-hidden="true">🏆</span>
            {t('stats.achievements')}
          </motion.button>
        )}
      </div>
    </div>
  )
})
