import { useEffect, useState, useCallback } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

interface ToastProps extends Toast {
  onDismiss: (id: string) => void
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const typeClasses: Record<ToastType, string> = {
  success: 'toast--success',
  error: 'toast--error',
  warning: 'toast--warning',
  info: 'toast--info',
}

export function Toast({ id, type, title, message, duration, action, onDismiss }: ToastProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration || 5000)

  const dismiss = useCallback(() => {
    onDismiss(id)
  }, [id, onDismiss])

  useEffect(() => {
    if (!duration || isPaused) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(interval)
          dismiss()
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration, isPaused, dismiss])

  const progress = duration ? ((duration - timeLeft) / duration) * 100 : 100

  return (
    <div
      className={`toast ${typeClasses[type]}`}
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span className="toast__icon" aria-hidden="true">{icons[type]}</span>
      <div className="toast__content">
        <h4 className="toast__title">{title}</h4>
        {message && <p className="toast__message">{message}</p>}
        {action && (
          <button
            className="toast__action"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        className="toast__dismiss"
        onClick={dismiss}
        aria-label="Закрыть уведомление"
      >
        ✕
      </button>
      {duration && (
        <div className="toast__progress">
          <div
            className="toast__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
