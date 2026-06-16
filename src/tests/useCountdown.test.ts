import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from '../hooks/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('должен изначально иметь null countdown', () => {
    const { result } = renderHook(() => useCountdown({ onComplete: vi.fn() }))
    expect(result.current.countdown).toBeNull()
  })

  it('должен устанавливать countdown при вызове start', () => {
    const { result } = renderHook(() => useCountdown({ onComplete: vi.fn() }))

    act(() => result.current.start(5))
    expect(result.current.countdown).toBe(5)
  })

  it('должен уменьшать countdown каждую секунду', () => {
    const { result } = renderHook(() => useCountdown({ onComplete: vi.fn() }))

    act(() => result.current.start(3))
    expect(result.current.countdown).toBe(3)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.countdown).toBe(2)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.countdown).toBe(1)
  })

  it('должен вызывать onComplete когда countdown достигает 0', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCountdown({ onComplete }))

    act(() => result.current.start(2))
    act(() => vi.advanceTimersByTime(2000))

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('должен сбрасывать countdown в null после завершения', () => {
    const { result } = renderHook(() => useCountdown({ onComplete: vi.fn() }))

    act(() => result.current.start(1))
    act(() => vi.advanceTimersByTime(1000))

    expect(result.current.countdown).toBeNull()
  })

  it('должен отменять countdown при вызове cancel', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCountdown({ onComplete }))

    act(() => result.current.start(5))
    act(() => vi.advanceTimersByTime(2000))
    act(() => result.current.cancel())

    expect(result.current.countdown).toBeNull()
    act(() => vi.advanceTimersByTime(5000))
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('должен перезапускать countdown при повторном вызове start', () => {
    const { result } = renderHook(() => useCountdown({ onComplete: vi.fn() }))

    act(() => result.current.start(10))
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.countdown).toBe(5)

    act(() => result.current.start(3))
    expect(result.current.countdown).toBe(3)

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.countdown).toBeNull()
  })

  it('должен предотвращать множественные вызовы onComplete', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCountdown({ onComplete }))

    act(() => result.current.start(1))
    act(() => vi.advanceTimersByTime(1000))
    expect(onComplete).toHaveBeenCalledTimes(1)

    act(() => vi.advanceTimersByTime(5000))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('должен очищать интервал при размонтировании', () => {
    const onComplete = vi.fn()
    const { result, unmount } = renderHook(() => useCountdown({ onComplete }))

    act(() => result.current.start(5))
    unmount()

    act(() => vi.advanceTimersByTime(10000))
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('должен обновлять onComplete при изменении пропса', () => {
    const onComplete1 = vi.fn()
    const onComplete2 = vi.fn()
    const { result, rerender } = renderHook(
      ({ onComplete }) => useCountdown({ onComplete }),
      { initialProps: { onComplete: onComplete1 } }
    )

    act(() => result.current.start(1))
    rerender({ onComplete: onComplete2 })
    act(() => vi.advanceTimersByTime(1000))

    expect(onComplete1).not.toHaveBeenCalled()
    expect(onComplete2).toHaveBeenCalledTimes(1)
  })

  it('должен игнорировать старый интервал после перезапуска', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCountdown({ onComplete }))

    act(() => result.current.start(3))
    act(() => vi.advanceTimersByTime(1000))

    act(() => result.current.start(5))
    act(() => vi.advanceTimersByTime(5000))

    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
