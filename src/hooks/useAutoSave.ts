/**
 * useAutoSave — Автосохранение прогресса при закрытии вкладки
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { UserProgress, TypingStats, KeyHeatmapData, UserSettings } from '../types'
import { logger } from '../utils/logger'
import { setToStorageWithQuotaHandling } from '../utils/storage'

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

const STORAGE_KEY = 'fastfingers-autosave'
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
    storageKey = STORAGE_KEY,
    onRestore,
  } = options

  const [isRestored, setIsRestored] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageKeyRef = useRef(storageKey)
  const dataRef = useRef<AutoSaveData>({ progress, currentSession, heatmap, settings, timestamp: Date.now() })
  storageKeyRef.current = storageKey

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
    const result = setToStorageWithQuotaHandling(storageKey, data)
    if (!result.success) {
      logger.warn('Failed to save:', result.quotaExceeded ? 'quota exceeded' : 'unknown error')
    }
  }, [storageKey])

  /**
   * Восстановление данных из автосохранения
   */
  const restoreData = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) {
        setIsRestored(true)
        return
      }

      const data: AutoSaveData = JSON.parse(saved)

      // Проверяем, не устарела ли сессия (более 5 минут)
      const isExpired = Date.now() - data.timestamp > SESSION_TIMEOUT

      if (isExpired) {
        // Сессия устарела, очищаем автосохранение
        localStorage.removeItem(storageKey)
        setIsRestored(true)
        return
      }

      // Восстанавливаем сессию
      if (onRestore && data.currentSession) {
        onRestore(data)
      }

      setIsRestored(true)
    } catch (error) {
      logger.warn('Failed to restore:', error)
      setIsRestored(true)
    }
  }, [storageKey, onRestore])

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
  }, [saveData])

  // Сохранение при закрытии вкладки — регистрируется один раз, читает свежие данные из ref
  useEffect(() => {
    const handleBeforeUnload = () => {
      const d = dataRef.current
      setToStorageWithQuotaHandling(storageKey, {
        progress: d.progress,
        currentSession: d.currentSession,
        heatmap: d.heatmap,
        settings: d.settings,
        timestamp: Date.now(),
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [storageKey])

  // Page Lifecycle API: сохранение при freeze (mobile/tab discard)
  // freeze fires only once per page lifecycle, so register once with empty deps
  useEffect(() => {
    const handleFreeze = () => {
      const d = dataRef.current
      const key = storageKeyRef.current
      setToStorageWithQuotaHandling(key, {
        progress: d.progress,
        currentSession: d.currentSession,
        heatmap: d.heatmap,
        settings: d.settings,
        timestamp: Date.now(),
      })
    }

    document.addEventListener('freeze', handleFreeze)

    return () => {
      document.removeEventListener('freeze', handleFreeze)
    }
  }, [])

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
