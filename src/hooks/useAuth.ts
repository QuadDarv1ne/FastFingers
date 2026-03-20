/**
 * useAuth — Хук для использования аутентификации
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

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
