import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Хук для использования аутентификации
 * Должен использоваться внутри AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
