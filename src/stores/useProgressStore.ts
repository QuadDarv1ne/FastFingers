import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateLevel } from '../utils/stats'

interface TypingSession {
  id: string
  date: string
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  duration: number
  xp: number
}

interface ProgressState {
  sessions: TypingSession[]
  totalXp: number
  level: number
  streak: number
  lastPracticeDate: string | null
  addSession: (session: Omit<TypingSession, 'id'>) => void
  addXp: (amount: number) => void
  updateStreak: (date: string) => void
  clearHistory: () => void
  getBestWpm: () => number
  getAvgAccuracy: () => number
  getTotalPracticeTime: () => number
}

const MAX_SESSIONS = 1000
const RECENT_SESSIONS_COUNT = 10

const calculateStreak = (lastDate: string | null, currentDate: string): number => {
  if (!lastDate) return 1

  const last = new Date(lastDate)
  const current = new Date(currentDate)
  const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 0
  if (diffDays === 1) return 1
  return 0 // Streak broken — reset
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      sessions: [],
      totalXp: 0,
      level: 1,
      streak: 0,
      lastPracticeDate: null,

      addSession: (session) => set((state) => ({
        sessions: [{ ...session, id: crypto.randomUUID() }, ...state.sessions].slice(0, MAX_SESSIONS),
      })),

      addXp: (amount) => set((state) => {
        const newTotalXp = state.totalXp + amount
        return {
          totalXp: newTotalXp,
          level: calculateLevel(newTotalXp),
        }
      }),

      updateStreak: (date) => set((state) => {
        const streakChange = calculateStreak(state.lastPracticeDate, date)

        if (streakChange === 0) {
          // Same day or broken streak — just update date, keep streak same for same day, reset for broken
          const last = state.lastPracticeDate ? new Date(state.lastPracticeDate) : null
          const current = new Date(date)
          const diffDays = last ? Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) : -1
          if (diffDays > 1) return { streak: 1, lastPracticeDate: date } // Broken streak, reset to 1
          return { lastPracticeDate: date } // Same day, no change
        }
        return { streak: state.streak + 1, lastPracticeDate: date }
      }),

      clearHistory: () => set({
        sessions: [],
        totalXp: 0,
        level: 1,
        streak: 0,
        lastPracticeDate: null
      }),

      getBestWpm: () => {
        const sessions = get().sessions
        return sessions.length > 0 ? Math.max(...sessions.map(s => s.wpm)) : 0
      },

      getAvgAccuracy: () => {
        const sessions = get().sessions.slice(0, RECENT_SESSIONS_COUNT)
        if (sessions.length === 0) return 0
        return Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
      },
      
      getTotalPracticeTime: () => {
        return get().sessions.reduce((sum, s) => sum + s.duration, 0)
      },
    }),
    {
      name: 'fastfingers-progress',
      partialize: (state) => ({
        sessions: state.sessions.slice(0, MAX_SESSIONS),
        totalXp: state.totalXp,
        level: state.level,
        streak: state.streak,
        lastPracticeDate: state.lastPracticeDate,
      }),
    }
  )
)

// ─── Reactive selector helpers ───────────────────────────────────────────────
// Components use these to subscribe to specific computed values.
// Unlike imperative getState() calls, these trigger re-renders when the value changes.

/** Best WPM across all sessions */
export const useBestWpm = () =>
  useProgressStore((state) =>
    state.sessions.length > 0
      ? Math.max(...state.sessions.map((s) => s.wpm))
      : 0
  )

/** Average accuracy of the most recent sessions */
export const useAvgAccuracy = () =>
  useProgressStore((state) => {
    const sessions = state.sessions.slice(0, RECENT_SESSIONS_COUNT)
    return sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
      : 0
  })

/** Total practice time in seconds across all sessions */
export const useTotalPracticeTime = () =>
  useProgressStore((state) =>
    state.sessions.reduce((sum, s) => sum + s.duration, 0)
  )

/** All three computed stats at once — single subscription for stats panels */
export const useProgressStats = () =>
  useProgressStore((state) => {
    const sessions = state.sessions
    const bestWpm = sessions.length > 0
      ? Math.max(...sessions.map((s) => s.wpm))
      : 0
    const recent = sessions.slice(0, RECENT_SESSIONS_COUNT)
    const avgAccuracy = recent.length > 0
      ? Math.round(recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length)
      : 0
    const totalPracticeTime = sessions.reduce((sum, s) => sum + s.duration, 0)
    // Return a string key to avoid creating new objects in selector (prevents infinite loop)
    return `${bestWpm}|${avgAccuracy}|${totalPracticeTime}`
  })
