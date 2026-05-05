import { useCallback } from 'react'

/**
 * Hook для тактильной обратной связи (вибрации) на мобильных устройствах
 * Использует Vibration API если доступно
 */
export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (!isSupported) return

    try {
      navigator.vibrate(pattern)
    } catch (e) {
      console.warn('Vibration API error:', e)
    }
  }, [isSupported])

  return { vibrate, isSupported }
}