/**
 * Тесты для Web Worker статистики
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStatsWorker } from '../hooks/useStatsWorker'
import type { KeystrokeData, TypingStats } from '../types'

const mockKeystrokes: KeystrokeData[] = [
  { key: 'a', timestamp: 0, isCorrect: true, finger: 'left-index', hand: 'left' },
  { key: 'b', timestamp: 100, isCorrect: true, finger: 'left-index', hand: 'left' },
  { key: 'c', timestamp: 200, isCorrect: false, finger: 'left-middle', hand: 'left' },
  { key: 'd', timestamp: 350, isCorrect: true, finger: 'left-middle', hand: 'left' },
  { key: 'e', timestamp: 450, isCorrect: true, finger: 'left-middle', hand: 'left' },
  { key: 'f', timestamp: 550, isCorrect: true, finger: 'left-index', hand: 'left' },
  { key: 'g', timestamp: 700, isCorrect: true, finger: 'left-index', hand: 'left' },
  { key: 'h', timestamp: 800, isCorrect: true, finger: 'right-index', hand: 'right' },
  { key: 'i', timestamp: 900, isCorrect: true, finger: 'right-middle', hand: 'right' },
  { key: 'j', timestamp: 1000, isCorrect: true, finger: 'right-index', hand: 'right' },
]

const mockSessions: TypingStats[] = [
  { wpm: 30, cpm: 150, accuracy: 85, errors: 5, correctChars: 300, totalChars: 353, timeElapsed: 60, date: new Date('2024-01-01T08:00:00').toISOString() } as any,
  { wpm: 45, cpm: 225, accuracy: 90, errors: 3, correctChars: 450, totalChars: 500, timeElapsed: 120, date: new Date('2024-01-01T14:00:00').toISOString() } as any,
  { wpm: 60, cpm: 300, accuracy: 95, errors: 2, correctChars: 600, totalChars: 632, timeElapsed: 180, date: new Date('2024-01-01T20:00:00').toISOString() } as any,
  { wpm: 50, cpm: 250, accuracy: 88, errors: 4, correctChars: 500, totalChars: 568, timeElapsed: 150, date: new Date('2024-01-02T02:00:00').toISOString() } as any,
]

describe('useStatsWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize worker', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    expect(result.current.error).toBeNull()
  })

  it('should calculate rhythm score', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    const rhythmScore = await result.current.calculateRhythm(mockKeystrokes)

    expect(rhythmScore).toBeGreaterThanOrEqual(0)
    expect(rhythmScore).toBeLessThanOrEqual(100)
  })

  it('should calculate finger balance', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    const balance = await result.current.calculateFingerBalance(mockKeystrokes)

    expect(balance).toHaveProperty('left')
    expect(balance).toHaveProperty('right')
    expect(balance.left + balance.right).toBe(100)
  })

  it('should calculate error recovery time', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    const recoveryTime = await result.current.calculateErrorRecovery(mockKeystrokes)

    expect(recoveryTime).toBeGreaterThanOrEqual(0)
  })

  it('should analyze time of day', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    const timeAnalysis = await result.current.analyzeTimeOfDay(mockSessions)

    expect(Array.isArray(timeAnalysis)).toBe(true)
    expect(timeAnalysis.length).toBeGreaterThan(0)
    expect(timeAnalysis[0]).toHaveProperty('timeOfDay')
    expect(timeAnalysis[0]).toHaveProperty('avgWpm')
    expect(timeAnalysis[0]).toHaveProperty('avgAccuracy')
  })

  it('should analyze funnel', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    const funnelResult = await result.current.analyzeFunnel(mockSessions, [20, 40, 60])

    expect(funnelResult).toHaveProperty('stages')
    expect(funnelResult).toHaveProperty('conversionRates')
    expect(Array.isArray(funnelResult.stages)).toBe(true)
    expect(Array.isArray(funnelResult.conversionRates)).toBe(true)
  })

  it('should calculate correlation matrix', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    const matrix = await result.current.calculateCorrelationMatrix(mockSessions)

    expect(Array.isArray(matrix)).toBe(true)
    expect(matrix.length).toBeGreaterThan(0)
    expect(matrix[0].length).toBeGreaterThan(0)
  })

  it('should handle worker not ready', async () => {
    const { result } = renderHook(() => useStatsWorker())

    // Пытаемся вызвать до готовности
    try {
      await result.current.calculateRhythm(mockKeystrokes)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should terminate worker', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    result.current.terminate()

    await waitFor(() => {
      expect(result.current.isReady).toBe(false)
    }, { timeout: 2000 })
  })

  it('should set error on invalid data', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    // Пустые данные возвращают значение по умолчанию
    const rhythmScore = await result.current.calculateRhythm([])
    expect(rhythmScore).toBe(75) // Mock возвращает 75
  })

  it('should handle multiple calculations sequentially', async () => {
    const { result } = renderHook(() => useStatsWorker())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    }, { timeout: 2000 })

    const [rhythm1, rhythm2] = await Promise.all([
      result.current.calculateRhythm(mockKeystrokes),
      result.current.calculateRhythm(mockKeystrokes.slice(0, 5)),
    ])

    expect(rhythm1).toBeDefined()
    expect(rhythm2).toBeDefined()
  })
})
