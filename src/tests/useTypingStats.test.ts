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

    act(() => {
      const res = result.current.completeSession()
      expect(res).toBeDefined()
      expect(res?.xp).toBeGreaterThan(0)
    })

    expect(result.current.isComplete).toBe(true)
    expect(onSaveStats).toHaveBeenCalled()
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

  it('должен записывать нажатия клавиш', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.recordKeystroke('a', true)
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current.recordKeystroke('b', false)
    })

    const keystrokes = result.current.getKeystrokes()
    expect(keystrokes.length).toBe(2)
    expect(keystrokes[0]?.key).toBe('a')
    expect(keystrokes[0]?.isCorrect).toBe(true)
    expect(keystrokes[1]?.key).toBe('b')
    expect(keystrokes[1]?.isCorrect).toBe(false)
  })

  it('должен возвращать расширенные метрики', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    act(() => {
      result.current.recordKeystroke('a', true)
      result.current.recordKeystroke('b', true)
      result.current.recordKeystroke('c', false)
      result.current.recordKeystroke('d', true)
    })

    act(() => {
      result.current.updateSession({
        correctChars: 10,
        totalChars: 12,
        errors: 2,
      })
    })

    expect(result.current.currentStats).not.toBeNull()
    expect(result.current.currentStats?.rhythmScore).toBeDefined()
    expect(result.current.currentStats?.fingerBalance).toBeDefined()
  })

  it('должен использовать кастомную функцию getKeyFinger', () => {
    const getKeyFinger = vi.fn((_key: string) => 'left-index')
    const { result } = renderHook(() => useTypingStats({ getKeyFinger }))

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.recordKeystroke('f', true)
    })

    expect(getKeyFinger).toHaveBeenCalledWith('f')
  })

  it('должен возвращать пустой массив при getKeystrokes без записей', () => {
    const { result } = renderHook(() => useTypingStats())

    const keystrokes = result.current.getKeystrokes()
    expect(keystrokes).toEqual([])
  })

  it('должен завершать сессию без onSaveStats', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

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

    act(() => {
      const res = result.current.completeSession()
      expect(res).toBeDefined()
    })

    expect(result.current.isComplete).toBe(true)
  })

  it('должен предотвращать обновление после завершения', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

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

    const statsBeforeComplete = result.current.currentStats
    
    act(() => {
      result.current.completeSession()
    })

    // После завершения статистика сохраняется
    expect(result.current.isComplete).toBe(true)
    expect(result.current.currentStats).not.toBeNull()
    expect(result.current.currentStats).toEqual(statsBeforeComplete)
  })

  it('должен предотвращать запись нажатий без начала сессии', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.recordKeystroke('a', true)
    })

    const keystrokes = result.current.getKeystrokes()
    expect(keystrokes.length).toBe(0)
  })

  it('должен предотвращать обновление без начала сессии', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.updateSession({
        correctChars: 10,
        totalChars: 10,
        errors: 0,
      })
    })

    expect(result.current.currentStats).toBeNull()
  })

  it('должен предотвращать завершение без начала сессии', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      const res = result.current.completeSession()
      expect(res).toBeUndefined()
    })

    expect(result.current.isComplete).toBe(false)
  })

  it('должен рассчитывать sessionEfficiency', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    act(() => {
      result.current.updateSession({
        correctChars: 50,
        totalChars: 50,
        errors: 0,
      })
    })

    expect(result.current.currentStats?.sessionEfficiency).toBeDefined()
  })

  it('должен рассчитывать errorRecoveryTime', () => {
    const { result } = renderHook(() => useTypingStats())

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.recordKeystroke('a', true)
      vi.advanceTimersByTime(200)
      result.current.recordKeystroke('b', false)
      vi.advanceTimersByTime(500)
      result.current.recordKeystroke('c', true)
    })

    act(() => {
      result.current.updateSession({
        correctChars: 10,
        totalChars: 12,
        errors: 1,
      })
    })

    expect(result.current.currentStats?.errorRecoveryTime).toBeDefined()
  })
})
