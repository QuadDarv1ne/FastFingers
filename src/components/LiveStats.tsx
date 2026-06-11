import { useEffect, useState, useRef, memo } from 'react'
import { useAppTranslation } from '../i18n/config'
import { formatDuration } from '../utils/number'

interface LiveStatsProps {
  wpm: number
  accuracy: number
  errors: number
  timeElapsed: number
  wordsTyped: number
  combo: number
}

export function LiveStats({
  wpm,
  accuracy,
  errors,
  timeElapsed,
  wordsTyped,
  combo,
}: LiveStatsProps) {
  const { t } = useAppTranslation()
  const [wpmTrend, setWpmTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const prevWpmRef = useRef(wpm)

  useEffect(() => {
    const prev = prevWpmRef.current
    prevWpmRef.current = wpm
    if (wpm > prev + 2) {
      setWpmTrend('up')
    } else if (wpm < prev - 2) {
      setWpmTrend('down')
    } else {
      setWpmTrend('stable')
    }
  }, [wpm])

  const getAccuracyColor = (acc: number): string => {
    if (acc >= 95) return 'text-green-400'
    if (acc >= 85) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getWpmColor = (speed: number): string => {
    if (speed >= 60) return 'text-green-400'
    if (speed >= 40) return 'text-blue-400'
    if (speed >= 20) return 'text-yellow-400'
    return 'text-dark-400'
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* WPM */}
      <LiveStatCard
        label={t('common.speed')}
        value={wpm}
        unit="WPM"
        color={getWpmColor(wpm)}
        trend={wpmTrend}
        icon="⚡"
      />

      {/* Accuracy */}
      <LiveStatCard
        label={t('common.accuracy')}
        value={accuracy}
        unit="%"
        color={getAccuracyColor(accuracy)}
        icon="🎯"
      />

      {/* Errors */}
      <LiveStatCard
        label={t('common.errors')}
        value={errors}
        unit=""
        color={errors > 10 ? 'text-red-400' : 'text-dark-400'}
        icon="❌"
      />

      {/* Time */}
      <LiveStatCard
        label={t('common.time')}
        value={formatDuration(timeElapsed)}
        unit=""
        color="text-blue-400"
        icon="⏱️"
        isString
      />

      {/* Words */}
      <LiveStatCard
        label={t('common.words')}
        value={wordsTyped}
        unit=""
        color="text-purple-400"
        icon="📝"
      />

      {/* Combo */}
      <LiveStatCard
        label={t('common.combo')}
        value={combo}
        unit=""
        color={combo >= 10 ? 'text-orange-400' : 'text-dark-400'}
        icon="🔥"
        pulse={combo >= 10}
      />
    </div>
  )
}

interface LiveStatCardProps {
  label: string
  value: number | string
  unit: string
  color: string
  icon: string
  trend?: 'up' | 'down' | 'stable'
  isString?: boolean
  pulse?: boolean
}

const LiveStatCard = memo(function LiveStatCard({
  label,
  value,
  unit,
  color,
  icon,
  trend,
  isString,
  pulse,
}: LiveStatCardProps) {
  return (
    <div className={`card p-4 ${pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-dark-400 font-medium uppercase">
          {label}
        </span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color}`}>
          {isString ? value : typeof value === 'number' ? value.toFixed(0) : value}
        </span>
        {unit && <span className="text-sm text-dark-500">{unit}</span>}
        {trend && trend !== 'stable' && (
          <span className="ml-1">
            {trend === 'up' ? (
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  )
})

// Compact version for smaller screens
export function LiveStatsCompact({
  wpm,
  accuracy,
  errors,
}: {
  wpm: number
  accuracy: number
  errors: number
}) {
  const { t } = useAppTranslation()
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-dark-400">WPM:</span>
        <span className="font-bold text-primary-400">{wpm.toFixed(0)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-dark-400">{t('common.accuracy')}:</span>
        <span className={`font-bold ${accuracy >= 95 ? 'text-green-400' : accuracy >= 85 ? 'text-yellow-400' : 'text-red-400'}`}>
          {accuracy.toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-dark-400">{t('common.errors')}:</span>
        <span className="font-bold text-red-400">{errors}</span>
      </div>
    </div>
  )
}
