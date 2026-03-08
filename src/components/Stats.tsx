import { memo } from 'react'
import { UserProgress, TypingStats as TypingStatsType } from '../types'
import { formatDuration } from '../utils/number'
import { useAppTranslation } from '../i18n/config'

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

export const Stats = memo(function Stats({ progress, currentStats, onViewHistory, onViewAchievements, challengeStats }: StatsProps) {
  const { t } = useAppTranslation()
  return (
    <div className="space-y-6">
      {/* Текущая сессия */}
      {currentStats && (
        <div className="card animate-scale-in" role="region" aria-label={t('stats.session')}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {t('stats.session')}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label={t('common.wpm')} value={currentStats.wpm.toString()} color="text-gradient" icon="⚡" />
            <StatCard label={t('common.cpm')} value={currentStats.cpm.toString()} color="text-gradient" icon="🚀" />
            <StatCard label={t('common.accuracy')} value={`${currentStats.accuracy}%`} color={currentStats.accuracy >= 95 ? 'text-gradient-success' : currentStats.accuracy >= 80 ? 'text-yellow-400' : 'text-gradient-error'} icon="🎯" />
            <StatCard label={t('common.errors')} value={currentStats.errors.toString()} color={currentStats.errors === 0 ? 'text-gradient-success' : 'text-gradient-error'} icon={currentStats.errors === 0 ? '✅' : '❌'} />
          </div>

          <div className="mt-4 pt-4 border-t border-dark-700/50 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-dark-400 mb-1">{t('common.time')}</p>
              <p className="text-lg font-semibold text-dark-300">{formatDuration(currentStats.timeElapsed)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-400 mb-1">{t('common.chars')}</p>
              <p className="text-lg font-semibold text-dark-300">{currentStats.correctChars}/{currentStats.totalChars}</p>
            </div>
          </div>
        </div>
      )}

      {/* Общий прогресс */}
      <div className="card" role="region" aria-label={t('stats.progress')}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          {t('stats.progress')}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label={t('common.best') + ' ' + t('common.wpm')} value={progress.bestWpm.toString()} color="text-gradient" icon="🏆" large />
            <StatCard label={t('common.best') + ' ' + t('common.accuracy')} value={`${progress.bestAccuracy}%`} color="text-gradient-success" icon="💯" large />
          </div>

          <div className="p-4 bg-dark-800/50 rounded-xl">
            <p className="text-sm text-dark-400 mb-1">{t('common.total')} {t('common.words')}</p>
            <p className="text-3xl font-bold text-gradient" aria-live="polite">{progress.totalWordsTyped.toLocaleString()}</p>
          </div>

          <div className="pt-4 border-t border-dark-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-dark-300">{t('common.level')} {progress.level}</span>
              <span className="text-sm font-medium text-primary-400">{progress.xp} XP</span>
            </div>
            <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={progress.xp} aria-valuemin={0} aria-valuemax={progress.xpToNextLevel} aria-label={`${t('common.level')} ${progress.level}`}>
              <div
                className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 progress-bar shadow-glow"
                style={{ width: `${(progress.xp / progress.xpToNextLevel) * 100}%` }}
              />
            </div>
            <p className="text-xs text-dark-500 mt-2 text-right font-medium">{progress.xpToNextLevel - progress.xp} XP {t('common.level')} {progress.level + 1}</p>
          </div>
        </div>
      </div>

      {/* Достижения */}
      <div className="card" role="region" aria-label={t('stats.achievements')}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          {t('stats.achievements')}
        </h3>

        <div className="space-y-2">
          <AchievementBadge
            icon="🚀"
            title={t('notification.achievement')}
            description="WPM 10+"
            unlocked={progress.bestWpm >= 10}
          />
          <AchievementBadge
            icon="⚡"
            title={t('mode.sprint')}
            description="WPM 40+"
            unlocked={progress.bestWpm >= 40}
          />
          <AchievementBadge
            icon="🎯"
            title={t('common.accuracy')}
            description="95%"
            unlocked={progress.bestAccuracy >= 95}
          />
          <AchievementBadge
            icon="📚"
            title={t('common.words')}
            description="1000"
            unlocked={progress.totalWordsTyped >= 1000}
          />
        </div>
      </div>

      {/* Статистика челленджей */}
      {challengeStats && challengeStats.total > 0 && (
        <div className="card" role="region" aria-label="Челленджи">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            Челленджи
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-400 font-medium">{t('status.completed')}</span>
              <span className="text-2xl font-bold text-gradient-success" aria-live="polite">
                {challengeStats.completed} / {challengeStats.total}
              </span>
            </div>
            <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={challengeStats.completionRate} aria-valuemin={0} aria-valuemax={100} aria-label={`${t('status.completed')} ${challengeStats.completionRate}%`}>
              <div
                className="h-full bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 progress-bar shadow-glow-success"
                style={{ width: `${challengeStats.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-dark-500 text-right font-medium">
              {challengeStats.completionRate}% {t('common.accuracy')}
            </p>
          </div>
        </div>
      )}

      {/* Кнопки */}
      <div className="space-y-3" role="group" aria-label={t('action.view')}>
        {/* Кнопка истории */}
        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-primary-500/30"
            aria-label={t('stats.history')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('stats.history')}
          </button>
        )}

        {/* Кнопка достижений */}
        {onViewAchievements && (
          <button
            onClick={onViewAchievements}
            className="w-full py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 border border-yellow-600/50 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20"
            aria-label={t('stats.achievements')}
          >
            <span className="text-xl">🏆</span>
            {t('stats.achievements')}
          </button>
        )}
      </div>
    </div>
  )
})

const StatCard = memo(function StatCard({
  label,
  value,
  color = 'text-white',
  large = false,
  icon
}: {
  label: string
  value: string
  color?: string
  large?: boolean
  icon?: string
}) {
  return (
    <div className={`${large ? 'col-span-2' : ''} p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-colors`} role="listitem">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
        <p className="text-xs text-dark-400 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-3xl font-bold ${color}`} aria-live="polite">{value}</p>
    </div>
  )
})

const AchievementBadge = memo(function AchievementBadge({
  icon,
  title,
  description,
  unlocked
}: {
  icon: string
  title: string
  description: string
  unlocked: boolean
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${unlocked ? 'bg-dark-800/70 hover:bg-dark-800 border border-dark-700/50' : 'bg-dark-800/30 opacity-50'}`} role="listitem">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' : 'bg-dark-700/50'}`} aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1">
        <p className={`font-semibold ${unlocked ? 'text-white' : 'text-dark-500'}`}>{title}</p>
        <p className="text-xs text-dark-500">{description}</p>
      </div>
      {unlocked && (
        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center" aria-label="unlocked">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
})
