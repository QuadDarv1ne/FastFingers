/**
 * useStatsWorker — Хук для работы с Web Worker статистики
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { KeystrokeData, TypingStats, TimeOfDayPerformance, FunnelStage } from '../types'

interface PendingPromise<T = unknown> {
  resolve: (value: T) => void
  reject: (error: Error) => void
}

interface WorkerResult {
  type: string
  payload: unknown
  messageId?: number
}

interface UseStatsWorkerReturn {
  // Состояния
  isReady: boolean
  isBusy: boolean
  error: string | null

  // Методы расчёта
  calculateRhythm: (keystrokes: KeystrokeData[]) => Promise<number>
  calculateFingerBalance: (keystrokes: KeystrokeData[]) => Promise<{ left: number; right: number }>
  calculateErrorRecovery: (keystrokes: KeystrokeData[]) => Promise<number>
  analyzeTimeOfDay: (sessions: TypingStats[]) => Promise<TimeOfDayPerformance[]>
  analyzeFunnel: (
    sessions: TypingStats[],
    thresholds?: number[]
  ) => Promise<{ stages: FunnelStage[]; conversionRates: number[] }>
  calculateCorrelationMatrix: (sessions: TypingStats[]) => Promise<number[][]>

  // Очистка
  terminate: () => void
}

/**
 * Хук для асинхронных вычислений статистики через Web Worker
 */
export function useStatsWorker(): UseStatsWorkerReturn {
  const [isReady, setIsReady] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const workerRef = useRef<Worker | null>(null)
  const pendingPromises = useRef<Map<number, PendingPromise<unknown>>>(new Map())
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const messageIdRef = useRef(0)
  const isReadyRef = useRef(false)
  const isBusyRef = useRef(false)

  // Инициализация воркера
  useEffect(() => {
    // Capture mutable refs to local variables for cleanup to avoid stale ref access
    const pendingMap = pendingPromises.current
    const timeoutsMap = timeoutsRef.current
    try {
      workerRef.current = new Worker(
        new URL('../workers/stats.worker.ts', import.meta.url),
        { type: 'module' }
      )

      workerRef.current.onmessage = (event: MessageEvent<WorkerResult>) => {
        const { type, payload, messageId } = event.data

        if (type === 'ERROR') {
          setError(payload as string)
          pendingMap.forEach(({ reject }) => reject(new Error(payload as string)))
          pendingMap.clear()
          isBusyRef.current = false
          setIsBusy(false)
          return
        }

        if (messageId !== undefined) {
          const pending = pendingMap.get(messageId)
          if (pending) {
            pendingMap.delete(messageId)
            timeoutsMap.delete(messageId)
            pending.resolve(payload)
            isBusyRef.current = false
            setIsBusy(false)
          }
        }
      }

      workerRef.current.onerror = (event) => {
        setError(`Worker error: ${event.message}`)
        isBusyRef.current = false
        setIsBusy(false)
      }

      isReadyRef.current = true
      setIsReady(true)

      return () => {
        const worker = workerRef.current
        if (worker) {
          worker.terminate()
          workerRef.current = null
        }
        isReadyRef.current = false
        const abortError = new DOMException('Worker terminated', 'AbortError')
        pendingMap.forEach(({ reject }) => reject(abortError))
        pendingMap.clear()
        timeoutsMap.forEach((_, id) => clearTimeout(id))
        timeoutsMap.clear()
      }
    } catch (err) {
      setError(`Failed to initialize worker: ${err instanceof Error ? err.message : 'Unknown error'}`)
      isReadyRef.current = false
      setIsReady(false)
      return
    }
  }, [])

  // Универсальный метод для отправки задач воркеру
  const sendToWorker = useCallback(<T,>(type: string, payload: unknown): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReadyRef.current) {
        reject(new Error('Worker not ready'))
        return
      }

      if (isBusyRef.current) {
        reject(new Error('Worker is busy'))
        return
      }

      const messageId = messageIdRef.current++
      pendingPromises.current.set(messageId, { resolve: resolve as (value: unknown) => void, reject })

      isBusyRef.current = true
      setIsBusy(true)
      setError(null)

      try {
        workerRef.current.postMessage({ type, payload, messageId })
      } catch (err) {
        // DataCloneError — payload contains non-serializable objects
        pendingPromises.current.delete(messageId)
        isBusyRef.current = false
        setIsBusy(false)
        reject(err instanceof Error ? err : new Error('Failed to send data to worker'))
        return
      }

      const timeoutId = setTimeout(() => {
        if (pendingPromises.current.has(messageId)) {
          pendingPromises.current.delete(messageId)
          timeoutsRef.current.delete(messageId)
          reject(new Error('Worker timeout'))
          isBusyRef.current = false
          setIsBusy(false)
        }
      }, 30000)
      timeoutsRef.current.set(messageId, timeoutId)
    })
  }, []) // Теперь не зависит от isReady/isBusy — используем refs

  // Методы расчёта
  const calculateRhythm = useCallback(
    (keystrokes: KeystrokeData[]) =>
      sendToWorker<number>('CALCULATE_RHYTHM', { keystrokes }),
    [sendToWorker]
  )

  const calculateFingerBalance = useCallback(
    (keystrokes: KeystrokeData[]) =>
      sendToWorker<{ left: number; right: number }>('CALCULATE_FINGER_BALANCE', { keystrokes }),
    [sendToWorker]
  )

  const calculateErrorRecovery = useCallback(
    (keystrokes: KeystrokeData[]) =>
      sendToWorker<number>('CALCULATE_ERROR_RECOVERY', { keystrokes }),
    [sendToWorker]
  )

  const analyzeTimeOfDay = useCallback(
    (sessions: TypingStats[]) =>
      sendToWorker<TimeOfDayPerformance[]>('ANALYZE_TIME_OF_DAY', { sessions }),
    [sendToWorker]
  )

  const analyzeFunnel = useCallback(
    (sessions: TypingStats[], thresholds?: number[]) =>
      sendToWorker<{ stages: FunnelStage[]; conversionRates: number[] }>('ANALYZE_FUNNEL', { sessions, thresholds }),
    [sendToWorker]
  )

  const calculateCorrelationMatrix = useCallback(
    (sessions: TypingStats[]) =>
      sendToWorker<number[][]>('CALCULATE_CORRELATION', { sessions }),
    [sendToWorker]
  )

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
      isReadyRef.current = false
      setIsReady(false)
      const abortError = new DOMException('Worker terminated', 'AbortError')
      pendingPromises.current.forEach(({ reject }) => reject(abortError))
      pendingPromises.current.clear()
      timeoutsRef.current.forEach((id) => clearTimeout(id))
      timeoutsRef.current.clear()
    }
  }, [])

  return {
    isReady,
    isBusy,
    error,
    calculateRhythm,
    calculateFingerBalance,
    calculateErrorRecovery,
    analyzeTimeOfDay,
    analyzeFunnel,
    calculateCorrelationMatrix,
    terminate,
  }
}

export default useStatsWorker
