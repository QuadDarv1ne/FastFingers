import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionHandlers } from '@hooks/useSessionHandlers'
import type { TypingStats } from '../types'

describe('useSessionHandlers', () => {
  const mockAddSession = vi.fn()
  const mockCompleteChallenge = vi.fn()
  const mockHandleSessionComplete = vi.fn()
  const mockSetLastSessionXp = vi.fn()
  const mockSetShowSessionSummary = vi.fn()

  const baseOptions = {
    addSession: mockAddSession,
    activeChallenge: null as string | null,
    todayChallenge: null,
    completeChallenge: mockCompleteChallenge,
    handleSessionComplete: mockHandleSessionComplete,
    streak: { current: 0 },
    setLastSessionXp: mockSetLastSessionXp,
    setShowSessionSummary: mockSetShowSessionSummary,
  }

  const mockStats: TypingStats = {
    wpm: 60,
    cpm: 300,
    accuracy: 95,
    errors: 5,
    timeElapsed: 60,
    correctChars: 300,
    totalChars: 315,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('должен вернуть handleSessionCompleteWithProgress и handleReactionGameComplete', () => {
    const { result } = renderHook(() => useSessionHandlers(baseOptions))

    expect(result.current.handleSessionCompleteWithProgress).toBeDefined()
    expect(result.current.handleReactionGameComplete).toBeDefined()
  })

  it('должен рассчитать XP и вызвать addSession при завершении сессии', () => {
    const { result } = renderHook(() => useSessionHandlers(baseOptions))

    act(() => {
      result.current.handleSessionCompleteWithProgress(mockStats)
    })

    expect(mockAddSession).toHaveBeenCalled()
    expect(mockSetLastSessionXp).toHaveBeenCalled()
    expect(mockSetShowSessionSummary).toHaveBeenCalledWith(true)
  })

  it('должен вызвать completeChallenge если есть активный челлендж', () => {
    const options = {
      ...baseOptions,
      activeChallenge: 'challenge-1',
      todayChallenge: { id: 'challenge-1', date: '2026-03-08', text: 'test', targetWpm: 60, targetAccuracy: 95, completed: false, xpReward: 100 },
    }

    const { result } = renderHook(() => useSessionHandlers(options))

    act(() => {
      result.current.handleSessionCompleteWithProgress(mockStats)
    })

    expect(mockCompleteChallenge).toHaveBeenCalledWith('challenge-1', 60, 95)
  })

  it('не должен вызывать completeChallenge если нет активного челленджа', () => {
    const { result } = renderHook(() => useSessionHandlers(baseOptions))

    act(() => {
      result.current.handleSessionCompleteWithProgress(mockStats)
    })

    expect(mockCompleteChallenge).not.toHaveBeenCalled()
  })

  it('должен вызвать handleSessionComplete с правильными параметрами', () => {
    const options = {
      ...baseOptions,
      streak: { current: 5 },
    }

    const { result } = renderHook(() => useSessionHandlers(options))

    act(() => {
      result.current.handleSessionCompleteWithProgress(mockStats)
    })

    expect(mockHandleSessionComplete).toHaveBeenCalledWith(mockStats, 5)
  })

  it('должен рассчитать XP для reaction game', () => {
    const { result } = renderHook(() => useSessionHandlers(baseOptions))

    act(() => {
      result.current.handleReactionGameComplete(100, 90)
    })

    const expectedXp = Math.floor(100 / 5) + Math.floor(90 / 10)
    expect(mockSetLastSessionXp).toHaveBeenCalledWith(expectedXp)
  })

  it('должен рассчитать XP для reaction game с нулевым score', () => {
    const { result } = renderHook(() => useSessionHandlers(baseOptions))

    act(() => {
      result.current.handleReactionGameComplete(0, 0)
    })

    expect(mockSetLastSessionXp).toHaveBeenCalledWith(0)
  })
})
