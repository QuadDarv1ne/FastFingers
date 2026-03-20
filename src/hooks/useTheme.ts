import { useState, useEffect, useCallback } from 'react'
import { ThemeColor, applyTheme, ThemeColors } from '../utils/themes'
import type { FontSize } from '../types'

type ThemeOption = ThemeColor | 'auto'

interface UseThemeReturn {
  theme: ThemeColor
  themeOption: ThemeOption
  setTheme: (theme: ThemeColor) => void
  setThemeOption: (option: ThemeOption) => void
  customColors: Partial<ThemeColors> | null
  setCustomColors: (colors: Partial<ThemeColors>) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  isSystemDark: boolean
}

export function useTheme(): UseThemeReturn {
  const [themeOption, setThemeOptionState] = useState<ThemeOption>(() => {
    try {
      const stored = localStorage.getItem('fastfingers_theme_option')
      return (stored as ThemeOption) || 'auto'
    } catch {
      return 'auto'
    }
  })

  const [isSystemDark, setIsSystemDark] = useState(() => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return true
    }
  })

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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setIsSystemDark(mediaQuery.matches)
      if (themeOption === 'auto') {
        const newTheme = mediaQuery.matches ? 'dark' : 'light'
        setThemeState(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    handleChange()

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeOption])

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('fastfingers_theme', newTheme)
    } catch {
      // Ignore save errors
    }
  }, [])

  const setThemeOption = useCallback((option: ThemeOption) => {
    setThemeOptionState(option)
    try {
      localStorage.setItem('fastfingers_theme_option', option)
      if (option === 'auto') {
        const newTheme = isSystemDark ? 'dark' : 'light'
        setThemeState(newTheme)
      }
    } catch {
      // Ignore save errors
    }
  }, [isSystemDark])

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
    try {
      localStorage.setItem('fastfingers_font_size', size)
    } catch {
      // Ignore save errors
    }
  }, [])

  return { 
    theme, 
    themeOption,
    setTheme, 
    setThemeOption,
    customColors, 
    setCustomColors, 
    fontSize, 
    setFontSize,
    isSystemDark
  }
}
