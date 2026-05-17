import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../hooks/useTheme'

vi.mock('../utils/themes', () => ({
  applyTheme: vi.fn(),
  ThemeColor: undefined,
  ThemeColors: undefined,
  themePresets: {},
}))

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return default values', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.themeOption).toBe('auto')
    expect(result.current.customColors).toBeNull()
    expect(result.current.fontSize).toBe('medium')
    expect(result.current.isSystemDark).toBe(false)
  })

  it('should load theme from localStorage', () => {
    localStorage.setItem('fastfingers_theme', 'light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('should load themeOption from localStorage', () => {
    localStorage.setItem('fastfingers_theme_option', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.themeOption).toBe('dark')
  })

  it('should load fontSize from localStorage', () => {
    localStorage.setItem('fastfingers_font_size', 'large')
    const { result } = renderHook(() => useTheme())
    expect(result.current.fontSize).toBe('large')
  })

  it('should load customColors from localStorage', () => {
    localStorage.setItem('fastfingers_custom_colors', JSON.stringify({ bg: '#000', text: '#fff' }))
    const { result } = renderHook(() => useTheme())
    expect(result.current.customColors).toEqual({ bg: '#000', text: '#fff' })
  })

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('fastfingers_custom_colors', 'not-json')
    expect(() => renderHook(() => useTheme())).not.toThrow()
  })

  it('should set theme and persist to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.theme).toBe('light')
    expect(localStorage.getItem('fastfingers_theme')).toBe('light')
  })

  it('should set themeOption and persist to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setThemeOption('purple')
    })
    expect(result.current.themeOption).toBe('purple')
    expect(localStorage.getItem('fastfingers_theme_option')).toBe('purple')
  })

  it('should set fontSize and persist to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setFontSize('small')
    })
    expect(result.current.fontSize).toBe('small')
    expect(localStorage.getItem('fastfingers_font_size')).toBe('small')
  })

  it('should set customColors and persist to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setCustomColors({ bg: '#111', text: '#eee' })
    })
    expect(result.current.customColors).toEqual({ bg: '#111', text: '#eee' })
    expect(localStorage.getItem('fastfingers_custom_colors')).toBe('{"bg":"#111","text":"#eee"}')
  })

  it('should respond to system dark mode changes when themeOption is auto', () => {
    const mqAddListener = vi.fn()
    const mqRemoveListener = vi.fn()

    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: mqAddListener,
      removeEventListener: mqRemoveListener,
    })))

    const { result, unmount } = renderHook(() => useTheme())

    const changeHandler = mqAddListener.mock.calls[0]?.[1]
    expect(changeHandler).toBeDefined()

    act(() => {
      changeHandler()
    })

    expect(result.current.isSystemDark).toBe(true)

    vi.unstubAllGlobals()
    unmount()
  })
})
