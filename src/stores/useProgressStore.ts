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
  // Статистика
  sessions: TypingSession[]
  totalXp: number
  level: number
  streak: number
  lastPracticeDate: string | null
  
  // Действия
  addSession: (session: Omit<TypingSession, 'id'>) => void
  addXp: (amount: number) => void
  updateStreak: (date: string) => void
  clearHistory: () => void
  
  // Вычисления
  getBestWpm: () => number
  getAvgAccuracy: () => number
  getTotalPracticeTime: () => number
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
        sessions: [{ ...session, id: crypto.randomUUID() }, ...state.sessions].slice(0, 1000),
      })),
      
      addXp: (amount) => set((state) => {
        const newTotalXp = state.totalXp + amount
        const newLevel = Math.floor(newTotalXp / 1000) + 1
        return {
          totalXp: newTotalXp,
          level: newLevel,
        }
      }),
      
      updateStreak: (date) => set((state) => {
        if (!state.lastPracticeDate) {
          return { streak: 1, lastPracticeDate: date }
        }
        
        const last = new Date(state.lastPracticeDate)
        const current = new Date(date)
        const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) {
          return state
        }
        
        if (diffDays === 1) {
          return { streak: state.streak + 1, lastPracticeDate: date }
        }
        
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
        const sessions = get().sessions.slice(0, 10)
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
