import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light' | 'system'

interface UseThemeReturn {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('fastfingers_theme')
      return (stored as Theme) || 'system'
    } catch {
      return 'system'
    }
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = (isDark: boolean) => {
      setResolvedTheme(isDark ? 'dark' : 'light')
      
      if (isDark) {
        root.classList.remove('light')
        root.style.setProperty('--color-bg', '#0f0f0f')
        root.style.setProperty('--color-surface', '#1e293b')
        root.style.setProperty('--color-text', '#f8fafc')
        root.style.setProperty('--color-text-muted', '#94a3b8')
      } else {
        root.classList.add('light')
        root.style.setProperty('--color-bg', '#ffffff')
        root.style.setProperty('--color-surface', '#f1f5f9')
        root.style.setProperty('--color-text', '#0f0f0f')
        root.style.setProperty('--color-text-muted', '#64748b')
      }
    }

    if (theme === 'system') {
      applyTheme(mediaQuery.matches)
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('fastfingers_theme', newTheme)
    } catch (e) {
      console.error('Failed to save theme:', e)
    }
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return { theme, resolvedTheme, setTheme, toggleTheme }
}
