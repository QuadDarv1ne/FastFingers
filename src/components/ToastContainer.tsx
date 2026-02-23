import { Toast } from './Toast'
import './ToastContainer.css'

interface ToastContainerProps {
  toasts: Toast[]
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
