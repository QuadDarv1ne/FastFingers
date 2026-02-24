import { useState, useEffect, useCallback } from 'react'
import { ThemeColor, applyTheme, ThemeColors } from '../utils/themes'

interface UseThemeReturn {
  theme: ThemeColor
  setTheme: (theme: ThemeColor) => void
  customColors: Partial<ThemeColors> | null
  setCustomColors: (colors: Partial<ThemeColors>) => void
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    try {
      const stored = localStorage.getItem('fastfingers_theme')
      return (stored as ThemeColor) || 'dark'
    } catch {
      return 'dark'
    }
  })

  const [customColors, setCustomColorsState] = useState<Partial<ThemeColors> | null>(() => {
    try {
      const stored = localStorage.getItem('fastfingers_custom_colors')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      applyTheme(theme, customColors || undefined)
    })
    return () => cancelAnimationFrame(timer)
  }, [theme, customColors])

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('fastfingers_theme', newTheme)
    } catch (e) {
      console.error('Failed to save theme:', e)
    }
  }, [])

  const setCustomColors = useCallback((colors: Partial<ThemeColors>) => {
    setCustomColorsState(colors)
    try {
      localStorage.setItem('fastfingers_custom_colors', JSON.stringify(colors))
    } catch (e) {
      console.error('Failed to save custom colors:', e)
    }
  }, [])

  return { theme, setTheme, customColors, setCustomColors }
}
