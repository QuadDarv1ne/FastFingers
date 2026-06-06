import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypingHistory } from '@hooks/useTypingHistory'
import type { TypingStats } from '../types'

const mockUser = { id: 'test-user', email: 'test@example.com', name: 'Test' }
let currentUser: typeof mockUser | null = mockUser

vi.mock('@hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: currentUser })),
}))

vi.mock('@services/cloudSync', () => ({
  saveTypingSession: vi.fn(() => Promise.resolve()),
  flushPendingSessions: vi.fn(),
  isBackendAvailable: vi.fn(() => true),
}))

vi.mock('@utils/logger', () => ({
  logger: { warn: vi.fn() },
}))

const stats: TypingStats = {
  wpm: 60,
  accuracy: 95,
  cpm: 300,
  errors: 3,
  correctChars: 100,
  totalChars: 110,
  timeElapsed: 120,
  rawWpm: 55,
  consistency: 90,
  characterAccuracy: 95,
}

describe('useTypingHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    currentUser = mockUser
  })

  it('должен инициализироваться с пустой историей', () => {
    const { result } = renderHook(() => useTypingHistory())

    expect(result.current.history).toEqual({
      sessions: [],
      heatmap: {},
      totalSessions: 0,
      totalTime: 0,
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isOnline).toBe(true)
  })

  it('должен загружать существующую историю из localStorage', () => {
    const existing = {
      sessions: [{ id: '1', date: '2026-01-01', wpm: 50, accuracy: 90, cpm: 250, errors: 5, duration: 60, xp: 10 }],
      heatmap: { a: { hits: 5, misses: 1, total: 6 } },
      totalSessions: 1,
      totalTime: 1,
    }
    localStorage.setItem('fastfingers_history', JSON.stringify(existing))

    const { result } = renderHook(() => useTypingHistory())

    expect(result.current.history).toEqual(existing)
    expect(result.current.isLoading).toBe(false)
  })

  it('должен восстанавливаться после повреждённых данных в localStorage', () => {
    localStorage.setItem('fastfingers_history', 'invalid-json{{{')

    const { result } = renderHook(() => useTypingHistory())

    expect(result.current.history).toEqual({
      sessions: [],
      heatmap: {},
      totalSessions: 0,
      totalTime: 0,
    })
    expect(result.current.error).toContain('Failed to load history')
  })

  it('addSession: должен добавлять сессию в историю', () => {
    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.addSession(stats, 50)
    })

    expect(result.current.history.sessions).toHaveLength(1)
    expect(result.current.history.sessions[0].wpm).toBe(60)
    expect(result.current.history.sessions[0].accuracy).toBe(95)
    expect(result.current.history.sessions[0].xp).toBe(50)
    expect(result.current.history.totalSessions).toBe(1)
    expect(result.current.history.totalTime).toBe(2)
  })

  it('addSession: должен добавлять несколько сессий', () => {
    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.addSession(stats, 50)
    })

    act(() => {
      result.current.addSession({ ...stats, wpm: 70, accuracy: 98 }, 100)
    })

    expect(result.current.history.sessions).toHaveLength(2)
    expect(result.current.history.totalSessions).toBe(2)
    expect(result.current.history.sessions[0].wpm).toBe(70)
    expect(result.current.history.sessions[1].wpm).toBe(60)
  })

  it('addSession: должен лимитировать количество сессий до 100', () => {
    const sessions = Array.from({ length: 100 }, (_, i) => ({
      id: String(i), date: '2026-01-01', wpm: 30, accuracy: 80, cpm: 150, errors: 10, duration: 60, xp: 5,
    }))
    localStorage.setItem('fastfingers_history', JSON.stringify({
      sessions, heatmap: {}, totalSessions: 100, totalTime: 100,
    }))

    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.addSession(stats, 50)
    })

    expect(result.current.history.sessions).toHaveLength(100)
    expect(result.current.history.sessions[0].wpm).toBe(60)
    expect(result.current.history.sessions[99].wpm).toBe(30)
    expect(result.current.history.totalSessions).toBe(101)
  })

  it('addSession: должен синхронизировать сессию с облаком если пользователь авторизован', async () => {
    const { saveTypingSession, flushPendingSessions } = await import('@services/cloudSync')
    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.addSession(stats, 50)
    })

    await vi.waitFor(() => {
      expect(saveTypingSession).toHaveBeenCalledWith('test-user', stats, 50)
    })
    expect(flushPendingSessions).toHaveBeenCalled()
  })

  it('addSession: НЕ должен синхронизироваться с облаком если пользователь не авторизован', async () => {
    currentUser = null
    const { saveTypingSession } = await import('@services/cloudSync')
    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.addSession(stats, 50)
    })

    expect(saveTypingSession).not.toHaveBeenCalled()
  })

  it('updateHeatmap: должен обновлять тепловую карту', () => {
    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.updateHeatmap('a', true)
    })

    expect(result.current.history.heatmap.a).toBeDefined()
  })

  it('clearHistory: должен очищать историю и localStorage', () => {
    localStorage.setItem('fastfingers_history', JSON.stringify({
      sessions: [{ id: '1', date: '2026-01-01', wpm: 50, accuracy: 90, cpm: 250, errors: 5, duration: 60, xp: 10 }],
      heatmap: {}, totalSessions: 1, totalTime: 1,
    }))

    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.history).toEqual({
      sessions: [], heatmap: {}, totalSessions: 0, totalTime: 0,
    })
    expect(localStorage.getItem('fastfingers_history')).toBeNull()
  })

  it('getStatsForPeriod: должен возвращать корректную статистику за период', () => {
    const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
    const sessions = [
      { id: '1', date: daysAgo(1), wpm: 60, accuracy: 95, cpm: 300, errors: 3, duration: 120, xp: 50 },
      { id: '2', date: daysAgo(2), wpm: 70, accuracy: 98, cpm: 350, errors: 1, duration: 120, xp: 100 },
      { id: '3', date: daysAgo(10), wpm: 80, accuracy: 99, cpm: 400, errors: 0, duration: 120, xp: 150 },
    ]

    const existingHistory = { sessions, heatmap: {}, totalSessions: 3, totalTime: 6 }
    localStorage.setItem('fastfingers_history', JSON.stringify(existingHistory))

    const { result } = renderHook(() => useTypingHistory())

    const last7 = result.current.getStatsForPeriod(7)
    expect(last7.sessions).toBe(2)
    expect(last7.avgWpm).toBe(65)
    expect(last7.avgAccuracy).toBe(97)
    expect(last7.bestWpm).toBe(70)

    const last30 = result.current.getStatsForPeriod(30)
    expect(last30.sessions).toBe(3)
    expect(last30.avgWpm).toBe(70)
    expect(last30.bestWpm).toBe(80)
  })

  it('getStatsForPeriod: должен возвращать нули если нет сессий за период', () => {
    const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
    const sessions = [
      { id: '1', date: daysAgo(10), wpm: 60, accuracy: 95, cpm: 300, errors: 3, duration: 120, xp: 50 },
    ]
    localStorage.setItem('fastfingers_history', JSON.stringify({
      sessions, heatmap: {}, totalSessions: 1, totalTime: 2,
    }))

    const { result } = renderHook(() => useTypingHistory())

    const last1 = result.current.getStatsForPeriod(1)
    expect(last1).toEqual({ avgWpm: 0, avgAccuracy: 0, bestWpm: 0, sessions: 0 })
  })

  it('getBestSession: должен возвращать сессию с максимальным WPM', () => {
    const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
    const sessions = [
      { id: '1', date: daysAgo(3), wpm: 60, accuracy: 95, cpm: 300, errors: 3, duration: 120, xp: 50 },
      { id: '2', date: daysAgo(2), wpm: 80, accuracy: 98, cpm: 400, errors: 1, duration: 120, xp: 100 },
      { id: '3', date: daysAgo(1), wpm: 70, accuracy: 99, cpm: 350, errors: 0, duration: 120, xp: 150 },
    ]
    localStorage.setItem('fastfingers_history', JSON.stringify({
      sessions, heatmap: {}, totalSessions: 3, totalTime: 6,
    }))

    const { result } = renderHook(() => useTypingHistory())

    const best = result.current.getBestSession
    expect(best).not.toBeNull()
    expect(best?.wpm).toBe(80)
    expect(best?.id).toBe('2')
  })

  it('getBestSession: должен возвращать null если нет сессий', () => {
    const { result } = renderHook(() => useTypingHistory())

    expect(result.current.getBestSession).toBeNull()
  })

  it('getRecentSessions: должен возвращать последние N сессий', () => {
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      id: String(i), date: '2026-01-01', wpm: 30 + i, accuracy: 80, cpm: 150, errors: 10, duration: 60, xp: 5,
    }))
    localStorage.setItem('fastfingers_history', JSON.stringify({
      sessions, heatmap: {}, totalSessions: 10, totalTime: 10,
    }))

    const { result } = renderHook(() => useTypingHistory())

    const recent = result.current.getRecentSessions(3)
    expect(recent).toHaveLength(3)
    expect(recent[0].id).toBe('0')
    expect(recent[2].id).toBe('2')
  })

  it('должен обновлять isOnline при ошибке облачной синхронизации', async () => {
    const { saveTypingSession } = await import('@services/cloudSync')
    vi.mocked(saveTypingSession).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useTypingHistory())

    act(() => {
      result.current.addSession(stats, 50)
    })

    await vi.waitFor(() => {
      expect(result.current.isOnline).toBe(false)
    })
  })
})
