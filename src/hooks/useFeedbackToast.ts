import { useState } from 'react'

export function useFeedbackToast() {
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    isVisible: boolean
  }>({
    type: 'info',
    message: '',
    isVisible: false,
  })

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setToast({ type, message, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return { toast, showToast, hideToast }
}
