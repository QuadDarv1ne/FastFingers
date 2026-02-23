export type ThemeColor = 'dark' | 'light' | 'purple' | 'blue' | 'orange' | 'custom'

export interface ThemeColors {
  bg: string
  surface: string
  text: string
  textMuted: string
  primary: string
  primaryHover: string
  success: string
  error: string
  border: string
}

export const themePresets: Record<ThemeColor, ThemeColors> = {
  dark: {
    bg: '#0f0f0f',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    success: '#22c55e',
    error: '#ef4444',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    bg: '#ffffff',
    surface: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    success: '#16a34a',
    error: '#dc2626',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  purple: {
    bg: '#1a0b2e',
    surface: '#2d1b4e',
    text: '#f3e8ff',
    textMuted: '#c4b5fd',
    primary: '#a78bfa',
    primaryHover: '#8b5cf6',
    success: '#34d399',
    error: '#f87171',
    border: 'rgba(167, 139, 250, 0.2)',
  },
  blue: {
    bg: '#0a1929',
    surface: '#1e3a5f',
    text: '#e0f2fe',
    textMuted: '#7dd3fc',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    success: '#10b981',
    error: '#f43f5e',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  orange: {
    bg: '#1c1410',
    surface: '#3d2817',
    text: '#fff7ed',
    textMuted: '#fdba74',
    primary: '#f97316',
    primaryHover: '#ea580c',
    success: '#22c55e',
    error: '#ef4444',
    border: 'rgba(249, 115, 22, 0.2)',
  },
  custom: {
    bg: '#0f0f0f',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    success: '#22c55e',
    error: '#ef4444',
    border: 'rgba(255, 255, 255, 0.1)',
  },
}

export function applyTheme(theme: ThemeColor, customColors?: Partial<ThemeColors>) {
  const colors = customColors && theme === 'custom' 
    ? { ...themePresets.custom, ...customColors }
    : themePresets[theme]

  const root = document.documentElement

  console.log('Applying theme:', theme, colors)

  root.style.setProperty('--color-bg', colors.bg)
  root.style.setProperty('--color-surface', colors.surface)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-text-muted', colors.textMuted)
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-primary-hover', colors.primaryHover)
  root.style.setProperty('--color-success', colors.success)
  root.style.setProperty('--color-error', colors.error)
  root.style.setProperty('--color-border', colors.border)

  // Добавляем класс для светлой темы
  if (theme === 'light') {
    root.classList.add('light')
  } else {
    root.classList.remove('light')
  }
}
