/**
 * PerformanceInsights — Расширенная аналитика производительности
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { TypingStats, TimeOfDayPerformance } from '../types'
import { useAppTranslation } from '../i18n/config'

interface SessionData {
  date: string
  wpm: number
  accuracy: number
  cpm: number
  duration: number
}

interface PerformanceInsightsProps {
  sessions: SessionData[]
  bestStats?: TypingStats
}

interface Insight {
  type: 'positive' | 'warning' | 'info'
  title: string
  description: string
  icon: string
}

export const PerformanceInsights = memo(function PerformanceInsights({
  sessions,
  bestStats,
}: PerformanceInsightsProps) {
  const { t } = useAppTranslation()

  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = []

    if (sessions.length < 2) {
      result.push({
        type: 'info',
        title: t('insights.needMoreData'),
        description: t('insights.needMoreDataDesc'),
        icon: '📊',
      })
      return result
    }

    const recentSessions = sessions.slice(-5)
    const olderSessions = sessions.slice(-10, -5)

    if (recentSessions.length >= 2) {
      const recentAvgWpm = recentSessions.reduce((sum, s) => sum + s.wpm, 0) / recentSessions.length
      const olderAvgWpm = olderSessions.length > 0
        ? olderSessions.reduce((sum, s) => sum + s.wpm, 0) / olderSessions.length
        : recentAvgWpm * 0.9

      const wpmChange = ((recentAvgWpm - olderAvgWpm) / olderAvgWpm) * 100

      if (wpmChange > 10) {
        result.push({
          type: 'positive',
          title: t('insights.greatProgress'),
          description: t('insights.speedGrew', { pct: Math.round(wpmChange) }),
          icon: '📈',
        })
      } else if (wpmChange < -5) {
        result.push({
          type: 'warning',
          title: t('insights.attention'),
          description: t('insights.speedDeclined'),
          icon: '⚠️',
        })
      }
    }

    if (recentSessions.length >= 3) {
      const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length

      if (avgAccuracy >= 95) {
        result.push({
          type: 'positive',
          title: t('insights.accuracyMaster'),
          description: t('insights.amazingAccuracy', { pct: avgAccuracy.toFixed(1) }),
          icon: '🎯',
        })
      } else if (avgAccuracy < 80) {
        result.push({
          type: 'warning',
          title: t('insights.workOnErrors'),
          description: t('insights.focusAccuracy'),
          icon: '💡',
        })
      }
    }

    const morningSessions = sessions.filter(s => {
      const hour = new Date(s.date).getHours()
      return hour >= 6 && hour < 12
    })

    const eveningSessions = sessions.filter(s => {
      const hour = new Date(s.date).getHours()
      return hour >= 18 && hour < 24
    })

    if (morningSessions.length >= 3 && eveningSessions.length >= 3) {
      const morningAvgWpm = morningSessions.reduce((sum, s) => sum + s.wpm, 0) / morningSessions.length
      const eveningAvgWpm = eveningSessions.reduce((sum, s) => sum + s.wpm, 0) / eveningSessions.length

      if (Math.abs(morningAvgWpm - eveningAvgWpm) > 10) {
        const better = morningAvgWpm > eveningAvgWpm ? t('stats.timeOfDay.morning') : t('stats.timeOfDay.evening')
        result.push({
          type: 'info',
          title: t('insights.productiveTime'),
          description: t('insights.fasterIn', { time: better }),
          icon: '🕐',
        })
      }
    }

    const today = new Date().toDateString()
    const hasTodaySession = sessions.some(s => new Date(s.date).toDateString() === today)

    if (hasTodaySession) {
      result.push({
        type: 'positive',
        title: t('insights.keepGoing'),
        description: t('insights.trainedToday'),
        icon: '🔥',
      })
    } else {
      result.push({
        type: 'info',
        title: t('insights.notTooLate'),
        description: t('insights.doOneSession'),
        icon: '⏰',
      })
    }

    if (bestStats) {
      if (bestStats.wpm >= 60) {
        result.push({
          type: 'positive',
          title: t('insights.speedMode'),
          description: t('insights.yourRecord', { wpm: bestStats.wpm }),
          icon: '⚡',
        })
      }

      if (bestStats.accuracy === 100 && bestStats.wpm >= 40) {
        result.push({
          type: 'positive',
          title: t('insights.perfectSession'),
          description: t('insights.had100Accuracy'),
          icon: '💎',
        })
      }
    }

    return result
  }, [sessions, bestStats, t])

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'gradient-card border-green-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gradient flex items-center gap-2">
        <span>💡</span> {t('insights.title')}
      </h3>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getInsightStyles(insight.type)} glass`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div>
                <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                <p className="text-sm text-dark-400">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
})

interface TimeOfDayAnalysisProps {
  sessions: SessionData[]
}

export const TimeOfDayAnalysis = memo(function TimeOfDayAnalysis({ sessions }: TimeOfDayAnalysisProps) {
  const { t } = useAppTranslation()

  const timeData = useMemo<TimeOfDayPerformance[]>(() => {
    const periods: Record<string, { wpm: number[]; accuracy: number[] }> = {
      morning: { wpm: [], accuracy: [] },
      afternoon: { wpm: [], accuracy: [] },
      evening: { wpm: [], accuracy: [] },
      night: { wpm: [], accuracy: [] },
    }

    sessions.forEach(session => {
      const hour = new Date(session.date).getHours()
      let period: keyof typeof periods

      if (hour >= 6 && hour < 12) period = 'morning'
      else if (hour >= 12 && hour < 18) period = 'afternoon'
      else if (hour >= 18 && hour < 24) period = 'evening'
      else period = 'night'

      const periodData = periods[period]
      if (periodData) {
        periodData.wpm.push(session.wpm)
        periodData.accuracy.push(session.accuracy)
      }
    })

    const result: TimeOfDayPerformance[] = []

    Object.keys(periods).forEach(key => {
      const periodKey = key as keyof typeof periods
      const data = periods[periodKey]
      if (data && data.wpm.length > 0) {
        result.push({
          timeOfDay: periodKey as TimeOfDayPerformance['timeOfDay'],
          avgWpm: Math.round(data.wpm.reduce((sum, w) => sum + w, 0) / data.wpm.length),
          avgAccuracy: Math.round(data.accuracy.reduce((sum, a) => sum + a, 0) / data.accuracy.length),
          sessions: data.wpm.length,
        })
      }
    })

    return result.sort((a, b) => b.avgWpm - a.avgWpm)
  }, [sessions])

  if (timeData.length === 0) {
    return null
  }

  const maxWpm = Math.max(...timeData.map(d => d.avgWpm))

  const timeOfDayLabel = (tod: string) => {
    switch (tod) {
      case 'morning': return t('stats.timeOfDay.morning')
      case 'afternoon': return t('stats.timeOfDay.afternoon')
      case 'evening': return t('stats.timeOfDay.evening')
      case 'night': return t('stats.timeOfDay.night')
      default: return tod
    }
  }

  const timeOfDayEmoji = (tod: string) => {
    switch (tod) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌆'
      case 'night': return '🌙'
      default: return ''
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🕐</span> {t('insights.timeOfDayTitle')}
      </h3>

      <div className="space-y-4">
        {timeData.map((data, index) => (
          <motion.div
            key={data.timeOfDay}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-300">
                {timeOfDayEmoji(data.timeOfDay)} {timeOfDayLabel(data.timeOfDay)}
              </span>
              <span className="text-dark-400">{data.sessions} {t('stats.sessions')}</span>
            </div>

            <div className="relative h-4 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(data.avgWpm / maxWpm) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`h-full ${
                  data.avgWpm === maxWpm
                    ? 'bg-gradient-to-r from-primary-600 to-primary-400'
                    : 'bg-gradient-to-r from-dark-600 to-dark-500'
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium">
                <span className={data.avgWpm === maxWpm ? 'text-white' : 'text-dark-400'}>
                  {data.avgWpm} WPM
                </span>
                <span className={data.avgWpm === maxWpm ? 'text-white' : 'text-dark-400'}>
                  {data.avgAccuracy}% {t('common.accuracy').toLowerCase()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {timeData.length > 0 && timeData[0] && (
        <p className="text-xs text-dark-500 mt-4 text-center">
          📊 {t('insights.bestTime')}: {timeOfDayLabel(timeData[0].timeOfDay).toLowerCase()}
        </p>
      )}
    </div>
  )
})

interface GoalsProgressProps {
  dailyGoal: number
  weeklyGoal: number
  todayWpm: number
  thisWeekAvgWpm: number
}

export const GoalsProgress = memo(function GoalsProgress({
  dailyGoal,
  weeklyGoal,
  todayWpm,
  thisWeekAvgWpm,
}: GoalsProgressProps) {
  const { t } = useAppTranslation()
  const dailyProgress = Math.min((todayWpm / dailyGoal) * 100, 100)
  const weeklyProgress = Math.min((thisWeekAvgWpm / weeklyGoal) * 100, 100)

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🎯</span> {t('insights.goalsProgress')}
      </h3>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-300">{t('insights.dailyGoal')}</span>
            <span className="text-sm font-medium text-primary-400">{todayWpm} / {dailyGoal} WPM</span>
          </div>
          <div className="relative h-3 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                dailyProgress >= 100
                  ? 'bg-gradient-to-r from-success to-green-400'
                  : 'bg-gradient-to-r from-primary-600 to-primary-400'
              }`}
            />
          </div>
          {dailyProgress >= 100 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-success mt-1 flex items-center gap-1"
            >
              <span>✅</span> {t('insights.goalReached')}
            </motion.p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-300">{t('insights.weeklyGoal')}</span>
            <span className="text-sm font-medium text-purple-400">{thisWeekAvgWpm.toFixed(1)} / {weeklyGoal} WPM</span>
          </div>
          <div className="relative h-3 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`h-full ${
                weeklyProgress >= 100
                  ? 'bg-gradient-to-r from-success to-green-400'
                  : 'bg-gradient-to-r from-purple-600 to-purple-400'
              }`}
            />
          </div>
          {weeklyProgress >= 100 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-success mt-1 flex items-center gap-1"
            >
              <span>🎉</span> {t('insights.weeklyGoalReached')}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
})
