import { useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContextValue'
import type { UseThemeReturn } from './useTheme'

export function useThemeContext(): UseThemeReturn {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return ctx
}
