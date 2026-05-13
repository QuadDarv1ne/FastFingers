import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHardcoreMode } from './useHardcoreMode'
import { generatePracticeText } from '../utils/exercises'
import { calculateStats } from '../utils/stats'
import { useTypingSound } from './useTypingSound'

// Mock dependencies
vi.mock('../utils/exercises')
vi.mock('../utils/stats')
vi.mock('./useTypingSound')

describe('useHardcoreMode', () => {
  const mockGeneratePracticeText = generatePracticeText as any
  const mockCalculateStats = calculateStats as any
  const mockUseTypingSound = useTypingSound as any

  const mockText = 'test text'
  const mockStats = { wpm: 50, accuracy: 90, cpm: 250, errors: 5, correctChars: 45, totalChars: 50, timeElapsed: 30 }

  beforeEach(() => {
    vi.useFakeTimers()
    mockGeneratePracticeText.mockReturnValue(mockText)
    mockCalculateStats.mockReturnValue(mockStats)
    mockUseTypingSound.mockReturnValue({
      playCorrect: vi.fn(),
      playError: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useHardcoreMode({
        onComplete: vi.fn(),
      })
    )

    expect(result.current.text).toBe(mockText)
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.inputResults).toEqual([])
    expect(result.current.isActive).toBe(false)
    expect(result.current.countdown).toBeNull()
    expect(result.current.streak).toBe(0)
    expect(result.current.bestStreak).toBe(0)
    expect(result.current.startTime).toBeNull()
    expect(result.current.inputRef).toHaveProperty('current')
  })

  it('should start countdown and then activate on handleStart', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useHardcoreMode({
        onComplete,
      })
    )

    act(() => {
      result.current.handleStart()
    })

    expect(result.current.countdown).toBe(3) // COUNTDOWN_SECONDS
    expect(result.current.isActive).toBe(false) // Not yet active

    // Simulate timer ticks
    act(() => {
      // Fast-forward the timers by 3 seconds
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.countdown).toBeNull()
    expect(result.current.isActive).toBe(true)
    expect(result.current.startTime).not.toBeNull()
  })

  // Helper function to create FormEvent
  const createInputEvent = (value: string): React.FormEvent<HTMLInputElement> => {
    const input = { value } as HTMLInputElement
    return {
      currentTarget: input,
      target: input,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: {} as Event,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: vi.fn(),
      timeStamp: 0,
      type: 'change',
    } as unknown as React.FormEvent<HTMLInputElement>
  }

  it('should handle correct input and increment streak', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useHardcoreMode({
        onComplete,
        sound: mockUseTypingSound(),
      })
    )

    // Start the game to make it active
    act(() => {
      result.current.handleStart()
      vi.advanceTimersByTime(3000) // Wait for countdown
    })

    // Simulate correct input
    act(() => {
      result.current.handleInput(createInputEvent('t'))
    })

    expect(result.current.inputResults).toEqual([{ isCorrect: true, char: 't' }])
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.streak).toBe(1)
    expect(mockUseTypingSound().playCorrect).toHaveBeenCalledWith('t')
  })

  it('should handle incorrect input and end game', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useHardcoreMode({
        onComplete,
        sound: mockUseTypingSound(),
      })
    )

    // Start the game to make it active
    act(() => {
      result.current.handleStart()
      vi.advanceTimersByTime(3000) // Wait for countdown
    })

    // Simulate incorrect input
    act(() => {
      result.current.handleInput(createInputEvent('x'))
    })

    // Should have called onComplete with stats
    expect(onComplete).toHaveBeenCalledWith(mockStats)
    expect(result.current.isActive).toBe(false)
    expect(mockUseTypingSound().playError).toHaveBeenCalled()
  })

  it('should reset game on resetGame', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useHardcoreMode({
        onComplete,
      })
    )

    // Set some state
    act(() => {
      result.current.handleStart()
      vi.advanceTimersByTime(3000)
      result.current.handleInput(createInputEvent('t'))
    })

    // Reset
    act(() => {
      result.current.resetGame()
    })

    expect(result.current.text).toBe(mockText) // New text generated
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.inputResults).toEqual([])
    expect(result.current.isActive).toBe(false)
    expect(result.current.countdown).toBeNull()
    expect(result.current.streak).toBe(0)
    expect(result.current.startTime).toBeNull()
  })

  it('should generate new text when reaching end of current text', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useHardcoreMode({
        onComplete,
      })
    )

    // Start the game
    act(() => {
      result.current.handleStart()
      vi.advanceTimersByTime(3000)
    })

    // Fill the entire text with correct characters
    for (let i = 0; i < mockText.length; i++) {
      const char = mockText[i]
      if (!char) continue
      act(() => {
        result.current.handleInput(createInputEvent(char))
      })
    }

    // After the last character, a new text should be generated
    expect(mockGeneratePracticeText).toHaveBeenCalledTimes(2) // Initial + one reset
  })
})