import { motion } from 'framer-motion'
import type { Toast as ToastType } from '@contexts/ToastContext'
import { useAppTranslation } from '@i18n/config'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

type ToastKind = 'success' | 'error' | 'info' | 'warning'

const toastAccents: Record<ToastKind, { border: string; bg: string; icon: string; ring: string }> = {
  success: { border: 'border-green-500/40', bg: 'bg-green-500/10', icon: '✓', ring: 'ring-green-500/20' },
  error: { border: 'border-red-500/40', bg: 'bg-red-500/10', icon: '✕', ring: 'ring-red-500/20' },
  info: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', icon: 'ℹ', ring: 'ring-blue-500/20' },
  warning: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', icon: '⚠', ring: 'ring-yellow-500/20' },
}

const textColors: Record<ToastKind, string> = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
}

const FALLBACK_ACCENT = { border: 'border-blue-500/40', bg: 'bg-blue-500/10', icon: 'ℹ', ring: 'ring-blue-500/20' }
const FALLBACK_TEXT_COLOR = 'text-blue-400'

export function Toast({ toast, onDismiss }: ToastProps) {
  const { t } = useAppTranslation()
  const accent = toastAccents[toast.type as ToastKind] ?? FALLBACK_ACCENT
  const textColor = textColors[toast.type as ToastKind] ?? FALLBACK_TEXT_COLOR

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`glass flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${accent.border} ${accent.bg} ${accent.ring}`}
      data-testid={`toast-${toast.type}`}
    >
      <span className={`w-7 h-7 rounded-lg ${accent.bg} flex items-center justify-center text-sm font-bold ${textColor}`}>
        {accent.icon}
      </span>
      <span className="flex-1 text-sm text-dark-200">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1.5 hover:bg-dark-700/50 rounded-lg transition-colors text-dark-400 hover:text-white"
        aria-label={t('action.close')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  )
}
