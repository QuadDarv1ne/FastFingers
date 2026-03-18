import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ToastProvider, useToast } from '@contexts/ToastContext'

function createWrapper() {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  )
  Wrapper.displayName = 'ToastProviderWrapper'
  return Wrapper
}

describe('ToastContext', () => {
  describe('useToast', () => {
    it('должен предоставлять showToast, dismissToast и dismissAll', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      expect(result.current.showToast).toBeDefined()
      expect(result.current.dismissToast).toBeDefined()
      expect(result.current.dismissAll).toBeDefined()
      expect(result.current.toasts).toEqual([])
    })

    it('должен добавлять toast при вызове showToast', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Тестовое сообщение', 'success', 3000)
      })

      expect(result.current.toasts).toHaveLength(1)
      const toast = result.current.toasts[0]
      expect(toast?.message).toBe('Тестовое сообщение')
      expect(toast?.type).toBe('success')
    })

    it('должен использовать значения по умолчанию', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Сообщение')
      })

      expect(result.current.toasts).toHaveLength(1)
      const toast = result.current.toasts[0]
      expect(toast?.type).toBe('info')
      expect(toast?.duration).toBe(3000)
    })

    it('должен удалять toast при вызове dismissToast', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Сообщение 1', 'success')
        result.current.showToast('Сообщение 2', 'error')
      })

      expect(result.current.toasts).toHaveLength(2)

      act(() => {
        const firstToastId = result.current.toasts[0]?.id
        if (firstToastId) {
          result.current.dismissToast(firstToastId)
        }
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]?.message).toBe('Сообщение 2')
    })

    it('должен удалять все toasts при вызове dismissAll', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Сообщение 1', 'success')
        result.current.showToast('Сообщение 2', 'error')
        result.current.showToast('Сообщение 3', 'info')
      })

      expect(result.current.toasts).toHaveLength(3)

      act(() => {
        result.current.dismissAll()
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('должен автоматически удалять toast через duration', async () => {
      vi.useFakeTimers()
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Временное сообщение', 'info', 1000)
      })

      expect(result.current.toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.toasts).toHaveLength(0)
      vi.useRealTimers()
    })

    it('не должен удалять toast если duration = 0', () => {
      vi.useFakeTimers()
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Постоянное сообщение', 'warning', 0)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(result.current.toasts).toHaveLength(1)
      vi.useRealTimers()
    })

    it('должен генерировать уникальные id для каждого toast', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Сообщение 1', 'success')
        result.current.showToast('Сообщение 2', 'success')
        result.current.showToast('Сообщение 3', 'success')
      })

      const ids = result.current.toasts.map((t) => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('ToastProvider', () => {
    it('должен выбрасывать ошибку при использовании useToast вне ToastProvider', () => {
      expect(() => {
        renderHook(() => useToast())
      }).toThrow('useToast must be used within ToastProvider')
    })
  })

  describe('типы уведомлений', () => {
    it('должен поддерживать все типы уведомлений', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.showToast('Success', 'success')
        result.current.showToast('Error', 'error')
        result.current.showToast('Info', 'info')
        result.current.showToast('Warning', 'warning')
      })

      expect(result.current.toasts.map((t) => t.type)).toEqual([
        'success',
        'error',
        'info',
        'warning',
      ])
    })
  })
})
