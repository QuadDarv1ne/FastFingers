import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ru: {
    translation: {
      // Навигация
      'nav.practice': 'Практика',
      'nav.sprint': 'Спринт',
      'nav.test': 'Тест',
      'nav.custom': 'Своё',
      'nav.tips': 'Советы',
      'nav.week': 'Неделя',
      'nav.game': 'Игра',
      'nav.learning': 'Обучение',
      'nav.statistics': 'Статистика',
      
      // Общие
      'common.wpm': 'WPM',
      'common.cpm': 'CPM',
      'common.accuracy': 'Точность',
      'common.errors': 'Ошибки',
      'common.time': 'Время',
      'common.level': 'Уровень',
      'common.xp': 'XP',
      'common.streak': 'Серия',
      'common.days': 'дней',
      
      // Статусы
      'status.completed': 'Выполнено',
      'status.failed': 'Не выполнено',
      'status.inProgress': 'В процессе',
      'status.locked': 'Заблокировано',
      
      // Действия
      'action.start': 'Начать',
      'action.restart': 'Начать заново',
      'action.continue': 'Продолжить',
      'action.skip': 'Пропустить',
      'action.save': 'Сохранить',
      'action.cancel': 'Отмена',
      'action.delete': 'Удалить',
      'action.export': 'Экспорт',
      'action.import': 'Импорт',
      
      // Аутентификация
      'auth.login': 'Войти',
      'auth.register': 'Зарегистрироваться',
      'auth.logout': 'Выйти',
      'auth.email': 'Email',
      'auth.password': 'Пароль',
      'auth.name': 'Имя',
      'auth.forgotPassword': 'Забыли пароль?',
      'auth.rememberMe': 'Запомнить меня',
      
      // Уведомления
      'notification.levelUp': 'Уровень повышен!',
      'notification.achievement': 'Достижение разблокировано!',
      'notification.challenge': 'Челлендж выполнен!',
      'notification.streak': 'Серия продолжается!',
      
      // Ошибки
      'error.invalidEmail': 'Неверный формат email',
      'error.weakPassword': 'Пароль должен содержать минимум 8 символов',
      'error.emailInUse': 'Этот email уже зарегистрирован',
      'error.userNotFound': 'Пользователь не найден',
      'error.wrongPassword': 'Неверный пароль',
    }
  },
  en: {
    translation: {
      // Navigation
      'nav.practice': 'Practice',
      'nav.sprint': 'Sprint',
      'nav.test': 'Test',
      'nav.custom': 'Custom',
      'nav.tips': 'Tips',
      'nav.week': 'Week',
      'nav.game': 'Game',
      'nav.learning': 'Learning',
      'nav.statistics': 'Statistics',
      
      // Common
      'common.wpm': 'WPM',
      'common.cpm': 'CPM',
      'common.accuracy': 'Accuracy',
      'common.errors': 'Errors',
      'common.time': 'Time',
      'common.level': 'Level',
      'common.xp': 'XP',
      'common.streak': 'Streak',
      'common.days': 'days',
      
      // Statuses
      'status.completed': 'Completed',
      'status.failed': 'Failed',
      'status.inProgress': 'In Progress',
      'status.locked': 'Locked',
      
      // Actions
      'action.start': 'Start',
      'action.restart': 'Restart',
      'action.continue': 'Continue',
      'action.skip': 'Skip',
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.delete': 'Delete',
      'action.export': 'Export',
      'action.import': 'Import',
      
      // Authentication
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Name',
      'auth.forgotPassword': 'Forgot password?',
      'auth.rememberMe': 'Remember me',
      
      // Notifications
      'notification.levelUp': 'Level Up!',
      'notification.achievement': 'Achievement Unlocked!',
      'notification.challenge': 'Challenge Completed!',
      'notification.streak': 'Streak Continued!',
      
      // Errors
      'error.invalidEmail': 'Invalid email format',
      'error.weakPassword': 'Password must be at least 8 characters',
      'error.emailInUse': 'This email is already registered',
      'error.userNotFound': 'User not found',
      'error.wrongPassword': 'Wrong password',
    }
  }
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
