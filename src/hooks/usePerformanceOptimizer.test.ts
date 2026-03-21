/**
 * Tests for usePerformanceOptimizer hook
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useThrottle } from './usePerformanceOptimizer'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('должен задерживать вызов функции', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useDebounce(fn, 100))

    act(() => {
      result.current('test')
    })

    expect(fn).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(fn).toHaveBeenCalledWith('test')
  })

  it('должен отменять предыдущие вызовы', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useDebounce(fn, 100))

    act(() => {
      result.current('first')
      vi.advanceTimersByTime(50)
      result.current('second')
    })

    expect(fn).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')
  })

  it('должен иметь метод cancel', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useDebounce(fn, 100))

    act(() => {
      result.current('test')
      result.current.cancel()
      vi.advanceTimersByTime(100)
    })

    expect(fn).not.toHaveBeenCalled()
  })

  it('должен иметь метод flush', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useDebounce(fn, 100))

    act(() => {
      result.current('test')
      result.current.flush()
    })

    expect(fn).toHaveBeenCalledWith('test')
  })

  it.skip('должен вызывать функцию немедленно с leading=true', () => {
    vi.useRealTimers()
    const fn = vi.fn()
    const { result } = renderHook(() =>
      useDebounce(fn, 100, { leading: true, trailing: false })
    )

    act(() => {
      result.current('test')
    })

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('test')
    
    vi.useFakeTimers()
  })
})

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('должен ограничивать частоту вызовов', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useThrottle(fn, 100))

    act(() => {
      result.current('first')
      vi.advanceTimersByTime(50)
      result.current('second')
      vi.advanceTimersByTime(60)
    })

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('first')
  })

  it('должен вызывать функцию снова после истечения времени', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useThrottle(fn, 100))

    act(() => {
      result.current('first')
      vi.advanceTimersByTime(100)
      result.current('second')
    })

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'first')
    expect(fn).toHaveBeenNthCalledWith(2, 'second')
  })

  it.skip('должен вызывать trailing вызов', () => {
    const fn = vi.fn()
    const { result } = renderHook(() =>
      useThrottle(fn, 100, { trailing: true })
    )

    act(() => {
      result.current('first')
      vi.advanceTimersByTime(50)
      result.current('second')
      vi.advanceTimersByTime(150)
    })

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
