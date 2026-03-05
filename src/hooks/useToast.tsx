import { useState, useCallback, useMemo } from 'react'
import { generateId } from '../utils/id'
import { Toast, ToastType, ToastAction } from '../components/Toast'

interface ToastOptions {
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

interface UseToastReturn {
  toasts: Toast[]
  success: (options: ToastOptions) => string
  error: (options: ToastOptions) => string
  warning: (options: ToastOptions) => string
  info: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

/**
 * Хук для управления Toast уведомлениями
 */
export function useToast(defaultDuration: number = 5000): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, { title, message, duration, action }: ToastOptions) => {
      const id = generateId()
      const toastDuration = duration ?? defaultDuration

      const toast: Toast = {
        id,
        type,
        title,
        message,
        duration: toastDuration,
        action,
      }

      setToasts(prev => [...prev, toast])

      if (toastDuration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, toastDuration)
      }

      return id
    },
    [defaultDuration, dismiss]
  )

  const success = useCallback(
    (options: ToastOptions) => addToast('success', options),
    [addToast]
  )

  const error = useCallback(
    (options: ToastOptions) => addToast('error', options),
    [addToast]
  )

  const warning = useCallback(
    (options: ToastOptions) => addToast('warning', options),
    [addToast]
  )

  const info = useCallback(
    (options: ToastOptions) => addToast('info', options),
    [addToast]
  )

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return useMemo(
    () => ({
      toasts,
      success,
      error,
      warning,
      info,
      dismiss,
      dismissAll,
    }),
    [toasts, success, error, warning, info, dismiss, dismissAll]
  )
}
