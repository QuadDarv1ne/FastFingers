import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ]

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            i18n.language === lang.code
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 text-dark-400 hover:text-white'
          }`}
        >
          <span>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.name}</span>
        </button>
      ))}
    </div>
  )
}
