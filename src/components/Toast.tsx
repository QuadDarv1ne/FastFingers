import { motion } from 'framer-motion'
import type { Toast as ToastType } from '@contexts/ToastContext'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

type ToastKind = 'success' | 'error' | 'info' | 'warning'

const toastStyles: Record<ToastKind, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-black',
}

const toastIcons: Record<ToastKind, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${toastStyles[toast.type]}`}
      data-testid={`toast-${toast.type}`}
    >
      <span className="text-lg font-bold">{toastIcons[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Закрыть уведомление"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  )
}
