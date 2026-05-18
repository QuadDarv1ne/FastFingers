/**
 * Hook and utilities for tracking text usage statistics.
 * Stores usage counts and performance metrics per text ID.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'

export interface TextUsageStats {
  textId: string
  title: string
  usageCount: number
  avgWpm: number
  avgAccuracy: number
  lastUsed: string
}

const USAGE_KEY = 'fastfingers_textUsage'

function loadUsage(): Record<string, { count: number; totalWpm: number; totalAccuracy: number; lastUsed: string }> {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveUsage(usage: Record<string, { count: number; totalWpm: number; totalAccuracy: number; lastUsed: string }>) {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage))
  } catch {
    // Ignore
  }
}

export function recordTextUsage(textId: string, _title: string, wpm: number, accuracy: number) {
  const usage = loadUsage()
  const entry = usage[textId] || { count: 0, totalWpm: 0, totalAccuracy: 0, lastUsed: '' }
  entry.count += 1
  entry.totalWpm += wpm
  entry.totalAccuracy += accuracy
  entry.lastUsed = new Date().toISOString()
  usage[textId] = entry
  saveUsage(usage)
}

export function useTextUsageStats() {
  const [usage, setUsage] = useState<Record<string, { count: number; totalWpm: number; totalAccuracy: number; lastUsed: string }>>({})

  useEffect(() => {
    setUsage(loadUsage())
  }, [])

  const stats = useMemo((): TextUsageStats[] => {
    return Object.entries(usage).map(([textId, data]) => ({
      textId,
      title: textId, // Title will be resolved by TextManager
      usageCount: data.count,
      avgWpm: data.count > 0 ? Math.round(data.totalWpm / data.count) : 0,
      avgAccuracy: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0,
      lastUsed: data.lastUsed,
    }))
  }, [usage])

  const refresh = useCallback(() => {
    setUsage(loadUsage())
  }, [])

  const clearStats = useCallback(() => {
    if (!confirm('Сбросить статистику использования текстов?')) return
    localStorage.removeItem(USAGE_KEY)
    setUsage({})
  }, [])

  return { stats, refresh, clearStats }
}
