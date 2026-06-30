/* eslint-disable react-refresh/only-export-components -- Context exports both provider and custom hook */
import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  dismissToast: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Clean up timeouts on unmount
  useEffect(() => {
    const currentTimeouts = timeoutsRef.current;
    return () => {
      currentTimeouts.forEach(id => clearTimeout(id))
      currentTimeouts.clear()
    }
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Math.random().toString(36).slice(2)
      const toast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          timeoutsRef.current.delete(id)
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
        timeoutsRef.current.set(id, timeoutId)
      }
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    for (const timeoutId of timeoutsRef.current.values()) {
      clearTimeout(timeoutId)
    }
    timeoutsRef.current.clear()
    setToasts([])
  }, [])

  const contextValue = useMemo(
    () => ({ toasts, showToast, dismissToast, dismissAll }),
    [toasts, showToast, dismissToast, dismissAll],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
