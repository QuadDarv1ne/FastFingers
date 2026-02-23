import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function FeedbackToast({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: FeedbackToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const config = {
    success: {
      icon: '✅',
      bgColor: 'from-green-600/90 to-emerald-600/90',
      borderColor: 'border-green-500/50',
      textColor: 'text-white',
    },
    error: {
      icon: '❌',
      bgColor: 'from-red-600/90 to-rose-600/90',
      borderColor: 'border-red-500/50',
      textColor: 'text-white',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'from-yellow-600/90 to-orange-600/90',
      borderColor: 'border-yellow-500/50',
      textColor: 'text-white',
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'from-blue-600/90 to-cyan-600/90',
      borderColor: 'border-blue-500/50',
      textColor: 'text-white',
    },
  }

  const { icon, bgColor, borderColor, textColor } = config[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-xl
            bg-gradient-to-r ${bgColor}
            border ${borderColor}
            backdrop-blur-xl shadow-2xl
            ${textColor}
          `}>
            <span className="text-2xl">{icon}</span>
            <p className="font-semibold text-sm">{message}</p>
            <button
              onClick={onClose}
              className="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Хук для управления toast уведомлениями
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

