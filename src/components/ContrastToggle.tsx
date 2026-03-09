import { useState, useEffect, useCallback } from 'react'
import { useAppTranslation } from '../i18n/config'

export function ContrastToggle() {
  const { t } = useAppTranslation()
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('fastfingers_contrast')
    const isHigh = saved === 'high'
    setIsHighContrast(isHigh)
    if (isHigh) {
      document.documentElement.setAttribute('data-contrast', 'high')
    } else {
      document.documentElement.removeAttribute('data-contrast')
    }
  }, [])

  const toggleContrast = useCallback(() => {
    const newValue = !isHighContrast
    setIsHighContrast(newValue)
    localStorage.setItem('fastfingers_contrast', newValue ? 'high' : 'normal')
    if (newValue) {
      document.documentElement.setAttribute('data-contrast', 'high')
    } else {
      document.documentElement.removeAttribute('data-contrast')
    }
  }, [isHighContrast])

  return (
    <button
      onClick={toggleContrast}
      className={`p-2 rounded-lg transition-all ${
        isHighContrast ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white'
      }`}
      aria-label={t('misc.highContrast')}
      title={t('misc.highContrast')}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </button>
  )
}
