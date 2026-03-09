import { useState, useEffect, useCallback } from 'react'
import { ThemeColor, applyTheme, ThemeColors } from '../utils/themes'
import type { FontSize } from '../types'

interface UseThemeReturn {
  theme: ThemeColor
  setTheme: (theme: ThemeColor) => void
  customColors: Partial<ThemeColors> | null
  setCustomColors: (colors: Partial<ThemeColors>) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
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

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      const stored = localStorage.getItem('fastfingers_font_size')
      return (stored as FontSize) || 'medium'
    } catch {
      return 'medium'
    }
  })

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      applyTheme(theme, customColors || undefined)
    })
    return () => cancelAnimationFrame(timer)
  }, [theme, customColors])

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
    try {
      localStorage.setItem('fastfingers_font_size', fontSize)
    } catch {
      // Ignore save errors
    }
  }, [fontSize])

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('fastfingers_theme', newTheme)
    } catch {
      // Ignore save errors
    }
  }, [])

  const setCustomColors = useCallback((colors: Partial<ThemeColors>) => {
    setCustomColorsState(colors)
    try {
      localStorage.setItem('fastfingers_custom_colors', JSON.stringify(colors))
    } catch {
      // Ignore save errors
    }
  }, [])

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size)
  }, [])

  return { theme, setTheme, customColors, setCustomColors, fontSize, setFontSize }
}
