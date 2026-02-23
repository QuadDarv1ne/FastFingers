import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

type TranslationKey =
  | 'nav.practice' | 'nav.sprint' | 'nav.test' | 'nav.custom' | 'nav.tips'
  | 'nav.week' | 'nav.game' | 'nav.learning' | 'nav.statistics'
  | 'common.wpm' | 'common.cpm' | 'common.accuracy' | 'common.errors'
  | 'common.time' | 'common.level' | 'common.xp' | 'common.streak' | 'common.days'
  | 'status.completed' | 'status.failed' | 'status.inProgress' | 'status.locked'
  | 'action.start' | 'action.restart' | 'action.continue' | 'action.skip'
  | 'action.save' | 'action.cancel' | 'action.delete' | 'action.export' | 'action.import'
  | 'auth.login' | 'auth.register' | 'auth.logout' | 'auth.email' | 'auth.password'
  | 'auth.name' | 'auth.forgotPassword' | 'auth.rememberMe'
  | 'notification.levelUp' | 'notification.achievement' | 'notification.challenge' | 'notification.streak'
  | 'error.invalidEmail' | 'error.weakPassword' | 'error.emailInUse'
  | 'error.userNotFound' | 'error.wrongPassword'

type Translations = Record<TranslationKey, string>

const createResources = (translations: Translations) => ({ translation: translations })

const ruTranslations: Translations = {
  'nav.practice': 'Практика',
  'nav.sprint': 'Спринт',
  'nav.test': 'Тест',
  'nav.custom': 'Своё',
  'nav.tips': 'Советы',
  'nav.week': 'Неделя',
  'nav.game': 'Игра',
  'nav.learning': 'Обучение',
  'nav.statistics': 'Статистика',
  'common.wpm': 'WPM',
  'common.cpm': 'CPM',
  'common.accuracy': 'Точность',
  'common.errors': 'Ошибки',
  'common.time': 'Время',
  'common.level': 'Уровень',
  'common.xp': 'XP',
  'common.streak': 'Серия',
  'common.days': 'дней',
  'status.completed': 'Выполнено',
  'status.failed': 'Не выполнено',
  'status.inProgress': 'В процессе',
  'status.locked': 'Заблокировано',
  'action.start': 'Начать',
  'action.restart': 'Начать заново',
  'action.continue': 'Продолжить',
  'action.skip': 'Пропустить',
  'action.save': 'Сохранить',
  'action.cancel': 'Отмена',
  'action.delete': 'Удалить',
  'action.export': 'Экспорт',
  'action.import': 'Импорт',
  'auth.login': 'Войти',
  'auth.register': 'Зарегистрироваться',
  'auth.logout': 'Выйти',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.name': 'Имя',
  'auth.forgotPassword': 'Забыли пароль?',
  'auth.rememberMe': 'Запомнить меня',
  'notification.levelUp': 'Уровень повышен!',
  'notification.achievement': 'Достижение разблокировано!',
  'notification.challenge': 'Челлендж выполнен!',
  'notification.streak': 'Серия продолжается!',
  'error.invalidEmail': 'Неверный формат email',
  'error.weakPassword': 'Пароль должен содержать минимум 8 символов',
  'error.emailInUse': 'Этот email уже зарегистрирован',
  'error.userNotFound': 'Пользователь не найден',
  'error.wrongPassword': 'Неверный пароль',
}

const enTranslations: Translations = {
  'nav.practice': 'Practice',
  'nav.sprint': 'Sprint',
  'nav.test': 'Test',
  'nav.custom': 'Custom',
  'nav.tips': 'Tips',
  'nav.week': 'Week',
  'nav.game': 'Game',
  'nav.learning': 'Learning',
  'nav.statistics': 'Statistics',
  'common.wpm': 'WPM',
  'common.cpm': 'CPM',
  'common.accuracy': 'Accuracy',
  'common.errors': 'Errors',
  'common.time': 'Time',
  'common.level': 'Level',
  'common.xp': 'XP',
  'common.streak': 'Streak',
  'common.days': 'days',
  'status.completed': 'Completed',
  'status.failed': 'Failed',
  'status.inProgress': 'In Progress',
  'status.locked': 'Locked',
  'action.start': 'Start',
  'action.restart': 'Restart',
  'action.continue': 'Continue',
  'action.skip': 'Skip',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.delete': 'Delete',
  'action.export': 'Export',
  'action.import': 'Import',
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.logout': 'Logout',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.name': 'Name',
  'auth.forgotPassword': 'Forgot password?',
  'auth.rememberMe': 'Remember me',
  'notification.levelUp': 'Level Up!',
  'notification.achievement': 'Achievement Unlocked!',
  'notification.challenge': 'Challenge Completed!',
  'notification.streak': 'Streak Continued!',
  'error.invalidEmail': 'Invalid email format',
  'error.weakPassword': 'Password must be at least 8 characters',
  'error.emailInUse': 'This email is already registered',
  'error.userNotFound': 'User not found',
  'error.wrongPassword': 'Wrong password',
}

const resources = {
  ru: createResources(ruTranslations),
  en: createResources(enTranslations),
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
