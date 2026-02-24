import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoading, useLoadingProgress } from '../hooks/useLoading'

describe('useLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('должен возвращать isLoading: false по умолчанию', () => {
    const { result } = renderHook(() => useLoading())
    expect(result.current.isLoading).toBe(false)
  })

  it('должен поддерживать начальное состояние загрузки', () => {
    const { result } = renderHook(() => useLoading({ initialState: true }))
    expect(result.current.isLoading).toBe(true)
  })

  it('должен переключать isLoading на true при startLoading', () => {
    const { result } = renderHook(() => useLoading())

    act(() => {
      result.current.startLoading()
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('должен переключать isLoading на false при stopLoading', () => {
    const { result } = renderHook(() => useLoading({ initialState: true }))

    act(() => {
      result.current.stopLoading()
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('должен ждать minDuration перед остановкой загрузки', () => {
    const minDuration = 1000
    const { result } = renderHook(() => useLoading({ minDuration }))

    act(() => {
      result.current.startLoading()
    })
    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.stopLoading()
      vi.advanceTimersByTime(500) // Меньше minDuration
    })
    expect(result.current.isLoading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500) // Ещё 500мс, итого 1000мс
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('должен немедленно останавливать загрузку, если прошло больше minDuration', () => {
    const minDuration = 500
    const { result } = renderHook(() => useLoading({ minDuration }))

    act(() => {
      result.current.startLoading()
      vi.advanceTimersByTime(1000)
      result.current.stopLoading()
    })

    expect(result.current.isLoading).toBe(false)
  })
})

describe('useLoadingProgress', () => {
  it('должен инициализировать прогресс с 0', () => {
    const { result } = renderHook(() => useLoadingProgress())
    expect(result.current.progress).toBe(0)
    expect(result.current.isComplete).toBe(false)
  })

  it('должен поддерживать начальный прогресс', () => {
    const { result } = renderHook(() => useLoadingProgress(25))
    expect(result.current.progress).toBe(25)
  })

  it('должен обновлять прогресс через update', () => {
    const { result } = renderHook(() => useLoadingProgress())

    act(() => {
      result.current.update(50)
    })

    expect(result.current.progress).toBe(50)
  })

  it('должен ограничивать прогресс от 0 до 100', () => {
    const { result } = renderHook(() => useLoadingProgress())

    act(() => {
      result.current.update(-10)
    })
    expect(result.current.progress).toBe(0)

    act(() => {
      result.current.update(150)
    })
    expect(result.current.progress).toBe(100)
  })

  it('должен увеличивать прогресс через increment', () => {
    const { result } = renderHook(() => useLoadingProgress(50))

    act(() => {
      result.current.increment(25)
    })
    expect(result.current.progress).toBe(75)

    act(() => {
      result.current.increment(50)
    })
    expect(result.current.progress).toBe(100)
  })

  it('должен завершать прогресс через complete', () => {
    const { result } = renderHook(() => useLoadingProgress(50))

    act(() => {
      result.current.complete()
    })

    expect(result.current.progress).toBe(100)
    expect(result.current.isComplete).toBe(true)
  })

  it('должен начинать прогресс через start', () => {
    const { result } = renderHook(() => useLoadingProgress(75))

    act(() => {
      result.current.start()
    })

    expect(result.current.progress).toBe(0)
    expect(result.current.isComplete).toBe(false)
  })

  it('должен сбрасывать прогресс через reset', () => {
    const { result } = renderHook(() => useLoadingProgress(25))

    act(() => {
      result.current.update(80)
      result.current.complete()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.progress).toBe(25)
    expect(result.current.isComplete).toBe(false)
  })
})
