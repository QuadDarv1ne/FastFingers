/**
 * stats.worker — Web Worker для тяжёлых вычислений статистики
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import type { KeystrokeData, TypingStats, TimeOfDayPerformance, FunnelStage } from '../types'

// Типы сообщений
type WorkerMessage =
  | { type: 'CALCULATE_RHYTHM'; payload: { keystrokes: KeystrokeData[] }; messageId?: number }
  | { type: 'CALCULATE_FINGER_BALANCE'; payload: { keystrokes: KeystrokeData[] }; messageId?: number }
  | { type: 'CALCULATE_ERROR_RECOVERY'; payload: { keystrokes: KeystrokeData[] }; messageId?: number }
  | { type: 'ANALYZE_TIME_OF_DAY'; payload: { sessions: TypingStats[] }; messageId?: number }
  | { type: 'ANALYZE_FUNNEL'; payload: { sessions: TypingStats[]; thresholds?: number[] }; messageId?: number }
  | { type: 'CALCULATE_CORRELATION'; payload: { sessions: TypingStats[] }; messageId?: number }

// Типы результатов
type WorkerResult =
  | { type: 'RHYTHM_RESULT'; payload: number; messageId?: number }
  | { type: 'FINGER_BALANCE_RESULT'; payload: { left: number; right: number }; messageId?: number }
  | { type: 'ERROR_RECOVERY_RESULT'; payload: number; messageId?: number }
  | { type: 'TIME_OF_DAY_RESULT'; payload: TimeOfDayPerformance[]; messageId?: number }
  | { type: 'FUNNEL_RESULT'; payload: { stages: FunnelStage[]; conversionRates: number[] }; messageId?: number }
  | { type: 'CORRELATION_RESULT'; payload: number[][]; messageId?: number }
  | { type: 'ERROR'; payload: string; messageId?: number }

/**
 * Расчёт Rhythm Score - равномерности печати
 */
function calculateRhythmScore(keystrokes: KeystrokeData[]): number {
  if (keystrokes.length < 2) return 100

  const intervals: number[] = []
  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1]
    const curr = keystrokes[i]
    if (prev && curr) {
      intervals.push(curr.timestamp - prev.timestamp)
    }
  }

  if (intervals.length === 0) return 100

  const sum = intervals.reduce((acc, v) => acc + v, 0)
  const avgInterval = sum / intervals.length
  if (avgInterval === 0) return 100

  const varianceSum = intervals.reduce((acc, v) => acc + Math.pow(v - avgInterval, 2), 0)
  const variance = varianceSum / intervals.length

  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avgInterval
  const score = Math.max(0, Math.min(100, (1 - cv) * 100))

  return Math.round(score)
}

/**
 * Расчёт баланса пальцев
 */
function calculateFingerBalance(keystrokes: KeystrokeData[]): { left: number; right: number } {
  if (keystrokes.length === 0) return { left: 50, right: 50 }

  const leftCount = keystrokes.filter(k => k?.hand === 'left').length
  const rightCount = keystrokes.length - leftCount
  const total = leftCount + rightCount

  return {
    left: Math.round((leftCount / total) * 100),
    right: Math.round((rightCount / total) * 100),
  }
}

/**
 * Расчёт Error Recovery Time
 */
function calculateErrorRecoveryTime(keystrokes: KeystrokeData[]): number {
  const errorIndices = keystrokes
    .map((k, i) => (k && !k.isCorrect ? i : -1))
    .filter(i => i !== -1)

  if (errorIndices.length === 0) return 0

  const recoveryTimes: number[] = []

  for (const errorIndex of errorIndices) {
    const error = keystrokes[errorIndex]
    if (!error) continue

    for (let j = errorIndex + 1; j < keystrokes.length; j++) {
      const curr = keystrokes[j]
      if (curr && curr.isCorrect) {
        recoveryTimes.push(curr.timestamp - error.timestamp)
        break
      }
    }
  }

  if (recoveryTimes.length === 0) return 0

  const sum = recoveryTimes.reduce((acc, v) => acc + v, 0)
  return Math.round(sum / recoveryTimes.length)
}

/**
 * Анализ времени суток
 */
function analyzeTimeOfDay(sessions: TypingStats[]): TimeOfDayPerformance[] {
  const timeSlots: Record<string, { sessions: number; totalWpm: number; totalAccuracy: number }> = {
    morning: { sessions: 0, totalWpm: 0, totalAccuracy: 0 },
    afternoon: { sessions: 0, totalWpm: 0, totalAccuracy: 0 },
    evening: { sessions: 0, totalWpm: 0, totalAccuracy: 0 },
    night: { sessions: 0, totalWpm: 0, totalAccuracy: 0 },
  }

  sessions.forEach(session => {
    if (!session) return
    const hour = new Date(session.date || '').getHours()
    let slot: string

    if (hour >= 6 && hour < 12) slot = 'morning'
    else if (hour >= 12 && hour < 18) slot = 'afternoon'
    else if (hour >= 18 && hour < 24) slot = 'evening'
    else slot = 'night'

    const timeSlot = timeSlots[slot]
    if (timeSlot) {
      timeSlot.sessions++
      timeSlot.totalWpm += session.wpm
      timeSlot.totalAccuracy += session.accuracy
    }
  })

  return (Object.keys(timeSlots) as string[]).map(slot => {
    const timeSlot = timeSlots[slot]
    if (!timeSlot) {
      return {
        timeOfDay: slot as 'morning' | 'afternoon' | 'evening' | 'night',
        sessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
      }
    }
    return {
      timeOfDay: slot as 'morning' | 'afternoon' | 'evening' | 'night',
      sessions: timeSlot.sessions,
      avgWpm: timeSlot.sessions > 0
        ? Math.round(timeSlot.totalWpm / timeSlot.sessions)
        : 0,
      avgAccuracy: timeSlot.sessions > 0
        ? Math.round(timeSlot.totalAccuracy / timeSlot.sessions)
        : 0,
    }
  })
}

