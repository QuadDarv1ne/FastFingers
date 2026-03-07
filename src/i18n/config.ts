import i18n, { TFunction } from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'

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
  | 'misc.theme'
  | 'misc.sound'
  | 'misc.keyboard'
  | 'misc.language'
  | 'misc.settings'
  | 'misc.profile'
  | 'misc.help'
  | 'misc.about'
  | 'misc.footer'
  | 'misc.copyright'

export type SupportedLanguage = 'ru' | 'en'

// ============================================
// Ресурсы переводов
// ============================================

const resources = {
  ru: {
    translation: {
      'nav.practice': 'Практика',
      'nav.sprint': 'Спринт',
      'nav.test': 'Тест',
      'nav.custom': 'Своё',
      'nav.tips': 'Советы',
      'nav.week': 'Неделя',
      'nav.game': 'Игра',
      'nav.learning': 'Обучение',
      'nav.statistics': 'Статистика',
      'nav.history': 'История',
      'nav.reaction': 'Реакция',
      'common.wpm': 'WPM',
      'common.cpm': 'CPM',
      'common.accuracy': 'Точность',
      'common.errors': 'Ошибки',
      'common.time': 'Время',
      'common.level': 'Уровень',
      'common.xp': 'XP',
      'common.streak': 'Серия',
      'common.days': 'дней',
      'common.words': 'слов',
      'common.chars': 'символов',
      'common.best': 'Лучший',
      'common.current': 'Текущий',
      'common.total': 'Всего',
      'common.speed': 'Скорость',
      'status.completed': 'Выполнено',
      'status.failed': 'Не выполнено',
      'status.inProgress': 'В процессе',
      'status.locked': 'Заблокировано',
      'status.available': 'Доступно',
      'action.start': 'Начать',
      'action.restart': 'Начать заново',
      'action.continue': 'Продолжить',
      'action.skip': 'Пропустить',
      'action.save': 'Сохранить',
      'action.cancel': 'Отмена',
      'action.delete': 'Удалить',
      'action.export': 'Экспорт',
      'action.import': 'Импорт',
      'action.edit': 'Редактировать',
      'action.view': 'Просмотр',
      'action.close': 'Закрыть',
      'action.confirm': 'Подтвердить',
      'action.back': 'Назад',
      'action.next': 'Далее',
      'action.previous': 'Назад',
      'action.submit': 'Отправить',
      'action.loading': 'Загрузка...',
      'action.exit': 'Выйти',
      'action.retry': 'Повторить',
      'auth.login': 'Войти',
      'auth.register': 'Зарегистрироваться',
      'auth.logout': 'Выйти',
      'auth.email': 'Email',
      'auth.password': 'Пароль',
      'auth.name': 'Имя',
      'auth.forgotPassword': 'Забыли пароль?',
      'auth.rememberMe': 'Запомнить меня',
      'auth.noAccount': 'Нет аккаунта?',
      'auth.haveAccount': 'Уже есть аккаунт?',
      'auth.confirmPassword': 'Подтвердите пароль',
      'auth.changePassword': 'Изменить пароль',
      'auth.resetPassword': 'Сброс пароля',
      'auth.sendResetLink': 'Отправить ссылку',
      'notification.levelUp': 'Уровень повышен',
      'notification.achievement': 'Достижение разблокировано',
      'notification.challenge': 'Челлендж выполнен',
      'notification.streak': 'Серия продолжается',
      'notification.newDay': 'Новый день',
      'notification.dailyReward': 'Ежедневная награда',
      'error.invalidEmail': 'Неверный формат email',
      'error.weakPassword': 'Пароль должен содержать минимум 8 символов',
      'error.emailInUse': 'Этот email уже зарегистрирован',
      'error.userNotFound': 'Пользователь не найден',
      'error.wrongPassword': 'Неверный пароль',
      'error.network': 'Ошибка сети. Проверьте подключение.',
      'error.server': 'Ошибка сервера. Попробуйте позже.',
      'error.unknown': 'Произошла неизвестная ошибка',
      'error.required': 'Обязательное поле',
      'error.tooShort': 'Слишком короткое значение',
      'error.tooLong': 'Слишком длинное значение',
      'exercise.mainRow': 'Основной ряд',
      'exercise.topRow': 'Верхний ряд',
      'exercise.bottomRow': 'Нижний ряд',
      'exercise.words': 'Слова',
      'exercise.sentences': 'Предложения',
      'exercise.code': 'Код',
      'exercise.custom': 'Пользовательское',
      'mode.practice': 'Практика',
      'mode.sprint': 'Спринт',
      'mode.speedtest': 'Тест скорости',
      'mode.challenge': 'Челлендж',
      'mode.game': 'Игра',
      'mode.hardcore': 'Хардкор',
      'mode.reaction': 'Реакция',
      'stats.title': 'Статистика',
      'stats.history': 'История',
      'stats.progress': 'Прогресс',
      'stats.achievements': 'Достижения',
      'stats.leaderboard': 'Таблица лидеров',
      'stats.session': 'Сессия',
      'misc.theme': 'Тема',
      'misc.sound': 'Звук',
      'misc.keyboard': 'Клавиатура',
      'misc.language': 'Язык',
      'misc.settings': 'Настройки',
      'misc.profile': 'Профиль',
      'misc.help': 'Помощь',
      'misc.about': 'О приложении',
      'misc.footer': 'FastFingers — Тренажёр слепой печати',
      'misc.copyright': '© 2026 FastFingers',
    }
  },
  en: {
    translation: {
      'nav.practice': 'Practice',
      'nav.sprint': 'Sprint',
      'nav.test': 'Test',
      'nav.custom': 'Custom',
      'nav.tips': 'Tips',
      'nav.week': 'Week',
      'nav.game': 'Game',
      'nav.learning': 'Learning',
      'nav.statistics': 'Statistics',
      'nav.history': 'History',
      'nav.reaction': 'Reaction',
      'common.wpm': 'WPM',
      'common.cpm': 'CPM',
      'common.accuracy': 'Accuracy',
      'common.errors': 'Errors',
      'common.time': 'Time',
      'common.level': 'Level',
      'common.xp': 'XP',
      'common.streak': 'Streak',
      'common.days': 'days',
      'common.words': 'words',
      'common.chars': 'chars',
      'common.best': 'Best',
      'common.current': 'Current',
      'common.total': 'Total',
      'common.speed': 'Speed',
      'status.completed': 'Completed',
      'status.failed': 'Failed',
      'status.inProgress': 'In Progress',
      'status.locked': 'Locked',
      'status.available': 'Available',
      'action.start': 'Start',
      'action.restart': 'Restart',
      'action.continue': 'Continue',
      'action.skip': 'Skip',
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.delete': 'Delete',
      'action.export': 'Export',
      'action.import': 'Import',
      'action.edit': 'Edit',
      'action.view': 'View',
      'action.close': 'Close',
      'action.confirm': 'Confirm',
      'action.back': 'Back',
      'action.next': 'Next',
      'action.previous': 'Previous',
      'action.submit': 'Submit',
      'action.loading': 'Loading...',
      'action.exit': 'Exit',
      'action.retry': 'Retry',
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Name',
      'auth.forgotPassword': 'Forgot password?',
      'auth.rememberMe': 'Remember me',
      'auth.noAccount': "Don't have an account?",
      'auth.haveAccount': 'Already have an account?',
      'auth.confirmPassword': 'Confirm password',
      'auth.changePassword': 'Change password',
      'auth.resetPassword': 'Reset password',
      'auth.sendResetLink': 'Send reset link',
      'notification.levelUp': 'Level Up',
      'notification.achievement': 'Achievement Unlocked',
      'notification.challenge': 'Challenge Completed',
      'notification.streak': 'Streak Continued',
      'notification.newDay': 'New Day',
      'notification.dailyReward': 'Daily Reward',
      'error.invalidEmail': 'Invalid email format',
      'error.weakPassword': 'Password must be at least 8 characters',
      'error.emailInUse': 'This email is already registered',
      'error.userNotFound': 'User not found',
      'error.wrongPassword': 'Wrong password',
      'error.network': 'Network error. Check your connection.',
      'error.server': 'Server error. Try again later.',
      'error.unknown': 'An unknown error occurred',
      'error.required': 'Required field',
      'error.tooShort': 'Value is too short',
      'error.tooLong': 'Value is too long',
      'exercise.mainRow': 'Home Row',
      'exercise.topRow': 'Top Row',
      'exercise.bottomRow': 'Bottom Row',
      'exercise.words': 'Words',
      'exercise.sentences': 'Sentences',
      'exercise.code': 'Code',
      'exercise.custom': 'Custom',
      'mode.practice': 'Practice',
      'mode.sprint': 'Sprint',
      'mode.speedtest': 'Speed Test',
      'mode.challenge': 'Challenge',
      'mode.game': 'Game',
      'mode.hardcore': 'Hardcore',
      'mode.reaction': 'Reaction',
      'stats.title': 'Statistics',
      'stats.history': 'History',
      'stats.progress': 'Progress',
      'stats.achievements': 'Achievements',
      'stats.leaderboard': 'Leaderboard',
      'stats.session': 'Session',
      'misc.theme': 'Theme',
      'misc.sound': 'Sound',
      'misc.keyboard': 'Keyboard',
      'misc.language': 'Language',
      'misc.settings': 'Settings',
      'misc.profile': 'Profile',
      'misc.help': 'Help',
      'misc.about': 'About',
      'misc.footer': 'FastFingers — Touch Typing Trainer',
      'misc.copyright': '© 2026 FastFingers',
    }
  }
}

// ============================================
// Инициализация i18n
// ============================================

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: undefined, // Будет определено через detection
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en'],
    interpolation: {
      escapeValue: false, // React уже экранирует значения
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'fastfingers_language',
      checkWhitelist: true,
    },
    react: {
      useSuspense: false,
    },
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
  return i18n.changeLanguage(lang)
}

export default i18n
