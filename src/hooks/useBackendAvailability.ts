import { useState, useEffect, useCallback } from 'react'
import { isBackendAvailable } from '../services/cloudSync'
import { logger } from '../utils/logger'

interface BackendStatus {
  isAvailable: boolean
  isChecking: boolean
  lastChecked: number | null
  retryCount: number
}

const CHECK_INTERVAL_MS = 30000 // 30 секунд
const MAX_RETRY_COUNT = 3

/**
 * Хук для отслеживания доступности бэкенда (Supabase)
 * Автоматически проверяет соединение и предоставляет статус
 */
export function useBackendAvailability(options: {
  autoCheck?: boolean
  checkInterval?: number
} = {}) {
  const { autoCheck = true, checkInterval = CHECK_INTERVAL_MS } = options

  const [status, setStatus] = useState<BackendStatus>({
    isAvailable: isBackendAvailable(),
    isChecking: false,
    lastChecked: null,
    retryCount: 0,
  })

  const checkBackend = useCallback(async () => {
    // Не проверяем, если уже максимальное количество попыток
    setStatus(prev => {
      if (prev.retryCount >= MAX_RETRY_COUNT && !prev.isAvailable) {
        return prev
      }
      return { ...prev, isChecking: true }
    })

    try {
      const available = isBackendAvailable()

      if (available) {
        setStatus({
          isAvailable: true,
          isChecking: false,
          lastChecked: Date.now(),
          retryCount: 0,
        })
      } else {
        setStatus(prev => ({
          isAvailable: false,
          isChecking: false,
          lastChecked: Date.now(),
          retryCount: Math.min(prev.retryCount + 1, MAX_RETRY_COUNT),
        }))
      }
    } catch {
      logger.warn('Operation failed in hooks/useBackendAvailability.ts')
      setStatus(prev => ({
        isAvailable: false,
        isChecking: false,
        lastChecked: Date.now(),
        retryCount: Math.min(prev.retryCount + 1, MAX_RETRY_COUNT),
      }))
    }
  }, [])

  useEffect(() => {
    // Первоначальная проверка
    checkBackend()

    if (!autoCheck) return

    const interval = setInterval(() => {
      checkBackend()
    }, checkInterval)

    return () => clearInterval(interval)
  }, [checkBackend, autoCheck, checkInterval])

  const resetStatus = useCallback(() => {
    setStatus({
      isAvailable: isBackendAvailable(),
      isChecking: false,
      lastChecked: null,
      retryCount: 0,
    })
  }, [])

  const canRetry = status.retryCount < MAX_RETRY_COUNT

  return {
    ...status,
    canRetry,
    checkBackend,
    resetStatus,
    isOfflineMode: !status.isAvailable,
  }
}

export default useBackendAvailability
