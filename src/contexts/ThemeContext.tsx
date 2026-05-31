/**
 * ThemeContext — Shared theme state via React Context
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { createContext, useContext, ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import type { UseThemeReturn } from '../hooks/useTheme'

const ThemeContext = createContext<UseThemeReturn | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = useTheme()
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext(): UseThemeReturn {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return ctx
}
