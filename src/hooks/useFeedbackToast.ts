import { useState, useCallback } from 'react'

interface ToastState {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  isVisible: boolean
}

export function useFeedbackToast() {
  const [toast, setToast] = useState<ToastState>({
    type: 'info',
    message: '',
    isVisible: false,
  })

  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setToast({ type, message, isVisible: true })
  }, [])

  const showSuccess = useCallback((message: string) => {
    showToast('success', message)
  }, [showToast])

  const showError = useCallback((message: string) => {
    showToast('error', message)
  }, [showToast])

  const showInfo = useCallback((message: string) => {
    showToast('info', message)
  }, [showToast])

  const showWarning = useCallback((message: string) => {
    showToast('warning', message)
  }, [showToast])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  return { toast, showToast, showSuccess, showError, showInfo, showWarning, hideToast }
}
