import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import type { KeyboardSkin } from '../types'
import { keyboardSkinPresets, getKeyboardSkin } from '../utils/keyboardSkins'
import { useAppTranslation } from '../i18n/config'
import { useClickOutside } from '@hooks/useClickOutside'

interface KeyboardSkinSelectorProps {
  skin: KeyboardSkin
  onSkinChange: (skin: KeyboardSkin) => void
}

export function KeyboardSkinSelector({ skin, onSkinChange }: KeyboardSkinSelectorProps) {
  const { t } = useAppTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const showMenuRef = useRef(showMenu)
  const focusedIndexRef = useRef(focusedIndex)
  const onSkinChangeRef = useRef(onSkinChange)
  showMenuRef.current = showMenu
  focusedIndexRef.current = focusedIndex
  onSkinChangeRef.current = onSkinChange

  useClickOutside(menuRef, () => setShowMenu(false))

  const currentSkin = useMemo(
    () => keyboardSkinPresets.find(t => t.value === skin) ?? keyboardSkinPresets[0],
    [skin]
  )

  const currentSkinColors = getKeyboardSkin(skin)

  // Обработка клавиатуры
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!showMenuRef.current) return

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setShowMenu(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % keyboardSkinPresets.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => (prev - 1 + keyboardSkinPresets.length) % keyboardSkinPresets.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (showMenuRef.current) {
          const selected = keyboardSkinPresets[focusedIndexRef.current]
          if (selected) {
            onSkinChangeRef.current(selected.value)
          }
          setShowMenu(false)
        }
        break
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Сброс фокуса при открытии меню
  useEffect(() => {
    if (showMenu) {
      setFocusedIndex(keyboardSkinPresets.findIndex(t => t.value === skin))
    }
  }, [showMenu, skin])

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
        title={t('misc.keyboard')}
        aria-label={t('misc.keyboard')}
        aria-expanded={showMenu}
        aria-haspopup="menu"
        type="button"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
          style={{
            background: currentSkinColors.spacebarGradient,
            border: `1px solid ${currentSkinColors.keyBorder}`
          }}
          aria-hidden="true"
        >
          ⌨️
        </div>
        <span className="text-sm hidden sm:inline">{t(currentSkin.labelKey)}</span>
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
        <div
          ref={menuRef}
          tabIndex={-1}
          className="absolute right-0 top-full mt-2 w-72 glass rounded-xl p-2 z-50 animate-fade-in outline-none max-h-96 overflow-y-auto"
          role="menu"
          aria-orientation="vertical"
          aria-activedescendant={`skin-item-${focusedIndex}`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowMenu(false) }}
        >
            <div className="px-3 py-2 border-b border-dark-700 mb-2">
              <p className="text-xs font-semibold text-dark-300">🎨 {t('misc.keyboard')}</p>
            </div>

            {keyboardSkinPresets.map((preset, index) => {
              const presetColors = getKeyboardSkin(preset.value)
              return (
                <button
                  key={preset.value}
                  id={`skin-item-${index}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onSkinChange(preset.value)
                    setShowMenu(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    skin === preset.value
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-dark-800/50'
                  } ${index === focusedIndex ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900' : ''}`}
                  role="menuitem"
                  tabIndex={index === focusedIndex ? 0 : -1}
                  type="button"
                >
                  {/* Превью скина */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background: presetColors.spacebarGradient,
                      border: `1px solid ${presetColors.keyBorder}`
                    }}
                    aria-hidden="true"
                  >
                    {preset.icon}
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{t(preset.labelKey)}</p>
                    <p className="text-xs text-dark-400">{t(preset.descriptionKey)}</p>
                  </div>

                  {skin === preset.value && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
      )}
    </div>
  )
}
