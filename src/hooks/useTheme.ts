import { useState, useEffect, useCallback } from 'react'
import { ThemeColor, applyTheme, ThemeColors } from '../utils/themes'
import type { FontSize } from '../types'
import { safeExecute } from '../utils/logger'
import { STORAGE_KEYS } from '../constants/storageKeys'

type ThemeOption = ThemeColor | 'auto'

function getSystemDark(): boolean {
  return safeExecute(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    true
  )
}

function getStoredThemeOption(): ThemeOption {
  return safeExecute(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_OPTION)
    return (stored as ThemeOption) || 'auto'
  }, 'auto')
}

function getInitialTheme(): ThemeColor {
  return safeExecute(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    return (stored as ThemeColor) || 'dark'
  }, 'dark')
}

export interface UseThemeReturn {
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
  const [themeOption, setThemeOptionState] = useState<ThemeOption>(getStoredThemeOption)

  const [isSystemDark, setIsSystemDark] = useState(getSystemDark)

  const [theme, setThemeState] = useState<ThemeColor>(getInitialTheme)

  const [customColors, setCustomColorsState] = useState<Partial<ThemeColors> | null>(() =>
    safeExecute(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_COLORS)
      return stored ? JSON.parse(stored) : null
    }, null)
  )

  const [fontSize, setFontSizeState] = useState<FontSize>(() =>
    safeExecute(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.FONT_SIZE)
      return (stored as FontSize) || 'medium'
    }, 'medium')
  )

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      applyTheme(theme, customColors || undefined)
    })
    return () => cancelAnimationFrame(timer)
  }, [theme, customColors])

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
    safeExecute(() => {
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize)
    }, undefined)
  }, [fontSize])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setIsSystemDark(mediaQuery.matches)
      if (themeOption === 'auto') {
        setThemeState(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    handleChange()

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeOption])

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme)
    safeExecute(() => {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
    }, undefined)
  }, [])

  const setThemeOption = useCallback((option: ThemeOption) => {
    setThemeOptionState(option)
    safeExecute(() => {
      localStorage.setItem(STORAGE_KEYS.THEME_OPTION, option)
      if (option === 'auto') {
        const newTheme = isSystemDark ? 'dark' : 'light'
        setThemeState(newTheme)
      }
    }, undefined)
  }, [isSystemDark])

  const setCustomColors = useCallback((colors: Partial<ThemeColors>) => {
    setCustomColorsState(colors)
    safeExecute(() => {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_COLORS, JSON.stringify(colors))
    }, undefined)
  }, [])

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size)
    safeExecute(() => {
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size)
    }, undefined)
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
