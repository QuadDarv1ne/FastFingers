import { useCallback } from 'react'
import { changeLanguage, getCurrentLanguage } from '../i18n/config'
import type { SupportedLanguage } from '../i18n/config'

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: SupportedLanguage) => void
}

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const currentLang = getCurrentLanguage()

  const handleLanguageChange = useCallback(
    async (lang: SupportedLanguage) => {
      await changeLanguage(lang)
      onLanguageChange?.(lang)
    },
    [onLanguageChange]
  )

  return (
    <div className="relative group">
      <button
        className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
        aria-label="Select language"
      >
        <span className="text-lg">
          {LANGUAGES.find((l) => l.code === currentLang)?.flag}
        </span>
        <span className="hidden sm:inline">{currentLang.toUpperCase()}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="absolute right-0 top-full mt-2 card p-2 hidden group-hover:block z-50 min-w-[140px] animate-scale-in">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center gap-3 ${
              currentLang === lang.code ? 'bg-dark-800/50 text-primary-400' : 'text-dark-300'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.label}</span>
            {currentLang === lang.code && (
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

export default LanguageSwitcher
