/**
 * i18n — Интернационализация FastFingers
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import i18n, { TFunction } from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { logger } from '../utils/logger'

// ============================================
// Типы для ключей переводов
// ============================================

export type TranslationKey =
  | 'nav.practice'
  | 'nav.sprint'
  | 'nav.test'
  | 'nav.custom'
  | 'nav.tips'
  | 'nav.week'
  | 'nav.game'
  | 'nav.learning'
  | 'nav.statistics'
  | 'nav.history'
  | 'nav.reaction'
  | 'common.wpm'
  | 'common.cpm'
  | 'common.accuracy'
  | 'common.errors'
  | 'common.time'
  | 'common.level'
  | 'common.xp'
  | 'common.streak'
  | 'common.days'
  | 'common.words'
  | 'common.chars'
  | 'common.best'
  | 'common.current'
  | 'common.total'
  | 'common.speed'
  | 'time.justNow'
  | 'time.minutesAgo'
  | 'time.hoursAgo'
  | 'time.daysAgo'
  | 'status.completed'
  | 'status.failed'
  | 'status.inProgress'
  | 'status.locked'
  | 'status.available'
  | 'action.start'
  | 'action.restart'
  | 'action.continue'
  | 'action.skip'
  | 'action.save'
  | 'action.cancel'
  | 'action.delete'
  | 'action.export'
  | 'action.import'
  | 'action.edit'
  | 'action.view'
  | 'action.close'
  | 'action.confirm'
  | 'action.back'
  | 'action.next'
  | 'action.previous'
  | 'action.submit'
  | 'action.loading'
  | 'action.exit'
  | 'action.retry'
  | 'action.welcome'
  | 'auth.login'
  | 'auth.register'
  | 'auth.logout'
  | 'auth.email'
  | 'auth.password'
  | 'auth.name'
  | 'auth.forgotPassword'
  | 'auth.rememberMe'
  | 'auth.noAccount'
  | 'auth.haveAccount'
  | 'auth.confirmPassword'
  | 'auth.changePassword'
  | 'auth.resetPassword'
  | 'auth.sendResetLink'
  | 'auth.welcomeBack'
  | 'notification.levelUp'
  | 'notification.achievement'
  | 'notification.challenge'
  | 'notification.streak'
  | 'notification.newDay'
  | 'notification.dailyReward'
  | 'error.invalidEmail'
  | 'error.weakPassword'
  | 'error.emailInUse'
  | 'error.userNotFound'
  | 'error.wrongPassword'
  | 'error.network'
  | 'error.server'
  | 'error.unknown'
  | 'error.required'
  | 'error.tooShort'
  | 'error.tooLong'
  | 'exercise.mainRow'
  | 'exercise.topRow'
  | 'exercise.bottomRow'
  | 'exercise.words'
  | 'exercise.sentences'
  | 'exercise.code'
  | 'exercise.custom'
  | 'mode.practice'
  | 'mode.sprint'
  | 'mode.speedtest'
  | 'mode.challenge'
  | 'mode.game'
  | 'mode.hardcore'
  | 'mode.reaction'
  | 'stats.title'
  | 'stats.history'
  | 'stats.progress'
  | 'stats.achievements'
  | 'stats.leaderboard'
  | 'stats.session'
  | 'stats.activityHeatmap'
  | 'stats.activeDays'
  | 'stats.totalSessions'
  | 'stats.bestWpm'
  | 'stats.bestAccuracy'
  | 'stats.bestCpm'
  | 'stats.longestStreak'
  | 'stats.totalTime'
  | 'stats.weeklyComparison'
  | 'stats.thisWeek'
  | 'stats.lastWeek'
  | 'stats.charsTyped'
  | 'stats.less'
  | 'stats.more'
  | 'stats.sessions'
  | 'stats.subtitle'
  | 'stats.totalSessionsLabel'
  | 'stats.practiceTime'
  | 'stats.avgAccuracy'
  | 'stats.record'
  | 'stats.advancedAnalytics'
  | 'stats.analyzing'
  | 'stats.performanceByTime'
  | 'stats.performanceFunnel'
  | 'stats.metricCorrelation'
  | 'stats.metric'
  | 'stats.correlationNote'
  | 'stats.detailedStats'
  | 'stats.speedProgress'
  | 'stats.accuracyDistribution'
  | 'stats.activityByDay'
  | 'stats.practiceTime7days'
  | 'stats.noData'
  | 'stats.recentSessions'
  | 'stats.date'
  | 'stats.errors'
  | 'stats.time'
  | 'stats.avgWpm'
  | 'stats.avgAccuracyLabel'
  | 'stats.timeOfDay.morning'
  | 'stats.timeOfDay.afternoon'
  | 'stats.timeOfDay.evening'
  | 'stats.timeOfDay.night'
  | 'stats.day.mon'
  | 'stats.day.tue'
  | 'stats.day.wed'
  | 'stats.day.thu'
  | 'stats.day.fri'
  | 'stats.day.sat'
  | 'stats.day.sun'
  | 'stats.metric.wpm'
  | 'stats.metric.accuracy'
  | 'stats.metric.cpm'
  | 'stats.metric.errors'
  | 'profile.tab.overview'
  | 'profile.tab.heatmap'
  | 'profile.tab.goals'
  | 'profile.toNextLevel'
  | 'profile.learningVelocity'
  | 'profile.totalWords'
  | 'profile.practiceTime'
  | 'profile.skillProfile'
  | 'profile.avgWpm'
  | 'profile.rhythm'
  | 'profile.errorRecovery'
  | 'profile.consistency'
  | 'profile.quickNav'
  | 'profile.goals'
  | 'profile.completed'
  | 'profile.heatmapTitle'
  | 'profile.heatmapLegend'
  | 'profile.noHeatmapData'
  | 'profile.completeSessions'
  | 'profile.goalsTitle'
  | 'profile.done'
  | 'profile.noGoals'
  | 'profile.setGoals'
  | 'profile.accountInfo'
  | 'profile.registered'
  | 'profile.lastLogin'
  | 'misc.theme'
  | 'misc.themeAuto'
  | 'misc.sound'
  | 'misc.keyboard'
  | 'misc.language'
  | 'misc.settings'
  | 'misc.profile'
  | 'misc.help'
  | 'misc.about'
  | 'misc.footer'
  | 'misc.copyright'
  | 'misc.fontSize'
  | 'misc.highContrast'
  | 'misc.installApp'
  | 'music.title'
  | 'music.genre'
  | 'music.tempo'
  | 'music.volume'
  | 'music.key'
  | 'music.playing'
  | 'action.stop'
  | 'tip.posture'
  | 'tip.postureDesc'
  | 'tip.hands'
  | 'tip.handsDesc'
  | 'tip.home'
  | 'tip.homeDesc'
  | 'tip.zones'
  | 'tip.zonesDesc'
  | 'tip.look'
  | 'tip.lookDesc'
  | 'tip.accuracy'
  | 'tip.accuracyDesc'
  | 'tip.regular'
  | 'tip.regularDesc'
  | 'tip.games'
  | 'tip.gamesDesc'
  | 'tip.breaks'
  | 'tip.breaksDesc'
  | 'tip.exercise'
  | 'tip.exerciseDesc'
  | 'tip.eyes'
  | 'tip.eyesDesc'
  | 'tip.progress'
  | 'tip.progressDesc'
  | 'quote.practice1'
  | 'quote.practice2'
  | 'quote.practice3'
  | 'quote.practice4'
  | 'quote.learning1'
  | 'quote.learning2'
  | 'quote.learning3'
  | 'quote.learning4'
  | 'quote.learning5'
  | 'quote.motivation1'
  | 'quote.motivation2'
  | 'quote.motivation3'
  | 'quote.motivation4'
  | 'quote.success1'
  | 'quote.success2'
  | 'quote.fastfingers'
  | 'quote.collier'
  | 'quote.jobs'
  | 'quote.category.motivation'
  | 'quote.category.practice'
  | 'quote.category.success'
  | 'quote.category.learning'
  | 'trainer.randomWords'
  | 'trainer.basicRow'
  | 'trainer.upperRow'
  | 'trainer.lowerRow'
  | 'trainer.difficulty.veryEasy'
  | 'trainer.difficulty.easy'
  | 'trainer.difficulty.medium'
  | 'trainer.difficulty.hard'
  | 'trainer.difficulty.veryHard'
  | 'trainer.adaptation'
  | 'trainer.nextKey'
  | 'trainer.progressLabel'
  | 'trainer.exerciseComplete'
  | 'trainer.nextExercise'
  | 'trainer.aria.category'
  | 'trainer.aria.difficulty'
  | 'trainer.aria.adaptiveToggle'
  | 'trainer.aria.progress'
  | 'trainer.aria.nextExercise'
  | 'trainer.aria.skip'
  | 'trainer.aria.practiceArea'
  | 'trainer.aria.settings'
  | 'trainer.aria.controls'
  | 'trainer.aria.inputField'
  | 'trainer.clickOrEnter'
  | 'trainer.newBtn'
  | 'trainer.myExercises'
  | 'trainer.fallbackText'
  | 'trainer.errorText'
  | 'trainer.liveRegion'
  | 'label.admin'
  | 'tooltip.admin'
  | 'admin.title'
  | 'admin.tabOverview'
  | 'admin.tabTexts'
  | 'admin.tabUsers'
  | 'admin.users'
  | 'admin.customTexts'
  | 'admin.sessions'
  | 'admin.systemInfo'
  | 'admin.version'
  | 'admin.authMode'
  | 'admin.administrator'
  | 'admin.staticTexts'

export type SupportedLanguage = 'ru' | 'en' | 'zh' | 'he' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'ja' | 'ar'

// ============================================
// Динамическая загрузка языков из JSON файлов
// ============================================

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ru', 'en', 'zh', 'he', 'de', 'fr', 'es', 'it', 'pt', 'ja', 'ar']

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
    const module = await import(/* webpackChunkName: "i18n-[request]" */ `./locales/${lang}.json`)
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

i18n
  .use(initReactI18next)
  .init({
    lng: 'ru',
    fallbackLng: 'ru',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      lookupLocalStorage: 'fastfingers_language',
    },
  })

// Загружаем русский язык сразу (язык по умолчанию)
loadLanguageFile('ru').then((translations) => {
  if (Object.keys(translations).length > 0) {
    i18n.addResourceBundle('ru', 'translation', translations, true, true)
  }
}).catch((err) => logger.warn('Failed to load default language (ru):', err))

// Автоматически подгружаем язык при переключении
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'he' || lng === 'ar'
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
  return i18n.changeLanguage(lang)
}

export default i18n
