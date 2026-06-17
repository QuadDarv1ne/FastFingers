import { describe, it, expect } from 'vitest'
import {
  mapSupabaseSessions,
  computeStudentStats,
  type SupabaseSession,
  type SessionData,
} from '../utils/studentStats'

describe('studentStats', () => {
  describe('mapSupabaseSessions', () => {
    it('should transform Supabase sessions to SessionData format', () => {
      const supabaseSessions: SupabaseSession[] = [
        {
          id: '1',
          user_id: 'u1',
          wpm: 50,
          cpm: 250,
          accuracy: 95,
          errors: 3,
          correct_chars: 190,
          total_chars: 200,
          duration: 60,
          xp: 100,
          created_at: '2026-06-15T10:00:00Z',
        },
      ]

      const result = mapSupabaseSessions(supabaseSessions)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '1',
        date: '2026-06-15T10:00:00Z',
        wpm: 50,
        accuracy: 95,
        cpm: 250,
        errors: 3,
        duration: 60,
        xp: 100,
      })
    })

    it('should return empty array for empty input', () => {
      const result = mapSupabaseSessions([])
      expect(result).toEqual([])
    })

    it('should handle multiple sessions', () => {
      const sessions: SupabaseSession[] = [
        { id: '1', user_id: 'u1', wpm: 50, cpm: 250, accuracy: 95, errors: 3, correct_chars: 190, total_chars: 200, duration: 60, xp: 100, created_at: '2026-06-15T10:00:00Z' },
        { id: '2', user_id: 'u1', wpm: 60, cpm: 300, accuracy: 98, errors: 1, correct_chars: 196, total_chars: 200, duration: 120, xp: 150, created_at: '2026-06-16T10:00:00Z' },
      ]

      const result = mapSupabaseSessions(sessions)
      expect(result).toHaveLength(2)
    })
  })

  describe('computeStudentStats', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0] as string

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)

    const makeSession = (date: Date, wpm: number, accuracy: number, duration: number, errors = 0): SessionData => ({
      id: 'test-id',
      date: date.toISOString(),
      wpm,
      accuracy,
      cpm: wpm * 5,
      errors,
      duration,
      xp: wpm * 2,
    })

    it('should return zeroed stats for empty sessions', () => {
      const result = computeStudentStats([])

      expect(result.summary.totalSessions).toBe(0)
      expect(result.summary.bestWpm).toBe(0)
      expect(result.summary.avgAccuracy).toBe(0)
      expect(result.summary.totalPracticeTime).toBe(0)
      expect(result.summary.avgWpm).toBe(0)
      expect(result.summary.totalErrors).toBe(0)
      expect(result.summary.totalChars).toBe(0)
      expect(result.dailyStats).toHaveLength(30)
      expect(result.personalRecords.bestWpm).toBe(0)
      expect(result.personalRecords.bestAccuracy).toBe(0)
      expect(result.personalRecords.totalSessions).toBe(0)
      expect(result.wpmTrend).toHaveLength(0)
      expect(result.activityByDayOfWeek).toHaveLength(7)
    })

    it('should compute summary for a single session', () => {
      const session = makeSession(today, 50, 95, 60, 3)
      const result = computeStudentStats([session])

      expect(result.summary.totalSessions).toBe(1)
      expect(result.summary.bestWpm).toBe(50)
      expect(result.summary.avgAccuracy).toBe(95)
      expect(result.summary.totalPracticeTime).toBe(60)
      expect(result.summary.avgWpm).toBe(50)
      expect(result.summary.totalErrors).toBe(3)
      expect(result.summary.totalChars).toBe(250)
    })

    it('should compute summary for multiple sessions', () => {
      const sessions = [
        makeSession(today, 50, 95, 60, 3),
        makeSession(today, 60, 98, 120, 1),
      ]
      const result = computeStudentStats(sessions)

      expect(result.summary.totalSessions).toBe(2)
      expect(result.summary.bestWpm).toBe(60)
      expect(result.summary.avgAccuracy).toBe(97)
      expect(result.summary.totalPracticeTime).toBe(180)
      expect(result.summary.avgWpm).toBe(55)
      expect(result.summary.totalErrors).toBe(4)
    })

    it('should compute daily stats for last 30 days', () => {
      const session = makeSession(today, 50, 95, 60)
      const result = computeStudentStats([session])

      expect(result.dailyStats).toHaveLength(30)
      const todayEntry = result.dailyStats.find(d => d.date === todayStr)
      expect(todayEntry).toBeDefined()
      expect(todayEntry?.avgWpm).toBe(50)
      expect(todayEntry?.avgAccuracy).toBe(95)
      expect(todayEntry?.sessions).toBe(1)

      // All other days should have 0 sessions
      const otherDays = result.dailyStats.filter(d => d.date !== todayStr)
      for (const day of otherDays) {
        expect(day.sessions).toBe(0)
        expect(day.avgWpm).toBe(0)
        expect(day.avgAccuracy).toBe(0)
      }
    })

    it('should compute personal records', () => {
      const sessions = [
        makeSession(today, 50, 95, 60, 3),
        makeSession(yesterday, 60, 98, 120, 1),
        makeSession(twoDaysAgo, 40, 90, 30, 5),
      ]
      const result = computeStudentStats(sessions)

      expect(result.personalRecords.bestWpm).toBe(60)
      expect(result.personalRecords.bestAccuracy).toBe(98)
      expect(result.personalRecords.bestCpm).toBe(300)
      expect(result.personalRecords.totalSessions).toBe(3)
      expect(result.personalRecords.totalTime).toBe(210)
    })

    it('should compute longest streak from consecutive days', () => {
      const sessions = [
        makeSession(today, 50, 95, 60),
        makeSession(yesterday, 55, 96, 60),
        makeSession(twoDaysAgo, 45, 93, 60),
      ]
      const result = computeStudentStats(sessions)

      expect(result.personalRecords.longestStreak).toBeGreaterThanOrEqual(3)
    })

    it('should compute streak that resets on gap', () => {
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)

      const sessions = [
        makeSession(today, 50, 95, 60),
        makeSession(yesterday, 55, 96, 60),
        makeSession(threeDaysAgo, 45, 93, 60),
        makeSession(fiveDaysAgo, 40, 90, 60),
        makeSession(new Date(fiveDaysAgo.getTime() - 24 * 60 * 60 * 1000), 35, 88, 60),
      ]
      const result = computeStudentStats(sessions)

      expect(result.personalRecords.longestStreak).toBeGreaterThanOrEqual(2)
    })

    it('should compute wpm trend for last 14 days with data', () => {
      const sessions = [
        makeSession(today, 50, 95, 60),
        makeSession(yesterday, 55, 96, 60),
      ]
      const result = computeStudentStats(sessions)

      expect(result.wpmTrend.length).toBeGreaterThan(0)
      for (const entry of result.wpmTrend) {
        expect(entry.wpm).toBeGreaterThan(0)
        expect(entry.accuracy).toBeGreaterThan(0)
      }
    })

    it('should compute activity by day of week', () => {
      const sessions = [
        makeSession(today, 50, 95, 60),
        makeSession(yesterday, 55, 96, 60),
      ]
      const result = computeStudentStats(sessions)

      expect(result.activityByDayOfWeek).toHaveLength(7)
      const totalActivitySessions = result.activityByDayOfWeek.reduce((sum, d) => sum + d.sessions, 0)
      expect(totalActivitySessions).toBe(2)
    })
  })
})
