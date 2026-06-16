import { useEffect, useState, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

const statSpring = { type: 'spring' as const, stiffness: 300, damping: 25 }

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
    if (wpm > prev + 2) setWpmTrend('up')
    else if (wpm < prev - 2) setWpmTrend('down')
    else setWpmTrend('stable')
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
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
      <LiveStatCard label={t('common.speed')} value={wpm} unit="WPM" color={getWpmColor(wpm)} trend={wpmTrend} icon="⚡" />
      <LiveStatCard label={t('common.accuracy')} value={accuracy} unit="%" color={getAccuracyColor(accuracy)} icon="🎯" />
      <LiveStatCard label={t('common.errors')} value={errors} unit="" color={errors > 10 ? 'text-red-400' : 'text-dark-400'} icon="❌" />
      <LiveStatCard label={t('common.time')} value={formatDuration(timeElapsed)} unit="" color="text-blue-400" icon="⏱️" isString />
      <LiveStatCard label={t('common.words')} value={wordsTyped} unit="" color="text-purple-400" icon="📝" />
      <LiveStatCard label={t('common.combo')} value={combo} unit="" color={combo >= 10 ? 'text-orange-400' : 'text-dark-400'} icon="🔥" pulse={combo >= 10} />
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
    <motion.div
      className={`glass rounded-xl p-3 ${pulse ? 'animate-border-glow' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={statSpring}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-dark-500 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-sm leading-none">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={String(value)}
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`text-lg font-bold font-mono ${color}`}
          >
            {isString ? value : typeof value === 'number' ? value.toFixed(0) : value}
          </motion.span>
        </AnimatePresence>
        {unit && <span className="text-[10px] text-dark-500 font-medium">{unit}</span>}
        {trend && trend !== 'stable' && (
          <span className="ml-auto">
            {trend === 'up' ? (
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        )}
      </div>
    </motion.div>
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
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5">
        <span className="text-dark-500 font-medium">WPM:</span>
        <span className="font-bold text-primary-400">{wpm.toFixed(0)}</span>
      </div>
      <div className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5">
        <span className="text-dark-500 font-medium">{t('common.accuracy')}:</span>
        <span className={`font-bold ${accuracy >= 95 ? 'text-green-400' : accuracy >= 85 ? 'text-yellow-400' : 'text-red-400'}`}>
          {accuracy.toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5">
        <span className="text-dark-500 font-medium">{t('common.errors')}:</span>
        <span className="font-bold text-red-400">{errors}</span>
      </div>
    </div>
  )
}
