import { useMemo } from 'react'
import { useAppTranslation } from '../i18n/config'
import { useTypingHistory } from '../hooks/useTypingHistory'

interface WeeklyProgressProps {
  compact?: boolean
}

export function WeeklyProgress({ compact = false }: WeeklyProgressProps) {
  const { t } = useAppTranslation()
  const { history } = useTypingHistory()

  // Get data for the last 7 days
  const weeklyData = useMemo(() => {
    const days = [
      t('stats.day.mon'),
      t('stats.day.tue'),
      t('stats.day.wed'),
      t('stats.day.thu'),
      t('stats.day.fri'),
      t('stats.day.sat'),
      t('stats.day.sun'),
    ]
    const today = new Date()
    const result = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      if (!dateStr) continue
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
      const dayName = days[dayIndex] ?? '??'

      const sessionsOnDay = history.sessions.filter(s =>
        s.date.startsWith(dateStr)
      )

      const totalXp = sessionsOnDay.reduce((sum, s) => sum + s.xp, 0)
      const avgWpm = sessionsOnDay.length > 0
        ? Math.round(sessionsOnDay.reduce((sum, s) => sum + s.wpm, 0) / sessionsOnDay.length)
        : 0
      const totalTime = sessionsOnDay.reduce((sum, s) => sum + (s.duration ?? 0), 0)

      result.push({
        date: dateStr,
        dayName,
        dayNum: date.getDate(),
        sessions: sessionsOnDay.length,
        xp: totalXp,
        avgWpm,
        totalTime,
      })
    }

    return result
  }, [history.sessions, t])

  const maxSessions = weeklyData.reduce((m, d) => Math.max(m, d.sessions), 1)
  const maxXp = weeklyData.reduce((m, d) => Math.max(m, d.xp), 1)

  const { totalSessions, totalXp, avgWpmWeek, totalTimeWeek } = useMemo(() => {
    let sessions = 0
    let xp = 0
    let wpmSum = 0
    let wpmCount = 0
    let timeSum = 0

    for (const d of weeklyData) {
      sessions += d.sessions
      xp += d.xp
      if (d.avgWpm > 0) {
        wpmSum += d.avgWpm
        wpmCount++
      }
      timeSum += d.totalTime
    }

    return {
      totalSessions: sessions,
      totalXp: xp,
      avgWpmWeek: wpmCount > 0 ? Math.round(wpmSum / wpmCount) : 0,
      totalTimeWeek: Math.round(timeSum / 60),
    }
  }, [weeklyData])

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-dark-400">{t('weekly.thisWeek')}</h3>
          <span className="text-xs text-primary-400">
            {t('weekly.sessionsCount', { count: totalSessions })}
          </span>
        </div>
        <div className="flex gap-1 h-16">
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col justify-end group relative"
            >
              <div
                className="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all hover:from-primary-500 hover:to-primary-300"
                style={{
                  height: `${(day.sessions / maxSessions) * 100}%`,
                  minHeight: day.sessions > 0 ? '4px' : '0',
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 
                            bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 
                            transition-opacity whitespace-nowrap pointer-events-none z-10">
                {t('weekly.sessionsCount', { count: day.sessions })}
                <br />
                {day.xp} XP
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-dark-500">
          {weeklyData.map((day) => (
            <span key={day.date} className="flex-1 text-center">{day.dayName}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">{t('weekly.title')}</h2>
          <p className="text-sm text-dark-400">{t('weekly.activity')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-dark-400">{t('weekly.totalLabel')}</p>
          <p className="text-xl font-bold text-primary-400">
            {totalSessions}
          </p>
          <p className="text-xs text-dark-500">{t('weekly.trainings')}</p>
        </div>
      </div>

      {/* Training chart */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-dark-400 mb-3">{t('weekly.byDay')}</h3>
        <div className="flex gap-2 h-32">
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col justify-end group relative"
            >
              <div
                className="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg 
                          transition-all hover:from-primary-500 hover:to-primary-300"
                style={{
                  height: `${(day.sessions / maxSessions) * 100}%`,
                  minHeight: day.sessions > 0 ? '8px' : '0',
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                            bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 
                            transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                <p className="font-bold">{day.dayName}, {day.dayNum}</p>
                <p className="text-primary-400">{t('weekly.sessionsCount', { count: day.sessions })}</p>
                <p className="text-yellow-400">{day.xp} XP</p>
                <p className="text-dark-400">{Math.round(day.totalTime / 60)} {t('weekly.minutes')}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className="flex-1 text-center text-xs text-dark-500"
            >
              <p>{day.dayName}</p>
              <p className="text-dark-600">{day.dayNum}</p>
            </div>
          ))}
        </div>
      </div>

      {/* XP statistics */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-dark-400 mb-3">{t('weekly.earnedXp')}</h3>
        <div className="flex gap-2 h-20">
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col justify-end group relative"
            >
              <div
                className="bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg 
                          transition-all hover:from-yellow-500 hover:to-yellow-300"
                style={{
                  height: `${(day.xp / maxXp) * 100}%`,
                  minHeight: day.xp > 0 ? '8px' : '0',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">{t('weekly.trainings')}</p>
          <p className="text-lg font-bold text-primary-400">
            {totalSessions}
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">XP</p>
          <p className="text-lg font-bold text-yellow-400">
            {totalXp}
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">{t('weekly.avgWpmLabel')}</p>
          <p className="text-lg font-bold text-success">
            {avgWpmWeek}
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">{t('weekly.timeLabel')}</p>
          <p className="text-lg font-bold text-dark-300">
            {totalTimeWeek} {t('weekly.minutes')}
          </p>
        </div>
      </div>
    </div>
  )
}
