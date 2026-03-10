import { useState, useCallback, useEffect, useRef } from 'react'
import { useTheme } from '@hooks/useTheme'
import { useAppTranslation } from '../i18n/config'
import { useClickOutside } from '@hooks/useClickOutside'
import type { FontSize } from '../types'

const FONT_SIZES: { value: FontSize; label: string; icon: string; px: string }[] = [
  { value: 'small', label: 'Маленький', icon: 'A', px: '14px' },
  { value: 'medium', label: 'Средний', icon: 'A', px: '16px' },
  { value: 'large', label: 'Большой', icon: 'A', px: '18px' },
]

export function FontSizeSelector() {
  const { t } = useAppTranslation()
  const { fontSize, setFontSize } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setIsOpen(false))

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize])

  const handleFontSizeChange = useCallback(
    (size: FontSize) => {
      setFontSize(size)
      setIsOpen(false)
    },
    [setFontSize]
  )

  const currentSize = FONT_SIZES.find(s => s.value === fontSize) ?? FONT_SIZES[1]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
        aria-label={t('misc.fontSize')}
        aria-expanded={isOpen}
        title={t('misc.fontSize')}
      >
        <span className="text-lg font-bold" style={{ fontSize: currentSize?.px }}>{currentSize?.icon}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-2 card p-2 z-50 min-w-[160px] animate-scale-in shadow-xl border border-dark-700">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => handleFontSizeChange(size.value)}
                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center gap-3 ${
                  fontSize === size.value ? 'bg-dark-800/50 text-primary-400' : 'text-dark-300'
                }`}
              >
                <span className="font-bold" style={{ fontSize: size.px }}>{size.icon}</span>
                <span>{size.label}</span>
                {fontSize === size.value && (
                  <svg className="w-4 h-4 ml-auto text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
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
