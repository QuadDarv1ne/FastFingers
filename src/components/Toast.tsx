import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
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

export function Toast({ id, type, title, message, duration, onDismiss }: ToastProps) {
  return (
    <div className={`toast ${typeClasses[type]}`} role="alert">
      <span className="toast__icon" aria-hidden="true">{icons[type]}</span>
      <div className="toast__content">
        <h4 className="toast__title">{title}</h4>
        {message && <p className="toast__message">{message}</p>}
        {duration && (
          <div className="toast__progress">
            <div
              className="toast__progress-bar"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
      <button
        className="toast__dismiss"
        onClick={() => onDismiss(id)}
        aria-label="Закрыть уведомление"
      >
        ✕
      </button>
    </div>
  )
}
