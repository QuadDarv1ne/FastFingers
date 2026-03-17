import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ThemeColor } from '../utils/themes'
import { useAppTranslation } from '../i18n/config'

type ThemeOption = ThemeColor | 'auto'

interface ThemeToggleProps {
  theme: ThemeColor
  themeOption?: ThemeOption
  onThemeChange: (theme: ThemeColor) => void
  onThemeOptionChange?: (option: ThemeOption) => void
}

export function ThemeToggle({ themeOption = 'dark', onThemeChange, onThemeOptionChange }: ThemeToggleProps) {
  const { t } = useAppTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleThemeOptionChange = useCallback((option: ThemeOption) => {
    if (onThemeOptionChange) {
      onThemeOptionChange(option)
    }
  }, [onThemeOptionChange])

  const themes = useMemo(() => [
    {
      value: 'auto' as ThemeOption,
      label: t('misc.themeAuto'),
      icon: '💻',
      gradient: 'from-gray-500 to-gray-700'
    },
    {
      value: 'dark' as ThemeColor,
      label: t('misc.theme') + ' 1',
      icon: '🌙',
      gradient: 'from-gray-900 to-gray-700'
    },
    {
      value: 'light' as ThemeColor,
      label: t('misc.theme') + ' 2',
      icon: '☀️',
      gradient: 'from-gray-100 to-white'
    },
    {
      value: 'purple' as ThemeColor,
      label: t('misc.theme') + ' 3',
      icon: '💜',
      gradient: 'from-purple-900 to-purple-600'
    },
    {
      value: 'blue' as ThemeColor,
      label: t('misc.theme') + ' 4',
      icon: '💙',
      gradient: 'from-blue-900 to-blue-600'
    },
    {
      value: 'orange' as ThemeColor,
      label: t('misc.theme') + ' 5',
      icon: '🧡',
      gradient: 'from-orange-900 to-orange-600'
    },
    {
      value: 'custom' as ThemeColor,
      label: t('misc.theme') + ' 6',
      icon: '🎨',
      gradient: 'from-pink-900 to-yellow-600'
    },
  ], [t])

  const currentTheme = useMemo(
    () => themes.find(t => t.value === themeOption) ?? themes[0],
    [themeOption, themes]
  )

  // Обработка клавиатуры
  useEffect(() => {
    if (!showMenu) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          setShowMenu(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(prev => (prev + 1) % themes.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => (prev - 1 + themes.length) % themes.length)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (showMenu) {
            const selected = themes[focusedIndex]
            if (selected) {
              if (selected.value === 'auto') {
                handleThemeOptionChange('auto')
              } else {
                onThemeChange(selected.value as ThemeColor)
                handleThemeOptionChange(selected.value as ThemeColor)
              }
            }
            setShowMenu(false)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showMenu, focusedIndex, themes, onThemeChange, handleThemeOptionChange])

  // Сброс фокуса при открытии меню
  useEffect(() => {
    if (showMenu) {
      setFocusedIndex(themes.findIndex(t => t.value === themeOption))
    }
  }, [showMenu, themeOption, themes])

  if (!currentTheme) return null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="flex items-center gap-2 px-4 py-2 glass rounded-xl hover:bg-dark-800/50 transition-colors"
        title={t('misc.theme')}
        aria-label={t('misc.theme')}
        aria-expanded={showMenu}
        aria-haspopup="menu"
        type="button"
      >
        <span className="text-xl">{currentTheme.icon}</span>
        <span className="text-sm hidden sm:inline">{currentTheme.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          <div
            ref={menuRef}
            tabIndex={-1}
            className="absolute right-0 top-full mt-2 w-56 glass rounded-xl p-2 z-50 animate-fade-in outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-activedescendant={`theme-item-${focusedIndex}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setFocusedIndex(prev => (prev + 1) % themes.length)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setFocusedIndex(prev => (prev - 1 + themes.length) % themes.length)
              }
            }}
          >
            {themes.map((t, index) => (
              <button
                key={t.value}
                id={`theme-item-${index}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (t.value === 'auto') {
                    handleThemeOptionChange('auto')
                  } else {
                    onThemeChange(t.value as ThemeColor)
                    handleThemeOptionChange(t.value as ThemeColor)
                  }
                  setShowMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  themeOption === t.value
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-dark-800/50'
                } ${index === focusedIndex ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900' : ''}`}
                role="menuitem"
                tabIndex={index === focusedIndex ? 0 : -1}
                type="button"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.gradient} flex items-center justify-center text-lg`}>
                  {t.icon}
                </div>
                <span className="text-sm font-medium">{t.label}</span>
                {themeOption === t.value && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
