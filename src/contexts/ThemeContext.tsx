/**
 * ThemeContext — Shared theme state via React Context
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import type { ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import { ThemeContext } from './ThemeContextValue'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = useTheme()
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}
