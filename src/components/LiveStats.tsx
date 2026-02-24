import { useEffect, useState } from 'react'

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
  const [prevWpm, setPrevWpm] = useState(wpm)
  const [wpmTrend, setWpmTrend] = useState<'up' | 'down' | 'stable'>('stable')

  useEffect(() => {
    if (wpm > prevWpm + 2) {
      setWpmTrend('up')
    } else if (wpm < prevWpm - 2) {
      setWpmTrend('down')
    } else {
      setWpmTrend('stable')
    }
    setPrevWpm(wpm)
  }, [wpm, prevWpm])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
      <StatCard
        label="Скорость"
        value={wpm}
        unit="WPM"
        color={getWpmColor(wpm)}
        trend={wpmTrend}
        icon="⚡"
      />

      {/* Accuracy */}
      <StatCard
        label="Точность"
        value={accuracy}
        unit="%"
        color={getAccuracyColor(accuracy)}
        icon="🎯"
      />

      {/* Errors */}
      <StatCard
        label="Ошибки"
        value={errors}
        unit=""
        color={errors > 10 ? 'text-red-400' : 'text-dark-400'}
        icon="❌"
      />

      {/* Time */}
      <StatCard
        label="Время"
        value={formatTime(timeElapsed)}
        unit=""
        color="text-blue-400"
        icon="⏱️"
        isString
      />

      {/* Words */}
      <StatCard
        label="Слова"
        value={wordsTyped}
        unit=""
        color="text-purple-400"
        icon="📝"
      />

      {/* Combo */}
      <StatCard
        label="Комбо"
        value={combo}
        unit=""
        color={combo >= 10 ? 'text-orange-400' : 'text-dark-400'}
        icon="🔥"
        pulse={combo >= 10}
      />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  unit: string
  color: string
  icon: string
  trend?: 'up' | 'down' | 'stable'
  isString?: boolean
  pulse?: boolean
}

function StatCard({
  label,
  value,
  unit,
  color,
  icon,
  trend,
  isString,
  pulse,
}: StatCardProps) {
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
}

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
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-dark-400">WPM:</span>
        <span className="font-bold text-primary-400">{wpm.toFixed(0)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-dark-400">Точность:</span>
        <span className={`font-bold ${accuracy >= 95 ? 'text-green-400' : accuracy >= 85 ? 'text-yellow-400' : 'text-red-400'}`}>
          {accuracy.toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-dark-400">Ошибки:</span>
        <span className="font-bold text-red-400">{errors}</span>
      </div>
    </div>
  )
}
