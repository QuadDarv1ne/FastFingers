import { memo } from 'react'
import { useAdvancedStats } from '@hooks/useAdvancedStats'
import { useAppTranslation } from '../i18n/config'

interface WeeklyComparisonProps {
  className?: string
}

export const WeeklyComparison = memo(function WeeklyComparison({ className = '' }: WeeklyComparisonProps) {
  const { t } = useAppTranslation()
  const { weeklyComparison } = useAdvancedStats()

  const { currentWeek, previousWeek, wpmChange, sessionsChange, charsChange } = weeklyComparison

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-success'
    if (value < 0) return 'text-error'
    return 'text-dark-400'
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return '↑'
    if (value < 0) return '↓'
    return '→'
  }

  return (
    <div className={`glass rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{t('stats.weeklyComparison')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WPM */}
        <div className="bg-dark-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">{t('common.speed')}</span>
            <span className="text-xs text-dark-500">WPM</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{currentWeek.avgWpm}</div>
              <div className="text-xs text-dark-500">{t('stats.thisWeek')}</div>
            </div>
            <div className={`text-right ${getChangeColor(wpmChange)}`}>
              <div className="text-lg font-semibold">
                {getChangeIcon(Math.abs(wpmChange))} {Math.abs(wpmChange)}%
              </div>
              <div className="text-xs text-dark-500">{previousWeek.avgWpm} {t('stats.lastWeek')}</div>
            </div>
          </div>
        </div>

        {/* Сессии */}
        <div className="bg-dark-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">{t('stats.sessions')}</span>
            <span className="text-xs text-dark-500">#</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{currentWeek.sessions}</div>
              <div className="text-xs text-dark-500">{t('stats.thisWeek')}</div>
            </div>
            <div className={`text-right ${getChangeColor(sessionsChange)}`}>
              <div className="text-lg font-semibold">
                {getChangeIcon(Math.abs(sessionsChange))} {Math.abs(sessionsChange)}%
              </div>
              <div className="text-xs text-dark-500">{previousWeek.sessions} {t('stats.lastWeek')}</div>
            </div>
          </div>
        </div>

        {/* Символы */}
        <div className="bg-dark-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">{t('stats.charsTyped')}</span>
            <span className="text-xs text-dark-500">{t('common.chars')}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{currentWeek.totalChars.toLocaleString()}</div>
              <div className="text-xs text-dark-500">{t('stats.thisWeek')}</div>
            </div>
            <div className={`text-right ${getChangeColor(charsChange)}`}>
              <div className="text-lg font-semibold">
                {getChangeIcon(Math.abs(charsChange))} {Math.abs(charsChange)}%
              </div>
              <div className="text-xs text-dark-500">{previousWeek.totalChars.toLocaleString()} {t('stats.lastWeek')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
