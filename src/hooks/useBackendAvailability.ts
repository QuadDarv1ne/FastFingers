import { useState, useEffect, useCallback, useRef } from 'react'
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
  const mountedRef = useRef(true)
  const checkingRef = useRef(false)

  const [status, setStatus] = useState<BackendStatus>({
    isAvailable: isBackendAvailable(),
    isChecking: false,
    lastChecked: null,
    retryCount: 0,
  })

  const checkBackend = useCallback(async () => {
    // Prevent overlapping checks
    if (checkingRef.current) return
    checkingRef.current = true

    // Don't start check if unmounted
    if (!mountedRef.current) {
      checkingRef.current = false
      return
    }

    let shouldSkip = false
    setStatus(prev => {
      if (prev.retryCount >= MAX_RETRY_COUNT && !prev.isAvailable) {
        shouldSkip = true
        return prev
      }
      return { ...prev, isChecking: true }
    })

    if (shouldSkip) {
      checkingRef.current = false
      return
    }

    try {
      const available = isBackendAvailable()

      if (!mountedRef.current) return
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
    } catch (error) {
      logger.warn('Backend availability check failed', error)
      if (!mountedRef.current) return
      setStatus(prev => ({
        isAvailable: false,
        isChecking: false,
        lastChecked: Date.now(),
        retryCount: Math.min(prev.retryCount + 1, MAX_RETRY_COUNT),
      }))
    } finally {
      checkingRef.current = false
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    checkBackend()

    if (!autoCheck) return

    const interval = setInterval(() => {
      checkBackend()
    }, checkInterval)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
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
