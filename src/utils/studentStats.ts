/**
 * Pure-function student statistics computation.
 * Accepts Supabase TypingSessionRow objects and returns analytics data.
 * Extracted from useAdvancedStats so it can work with any sessions source.
 */

export interface SupabaseSession {
  id: string
  user_id: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  correct_chars: number
  total_chars: number
  duration: number
  xp: number
  created_at: string
}

export interface SessionData {
  id: string
  date: string
  wpm: number
  accuracy: number
  cpm: number
  errors: number
  duration: number
  xp: number
}

export interface DailyStats {
  date: string
  avgWpm: number
  avgAccuracy: number
  sessions: number
  totalChars: number
}

export interface PersonalRecords {
  bestWpm: number
  bestAccuracy: number
  bestCpm: number
  longestStreak: number
  totalSessions: number
  totalTime: number
}

export interface WpmTrendData {
  date: string
  wpm: number
  accuracy: number
}

export interface ActivityDayData {
  day: string
  index: number
  sessions: number
  avgWpm: number
}

export interface StudentStatsResult {
  dailyStats: DailyStats[]
  personalRecords: PersonalRecords
  wpmTrend: WpmTrendData[]
  activityByDayOfWeek: ActivityDayData[]
  summary: {
    totalSessions: number
    bestWpm: number
    avgAccuracy: number
    totalPracticeTime: number
    avgWpm: number
    totalErrors: number
    totalChars: number
  }
}

/** Transform Supabase sessions to app SessionData format. */
export function mapSupabaseSessions(sessions: SupabaseSession[]): SessionData[] {
  return sessions.map(s => ({
    id: s.id,
    date: s.created_at,
    wpm: s.wpm,
    accuracy: s.accuracy,
    cpm: s.cpm,
    errors: s.errors,
    duration: s.duration,
    xp: s.xp,
  }))
}

export interface FetchResult<T> { data: T[] | null; error: Error | null }

/** Compute full analytics from a sessions array. */
export function computeStudentStats(sessions: SessionData[], locale = 'en'): StudentStatsResult {
  const dayMs = 24 * 60 * 60 * 1000
  const now = Date.now()

  // Bucket sessions by date
  const sessionsByDate = new Map<string, SessionData[]>()
  for (const s of sessions) {
    const dateStr = new Date(s.date).toISOString().split('T')[0] || ''
    if (!dateStr) continue
    const bucket = sessionsByDate.get(dateStr)
    if (bucket) {
      bucket.push(s)
    } else {
      sessionsByDate.set(dateStr, [s])
    }
  }

  // Summary
  const totalSessions = sessions.length
  const bestWpm = sessions.reduce((max, s) => Math.max(max, s.wpm), 0)
  const avgAccuracy = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions)
    : 0
  const totalPracticeTime = sessions.reduce((sum, s) => sum + s.duration, 0)
  const avgWpm = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / totalSessions)
    : 0
  const totalErrors = sessions.reduce((sum, s) => sum + s.errors, 0)
  const totalChars = sessions.reduce((sum, s) => sum + (s.cpm * s.duration / 60), 0)

  // Daily stats (last 30 days)
  const dailyStats: DailyStats[] = []
  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(now - i * dayMs)
    dayStart.setHours(0, 0, 0, 0)
    const dateStr = dayStart.toISOString().split('T')[0] || ''
    const daySessions = sessionsByDate.get(dateStr) || []
    dailyStats.push({
      date: dateStr,
      avgWpm: daySessions.length > 0
        ? Math.round(daySessions.reduce((sum, s) => sum + s.wpm, 0) / daySessions.length)
        : 0,
      avgAccuracy: daySessions.length > 0
        ? Math.round(daySessions.reduce((sum, s) => sum + s.accuracy, 0) / daySessions.length)
        : 0,
      sessions: daySessions.length,
      totalChars: Math.round(daySessions.reduce((sum, s) => sum + s.cpm * s.duration / 60, 0)),
    })
  }

  // Personal records
  const bestAccuracy = sessions.reduce((max, s) => Math.max(max, s.accuracy), 0)
  const bestCpm = sessions.reduce((max, s) => Math.max(max, s.cpm), 0)

  // Longest streak
  const practiceDates = Array.from(sessionsByDate.keys())
    .map(d => new Date(d).getTime())
    .sort((a, b) => a - b)
  let longestStreak = 0
  let currentStreak = 0
  for (let i = 0; i < practiceDates.length; i++) {
    const prev = i > 0 ? practiceDates[i - 1] : undefined
    const curr = practiceDates[i]
    if (curr === undefined) continue
    if (prev === undefined || Math.round((curr - prev) / dayMs) === 1) {
      currentStreak++
    } else {
      currentStreak = 1
    }
    longestStreak = Math.max(longestStreak, currentStreak)
  }

  const personalRecords: PersonalRecords = {
    bestWpm,
    bestAccuracy,
    bestCpm,
    longestStreak,
    totalSessions,
    totalTime: totalPracticeTime,
  }

  // WPM trend (last 14 days with data)
  const wpmTrend: WpmTrendData[] = []
  for (let i = 13; i >= 0; i--) {
    const dayStart = new Date(now - i * dayMs)
    dayStart.setHours(0, 0, 0, 0)
    const dateStr = dayStart.toISOString().split('T')[0] || ''
    const daySessions = sessionsByDate.get(dateStr) || []
    if (daySessions.length > 0) {
      wpmTrend.push({
        date: dayStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
        wpm: Math.round(daySessions.reduce((sum, s) => sum + s.wpm, 0) / daySessions.length),
        accuracy: Math.round(daySessions.reduce((sum, s) => sum + s.accuracy, 0) / daySessions.length),
      })
    }
  }

  // Activity by day of week
  const dayLabels = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 7 + i)))
  const activityByDayOfWeek = dayLabels.map((day, index) => ({
    day, index, sessions: 0, totalWpm: 0, avgWpm: 0,
  }))
  for (const s of sessions) {
    const dayIndex = new Date(s.date).getDay()
    const entry = activityByDayOfWeek[dayIndex]
    if (entry) {
      entry.sessions++
      entry.totalWpm += s.wpm
    }
  }
  for (const a of activityByDayOfWeek) {
    if (a.sessions > 0) a.avgWpm = Math.round(a.totalWpm / a.sessions)
  }

  return {
    dailyStats,
    personalRecords,
    wpmTrend,
    activityByDayOfWeek: activityByDayOfWeek.map(({ day, index, sessions, avgWpm }) => ({ day, index, sessions, avgWpm })),
    summary: { totalSessions, bestWpm, avgAccuracy, totalPracticeTime, avgWpm, totalErrors, totalChars: Math.round(totalChars) },
  }
}
