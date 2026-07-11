/**
 * i18n — Интернационализация FastFingers
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import i18n from 'i18next'
import type { TFunction } from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { logger } from '../utils/logger'
import { STORAGE_KEYS } from '../constants/storageKeys'

// ============================================
// Типы для ключей переводов
// ============================================

/**
 * Все валидные i18n ключи, автоматически выведенные из en.json.
 * Поддерживается в sync — если ключ есть в en.json, он есть в типе.
 */
import type enJson from './locales/en.json'
export type TranslationKey = keyof typeof enJson

export type SupportedLanguage = 'ru' | 'en' | 'zh' | 'he' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'ja'

// ============================================
// Динамическая загрузка языков из JSON файлов
// ============================================

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ru', 'en', 'zh', 'he', 'de', 'fr', 'es', 'it', 'pt', 'ja']

// Кэш загруженных языков
const loadedLanguages = new Set<string>()

/**
 * Загрузить конкретный язык из JSON файла
 */
async function loadLanguageFile(lang: string): Promise<Record<string, string>> {
  if (loadedLanguages.has(lang)) {
    return {}
  }

  try {
    const module = await import(`./locales/${lang}.json`)
    loadedLanguages.add(lang)
    return module.default
  } catch {
    logger.warn(`Failed to load language: ${lang}`)
    return {}
  }
}

// ============================================
// Инициализация i18n
// ============================================

const savedLang = (() => {
  try {
    const v = localStorage.getItem(STORAGE_KEYS.LANGUAGE)
    if (v && SUPPORTED_LANGUAGES.includes(v as SupportedLanguage)) return v as SupportedLanguage
  } catch (err) { logger.warn('Failed to read language from localStorage', err) }
  return 'ru'
})()

i18n
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'ru',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

// Загружаем язык по умолчанию сразу (блокирует рендеринг)
// Английский загружается в фоне после первоначального рендеринга
loadLanguageFile(savedLang).then((translations) => {
  if (Object.keys(translations).length > 0) {
    i18n.addResourceBundle(savedLang, 'translation', translations, true, true)
  } else {
    logger.error(`Default language (${savedLang}) bundle is empty — translations unavailable`)
  }
}).catch((err) => {
  logger.error(`Failed to load default language (${savedLang}):`, err)
})

// Фоновая загрузка английского (резервный язык) — не блокирует рендеринг
const idleCallback = typeof requestIdleCallback === 'function'
  ? requestIdleCallback
  : (fn: () => void) => setTimeout(fn, 1000)
idleCallback(() => {
  if (!loadedLanguages.has('en')) {
    loadLanguageFile('en').then((translations) => {
      if (Object.keys(translations).length > 0) {
        i18n.addResourceBundle('en', 'translation', translations, true, true)
      }
    }).catch((err) => logger.warn('Failed to preload English fallback:', err))
  }
})

// Автоматически подгружаем язык при переключении
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'he'
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = lng

  // Лениво загружаем переводы если ещё не загружены
  if (!loadedLanguages.has(lng)) {
    loadLanguageFile(lng).then((translations) => {
      if (Object.keys(translations).length > 0) {
        i18n.addResourceBundle(lng, 'translation', translations, true, true)
      }
    }).catch((err) => logger.warn(`Failed to load language: ${lng}`, err))
  }
})

// ============================================
// Хуки и утилиты
// ============================================

/**
 * Типизированный хук для переводов
 *
 * @example
 * const { t } = useAppTranslation()
 * <h1>{t('nav.practice')}</h1>
 */
export function useAppTranslation() {
  return useTranslation('translation')
}

/**
 * Получить текущий язык
 */
export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language as SupportedLanguage) || 'ru'
}

/**
 * Изменить язык
 */
export async function changeLanguage(lang: SupportedLanguage): Promise<TFunction> {
  // Убедимся что переводы загружены перед переключением
  if (!loadedLanguages.has(lang)) {
    const translations = await loadLanguageFile(lang)
    if (Object.keys(translations).length > 0) {
      i18n.addResourceBundle(lang, 'translation', translations, true, true)
    }
  }
  try { localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang) } catch (err) { logger.warn('Failed to save language to localStorage', err) }
  return i18n.changeLanguage(lang)
}

export default i18n
