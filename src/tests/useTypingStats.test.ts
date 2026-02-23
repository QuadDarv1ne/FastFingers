import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypingStats } from '../hooks/useTypingStats'

describe('useTypingStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('должен начинать сессию', () => {
    const { result } = renderHook(() => useTypingStats())

    expect(result.current.currentStats).toBeNull()
    expect(result.current.isComplete).toBe(false)

    act(() => {
      result.current.startSession()
    })

    expect(result.current.currentStats).toBeNull()
    expect(result.current.isComplete).toBe(false)
  })

  it('должен обновлять статистику', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

    // Проматываем время на 1 секунду
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    act(() => {
      result.current.updateSession({
        correctChars: 10,
        totalChars: 10,
        errors: 0,
      })
    })

    expect(result.current.currentStats).not.toBeNull()
    expect(result.current.currentStats?.correctChars).toBe(10)
    expect(result.current.currentStats?.totalChars).toBe(10)
    expect(result.current.currentStats?.accuracy).toBe(100)
  })

  it('должен завершать сессию', () => {
    const onSaveStats = vi.fn()
    const { result } = renderHook(() => useTypingStats({ onSaveStats }))

    act(() => {
      result.current.startSession()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    act(() => {
      result.current.updateSession({
        correctChars: 20,
        totalChars: 20,
        errors: 0,
      })
    })

    let sessionResult: ReturnType<typeof result.current.completeSession>
    act(() => {
      sessionResult = result.current.completeSession()
    })

    expect(result.current.isComplete).toBe(true)
    expect(onSaveStats).toHaveBeenCalled()
    expect(sessionResult?.xp).toBeGreaterThan(0)
  })

  it('должен сбрасывать сессию', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.resetSession()
    })

    expect(result.current.currentStats).toBeNull()
    expect(result.current.isComplete).toBe(false)
  })
})
