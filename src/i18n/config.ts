/**
 * i18n — Интернационализация FastFingers
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import i18n, { TFunction } from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { logger } from '../utils/logger'
import { STORAGE_KEYS } from '../constants/storageKeys'

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
  | 'common.rank'
  | 'common.characters'
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
  | 'action.reload'
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
  | 'challenge.daily'
  | 'error.invalidEmail'
  | 'error.authFailed'
  | 'error.widgetsFailed'
  | 'error.statsFailed'
  | 'error.settingsFailed'
  | 'error.exportImportFailed'
  | 'error.historyFailed'
  | 'error.exerciseEditorFailed'
  | 'error.tipsFailed'
  | 'error.weeklyStatsFailed'
  | 'error.statisticsFailed'
  | 'error.learningFailed'
  | 'error.adminFailed'
  | 'error.studentAnalyticsFailed'
  | 'error.reactionFailed'
  | 'error.duelFailed'
  | 'error.codeFailed'
  | 'error.marathonFailed'
  | 'error.tournamentFailed'
  | 'error.sprintFailed'
  | 'error.hardcoreFailed'
  | 'error.speedtestFailed'
  | 'error.practiceFailed'
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
  | 'exportImport.title'
  | 'exportImport.subtitle'
  | 'exportImport.exportSection'
  | 'exportImport.exportDesc'
  | 'exportImport.exportBtn'
  | 'exportImport.importSection'
  | 'exportImport.importDesc'
  | 'exportImport.importBtn'
  | 'exportImport.importing'
  | 'exportImport.dangerZone'
  | 'exportImport.clearDataDesc'
  | 'exportImport.clearDataBtn'
  | 'exportImport.exportSuccess'
  | 'exportImport.exportError'
  | 'exportImport.importSuccess'
  | 'exportImport.importError'
  | 'exportImport.readError'
  | 'exportImport.clearSuccess'
  | 'exportImport.clearError'
  | 'exportImport.versionMismatch'
  | 'exportImport.confirmOverwrite'
  | 'exportImport.confirmClear1'
  | 'exportImport.confirmClear2'
  | 'exportImport.quotaExceeded'
  | 'exportImport.invalidFormat'
  | 'exportImport.infoTitle'
  | 'exportImport.infoJson'
  | 'exportImport.infoBackup'
  | 'exportImport.infoOverwrite'
  | 'exportImport.infoLocal'
  | 'code.title' | 'code.subtitle' | 'code.completed' | 'code.randomText'
  | 'code.selectExercise' | 'code.readyPrompt' | 'code.tip'
  | 'marathon.title' | 'marathon.subtitle' | 'marathon.duration'
  | 'marathon.completed' | 'marathon.finished' | 'marathon.readyPrompt'
  | 'marathon.timeLeft' | 'marathon.progress' | 'marathon.bestCombo'
  | 'marathon.tip' | 'marathon.milestone.60' | 'marathon.milestone.120'
  | 'marathon.milestone.180' | 'marathon.milestone.240' | 'marathon.milestone.300'
  | 'tournament.title' | 'tournament.subtitle'
  | 'learning.title' | 'learning.subtitle' | 'learning.close'
  | 'learning.backToLessons' | 'learning.difficulty' | 'learning.startExercise'
  | 'learning.exerciseText'
  | 'error.tournamentLoadFailed' | 'error.tournamentParticipantsFailed'
  | 'error.tournamentRegisterFailed' | 'error.tournamentUnregisterFailed'
  | 'admin.importSuccessSkip'
  | 'month.short.0' | 'month.short.1' | 'month.short.2' | 'month.short.3'
  | 'month.short.4' | 'month.short.5' | 'month.short.6' | 'month.short.7'
  | 'month.short.8' | 'month.short.9' | 'month.short.10' | 'month.short.11'
  | 'certificate.title' | 'certificate.issued' | 'certificate.yourResult'
  | 'certificate.theme' | 'certificate.themeClassic' | 'certificate.themeModern'
  | 'certificate.themeNeon' | 'certificate.langRu' | 'certificate.langEn'
  | 'certificate.downloadPng' | 'certificate.generating' | 'certificate.share'
  | 'certificate.shareTitle' | 'certificate.shareText' | 'certificate.actions'
  | 'certificate.rankSystem' | 'certificate.themeDescription' | 'certificate.langDescription'
  | 'certificate.generationFailed' | 'certificate.issuedTo'
  | 'history.title' | 'history.subtitle' | 'history.exportCsv'
  | 'history.totalSessions' | 'history.trainingTime' | 'history.bestWpm'
  | 'history.avgAccuracy' | 'history.period24h' | 'history.period7d'
  | 'history.period30d' | 'history.wpmProgress' | 'history.accuracyProgress'
  | 'history.lastSessions' | 'history.clearHistory' | 'history.empty'
  | 'history.emptyHint' | 'history.startTraining' | 'history.sessions'
  | 'history.avgWpm'
  | 'timer.resume'
  | 'sound.theme' | 'sound.themeDefault' | 'sound.themePiano'
  | 'sound.themeMechanical' | 'sound.themeSoft' | 'sound.themeRetro'
  | 'sound.themeAsmr' | 'sound.correct' | 'sound.error' | 'sound.complete'
  | 'sound.tip'
  | 'cookie.title' | 'cookie.description' | 'cookie.accept' | 'cookie.decline'
  | 'cookie.policyLink' | 'cookie.privacyLink' | 'cookie.and' | 'cookie.ariaLabel'
  | 'pwa.description' | 'pwa.install' | 'pwa.later'
  | 'skip.nav' | 'skip.content' | 'skip.keyboard' | 'skip.settings'

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

// Загружаем русский язык сразу (язык по умолчанию)
loadLanguageFile('ru').then((translations) => {
  if (Object.keys(translations).length > 0) {
    i18n.addResourceBundle('ru', 'translation', translations, true, true)
  } else {
    logger.error('Default language (ru) bundle is empty — translations unavailable')
  }
}).catch((err) => {
  logger.error('Failed to load default language (ru):', err)
})

// Загружаем английский как резервный язык
loadLanguageFile('en').then((translations) => {
  if (Object.keys(translations).length > 0) {
    i18n.addResourceBundle('en', 'translation', translations, true, true)
  }
}).catch((err) => logger.warn('Failed to preload English fallback:', err))

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
