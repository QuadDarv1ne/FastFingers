import { useCallback, useEffect } from 'react'
import { useTheme } from '@hooks/useTheme'
import { useAppTranslation } from '../i18n/config'
import type { FontSize } from '../types'

const FONT_SIZES: { value: FontSize; label: string; icon: string }[] = [
  { value: 'small', label: 'S', icon: 'A' },
  { value: 'medium', label: 'M', icon: 'A' },
  { value: 'large', label: 'L', icon: 'A' },
]

export function FontSizeSelector() {
  const { t } = useAppTranslation()
  const { fontSize, setFontSize } = useTheme()

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize])

  const handleFontSizeChange = useCallback(
    (size: FontSize) => {
      setFontSize(size)
    },
    [setFontSize]
  )

  return (
    <div className="relative group">
      <button
        className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
        aria-label={t('misc.fontSize')}
        title={t('misc.fontSize')}
      >
        <span className="text-lg font-bold">{fontSize === 'large' ? 'A' : fontSize === 'medium' ? 'A' : 'A'}</span>
        <span className="hidden sm:inline">{fontSize.toUpperCase()}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="absolute right-0 top-full mt-2 card p-2 hidden group-hover:block z-50 min-w-[120px] animate-scale-in">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => handleFontSizeChange(size.value)}
            className={`w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center gap-3 ${
              fontSize === size.value ? 'bg-dark-800/50 text-primary-400' : 'text-dark-300'
            }`}
          >
            <span className={`font-bold ${size.value === 'large' ? 'text-lg' : size.value === 'medium' ? 'text-base' : 'text-sm'}`}>
              {size.icon}
            </span>
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
    </div>
  )
}
