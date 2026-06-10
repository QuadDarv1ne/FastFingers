import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
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
}

const MAX_SESSIONS = 1000
const RECENT_SESSIONS_COUNT = 10

// ─── Shared computation functions ────────────────────────────────────────────
// Pure functions used by both imperative methods and reactive selectors.

export function getBestWpmFromSessions(sessions: TypingSession[]): number {
  return sessions.length > 0 ? Math.max(...sessions.map((s) => s.wpm)) : 0
}

export function getAvgAccuracyFromSessions(sessions: TypingSession[]): number {
  const recent = sessions.slice(0, RECENT_SESSIONS_COUNT)
  return recent.length > 0
    ? Math.round(recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length)
    : 0
}

export function getTotalPracticeTimeFromSessions(sessions: TypingSession[]): number {
  return sessions.reduce((sum, s) => sum + s.duration, 0)
}

export type StreakResult = 'first' | 'increment' | 'unchanged' | 'reset'

const calculateStreak = (lastDate: string | null, currentDate: string): StreakResult => {
  if (!lastDate) return 'first'

  const last = new Date(lastDate)
  const current = new Date(currentDate)

  // Compare calendar dates in UTC to match ISO timestamp inputs
  const lastDay = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())
  const currentDay = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate())
  const diffDays = Math.round((currentDay - lastDay) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'unchanged'
  if (diffDays === 1) return 'increment'
  return 'reset'
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, _get) => ({
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
        const action = calculateStreak(state.lastPracticeDate, date)

        switch (action) {
          case 'first':
            return { streak: 1, lastPracticeDate: date }
          case 'increment':
            return { streak: state.streak + 1, lastPracticeDate: date }
          case 'unchanged':
            return { streak: state.streak, lastPracticeDate: date }
          case 'reset':
            return { streak: 1, lastPracticeDate: date }
        }
      }),

      clearHistory: () => set({
        sessions: [],
        totalXp: 0,
        level: 1,
        streak: 0,
        lastPracticeDate: null
      }),

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
  useProgressStore((state) => getBestWpmFromSessions(state.sessions))

/** Average accuracy of the most recent sessions */
export const useAvgAccuracy = () =>
  useProgressStore((state) => getAvgAccuracyFromSessions(state.sessions))

/** Total practice time in seconds across all sessions */
export const useTotalPracticeTime = () =>
  useProgressStore((state) => getTotalPracticeTimeFromSessions(state.sessions))

/** All three computed stats at once — single subscription for stats panels */
export const useProgressStats = () =>
  useProgressStore(useShallow((state) => ({
    bestWpm: getBestWpmFromSessions(state.sessions),
    avgAccuracy: getAvgAccuracyFromSessions(state.sessions),
    totalPracticeTime: getTotalPracticeTimeFromSessions(state.sessions),
  })))
