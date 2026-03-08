import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypingGame } from '@hooks/useTypingGame'
import * as exercises from '@utils/exercises'

vi.mock('@utils/exercises', () => ({
  generatePracticeText: vi.fn().mockReturnValue('test text for typing'),
}))

describe('useTypingGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('должен инициализировать текст при монтировании', () => {
    const { result } = renderHook(() => useTypingGame())

    expect(exercises.generatePracticeText).toHaveBeenCalledWith(30, 5)
    expect(result.current.text).toBe('test text for typing')
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.inputResults).toEqual([])
  })

  it('должен использовать кастомные параметры wordCount и difficulty', () => {
    renderHook(() => useTypingGame({ initialWordCount: 50, initialDifficulty: 7 }))

    expect(exercises.generatePracticeText).toHaveBeenCalledWith(50, 7)
  })

  it('должен работать в timed режиме с таймером', () => {
    const { result } = renderHook(() => useTypingGame({ mode: 'timed', duration: 30 }))

    expect(result.current.timeLeft).toBe(30)
    expect(result.current.isActive).toBe(false)
  })

  it('должен запускать таймер при isActive', () => {
    const { result } = renderHook(() => useTypingGame({ mode: 'timed', duration: 10 }))

    act(() => {
      result.current.handleStart()
    })

    expect(result.current.isActive).toBe(true)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.timeLeft).toBeLessThan(10)
  })

  it('должен сбрасывать состояние при reset', () => {
    const { result } = renderHook(() => useTypingGame())

    act(() => {
      result.current.reset()
    })

    expect(result.current.text).toBe('test text for typing')
    expect(result.current.currentIndex).toBe(0)
  })

  it('должен возвращать isComplete = false изначально', () => {
    const { result } = renderHook(() => useTypingGame())

    expect(result.current.isComplete).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })

  it('должен предоставлять inputRef', () => {
    const { result } = renderHook(() => useTypingGame())

    expect(result.current.inputRef.current).toBeNull()
  })

  it('должен вызывать handleSkip для генерации нового текста', () => {
    const { result } = renderHook(() => useTypingGame())

    act(() => {
      result.current.handleSkip()
    })

    expect(exercises.generatePracticeText).toHaveBeenCalledTimes(2)
  })

  it('должен экспортировать generateNewText', () => {
    const { result } = renderHook(() => useTypingGame())

    act(() => {
      result.current.generateNewText()
    })

    expect(exercises.generatePracticeText).toHaveBeenCalledTimes(2)
  })
})
