import { useState, useEffect, useCallback } from 'react'

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
    } catch {
      setQueue([])
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    } catch {
      // Ignore storage errors
    }
  }, [queue])

  useEffect(() => {
    if (!isOnline || !onSync) return

    const processQueue = async () => {
      const validQueue = queue.filter(item => item.retryCount < MAX_RETRIES)
      if (validQueue.length === 0) {
        // Clean up any exhausted items
        setQueue(prev => prev.filter(item => item.retryCount < MAX_RETRIES))
        return
      }

      const results: { id: string; success: boolean }[] = []

      for (const item of validQueue) {
        try {
          await onSync(item)
          results.push({ id: item.id, success: true })
        } catch {
          results.push({ id: item.id, success: false })
        }
      }

      // Apply all changes in a single batch
      setQueue(prev => {
        const resultIdSet = new Set(results.map(r => r.id))
        const updated = prev.map(item => {
          if (!resultIdSet.has(item.id)) return item
          const result = results.find(r => r.id === item.id)
          if (!result) return item
          return result.success ? null : { ...item, retryCount: item.retryCount + 1 }
        }).filter(Boolean) as typeof prev
        // Remove exhausted items that exceeded max retries
        return updated.filter(item => item.retryCount < MAX_RETRIES)
      })
    }

    const interval = setInterval(processQueue, syncInterval)
    return () => clearInterval(interval)
  }, [isOnline, queue, onSync, syncInterval])

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
    } catch {
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
