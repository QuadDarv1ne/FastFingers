import { Toast, ToastAction } from './Toast'
import './ToastContainer.css'

export interface ToastWithAction {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

interface ToastContainerProps {
  toasts: ToastWithAction[]
  onDismiss: (id: string) => void
}

/**
 * Компонент-контейнер для Toast уведомлений
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
