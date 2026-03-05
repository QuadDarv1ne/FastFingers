import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
const XP_PER_LEVEL = 1000

function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1
}

function calculateStreak(lastDate: string | null, currentDate: string): number {
  if (!lastDate) return 1

  const last = new Date(lastDate)
  const current = new Date(currentDate)
  const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 0
  if (diffDays === 1) return 1
  return -1
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

        if (streakChange === 0) return state
        if (streakChange === 1) return { streak: state.streak + 1, lastPracticeDate: date }
        return { streak: 1, lastPracticeDate: date }
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
        sessions: state.sessions.slice(0, 100),
        totalXp: state.totalXp,
        level: state.level,
        streak: state.streak,
        lastPracticeDate: state.lastPracticeDate,
      }),
    }
  )
)
