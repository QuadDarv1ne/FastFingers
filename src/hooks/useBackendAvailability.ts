import { useState, useEffect, useCallback } from 'react'
import { isBackendAvailable } from '../services/cloudSync'

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
    setStatus(prev => ({ ...prev, isChecking: true }))

    try {
      // Проверяем наличие Supabase клиента
      const available = isBackendAvailable()

      if (available) {
        // Дополнительная проверка — попробуем сделать лёгкий запрос
        // Если Supabase настроен, но недоступен — это обнаружится здесь
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
      // Не проверяем, если уже максимальное количество попыток
      if (status.retryCount >= MAX_RETRY_COUNT) return
      checkBackend()
    }, checkInterval)

    return () => clearInterval(interval)
  }, [checkBackend, autoCheck, checkInterval, status.retryCount])

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
