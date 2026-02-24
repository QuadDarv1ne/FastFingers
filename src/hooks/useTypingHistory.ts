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

export function useTypingHistory(): UseTypingHistoryReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryData>({
    sessions: [],
    heatmap: {},
    totalSessions: 0,
    totalTime: 0,
  })

  // Загрузка истории при старте
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load history'
      setError(message)
      console.error('Failed to load history:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Сохранение истории с обработкой ошибок
  const saveHistory = useCallback((newHistory: HistoryData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      setError(null)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save history'
      setError(message)
      console.error('Failed to save history:', e)
    }
  }, [])

  // Добавление сессии
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

      saveHistory(newHistory)
      return newHistory
    })
  }, [saveHistory])

  // Обновление тепловой карты
  const updateHeatmap = useCallback((key: string, isCorrect: boolean) => {
    setHistory(prev => {
      const newHeatmap = updateKeyHeatmap({ ...prev.heatmap }, key, isCorrect)

      const newHistory = {
        ...prev,
        heatmap: newHeatmap,
      }

      saveHistory(newHistory)
      return newHistory
    })
  }, [saveHistory])

  // Очистка истории
  const clearHistory = useCallback(() => {
    setHistory({
      sessions: [],
      heatmap: {},
      totalSessions: 0,
      totalTime: 0,
    })
    localStorage.removeItem(STORAGE_KEY)
    setError(null)
  }, [])

  // Статистика за период (мемоизация)
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

  // Лучшая сессия (мемоизация)
  const getBestSession = useMemo(() => {
    if (history.sessions.length === 0) return null
    return history.sessions.reduce((best, current) => 
      current.wpm > best.wpm ? current : best
    )
  }, [history.sessions])

  // Последние сессии (мемоизация)
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
