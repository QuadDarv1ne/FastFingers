import { useContext } from 'react'
import { NotificationContext } from '../contexts/NotificationContext'

/**
 * Хук для использования уведомлений
 * Должен использоваться внутри NotificationProvider
 */
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
