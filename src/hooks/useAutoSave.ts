/**
 * useAutoSave — Автосохранение прогресса при закрытии вкладки
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { UserProgress, TypingStats, KeyHeatmapData, UserSettings } from '../types'
import { logger } from '../utils/logger'

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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Сохранение текущих данных
   */
  const saveData = useCallback(() => {
    try {
      const data: AutoSaveData = {
        progress,
        currentSession,
        heatmap,
        settings,
        timestamp: Date.now(),
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      logger.warn('Failed to save:', error)
    }
  }, [progress, currentSession, heatmap, settings, storageKey])

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

  // Сохранение при закрытии вкладки
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveData()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveData])

  // Сохранение при потере фокуса
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveData()
      }
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

export default useAutoSave