/**
 * Анализ воронки
 */
function analyzeFunnel(
  sessions: TypingStats[],
  thresholds: number[] = [20, 40, 60, 80, 100]
): { stages: FunnelStage[]; conversionRates: number[] } {
  const stages: FunnelStage[] = []
  const conversionRates: number[] = []

  const totalSessions = sessions.length
  if (totalSessions === 0) {
    return { stages: [], conversionRates: [] }
  }

  thresholds.forEach((threshold, index) => {
    const count = sessions.filter(s => s && s.wpm >= threshold).length
    const percentage = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0

    stages.push({
      name: `WPM ≥ ${threshold}`,
      count,
      percentage,
    })

    if (index === 0) {
      conversionRates.push(percentage)
    } else {
      const prevStage = stages[index - 1]
      const rate = prevStage && prevStage.count > 0 ? Math.round((count / prevStage.count) * 100) : 0
      conversionRates.push(rate)
    }
  })

  return { stages, conversionRates }
}

/**
 * Расчёт матрицы корреляции
 */
function calculateCorrelationMatrix(sessions: TypingStats[]): number[][] {
  if (sessions.length < 2) return [[1]]

  const metrics: (keyof TypingStats)[] = ['wpm', 'accuracy', 'cpm', 'errors']
  const n = sessions.length

  // Извлекаем значения метрик
  const values: number[][] = metrics.map((metric) =>
    sessions.map((s) => (s ? (s[metric] as number) || 0 : 0))
  )

  // Вычисляем средние значения
  const means: number[] = values.map((v) => (v.length > 0 ? v.reduce((a, b) => a + b, 0) / n : 0))

  // Вычисляем корреляционную матрицу
  const matrix: number[][] = Array(metrics.length)
    .fill(null)
    .map(() => Array(metrics.length).fill(0))

  for (let i = 0; i < metrics.length; i++) {
    const matrixRow = matrix[i]
    if (!matrixRow) continue
    for (let j = 0; j < metrics.length; j++) {
      if (i === j) {
        matrixRow[j] = 1
      } else {
        let numerator = 0
        let denomI = 0
        let denomJ = 0

        const rowI = values[i]
        const rowJ = values[j]
        const meanI = means[i] ?? 0
        const meanJ = means[j] ?? 0

        for (let k = 0; k < n; k++) {
          const valI: number = rowI?.[k] ?? 0
          const valJ: number = rowJ?.[k] ?? 0
          const diffI = valI - meanI
          const diffJ = valJ - meanJ
          numerator += diffI * diffJ
          denomI += diffI * diffI
          denomJ += diffJ * diffJ
        }

        const denominator = Math.sqrt(denomI * denomJ)
        matrixRow[j] = denominator > 0 ? numerator / denominator : 0
      }
    }
  }

  return matrix
}

// Обработка сообщений
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  try {
    const { type, payload, messageId } = event.data

    switch (type) {
      case 'CALCULATE_RHYTHM': {
        const result = calculateRhythmScore(payload.keystrokes)
        self.postMessage({ type: 'RHYTHM_RESULT', payload: result, messageId } as WorkerResult)
        break
      }

      case 'CALCULATE_FINGER_BALANCE': {
        const result = calculateFingerBalance(payload.keystrokes)
        self.postMessage({ type: 'FINGER_BALANCE_RESULT', payload: result, messageId } as WorkerResult)
        break
      }

      case 'CALCULATE_ERROR_RECOVERY': {
        const result = calculateErrorRecoveryTime(payload.keystrokes)
        self.postMessage({ type: 'ERROR_RECOVERY_RESULT', payload: result, messageId } as WorkerResult)
        break
      }

      case 'ANALYZE_TIME_OF_DAY': {
        const result = analyzeTimeOfDay(payload.sessions)
        self.postMessage({ type: 'TIME_OF_DAY_RESULT', payload: result, messageId } as WorkerResult)
        break
      }

      case 'ANALYZE_FUNNEL': {
        const result = analyzeFunnel(payload.sessions, payload.thresholds)
        self.postMessage({ type: 'FUNNEL_RESULT', payload: result, messageId } as WorkerResult)
        break
      }

      case 'CALCULATE_CORRELATION': {
        const result = calculateCorrelationMatrix(payload.sessions)
        self.postMessage({ type: 'CORRELATION_RESULT', payload: result, messageId } as WorkerResult)
        break
      }

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: error instanceof Error ? error.message : 'Unknown error',
    } as WorkerResult)
  }
}

export {}
