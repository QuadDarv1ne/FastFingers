import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { TypingStats, KeyHeatmapData } from '../types'
import { updateKeyHeatmap } from '../utils/stats'
import { saveTypingSession, flushPendingSessions, isBackendAvailable } from '../services/cloudSync'
import { useAuth } from './useAuth'

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
  isOnline: boolean
  addSession: (stats: TypingStats, xp: number) => void
  updateHeatmap: (key: string, isCorrect: boolean) => void
  clearHistory: () => void
  getStatsForPeriod: (days: number) => { avgWpm: number; avgAccuracy: number; bestWpm: number; sessions: number }
  getBestSession: SessionData | null
  getRecentSessions: (count: number) => SessionData[]
}

const STORAGE_KEY = 'fastfingers_history'
const MAX_SESSIONS = 100

function loadHistory(onError: (msg: string) => void): HistoryData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown load error'
    onError(`Failed to load history: ${msg}`)
  }
  return { sessions: [], heatmap: {}, totalSessions: 0, totalTime: 0 }
}

function saveHistory(history: HistoryData, onError: (msg: string) => void): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown save error'
    onError(`Failed to save history: ${msg}`)
  }
}

export function useTypingHistory(): UseTypingHistoryReturn {
  const { user } = useAuth()
  const userRef = useRef(user)
  userRef.current = user
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedSave = useCallback((historyData: HistoryData) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveHistory(historyData, setError)
      saveTimeoutRef.current = null
    }, 500)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryData>(() => loadHistory(setError))
  const [isOnline, setIsOnline] = useState(isBackendAvailable())

  useEffect(() => {
    setIsLoading(false)
    // Проверка доступности бэкенда при загрузке
    setIsOnline(isBackendAvailable())
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
      debouncedSave(newHistory)
      return newHistory
    })

    // Сохранение в облако с fallback
    if (userRef.current) {
      saveTypingSession(userRef.current.id, stats, xp)
        .then(() => {
          setIsOnline(isBackendAvailable())
          setError(null)
          flushPendingSessions()
        })
        .catch(() => {
          // Ignore cloud sync errors
        })
    }
  }, [debouncedSave])

  const updateHeatmap = useCallback((key: string, isCorrect: boolean) => {
    setHistory(prev => {
      const newHeatmap = updateKeyHeatmap({ ...prev.heatmap }, key, isCorrect)
      const newHistory = { ...prev, heatmap: newHeatmap }
      debouncedSave(newHistory)
      return newHistory
    })
  }, [debouncedSave])

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
    let best: SessionData | null = null
    for (const s of history.sessions) {
      if (!best || s.wpm > best.wpm) best = s
    }
    return best
  }, [history.sessions])

  const getRecentSessions = useCallback((count: number) => {
    return history.sessions.slice(0, count)
  }, [history])

  return {
    history,
    isLoading,
    error,
    isOnline,
    addSession,
    updateHeatmap,
    clearHistory,
    getStatsForPeriod,
    getBestSession,
    getRecentSessions,
  }
}
