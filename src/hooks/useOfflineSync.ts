import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '../utils/logger'

interface OfflineQueueItem {
  id: string
  type: string
  data: unknown
  timestamp: number
  retryCount: number
}

const QUEUE_KEY = 'fastfingers_offline_queue'
const MAX_RETRIES = 3

export function useOfflineSync(options: {
  onSync?: (item: OfflineQueueItem) => Promise<void>
  syncInterval?: number
} = {}) {
  const { onSync, syncInterval = 30000 } = options
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queue, setQueue] = useState<OfflineQueueItem[]>([])

  // Use refs to avoid interval recreation when these change
  const queueRef = useRef(queue)
  queueRef.current = queue
  const onSyncRef = useRef(onSync)
  onSyncRef.current = onSync
  const isProcessingRef = useRef(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      if (stored) {
        setQueue(JSON.parse(stored))
      }
    } catch (error) {
      logger.warn('Failed to load offline queue', error)
      setQueue([])
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    } catch (error) {
      logger.warn('Failed to save offline queue', error)
      // Ignore storage errors
    }
  }, [queue])

  useEffect(() => {
    if (!isOnline) return

    const processQueue = async () => {
      if (isProcessingRef.current || !onSyncRef.current) return
      isProcessingRef.current = true

      const currentQueue = queueRef.current
      const validQueue = currentQueue.filter(item => item.retryCount < MAX_RETRIES)
      if (validQueue.length === 0) {
        setQueue(prev => prev.filter(item => item.retryCount < MAX_RETRIES))
        isProcessingRef.current = false
        return
      }

      const results: { id: string; success: boolean }[] = []

      for (const item of validQueue) {
        try {
          await onSyncRef.current(item)
          results.push({ id: item.id, success: true })
        } catch (error) {
          logger.warn('Failed to sync offline item', error)
          results.push({ id: item.id, success: false })
        }
      }

      setQueue(prev => {
        const resultIdSet = new Set(results.map(r => r.id))
        const updated = prev.map(item => {
          if (!resultIdSet.has(item.id)) return item
          const result = results.find(r => r.id === item.id)
          if (!result) return item
          return result.success ? null : { ...item, retryCount: item.retryCount + 1 }
        }).filter(Boolean) as typeof prev
        return updated.filter(item => item.retryCount < MAX_RETRIES)
      })

      isProcessingRef.current = false
    }

    const interval = setInterval(processQueue, syncInterval)
    return () => clearInterval(interval)
  }, [isOnline, syncInterval])

  const addToQueue = useCallback((type: string, data: unknown) => {
    const item: OfflineQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }

    setQueue(prev => [...prev, item])
    return item.id
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    try {
      localStorage.removeItem(QUEUE_KEY)
    } catch (error) {
      logger.warn('Failed to clear offline queue', error)
      // Ignore errors
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
    queueLength: queue.length,
    addToQueue,
    clearQueue,
  }
}

export default useOfflineSync
