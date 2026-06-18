/**
 * useAutoSave — Автосохранение прогресса при закрытии вкладки
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import type { UserProgress, TypingStats, KeyHeatmapData, UserSettings } from '../types'
import { logger } from '../utils/logger'
import { setToStorageWithQuotaHandling } from '../utils/storage'
import { STORAGE_KEYS } from '../constants/storageKeys'

interface AutoSaveData {
  progress: UserProgress
  currentSession: TypingStats | null
  heatmap: KeyHeatmapData
  settings: UserSettings
  timestamp: number
}

interface UseAutoSaveOptions {
  progress: UserProgress
  currentSession: TypingStats | null
  heatmap: KeyHeatmapData
  settings: UserSettings
  storageKey?: string
  onRestore?: (data: AutoSaveData) => void
}

interface UseAutoSaveReturn {
  isRestored: boolean
  clearAutoSave: () => void
  forceSave: () => void
}

const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 минут

/**
 * Хук для автосохранения прогресса при закрытии вкладки
 * и восстановления сессии при возврате
 */
export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  const {
    progress,
    currentSession,
    heatmap,
    settings,
    storageKey = STORAGE_KEYS.AUTOSAVE,
    onRestore,
  } = options

  const [isRestored, setIsRestored] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageKeyRef = useRef(storageKey)
  const dataRef = useRef<AutoSaveData>({ progress, currentSession, heatmap, settings, timestamp: Date.now() })
  const onRestoreRef = useRef(onRestore)
  const restoredRef = useRef(false)
  storageKeyRef.current = storageKey
  onRestoreRef.current = onRestore

  useEffect(() => {
    dataRef.current = { progress, currentSession, heatmap, settings, timestamp: Date.now() }
  }, [progress, currentSession, heatmap, settings])

  const saveData = useCallback(() => {
    const d = dataRef.current
    const data: AutoSaveData = {
      progress: d.progress,
      currentSession: d.currentSession,
      heatmap: d.heatmap,
      settings: d.settings,
      timestamp: Date.now(),
    }
    const result = setToStorageWithQuotaHandling(storageKeyRef.current, data)
    if (!result.success) {
      logger.warn('Failed to save:', result.quotaExceeded ? 'quota exceeded' : 'unknown error')
    }
  }, [])

  /**
   * Восстановление данных из автосохранения
   */
  const restoreData = useCallback(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    try {
      const saved = localStorage.getItem(storageKeyRef.current)
      if (!saved) {
        setIsRestored(true)
        return
      }

      const data: AutoSaveData = JSON.parse(saved)

      const isExpired = Date.now() - data.timestamp > SESSION_TIMEOUT

      if (isExpired) {
        localStorage.removeItem(storageKeyRef.current)
        setIsRestored(true)
        return
      }

      const cb = onRestoreRef.current
      if (cb && data.currentSession) {
        cb(data)
      }

      setIsRestored(true)
    } catch (error) {
      logger.warn('Failed to restore:', error)
      setIsRestored(true)
    }
  }, [])

  /**
   * Очистка автосохранения
   */
  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      logger.warn('Failed to clear:', error)
    }
  }, [storageKey])

  /**
   * Принудительное сохранение
   */
  const forceSave = useCallback(() => {
    saveData()
  }, [saveData])

  // Восстановление при монтировании
  useEffect(() => {
    restoreData()
  }, [restoreData])

  // Отложенное сохранение при изменениях
  useEffect(() => {
    // Очищаем предыдущий таймер
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Сохраняем через 1 секунду после изменений
    saveTimeoutRef.current = setTimeout(() => {
      saveData()
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [saveData, progress, currentSession, heatmap, settings])

  // Сохранение при закрытии вкладки
  useEffect(() => {
    const handleBeforeUnload = () => saveData()

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveData])

  // Page Lifecycle API: сохранение при freeze (mobile/tab discard)
  useEffect(() => {
    const handleFreeze = () => saveData()

    document.addEventListener('freeze', handleFreeze)

    return () => {
      document.removeEventListener('freeze', handleFreeze)
    }
  }, [saveData])

  // Сохранение при потере фокуса (НЕ восстанавливаем при возврате чтобы не перезаписать текущий прогресс)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveData()
      }
      // Важно: НЕ вызываем restoreData при visible — это может перезаписать
      // текущий прогресс пользователя устаревшими данными из autosave.
      // Восстановление происходит только один раз при монтировании компонента.
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [saveData])

  return {
    isRestored,
    clearAutoSave,
    forceSave,
  }
}
