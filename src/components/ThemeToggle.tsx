import { useState } from 'react'
import { ThemeColor } from '../utils/themes'

interface ThemeToggleProps {
  theme: ThemeColor
  onThemeChange: (theme: ThemeColor) => void
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const [showMenu, setShowMenu] = useState(false)

  const themes: { value: ThemeColor; label: string; icon: string; gradient: string }[] = [
    { 
      value: 'dark', 
      label: 'Тёмная', 
      icon: '🌙',
      gradient: 'from-gray-900 to-gray-700'
    },
    { 
      value: 'light', 
      label: 'Светлая', 
      icon: '☀️',
      gradient: 'from-gray-100 to-white'
    },
    { 
      value: 'purple', 
      label: 'Фиолетовая', 
      icon: '💜',
      gradient: 'from-purple-900 to-purple-600'
    },
    { 
      value: 'blue', 
      label: 'Синяя', 
      icon: '💙',
      gradient: 'from-blue-900 to-blue-600'
    },
    { 
      value: 'orange', 
      label: 'Оранжевая', 
      icon: '🧡',
      gradient: 'from-orange-900 to-orange-600'
    },
    { 
      value: 'custom', 
      label: 'Настраиваемая', 
      icon: '🎨',
      gradient: 'from-pink-900 to-yellow-600'
    },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 glass rounded-xl hover:bg-dark-800/50 transition-colors"
        title="Выбрать тему"
      >
        <span className="text-xl">{currentTheme.icon}</span>
        <span className="text-sm hidden sm:inline">{currentTheme.label}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl p-2 z-50 animate-fade-in">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  onThemeChange(t.value)
                  setShowMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  theme === t.value
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-dark-800/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.gradient} flex items-center justify-center text-lg`}>
                  {t.icon}
                </div>
                <span className="text-sm font-medium">{t.label}</span>
                {theme === t.value && (
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
