import { useState, useEffect, useCallback } from 'react'
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

const STORAGE_KEY = 'fastfingers_history'

export function useTypingHistory() {
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
      console.error('Failed to load history:', e)
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
        sessions: [session, ...prev.sessions].slice(0, 100), // Храним последние 100
        totalSessions: prev.totalSessions + 1,
        totalTime: prev.totalTime + Math.floor(stats.timeElapsed / 60),
      }
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch (e) {
        console.error('Failed to save history:', e)
      }
      
      return newHistory
    })
  }, [])

  // Обновление тепловой карты
  const updateHeatmap = useCallback((key: string, isCorrect: boolean) => {
    setHistory(prev => {
      const newHeatmap = updateKeyHeatmap({ ...prev.heatmap }, key, isCorrect)
      
      const newHistory = {
        ...prev,
        heatmap: newHeatmap,
      }
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch (e) {
        console.error('Failed to save heatmap:', e)
      }
      
      return newHistory
    })
  }, [])

  // Очистка истории
  const clearHistory = useCallback(() => {
    setHistory({
      sessions: [],
      heatmap: {},
      totalSessions: 0,
      totalTime: 0,
    })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Статистика за период
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

  return {
    history,
    addSession,
    updateHeatmap,
    clearHistory,
    getStatsForPeriod,
  }
}
