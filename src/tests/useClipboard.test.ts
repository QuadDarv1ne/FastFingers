import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClipboard } from '../hooks/useClipboard'

describe('useClipboard', () => {
  const originalClipboard = navigator.clipboard
  const mockWriteText = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    // @ts-ignore - Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true
    })
    mockWriteText.mockClear()
  })

  it('должен возвращать copied: false по умолчанию', () => {
    const { result } = renderHook(() => useClipboard())

    expect(result.current.copied).toBe(false)
  })

  it('должен копировать текст в буфер обмена', async () => {
    mockWriteText.mockResolvedValue(undefined)

    const { result } = renderHook(() => useClipboard({ timeout: 2000 }))

    await act(async () => {
      await result.current.copy('Тестовый текст')
    })

    expect(mockWriteText).toHaveBeenCalledWith('Тестовый текст')
    expect(result.current.copied).toBe(true)
  })

  it('должен устанавливать copied: false после timeout', async () => {
    mockWriteText.mockResolvedValue(undefined)

    const { result } = renderHook(() => useClipboard({ timeout: 2000 }))

    await act(async () => {
      await result.current.copy('Тест')
    })

    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.copied).toBe(false)
  })

  it('должен вызывать onSuccess при успешном копировании', async () => {
    mockWriteText.mockResolvedValue(undefined)
    const onSuccess = vi.fn()

    const { result } = renderHook(() => useClipboard({ onSuccess }))

    await act(async () => {
      await result.current.copy('Тест')
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('должен вызывать onError при ошибке копирования', async () => {
    mockWriteText.mockRejectedValue(new Error('Clipboard error'))
    const onError = vi.fn()

    const { result } = renderHook(() => useClipboard({ onError }))

    await expect(result.current.copy('Тест')).rejects.toThrow('Clipboard error')
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('должен сбрасывать copied при вызове reset', async () => {
    mockWriteText.mockResolvedValue(undefined)

    const { result } = renderHook(() => useClipboard({ timeout: 5000 }))

    await act(async () => {
      await result.current.copy('Тест')
    })

    expect(result.current.copied).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.copied).toBe(false)
  })

  it('должен обрабатывать ошибку при отсутствии clipboard API', async () => {
    // @ts-ignore - Отключаем clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true
    })
    const onError = vi.fn()

    const { result } = renderHook(() => useClipboard({ onError }))

    // В jsdom execCommand не поддерживается, поэтому будет ошибка
    await expect(result.current.copy('Тест')).rejects.toThrow()
  })
})
