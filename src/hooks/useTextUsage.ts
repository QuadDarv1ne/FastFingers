/**
 * Hook and utilities for tracking text usage statistics.
 * Stores usage counts and performance metrics per text ID.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getFromStorageAsObject } from '../utils/storage'
import { logger } from '../utils/logger'
import { STORAGE_KEYS } from '../constants/storageKeys'
import i18n from 'i18next'

export interface TextUsageStats {
  textId: string
  title: string
  usageCount: number
  avgWpm: number
  avgAccuracy: number
  lastUsed: string
}

function loadUsage(): Record<string, { count: number; totalWpm: number; totalAccuracy: number; lastUsed: string }> {
  return getFromStorageAsObject(STORAGE_KEYS.TEXT_USAGE)
}

function saveUsage(usage: Record<string, { count: number; totalWpm: number; totalAccuracy: number; lastUsed: string }>) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXT_USAGE, JSON.stringify(usage))
  } catch {
    logger.warn('Failed to save text usage data')
  }
}

export function recordTextUsage(textId: string, wpm: number, accuracy: number) {
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
    if (!confirm(i18n.t('admin.clearStatsConfirm', 'Reset text usage statistics?'))) return
    try {
      localStorage.removeItem(STORAGE_KEYS.TEXT_USAGE)
    } catch {
      logger.warn('Failed to clear text usage data')
    }
    setUsage({})
  }, [])

  return { stats, refresh, clearStats }
}
