import { useMemo } from 'react'
import { useTypingHistory } from './useTypingHistory'
import i18n from 'i18next'

interface SessionData {
  id: string
  date: string
  wpm: number
  accuracy: number
  cpm: number
  errors: number
  duration: number
  xp: number
}

interface DailyStats {
  date: string
  avgWpm: number
  avgAccuracy: number
  sessions: number
  totalChars: number
}

interface WeeklyComparison {
  currentWeek: { avgWpm: number; sessions: number; totalChars: number }
  previousWeek: { avgWpm: number; sessions: number; totalChars: number }
  wpmChange: number
  sessionsChange: number
  charsChange: number
}

interface PersonalRecords {
  bestWpm: number
  bestAccuracy: number
  bestCpm: number
  longestStreak: number
  totalSessions: number
  totalTime: number
  bestSession: SessionData | null
}

interface WpmTrendData {
  date: string
  wpm: number
  accuracy: number
}

export function useAdvancedStats() {
  const { history, getStatsForPeriod } = useTypingHistory()
  const { sessions } = history

  // Bucket sessions by date string for O(1) day lookup
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, typeof sessions>()
    for (const s of sessions) {
      const dateStr = new Date(s.date).toISOString().split('T')[0] || ''
      if (!dateStr) continue
      const bucket = map.get(dateStr)
      if (bucket) {
        bucket.push(s)
      } else {
        map.set(dateStr, [s])
      }
    }
    return map
  }, [sessions])

  // Ежедневная статистика за последние 30 дней
  const dailyStats = useMemo<DailyStats[]>(() => {
    const days = 30
    const stats: DailyStats[] = []
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now - i * dayMs)
      dayStart.setHours(0, 0, 0, 0)
      const dateStr = dayStart.toISOString().split('T')[0] || ''
      const sessions = sessionsByDate.get(dateStr) || []

      if (sessions.length > 0) {
        const avgWpm = Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length)
        const avgAccuracy = Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
        const totalChars = sessions.reduce((sum, s) => sum + s.cpm * s.duration / 60, 0)

        stats.push({
          date: dateStr,
          avgWpm,
          avgAccuracy,
          sessions: sessions.length,
          totalChars: Math.round(totalChars),
        })
      } else {
        stats.push({
          date: dateStr,
          avgWpm: 0,
          avgAccuracy: 0,
          sessions: 0,
          totalChars: 0,
        })
      }
    }

    return stats
  }, [sessionsByDate])

  // Сравнение с прошлой неделей
  const weeklyComparison = useMemo<WeeklyComparison>(() => {
    const now = Date.now()
    const weekMs = 7 * 24 * 60 * 60 * 1000

    const currentWeekStart = new Date(now - weekMs)
    const previousWeekStart = new Date(now - 2 * weekMs)

    const currentWeekSessions = sessions.filter(s => new Date(s.date) >= currentWeekStart)
    const previousWeekSessions = sessions.filter(
      s => new Date(s.date) >= previousWeekStart && new Date(s.date) < currentWeekStart
    )

    const calcStats = (sessionList: typeof sessions) => ({
      avgWpm: sessionList.length > 0 ? Math.round(sessionList.reduce((sum, item) => sum + item.wpm, 0) / sessionList.length) : 0,
      sessions: sessionList.length,
      totalChars: Math.round(sessionList.reduce((sum, item) => sum + item.cpm * item.duration / 60, 0)),
    })

    const currentWeek = calcStats(currentWeekSessions)
    const previousWeek = calcStats(previousWeekSessions)

    return {
      currentWeek,
      previousWeek,
      wpmChange: previousWeek.avgWpm > 0 ? Math.round(((currentWeek.avgWpm - previousWeek.avgWpm) / previousWeek.avgWpm) * 100) : 0,
      sessionsChange: previousWeek.sessions > 0 ? Math.round(((currentWeek.sessions - previousWeek.sessions) / previousWeek.sessions) * 100) : 0,
      charsChange: previousWeek.totalChars > 0 ? Math.round(((currentWeek.totalChars - previousWeek.totalChars) / previousWeek.totalChars) * 100) : 0,
    }
  }, [sessions])

  // Вычисление самой длинной серии последовательных дней
  const longestStreak = useMemo(() => {
    if (sessionsByDate.size === 0) return 0

    // Collect and sort unique practice dates
    const dates = Array.from(sessionsByDate.keys())
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime())

    let maxStreak = 1
    let currentStreak = 1
    const dayMs = 24 * 60 * 60 * 1000

    for (let i = 1; i < dates.length; i++) {
      const prev = dates[i - 1]
      const curr = dates[i]
      if (!prev || !curr) continue
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / dayMs)

      if (diffDays === 1) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else if (diffDays > 1) {
        currentStreak = 1
      }
      // diffDays === 0 means same day (duplicate), skip
    }

    return maxStreak
  }, [sessionsByDate])

  // Персональные рекорды
  const personalRecords = useMemo<PersonalRecords>(() => {
    if (sessions.length === 0) {
      return {
        bestWpm: 0,
        bestAccuracy: 0,
        bestCpm: 0,
        longestStreak: 0,
        totalSessions: 0,
        totalTime: 0,
        bestSession: null,
      }
    }

    const fallbackSession: SessionData = { id: '', date: '', wpm: 0, accuracy: 0, cpm: 0, errors: 0, duration: 0, xp: 0 }
    let bestWpmSession: SessionData = sessions[0] ?? fallbackSession
    let bestAccuracySession: SessionData = sessions[0] ?? fallbackSession
    let bestCpmSession: SessionData = sessions[0] ?? fallbackSession

    for (let i = 1; i < sessions.length; i++) {
      const s = sessions[i]
      if (!s) continue
      if (s.wpm > bestWpmSession.wpm) bestWpmSession = s
      if (s.accuracy > bestAccuracySession.accuracy) bestAccuracySession = s
      if (s.cpm > bestCpmSession.cpm) bestCpmSession = s
    }

    return {
      bestWpm: bestWpmSession.wpm,
      bestAccuracy: bestAccuracySession.accuracy,
      bestCpm: bestCpmSession.cpm,
      longestStreak,
      totalSessions: history.totalSessions,
      totalTime: history.totalTime,
      bestSession: bestWpmSession,
    }
  }, [sessions, history.totalSessions, history.totalTime, longestStreak])

  // Данные для графика WPM тренда
  const wpmTrend = useMemo<WpmTrendData[]>(() => {
    const days = 14
    const trend: WpmTrendData[] = []
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now - i * dayMs)
      dayStart.setHours(0, 0, 0, 0)
      const dateStr = dayStart.toISOString().split('T')[0] || ''
      const sessions = sessionsByDate.get(dateStr) || []

      if (sessions.length > 0) {
        const avgWpm = Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length)
        const avgAccuracy = Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
        trend.push({
          date: dayStart.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }),
          wpm: avgWpm,
          accuracy: avgAccuracy,
        })
      }
    }

    return trend
  }, [sessionsByDate])

  // Активность по дням недели
  const activityByDayOfWeek = useMemo(() => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    const activity = days.map((day, index) => ({
      day,
      index,
      sessions: 0,
      totalWpm: 0,
      avgWpm: 0,
    }))

    sessions.forEach(session => {
      const dayIndex = new Date(session.date).getDay()
      const dayActivity = activity[dayIndex]
      if (dayActivity) {
        dayActivity.sessions++
        dayActivity.totalWpm += session.wpm
      }
    })

    activity.forEach(a => {
      if (a.sessions > 0) {
        a.avgWpm = Math.round(a.totalWpm / a.sessions)
      }
    })

    return activity
  }, [sessions])

  return {
    dailyStats,
    weeklyComparison,
    personalRecords,
    wpmTrend,
    activityByDayOfWeek,
    getStatsForPeriod,
  }
}
