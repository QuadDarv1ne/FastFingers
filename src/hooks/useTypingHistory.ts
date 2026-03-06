import { useState, useEffect, useCallback, useMemo } from 'react'
import { TypingStats, KeyHeatmapData } from '../types'
import { updateKeyHeatmap } from '../utils/stats'

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

interface HistoryData {
  sessions: SessionData[]
  heatmap: KeyHeatmapData
  totalSessions: number
  totalTime: number
}

interface UseTypingHistoryReturn {
  history: HistoryData
  isLoading: boolean
  error: string | null
  addSession: (stats: TypingStats, xp: number) => void
  updateHeatmap: (key: string, isCorrect: boolean) => void
  clearHistory: () => void
  getStatsForPeriod: (days: number) => { avgWpm: number; avgAccuracy: number; bestWpm: number; sessions: number }
  getBestSession: SessionData | null
  getRecentSessions: (count: number) => SessionData[]
}

const STORAGE_KEY = 'fastfingers_history'
const MAX_SESSIONS = 100

function loadHistory(): HistoryData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Ignore load errors
  }
  return { sessions: [], heatmap: {}, totalSessions: 0, totalTime: 0 }
}

function saveHistory(history: HistoryData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // Ignore save errors
  }
}

// Debounced save для оптимизации
let saveTimeout: NodeJS.Timeout | null = null
const debouncedSaveHistory = (history: HistoryData) => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveHistory(history)
    saveTimeout = null
  }, 500)
}

export function useTypingHistory(): UseTypingHistoryReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryData>(loadHistory)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const addSession = useCallback((stats: TypingStats, xp: number) => {
    const session: SessionData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      cpm: stats.cpm,
      errors: stats.errors,
      duration: stats.timeElapsed,
      xp,
    }

    setHistory(prev => {
      const newHistory = {
        ...prev,
        sessions: [session, ...prev.sessions].slice(0, MAX_SESSIONS),
        totalSessions: prev.totalSessions + 1,
        totalTime: prev.totalTime + Math.floor(stats.timeElapsed / 60),
      }
      debouncedSaveHistory(newHistory)
      return newHistory
    })
  }, [])

  const updateHeatmap = useCallback((key: string, isCorrect: boolean) => {
    setHistory(prev => {
      const newHeatmap = updateKeyHeatmap({ ...prev.heatmap }, key, isCorrect)
      const newHistory = { ...prev, heatmap: newHeatmap }
      debouncedSaveHistory(newHistory)
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory({ sessions: [], heatmap: {}, totalSessions: 0, totalTime: 0 })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getStatsForPeriod = useCallback((days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    const filtered = history.sessions.filter(s => new Date(s.date).getTime() > cutoff)

    if (filtered.length === 0) {
      return { avgWpm: 0, avgAccuracy: 0, bestWpm: 0, sessions: 0 }
    }

    return {
      avgWpm: Math.round(filtered.reduce((sum, s) => sum + s.wpm, 0) / filtered.length),
      avgAccuracy: Math.round(filtered.reduce((sum, s) => sum + s.accuracy, 0) / filtered.length),
      bestWpm: Math.max(...filtered.map(s => s.wpm)),
      sessions: filtered.length,
    }
  }, [history.sessions])

  const getBestSession = useMemo(() => {
    if (history.sessions.length === 0) return null
    return history.sessions.reduce((best, current) =>
      current.wpm > best.wpm ? current : best
    )
  }, [history.sessions])

  const getRecentSessions = useCallback((count: number) => {
    return history.sessions.slice(0, count)
  }, [history.sessions])

  return {
    history,
    isLoading,
    error,
    addSession,
    updateHeatmap,
    clearHistory,
    getStatsForPeriod,
    getBestSession,
    getRecentSessions,
  }
}
