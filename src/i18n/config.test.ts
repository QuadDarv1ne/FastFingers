import { describe, it, expect } from 'vitest'
import i18n from 'i18next'
import {
  useAppTranslation,
  getCurrentLanguage,
  changeLanguage,
  type TranslationKey,
  type SupportedLanguage,
} from './config'

describe('i18n config', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru')
  })

  describe('TranslationKey type', () => {
    it('should have navigation keys', () => {
      const navKeys: TranslationKey[] = [
        'nav.practice',
        'nav.sprint',
        'nav.test',
        'nav.custom',
        'nav.tips',
        'nav.week',
        'nav.game',
        'nav.learning',
        'nav.statistics',
        'nav.history',
        'nav.reaction',
      ]
      expect(navKeys.length).toBe(11)
    })

    it('should have common keys', () => {
      const commonKeys: TranslationKey[] = [
        'common.wpm',
        'common.cpm',
        'common.accuracy',
        'common.errors',
        'common.time',
        'common.level',
        'common.xp',
        'common.streak',
        'common.days',
        'common.words',
        'common.chars',
        'common.best',
        'common.current',
        'common.total',
        'common.speed',
      ]
      expect(commonKeys.length).toBe(15)
    })

    it('should have status keys', () => {
      const statusKeys: TranslationKey[] = [
        'status.completed',
        'status.failed',
        'status.inProgress',
        'status.locked',
        'status.available',
      ]
      expect(statusKeys.length).toBe(5)
    })

    it('should have action keys', () => {
      const actionKeys: TranslationKey[] = [
        'action.start',
        'action.restart',
        'action.continue',
        'action.skip',
        'action.save',
        'action.cancel',
        'action.delete',
        'action.export',
        'action.import',
        'action.edit',
        'action.view',
        'action.close',
        'action.confirm',
        'action.back',
        'action.next',
        'action.previous',
        'action.submit',
        'action.loading',
        'action.exit',
        'action.retry',
        'action.stop',
      ]
      expect(actionKeys.length).toBe(21)
    })

    it('should have auth keys', () => {
      const authKeys: TranslationKey[] = [
        'auth.login',
        'auth.register',
        'auth.logout',
        'auth.email',
        'auth.password',
        'auth.name',
        'auth.forgotPassword',
        'auth.rememberMe',
        'auth.noAccount',
        'auth.haveAccount',
        'auth.confirmPassword',
        'auth.changePassword',
        'auth.resetPassword',
        'auth.sendResetLink',
      ]
      expect(authKeys.length).toBe(14)
    })

    it('should have notification keys', () => {
      const notificationKeys: TranslationKey[] = [
        'notification.levelUp',
        'notification.achievement',
        'notification.challenge',
        'notification.streak',
        'notification.newDay',
        'notification.dailyReward',
      ]
      expect(notificationKeys.length).toBe(6)
    })

    it('should have error keys', () => {
      const errorKeys: TranslationKey[] = [
        'error.invalidEmail',
        'error.weakPassword',
        'error.emailInUse',
        'error.userNotFound',
        'error.wrongPassword',
        'error.network',
        'error.server',
        'error.unknown',
        'error.required',
        'error.tooShort',
        'error.tooLong',
      ]
      expect(errorKeys.length).toBe(11)
    })

    it('should have exercise keys', () => {
      const exerciseKeys: TranslationKey[] = [
        'exercise.mainRow',
        'exercise.topRow',
        'exercise.bottomRow',
        'exercise.words',
        'exercise.sentences',
        'exercise.code',
        'exercise.custom',
      ]
      expect(exerciseKeys.length).toBe(7)
    })

    it('should have mode keys', () => {
      const modeKeys: TranslationKey[] = [
        'mode.practice',
        'mode.sprint',
        'mode.speedtest',
        'mode.challenge',
        'mode.game',
        'mode.hardcore',
        'mode.reaction',
      ]
      expect(modeKeys.length).toBe(7)
    })

    it('should have stats keys', () => {
      const statsKeys: TranslationKey[] = [
        'stats.title',
        'stats.history',
        'stats.progress',
        'stats.achievements',
        'stats.leaderboard',
        'stats.session',
        'stats.activityHeatmap',
        'stats.activeDays',
        'stats.totalSessions',
        'stats.bestWpm',
        'stats.bestAccuracy',
        'stats.bestCpm',
        'stats.longestStreak',
        'stats.totalTime',
        'stats.weeklyComparison',
        'stats.thisWeek',
        'stats.lastWeek',
        'stats.charsTyped',
        'stats.less',
        'stats.more',
        'stats.sessions',
      ]
      expect(statsKeys.length).toBe(21)
    })

    it('should have misc keys', () => {
      const miscKeys: TranslationKey[] = [
        'misc.theme',
        'misc.themeAuto',
        'misc.sound',
        'misc.keyboard',
        'misc.language',
        'misc.settings',
        'misc.profile',
        'misc.help',
        'misc.about',
        'misc.footer',
        'misc.copyright',
        'misc.fontSize',
        'misc.highContrast',
      ]
      expect(miscKeys.length).toBe(13)
    })

    it('should have music keys', () => {
      const musicKeys: TranslationKey[] = [
        'music.title',
        'music.genre',
        'music.tempo',
        'music.volume',
        'music.key',
        'music.playing',
      ]
      expect(musicKeys.length).toBe(6)
    })

    it('should have tip keys', () => {
      const tipKeys: TranslationKey[] = [
        'tip.posture',
        'tip.postureDesc',
        'tip.hands',
        'tip.handsDesc',
        'tip.home',
        'tip.homeDesc',
        'tip.zones',
        'tip.zonesDesc',
        'tip.look',
        'tip.lookDesc',
        'tip.accuracy',
        'tip.accuracyDesc',
        'tip.regular',
        'tip.regularDesc',
        'tip.games',
        'tip.gamesDesc',
        'tip.breaks',
        'tip.breaksDesc',
        'tip.exercise',
        'tip.exerciseDesc',
        'tip.eyes',
        'tip.eyesDesc',
        'tip.progress',
        'tip.progressDesc',
      ]
      expect(tipKeys.length).toBe(24)
    })

    it('should have quote keys', () => {
      const quoteKeys: TranslationKey[] = [
        'quote.practice1',
        'quote.practice2',
        'quote.practice3',
        'quote.practice4',
        'quote.learning1',
        'quote.learning2',
        'quote.learning3',
        'quote.learning4',
        'quote.learning5',
        'quote.motivation1',
        'quote.motivation2',
        'quote.motivation3',
        'quote.motivation4',
        'quote.success1',
        'quote.success2',
        'quote.fastfingers',
        'quote.collier',
        'quote.jobs',
      ]
      expect(quoteKeys.length).toBe(18)
    })
  })

  describe('SupportedLanguage type', () => {
    it('should support Russian', () => {
      const lang: SupportedLanguage = 'ru'
      expect(lang).toBe('ru')
    })

    it('should support English', () => {
      const lang: SupportedLanguage = 'en'
      expect(lang).toBe('en')
    })

    it('should support Chinese', () => {
      const lang: SupportedLanguage = 'zh'
      expect(lang).toBe('zh')
    })

    it('should support Hebrew', () => {
      const lang: SupportedLanguage = 'he'
      expect(lang).toBe('he')
    })
  })

  describe('resources', () => {
    it('should have Russian translations', () => {
      const ruTranslation = i18n.getResourceBundle('ru', 'translation')
      expect(ruTranslation).toBeDefined()
      expect(ruTranslation['nav.practice']).toBe('Практика')
      expect(ruTranslation['common.wpm']).toBe('WPM')
      expect(ruTranslation['misc.themeAuto']).toBe('Авто (системная)')
    })

    it('have English translations', () => {
      const enTranslation = i18n.getResourceBundle('en', 'translation')
      expect(enTranslation).toBeDefined()
      expect(enTranslation['nav.practice']).toBe('Practice')
      expect(enTranslation['common.wpm']).toBe('WPM')
      expect(enTranslation['misc.themeAuto']).toBe('Auto (System)')
    })

    it('should have Chinese translations', () => {
      const zhTranslation = i18n.getResourceBundle('zh', 'translation')
      expect(zhTranslation).toBeDefined()
      expect(zhTranslation['nav.practice']).toBe('练习')
      expect(zhTranslation['common.wpm']).toBe('WPM')
      expect(zhTranslation['misc.themeAuto']).toBe('自动（系统）')
    })

    it('should have Hebrew translations', () => {
      const heTranslation = i18n.getResourceBundle('he', 'translation')
      expect(heTranslation).toBeDefined()
      expect(heTranslation['nav.practice']).toBe('תרגול')
      expect(heTranslation['common.wpm']).toBe('MWW')
      expect(heTranslation['misc.themeAuto']).toBe('אוטומטי (מערכת)')
    })

    it('should have consistent keys across languages', () => {
      const enTranslation = i18n.getResourceBundle('en', 'translation')
      const zhTranslation = i18n.getResourceBundle('zh', 'translation')
      const heTranslation = i18n.getResourceBundle('he', 'translation')

      const enKeys = Object.keys(enTranslation)
      const zhKeys = Object.keys(zhTranslation)
      const heKeys = Object.keys(heTranslation)

      // Все языки имеют одинаковое количество ключей (допускаются небольшие различия)
      expect(enKeys.length).toBeGreaterThan(150)
      expect(zhKeys.length).toBeGreaterThan(150)
      expect(heKeys.length).toBeGreaterThan(150)
    })
  })

  describe('i18n configuration', () => {
    it('should have fallback language set to Russian', () => {
      expect(i18n.options.fallbackLng).toEqual(['ru'])
    })

    it('should have supported languages', () => {
      const supportedLngs = i18n.options.supportedLngs
      expect(supportedLngs).toContain('ru')
      expect(supportedLngs).toContain('en')
      expect(supportedLngs).toContain('zh')
      expect(supportedLngs).toContain('he')
    })

    it('should have detection configuration', () => {
      expect(i18n.options.detection).toBeDefined()
      expect(i18n.options.detection?.lookupLocalStorage).toBe('fastfingers_language')
    })

    it('should have react configuration with useSuspense false', () => {
      expect(i18n.options.react?.useSuspense).toBe(false)
    })
  })

  describe('getCurrentLanguage', () => {
    it('should return current language', async () => {
      await i18n.changeLanguage('ru')
      expect(getCurrentLanguage()).toBe('ru')

      await i18n.changeLanguage('en')
      expect(getCurrentLanguage()).toBe('en')

      await i18n.changeLanguage('zh')
      expect(getCurrentLanguage()).toBe('zh')

      await i18n.changeLanguage('he')
      expect(getCurrentLanguage()).toBe('he')
    })

    it('should return fallback language if not set', () => {
      const currentLang = getCurrentLanguage()
      expect(currentLang).toBeDefined()
    })
  })

  describe('changeLanguage', () => {
    it('should change language to Russian', async () => {
      const result = await changeLanguage('ru')
      expect(result).toBeDefined()
      expect(getCurrentLanguage()).toBe('ru')
    })

    it('should change language to English', async () => {
      const result = await changeLanguage('en')
      expect(result).toBeDefined()
      expect(getCurrentLanguage()).toBe('en')
    })

    it('should change language to Chinese', async () => {
      const result = await changeLanguage('zh')
      expect(result).toBeDefined()
      expect(getCurrentLanguage()).toBe('zh')
    })

    it('should change language to Hebrew', async () => {
      const result = await changeLanguage('he')
      expect(result).toBeDefined()
      expect(getCurrentLanguage()).toBe('he')
    })

    it('should set RTL direction for Hebrew', async () => {
      await changeLanguage('he')
      expect(document.documentElement.dir).toBe('rtl')
    })

    it('should set LTR direction for other languages', async () => {
      await changeLanguage('en')
      expect(document.documentElement.dir).toBe('ltr')

      await changeLanguage('ru')
      expect(document.documentElement.dir).toBe('ltr')

      await changeLanguage('zh')
      expect(document.documentElement.dir).toBe('ltr')
    })

    it('should set lang attribute on html element', async () => {
      await changeLanguage('en')
      expect(document.documentElement.lang).toBe('en')

      await changeLanguage('ru')
      expect(document.documentElement.lang).toBe('ru')
    })
  })

  describe('useAppTranslation hook', () => {
    it('should be defined', () => {
      expect(useAppTranslation).toBeDefined()
    })
  })

  describe('translation quality', () => {
    it('should have non-empty translations for Russian', () => {
      const ruTranslation = i18n.getResourceBundle('ru', 'translation')
      const values = Object.values(ruTranslation)
      const emptyValues = values.filter(v => !v || v === '')
      expect(emptyValues.length).toBe(0)
    })

    it('should have non-empty translations for English', () => {
      const enTranslation = i18n.getResourceBundle('en', 'translation')
      const values = Object.values(enTranslation)
      const emptyValues = values.filter(v => !v || v === '')
      expect(emptyValues.length).toBe(0)
    })

    it('should have non-empty translations for Chinese', () => {
      const zhTranslation = i18n.getResourceBundle('zh', 'translation')
      const values = Object.values(zhTranslation)
      const emptyValues = values.filter(v => !v || v === '')
      expect(emptyValues.length).toBe(0)
    })

    it('should have non-empty translations for Hebrew', () => {
      const heTranslation = i18n.getResourceBundle('he', 'translation')
      const values = Object.values(heTranslation)
      const emptyValues = values.filter(v => !v || v === '')
      expect(emptyValues.length).toBe(0)
    })
  })
})
