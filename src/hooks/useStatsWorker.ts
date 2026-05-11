/**
 * useStatsWorker — Хук для работы с Web Worker статистики
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { KeystrokeData, TypingStats, TimeOfDayPerformance, FunnelStage } from '../types'

interface WorkerResult {
  type: string
  payload: any
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
  const pendingPromises = useRef<Map<number, { resolve: Function; reject: Function }>>(new Map())
  const messageIdRef = useRef(0)

  // Инициализация воркера
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/stats.worker.ts', import.meta.url),
        { type: 'module' }
      )

      workerRef.current.onmessage = (event: MessageEvent<WorkerResult>) => {
        const { type, payload, messageId } = event.data

        if (type === 'ERROR') {
          setError(payload)
          // Отклоняем все ожидающие промисы
          pendingPromises.current.forEach(({ reject }) => reject(new Error(payload)))
          pendingPromises.current.clear()
          setIsBusy(false)
          return
        }

        // Находим промис по messageId
        if (messageId !== undefined && pendingPromises.current.has(messageId)) {
          const { resolve } = pendingPromises.current.get(messageId)!
          pendingPromises.current.delete(messageId)
          resolve(payload)
          setIsBusy(false)
        }
      }

      workerRef.current.onerror = (event) => {
        setError(`Worker error: ${event.message}`)
        setIsBusy(false)
      }

      setIsReady(true)

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate()
          workerRef.current = null
        }
        pendingPromises.current.clear()
      }
    } catch (err) {
      setError(`Failed to initialize worker: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsReady(false)
      return
    }
  }, [])

  // Универсальный метод для отправки задач воркеру
  const sendToWorker = useCallback(<T>(type: string, payload: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      if (isBusy) {
        reject(new Error('Worker is busy'))
        return
      }

      const messageId = messageIdRef.current++
      pendingPromises.current.set(messageId, { resolve, reject })

      setIsBusy(true)
      setError(null)

      workerRef.current.postMessage({ type, payload, messageId })

      // Таймаут на случай если воркер не ответит
      setTimeout(() => {
        if (pendingPromises.current.has(messageId)) {
          pendingPromises.current.delete(messageId)
          reject(new Error('Worker timeout'))
          setIsBusy(false)
        }
      }, 30000) // 30 секунд
    })
  }, [isReady, isBusy])

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
      setIsReady(false)
      pendingPromises.current.clear()
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
