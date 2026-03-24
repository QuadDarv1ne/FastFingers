/**
 * i18n — Интернационализация FastFingers
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

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

export type SupportedLanguage = 'ru' | 'en' | 'zh' | 'he' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'ja'

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
      'stats.activityHeatmap': 'Активность',
      'stats.activeDays': 'активных дней',
      'stats.totalSessions': 'сессий',
      'stats.bestWpm': 'Лучший WPM',
      'stats.bestAccuracy': 'Лучшая точность',
      'stats.bestCpm': 'Лучший CPM',
      'stats.longestStreak': 'Серия',
      'stats.totalTime': 'Время тренировок',
      'stats.weeklyComparison': 'Сравнение с прошлой неделей',
      'stats.thisWeek': 'эта неделя',
      'stats.lastWeek': 'прошлая неделя',
      'stats.charsTyped': 'Напечатано',
      'stats.less': 'Меньше',
      'stats.more': 'Больше',
      'stats.sessions': 'сессий',
      'misc.theme': 'Тема',
      'misc.themeAuto': 'Авто (системная)',
      'misc.sound': 'Звук',
      'misc.keyboard': 'Клавиатура',
      'misc.language': 'Язык',
      'misc.settings': 'Настройки',
      'misc.profile': 'Профиль',
      'misc.help': 'Помощь',
      'misc.about': 'О приложении',
      'misc.footer': 'FastFingers — Тренажёр слепой печати',
      'misc.copyright': '© 2026 FastFingers',
      'misc.fontSize': 'Размер шрифта',
      'misc.highContrast': 'Контрастность',
      'misc.installApp': 'Установить приложение',
      'music.title': 'Музыка',
      'music.genre': 'Жанр',
      'music.tempo': 'Темп',
      'music.volume': 'Громкость',
      'music.key': 'Тональность',
      'music.playing': 'Воспроизведение...',
      'action.stop': 'Стоп',
      'tip.posture': 'Правильная осанка',
      'tip.postureDesc': 'Сидите прямо, спина прижата к спинке стула. Расстояние от глаз до монитора — 50-70 см.',
      'tip.hands': 'Положение рук',
      'tip.handsDesc': 'Локти под углом 90°, запястья не провисают. Используйте подставку для запястий при необходимости.',
      'tip.home': 'Домашняя позиция',
      'tip.homeDesc': 'Левая рука: мизинец на А, безымянный на В, средний на Ы, указательный на Ф. Правая: указательный на О, средний на Р, безымянный на Л, мизинец на Д.',
      'tip.zones': 'Зоны пальцев',
      'tip.zonesDesc': 'Каждый палец отвечает за определённые клавиши. Указательные пальцы — самые активные, обслуживают по 4 клавиши.',
      'tip.look': 'Не смотрите на клавиатуру',
      'tip.lookDesc': 'Главное правило слепой печати! Если нужно — накройте руки лёгкой тканью.',
      'tip.accuracy': 'Сначала точность',
      'tip.accuracyDesc': 'Не гонитесь за скоростью. Сосредоточьтесь на правильной технике и отсутствии ошибок. Скорость придёт сама.',
      'tip.regular': 'Регулярные занятия',
      'tip.regularDesc': 'Лучше 15 минут каждый день, чем 2 часа раз в неделю. Поддерживайте серию дней!',
      'tip.games': 'Играйте в игры',
      'tip.gamesDesc': 'Используйте режим спринта и челленджи для разнообразия тренировки.',
      'tip.breaks': 'Делайте перерывы',
      'tip.breaksDesc': 'Каждые 25-30 минут делайте 5-минутный перерыв. Встаньте, потянитесь, разомните кисти.',
      'tip.exercise': 'Упражнения для кистей',
      'tip.exerciseDesc': 'Вращайте кистями, сжимайте-разжимайте кулаки. Это предотвратит туннельный синдром.',
      'tip.eyes': 'Гимнастика для глаз',
      'tip.eyesDesc': 'Каждые 20 минут смотрите на объект в 6 метрах в течение 20 секунд. Это правило 20-20-20.',
      'tip.progress': 'Отмечайте прогресс',
      'tip.progressDesc': 'Радуйтесь каждому достижению! Даже небольшой прогресс — это шаг к мастерству.',
      'quote.practice1': 'Практика делает совершенным. Каждое нажатие клавиши приближает вас к мастерству.',
      'quote.practice2': 'Постоянство важнее интенсивности. 10 минут каждый день лучше, чем час раз в неделю.',
      'quote.practice3': 'Ваши пальцы знают больше, чем вы думаете. Доверьтесь мышечной памяти.',
      'quote.practice4': 'Ритм важнее скорости. Найдите свой темп и придерживайтесь его.',
      'quote.learning1': 'Скорость приходит с точностью. Сначала научитесь печатать правильно.',
      'quote.learning2': 'Каждая ошибка - это возможность научиться чему-то новому.',
      'quote.learning3': 'Мастерство - это не пункт назначения, это путешествие.',
      'quote.learning4': 'Скорость без точности - это просто быстрые ошибки.',
      'quote.learning5': 'Не смотрите на клавиатуру. Доверьтесь своим пальцам.',
      'quote.motivation1': 'Не сравнивайте себя с другими. Сравнивайте себя с собой вчерашним.',
      'quote.motivation2': 'Единственный способ делать великую работу - любить то, что вы делаете.',
      'quote.motivation3': 'Не бойтесь ошибаться. Бойтесь не пробовать.',
      'quote.motivation4': 'Каждый эксперт когда-то был новичком. Продолжайте практиковаться.',
      'quote.success1': 'Успех - это сумма маленьких усилий, повторяемых день за днём.',
      'quote.success2': 'Прогресс может быть медленным, но он всегда заметен при постоянстве.',
      'quote.fastfingers': 'FastFingers',
      'quote.collier': 'Роберт Кольер',
      'quote.jobs': 'Стив Джобс',
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
      'stats.activityHeatmap': 'Activity',
      'stats.activeDays': 'active days',
      'stats.totalSessions': 'sessions',
      'stats.bestWpm': 'Best WPM',
      'stats.bestAccuracy': 'Best Accuracy',
      'stats.bestCpm': 'Best CPM',
      'stats.longestStreak': 'Streak',
      'stats.totalTime': 'Practice Time',
      'stats.weeklyComparison': 'Weekly Comparison',
      'stats.thisWeek': 'this week',
      'stats.lastWeek': 'last week',
      'stats.charsTyped': 'Typed',
      'stats.less': 'Less',
      'stats.more': 'More',
      'stats.sessions': 'sessions',
      'misc.theme': 'Theme',
      'misc.themeAuto': 'Auto (System)',
      'misc.sound': 'Sound',
      'misc.keyboard': 'Keyboard',
      'misc.language': 'Language',
      'misc.settings': 'Settings',
      'misc.profile': 'Profile',
      'misc.help': 'Help',
      'misc.about': 'About',
      'misc.footer': 'FastFingers — Touch Typing Trainer',
      'misc.copyright': '© 2026 FastFingers',
      'misc.fontSize': 'Font Size',
      'misc.highContrast': 'High Contrast',
      'misc.installApp': 'Install App',
      'music.title': 'Music',
      'music.genre': 'Genre',
      'music.tempo': 'Tempo',
      'music.volume': 'Volume',
      'music.key': 'Key',
      'music.playing': 'Playing...',
      'action.stop': 'Stop',
      'tip.posture': 'Posture',
      'tip.postureDesc': 'Sit up straight, back against the chair. Keep 50-70cm distance from eyes to monitor.',
      'tip.hands': 'Hand Position',
      'tip.handsDesc': 'Elbows at 90°, wrists not sagging. Use wrist rests if needed.',
      'tip.home': 'Home Position',
      'tip.homeDesc': 'Left hand: pinky on A, ring on S, middle on D, index on F. Right: index on J, middle on K, ring on L, pinky on ;',
      'tip.zones': 'Finger Zones',
      'tip.zonesDesc': 'Each finger is responsible for certain keys. Index fingers are most active, serving 4 keys each.',
      'tip.look': 'Dont Look',
      'tip.lookDesc': 'Golden rule of touch typing! If needed, cover your hands with a light cloth.',
      'tip.accuracy': 'Accuracy First',
      'tip.accuracyDesc': 'Dont rush for speed. Focus on proper technique and no errors. Speed will come naturally.',
      'tip.regular': 'Regular Practice',
      'tip.regularDesc': 'Better 15 minutes daily than 2 hours once a week. Maintain your streak!',
      'tip.games': 'Play Games',
      'tip.gamesDesc': 'Use sprint mode and challenges for training variety.',
      'tip.breaks': 'Take Breaks',
      'tip.breaksDesc': 'Every 25-30 minutes take a 5-minute break. Stand up, stretch, warm up your wrists.',
      'tip.exercise': 'Hand Exercises',
      'tip.exerciseDesc': 'Rotate wrists, clench-unclench fists. This prevents carpal tunnel syndrome.',
      'tip.eyes': 'Eye Gym',
      'tip.eyesDesc': 'Every 20 minutes look at an object 6 meters away for 20 seconds. The 20-20-20 rule.',
      'tip.progress': 'Track Progress',
      'tip.progressDesc': 'Celebrate every achievement! Even small progress is a step to mastery.',
      'quote.practice1': 'Practice makes perfect. Every keystroke brings you closer to mastery.',
      'quote.practice2': 'Consistency is more important than intensity. 10 minutes daily is better than an hour once a week.',
      'quote.practice3': 'Your fingers know more than you think. Trust your muscle memory.',
      'quote.practice4': 'Rhythm is more important than speed. Find your tempo and stick to it.',
      'quote.learning1': 'Speed comes with accuracy. First learn to type correctly.',
      'quote.learning2': 'Every mistake is an opportunity to learn something new.',
      'quote.learning3': 'Mastery is not a destination, it is a journey.',
      'quote.learning4': 'Speed without accuracy is just fast mistakes.',
      'quote.learning5': 'Dont look at the keyboard. Trust your fingers.',
      'quote.motivation1': 'Dont compare yourself to others. Compare yourself to who you were yesterday.',
      'quote.motivation2': 'The only way to do great work is to love what you do.',
      'quote.motivation3': 'Dont be afraid to make mistakes. Be afraid not to try.',
      'quote.motivation4': 'Every expert was once a beginner. Keep practicing.',
      'quote.success1': 'Success is the sum of small efforts, repeated day in and day out.',
      'quote.success2': 'Progress may be slow, but it is always noticeable with consistency.',
      'quote.fastfingers': 'FastFingers',
      'quote.collier': 'Robert Collier',
      'quote.jobs': 'Steve Jobs',
    }
  },
  zh: {
    translation: {
      'nav.practice': '练习',
      'nav.sprint': '冲刺',
      'nav.test': '测试',
      'nav.custom': '自定义',
      'nav.tips': '提示',
      'nav.week': '周报',
      'nav.game': '游戏',
      'nav.learning': '学习',
      'nav.statistics': '统计',
      'nav.history': '历史',
      'nav.reaction': '反应',
      'common.wpm': 'WPM',
      'common.cpm': 'CPM',
      'common.accuracy': '准确率',
      'common.errors': '错误',
      'common.time': '时间',
      'common.level': '等级',
      'common.xp': '经验值',
      'common.streak': '连击',
      'common.days': '天',
      'common.words': '单词',
      'common.chars': '字符',
      'common.best': '最佳',
      'common.current': '当前',
      'common.total': '总计',
      'common.speed': '速度',
      'status.completed': '已完成',
      'status.failed': '失败',
      'status.inProgress': '进行中',
      'status.locked': '已锁定',
      'status.available': '可用',
      'action.start': '开始',
      'action.restart': '重新开始',
      'action.continue': '继续',
      'action.skip': '跳过',
      'action.save': '保存',
      'action.cancel': '取消',
      'action.delete': '删除',
      'action.export': '导出',
      'action.import': '导入',
      'action.edit': '编辑',
      'action.view': '查看',
      'action.close': '关闭',
      'action.confirm': '确认',
      'action.back': '返回',
      'action.next': '下一步',
      'action.previous': '上一步',
      'action.submit': '提交',
      'action.loading': '加载中...',
      'action.exit': '退出',
      'action.retry': '重试',
      'auth.login': '登录',
      'auth.register': '注册',
      'auth.logout': '登出',
      'auth.email': '邮箱',
      'auth.password': '密码',
      'auth.name': '姓名',
      'auth.forgotPassword': '忘记密码？',
      'auth.rememberMe': '记住我',
      'auth.noAccount': '没有账号？',
      'auth.haveAccount': '已有账号？',
      'auth.confirmPassword': '确认密码',
      'auth.changePassword': '修改密码',
      'auth.resetPassword': '重置密码',
      'auth.sendResetLink': '发送重置链接',
      'notification.levelUp': '等级提升',
      'notification.achievement': '成就解锁',
      'notification.challenge': '挑战完成',
      'notification.streak': '连击继续',
      'notification.newDay': '新的一天',
      'notification.dailyReward': '每日奖励',
      'error.invalidEmail': '邮箱格式错误',
      'error.weakPassword': '密码至少 8 个字符',
      'error.emailInUse': '该邮箱已注册',
      'error.userNotFound': '用户不存在',
      'error.wrongPassword': '密码错误',
      'error.network': '网络错误，请检查连接',
      'error.server': '服务器错误，请稍后重试',
      'error.unknown': '发生未知错误',
      'error.required': '必填字段',
      'error.tooShort': '值太短',
      'error.tooLong': '值太长',
      'exercise.mainRow': '主行',
      'exercise.topRow': '上行',
      'exercise.bottomRow': '下行',
      'exercise.words': '单词',
      'exercise.sentences': '句子',
      'exercise.code': '代码',
      'exercise.custom': '自定义',
      'mode.practice': '练习',
      'mode.sprint': '冲刺',
      'mode.speedtest': '速度测试',
      'mode.challenge': '挑战',
      'mode.game': '游戏',
      'mode.hardcore': '硬核',
      'mode.reaction': '反应',
      'stats.title': '统计',
      'stats.history': '历史',
      'stats.progress': '进度',
      'stats.achievements': '成就',
      'stats.leaderboard': '排行榜',
      'stats.session': '会话',
      'misc.theme': '主题',
      'misc.themeAuto': '自动（系统）',
      'misc.sound': '声音',
      'misc.keyboard': '键盘',
      'misc.language': '语言',
      'misc.settings': '设置',
      'misc.profile': '个人资料',
      'misc.help': '帮助',
      'misc.about': '关于',
      'misc.footer': 'FastFingers — 打字训练器',
      'misc.copyright': '© 2026 FastFingers',
      'misc.installApp': '安装应用',
      'tip.posture': '姿势',
      'tip.postureDesc': '坐直，背部靠在椅背上。眼睛与显示器距离 50-70 厘米。',
      'tip.hands': '手部位置',
      'tip.handsDesc': '肘部呈 90°，手腕不下垂。必要时使用腕托。',
      'tip.home': '基准键位',
      'tip.homeDesc': '左手：小指 A，无名指 S，中指 D，食指 F。右手：食指 J，中指 K，无名指 L，小指；',
      'tip.zones': '手指区域',
      'tip.zonesDesc': '每个手指负责特定按键。食指最活跃，各负责 4 个键。',
      'tip.look': '不看键盘',
      'tip.lookDesc': '盲打黄金法则！必要时用轻布盖住双手。',
      'tip.accuracy': '准确优先',
      'tip.accuracyDesc': '不要追求速度。专注于正确技术和无错误。速度会自然提升。',
      'tip.regular': '规律练习',
      'tip.regularDesc': '每天 15 分钟胜过每周 2 小时。保持连续练习！',
      'tip.games': '游戏模式',
      'tip.gamesDesc': '使用冲刺模式和挑战增加训练多样性。',
      'tip.breaks': '休息',
      'tip.breaksDesc': '每 25-30 分钟休息 5 分钟。站起来，伸展，活动手腕。',
      'tip.exercise': '手部运动',
      'tip.exerciseDesc': '转动手腕，握拳松拳。预防腕管综合征。',
      'tip.eyes': '眼保健操',
      'tip.eyesDesc': '每 20 分钟看 6 米外物体 20 秒。20-20-20 法则。',
      'tip.progress': '记录进步',
      'tip.progressDesc': '庆祝每个成就！即使小进步也是迈向精通的一步。',
      'quote.practice1': '熟能生巧。每次按键都让你更接近精通。',
      'quote.practice2': '坚持比强度更重要。每天 10 分钟胜过每周 2 小时。',
      'quote.practice3': '你的手指知道的比你想象的多。相信肌肉记忆。',
      'quote.practice4': '节奏比速度更重要。找到你的节奏并坚持。',
      'quote.learning1': '速度伴随准确而来。先学会正确打字。',
      'quote.learning2': '每个错误都是学习新东西的机会。',
      'quote.learning3': '精通不是终点，而是旅程。',
      'quote.learning4': '没有准确的速度只是快速犯错。',
      'quote.learning5': '不要看键盘。相信你的手指。',
      'quote.motivation1': '不要和别人比较。和昨天的自己比较。',
      'quote.motivation2': '做伟大工作的唯一方法是热爱你所做的。',
      'quote.motivation3': '不要害怕犯错。害怕不尝试。',
      'quote.motivation4': '每个专家都曾是初学者。继续练习。',
      'quote.success1': '成功是小努力的总和，日复一日重复。',
      'quote.success2': '进步可能缓慢，但坚持总会 noticeable。',
      'quote.fastfingers': 'FastFingers',
      'quote.collier': '罗伯特·科利尔',
      'quote.jobs': '史蒂夫·乔布斯',
    }
  },
  he: {
    translation: {
      'nav.practice': 'תרגול',
      'nav.sprint': 'ספרינט',
      'nav.test': 'מבחן',
      'nav.custom': 'מותאם אישית',
      'nav.tips': 'טיפים',
      'nav.week': 'שבועי',
      'nav.game': 'משחק',
      'nav.learning': 'למידה',
      'nav.statistics': 'סטטיסטיקה',
      'nav.history': 'היסטוריה',
      'nav.reaction': 'תגובה',
      'common.wpm': 'MWW',
      'common.cpm': 'MPC',
      'common.accuracy': 'דיוק',
      'common.errors': 'שגיאות',
      'common.time': 'זמן',
      'common.level': 'רמה',
      'common.xp': 'נקודות',
      'common.streak': 'רצף',
      'common.days': 'ימים',
      'common.words': 'מילים',
      'common.chars': 'תווים',
      'common.best': 'מיטבי',
      'common.current': 'נוכחי',
      'common.total': 'סה״כ',
      'common.speed': 'מהירות',
      'status.completed': 'הושלם',
      'status.failed': 'נכשל',
      'status.inProgress': 'בתהליך',
      'status.locked': 'נעול',
      'status.available': 'זמין',
      'action.start': 'התחל',
      'action.restart': 'התחל מחדש',
      'action.continue': 'המשך',
      'action.skip': 'דלג',
      'action.save': 'שמור',
      'action.cancel': 'בטל',
      'action.delete': 'מחק',
      'action.export': 'ייצא',
      'action.import': 'ייבא',
      'action.edit': 'ערוך',
      'action.view': 'צפה',
      'action.close': 'סגור',
      'action.confirm': 'אשר',
      'action.back': 'חזור',
      'action.next': 'הבא',
      'action.previous': 'הקודם',
      'action.submit': 'שלח',
      'action.loading': 'טוען...',
      'action.exit': 'יציאה',
      'action.retry': 'נסה שוב',
      'auth.login': 'התחברות',
      'auth.register': 'הרשמה',
      'auth.logout': 'התנתק',
      'auth.email': 'דוא״ל',
      'auth.password': 'סיסמה',
      'auth.name': 'שם',
      'auth.forgotPassword': 'שכחת סיסמה?',
      'auth.rememberMe': 'זכור אותי',
      'auth.noAccount': 'אין לך חשבון?',
      'auth.haveAccount': 'כבר יש לך חשבון?',
      'auth.confirmPassword': 'אשר סיסמה',
      'auth.changePassword': 'שנה סיסמה',
      'auth.resetPassword': 'איפוס סיסמה',
      'auth.sendResetLink': 'שלח קישור לאיפוס',
      'notification.levelUp': 'רמה עלתה',
      'notification.achievement': 'הישג נפתח',
      'notification.challenge': 'אתגר הושלם',
      'notification.streak': 'רצף נמשך',
      'notification.newDay': 'יום חדש',
      'notification.dailyReward': 'פרס יומי',
      'error.invalidEmail': 'פורמט דוא״ל שגוי',
      'error.weakPassword': 'סיסמה חייבת לפחות 8 תווים',
      'error.emailInUse': 'דוא״ל זה כבר רשום',
      'error.userNotFound': 'משתמש לא נמצא',
      'error.wrongPassword': 'סיסמה שגויה',
      'error.network': 'שגיאת רשת. בדוק חיבור.',
      'error.server': 'שגיאת שרת. נסה מאוחר יותר.',
      'error.unknown': 'אירעה שגיאה לא ידועה',
      'error.required': 'שדה חובה',
      'error.tooShort': 'הערך קצר מדי',
      'error.tooLong': 'הערך ארוך מדי',
      'exercise.mainRow': 'שורה ראשית',
      'exercise.topRow': 'שורה עליונה',
      'exercise.bottomRow': 'שורה תחתונה',
      'exercise.words': 'מילים',
      'exercise.sentences': 'משפטים',
      'exercise.code': 'קוד',
      'exercise.custom': 'מותאם אישית',
      'mode.practice': 'תרגול',
      'mode.sprint': 'ספרינט',
      'mode.speedtest': 'מבחן מהירות',
      'mode.challenge': 'אתגר',
      'mode.game': 'משחק',
      'mode.hardcore': 'הארדקור',
      'mode.reaction': 'תגובה',
      'stats.title': 'סטטיסטיקה',
      'stats.history': 'היסטוריה',
      'stats.progress': 'תקדמות',
      'stats.achievements': 'הישגים',
      'stats.leaderboard': 'טבלת מובילים',
      'stats.session': 'סשן',
      'misc.theme': 'ערכת נושא',
      'misc.themeAuto': 'אוטומטי (מערכת)',
      'misc.sound': 'צליל',
      'misc.keyboard': 'מקלדת',
      'misc.language': 'שפה',
      'misc.settings': 'הגדרות',
      'misc.profile': 'פרופיל',
      'misc.help': 'עזרה',
      'misc.about': 'אודות',
      'misc.footer': 'FastFingers — מאמן הקלדה עיוורת',
      'misc.copyright': '© 2026 FastFingers',
      'misc.installApp': 'התקן אפליקציה',
      'tip.posture': 'יציבה',
      'tip.postureDesc': 'שבו זקוף, גב צמוד למשענת הכיסא. שמרו על מרחק 50-70 ס״מ מהעיניים למסך.',
      'tip.hands': 'מיקום ידיים',
      'tip.handsDesc': 'מרפקים בזווית 90°, מפרקים לא שמוטים. השתמשו במשענות מפרק אם צריך.',
      'tip.home': 'עמדת בית',
      'tip.homeDesc': 'יד שמאל: זרת על A, קמיצה על S, אמה על D, אצבע על F. ימין: אצבע על J, אמה על K, קמיצה על L, זרת על ;',
      'tip.zones': 'אזורי אצבעות',
      'tip.zonesDesc': 'כל אצבע אחראית על מקשים מסוימים. אצבעות המורה הכי פעילות, כל אחת משרתת 4 מקשים.',
      'tip.look': 'אל תסתכלו',
      'tip.lookDesc': 'כלל הזהב של הקלדה עיוורת! אם צריך, כסו את הידיים בבד קל.',
      'tip.accuracy': 'דיוק קודם',
      'tip.accuracyDesc': 'אל תרדפו אחרי מהירות. התמקדו בטכניקה נכונה וללא שגיאות. המהירות תבוא לבד.',
      'tip.regular': 'תרגול קבוע',
      'tip.regularDesc': 'עדיף 15 דקות כל יום מאשר שעתיים פעם בשבוע. שמרו על רצף!',
      'tip.games': 'משחקים',
      'tip.gamesDesc': 'השתמשו במצב ספרינט ואתגרים לגיוון האימון.',
      'tip.breaks': 'הפסקות',
      'tip.breaksDesc': 'כל 25-30 דקות קחו הפסקה של 5 דקות. קומו, הימתחו, חממו מפרקים.',
      'tip.exercise': 'תרגילי ידיים',
      'tip.exerciseDesc': 'סובבו מפרקים, כווצו-שחררו אגרופים. זה מונע תסמונת המנהרה.',
      'tip.eyes': 'התעמלות עיניים',
      'tip.eyesDesc': 'כל 20 דקות הסתכלו על עצם במרחק 6 מטר למשך 20 שניות. כלל 20-20-20.',
      'tip.progress': 'מעקב התקדמות',
      'tip.progressDesc': 'חגגו כל הישג! אפילו התקדמות קטנה היא צעד למastery.',
      'quote.practice1': 'תרגול עושה מושלם. כל הקשה מקרבת אותך למastery.',
      'quote.practice2': 'עקביות חשובה יותר מעוצמה. 10 דקות כל יום עדיף על שעתיים פעם בשבוע.',
      'quote.practice3': 'האצבעות שלך יודעות יותר ממה שאתה חושב. תסמוך על הזיכרון השרירי.',
      'quote.practice4': 'קצב חשוב יותר ממהירות. מצא את הטמפו שלך והיצמד אליו.',
      'quote.learning1': 'מהירות באה עם דיוק. קודם כל ללמוד להקליד נכון.',
      'quote.learning2': 'כל טעות היא הזדמנות ללמוד משהו חדש.',
      'quote.learning3': 'מastery היא לא יעד, היא מסע.',
      'quote.learning4': 'מהירות ללא דיוק היא פשוט טעויות מהירות.',
      'quote.learning5': 'אל תסתכל על המקלדת. תסמוך על האצבעות שלך.',
      'quote.motivation1': 'אל תשווה את עצמך לאחרים. תשווה את עצמך למי שהיית אתמול.',
      'quote.motivation2': 'הדרך היחידה לעשות עבודה גדולה היא לאהוב את מה שאתה עושה.',
      'quote.motivation3': 'אל תפחד לטעות. תפחד לא לנסות.',
      'quote.motivation4': 'כל מומחה היה פעם מתחיל. המשך לתרגל.',
      'quote.success1': 'הצלחה היא סכום של מאמצים קטנים, חוזרים יום אחרי יום.',
      'quote.success2': 'התקדמות עשויה להיות איטית, אבל היא תמיד מורגשת עם עקביות.',
      'quote.fastfingers': 'FastFingers',
      'quote.collier': 'רוברט קולייר',
      'quote.jobs': 'סטיב ג׳ובס',
    }
  },
  it: {
    translation: {
      'nav.practice': 'Pratica', 'nav.sprint': 'Sprint', 'nav.test': 'Test', 'nav.custom': 'Personalizzato', 'nav.tips': 'Suggerimenti', 'nav.week': 'Settimanale', 'nav.game': 'Gioco', 'nav.learning': 'Apprendimento', 'nav.statistics': 'Statistiche', 'nav.history': 'Cronologia', 'nav.reaction': 'Reazione',
      'common.wpm': 'PPM', 'common.cpm': 'CPM', 'common.accuracy': 'Precisione', 'common.errors': 'Errori', 'common.time': 'Tempo', 'common.level': 'Livello', 'common.xp': 'XP', 'common.streak': 'Serie', 'common.days': 'giorni', 'common.words': 'parole', 'common.chars': 'caratteri', 'common.best': 'migliore', 'common.current': 'attuale', 'common.total': 'totale', 'common.speed': 'Velocità',
      'status.completed': 'Completato', 'status.failed': 'Fallito', 'status.inProgress': 'In corso', 'status.locked': 'Bloccato', 'status.available': 'Disponibile',
      'action.start': 'Inizia', 'action.restart': 'Ricomincia', 'action.continue': 'Continua', 'action.skip': 'Salta', 'action.save': 'Salva', 'action.cancel': 'Annulla', 'action.delete': 'Elimina', 'action.export': 'Esporta', 'action.import': 'Importa', 'action.edit': 'Modifica', 'action.view': 'Visualizza', 'action.close': 'Chiudi', 'action.confirm': 'Conferma', 'action.back': 'Indietro', 'action.next': 'Avanti', 'action.previous': 'Precedente', 'action.submit': 'Invia', 'action.loading': 'Caricamento...', 'action.exit': 'Esci', 'action.retry': 'Riprova', 'action.stop': 'Ferma',
      'auth.login': 'Accedi', 'auth.register': 'Registrati', 'auth.logout': 'Disconnetti', 'auth.email': 'Email', 'auth.password': 'Password', 'auth.name': 'Nome', 'auth.forgotPassword': 'Password dimenticata?', 'auth.rememberMe': 'Ricordami', 'auth.noAccount': 'Nessun account?', 'auth.haveAccount': 'Hai già un account?', 'auth.confirmPassword': 'Conferma password', 'auth.changePassword': 'Cambia password', 'auth.resetPassword': 'Reimposta password', 'auth.sendResetLink': 'Invia link reset',
      'notification.levelUp': 'Livello aumentato', 'notification.achievement': 'Obiettivo sbloccato', 'notification.challenge': 'Sfida completata', 'notification.streak': 'Serie continuata', 'notification.newDay': 'Nuovo giorno', 'notification.dailyReward': 'Ricompensa giornaliera',
      'error.invalidEmail': 'Formato email non valido', 'error.passwordTooShort': 'Password minima 8 caratteri', 'error.passwordsMismatch': 'Password non corrispondono', 'error.network': 'Errore di rete', 'error.server': 'Errore server', 'error.unknown': 'Errore sconosciuto', 'error.required': 'Campo obbligatorio', 'error.tooShort': 'Troppo corto', 'error.tooLong': 'Troppo lungo', 'error.weakPassword': 'Password debole', 'error.emailInUse': 'Email già in uso', 'error.userNotFound': 'Utente non trovato', 'error.wrongPassword': 'Password errata',
      'exercise.mainRow': 'Riga principale', 'exercise.topRow': 'Riga superiore', 'exercise.bottomRow': 'Riga inferiore', 'exercise.words': 'Parole', 'exercise.sentences': 'Frasi', 'exercise.code': 'Codice', 'exercise.custom': 'Personalizzato',
      'mode.practice': 'Pratica', 'mode.sprint': 'Sprint', 'mode.speedtest': 'Test velocità', 'mode.challenge': 'Sfida', 'mode.game': 'Gioco', 'mode.hardcore': 'Hardcore', 'mode.reaction': 'Reazione',
      'stats.title': 'Statistiche', 'stats.history': 'Cronologia', 'stats.progress': 'Progresso', 'stats.achievements': 'Obiettivi', 'stats.leaderboard': 'Classifica', 'stats.session': 'Sessione', 'stats.activityHeatmap': 'Mappa attività', 'stats.activeDays': 'Giorni attivi', 'stats.totalSessions': 'Sessioni totali', 'stats.bestWpm': 'Miglior PPM', 'stats.bestAccuracy': 'Miglior precisione', 'stats.bestCpm': 'Miglior CPM', 'stats.longestStreak': 'Serie più lunga', 'stats.totalTime': 'Tempo totale', 'stats.weeklyComparison': 'Confronto settimanale', 'stats.thisWeek': 'Questa settimana', 'stats.lastWeek': 'Settimana scorsa', 'stats.charsTyped': 'Caratteri digitati', 'stats.less': 'meno', 'stats.more': 'più', 'stats.sessions': 'sessioni',
      'misc.theme': 'Tema', 'misc.themeAuto': 'Automatico', 'misc.sound': 'Suono', 'misc.keyboard': 'Tastiera', 'misc.language': 'Lingua', 'misc.settings': 'Impostazioni', 'misc.profile': 'Profilo', 'misc.help': 'Aiuto', 'misc.about': 'Info', 'misc.footer': 'FastFingers — Allenatore di dattilografia', 'misc.copyright': '© 2026 FastFingers', 'misc.fontSize': 'Dimensione testo', 'misc.highContrast': 'Contrasto elevato',
      'music.title': 'Musica', 'music.genre': 'Genere', 'music.tempo': 'Tempo', 'music.volume': 'Volume', 'music.key': 'Tonalità', 'music.playing': 'In riproduzione',
      'tip.posture': 'Postura', 'tip.postureDesc': 'Siediti dritto, schiena contro lo schienale. Distanza schermo 50-70 cm.', 'tip.hands': 'Posizione mani', 'tip.handsDesc': 'Gomiti a 90°, polsi non cadenti.', 'tip.home': 'Posizione base', 'tip.homeDesc': 'Sinistra: mignolo A, anulare S, medio D, indice F. Destra: indice J, medio K, anulare L, mignolo ;', 'tip.zones': 'Zone dita', 'tip.zonesDesc': 'Ogni dito ha tasti specifici. Gli indici sono i più attivi.', 'tip.look': 'Non guardare', 'tip.lookDesc': 'Regola d\'oro della dattilografia! Copri le mani se necessario.', 'tip.accuracy': 'Precisione prima', 'tip.accuracyDesc': 'Non cercare la velocità. Concentrati sulla tecnica corretta.', 'tip.regular': 'Pratica regolare', 'tip.regularDesc': 'Meglio 15 minuti al giorno che 2 ore una volta a settimana.', 'tip.games': 'Giochi', 'tip.gamesDesc': 'Usa sprint e sfide per variare gli allenamenti.', 'tip.breaks': 'Pause', 'tip.breaksDesc': 'Ogni 25-30 minuti, pausa di 5 minuti.', 'tip.exercise': 'Esercizi mani', 'tip.exerciseDesc': 'Ruota i polsi, stringi e apri i pugni.', 'tip.eyes': 'Ginnastica occhi', 'tip.eyesDesc': 'Ogni 20 minuti, guarda a 6 metri per 20 secondi.', 'tip.progress': 'Monitora progresso', 'tip.progressDesc': 'Celebra ogni risultato! Ogni piccolo passo conta.',
      'quote.practice1': 'La pratica rende perfetti.', 'quote.practice2': 'La costanza è più importante dell\'intensità.', 'quote.practice3': 'Le tue dita sanno più di quanto pensi.', 'quote.practice4': 'Il ritmo è più importante della velocità.',
      'quote.learning1': 'La velocità viene con la precisione.', 'quote.learning2': 'Ogni errore è un\'opportunità per imparare.', 'quote.learning3': 'La maestria è un viaggio, non una destinazione.', 'quote.learning4': 'Velocità senza precisione è solo sbagliare velocemente.', 'quote.learning5': 'Non guardare la tastiera.',
      'quote.motivation1': 'Non confrontarti con gli altri, confrontati con te stesso.', 'quote.motivation2': 'L\'unico modo per fare un grande lavoro è amare ciò che fai.', 'quote.motivation3': 'Non aver paura di sbagliare, ma di non provare.', 'quote.motivation4': 'Ogni esperto è stato un principiante.',
      'quote.success1': 'Il successo è la somma di piccoli sforzi ripetuti.', 'quote.success2': 'Il progresso può essere lento, ma la costanza paga.',
      'quote.fastfingers': 'FastFingers', 'quote.collier': 'Robert Collier', 'quote.jobs': 'Steve Jobs',
    }
  },
  pt: {
    translation: {
      'nav.practice': 'Prática', 'nav.sprint': 'Sprint', 'nav.test': 'Teste', 'nav.custom': 'Personalizado', 'nav.tips': 'Dicas', 'nav.week': 'Semanal', 'nav.game': 'Jogo', 'nav.learning': 'Aprendizado', 'nav.statistics': 'Estatísticas', 'nav.history': 'Histórico', 'nav.reaction': 'Reação',
      'common.wpm': 'PPM', 'common.cpm': 'CPM', 'common.accuracy': 'Precisão', 'common.errors': 'Erros', 'common.time': 'Tempo', 'common.level': 'Nível', 'common.xp': 'XP', 'common.streak': 'Sequência', 'common.days': 'dias', 'common.words': 'palavras', 'common.chars': 'caracteres', 'common.best': 'melhor', 'common.current': 'atual', 'common.total': 'total', 'common.speed': 'Velocidade',
      'status.completed': 'Concluído', 'status.failed': 'Falhou', 'status.inProgress': 'Em progresso', 'status.locked': 'Bloqueado', 'status.available': 'Disponível',
      'action.start': 'Iniciar', 'action.restart': 'Reiniciar', 'action.continue': 'Continuar', 'action.skip': 'Pular', 'action.save': 'Salvar', 'action.cancel': 'Cancelar', 'action.delete': 'Excluir', 'action.export': 'Exportar', 'action.import': 'Importar', 'action.edit': 'Editar', 'action.view': 'Ver', 'action.close': 'Fechar', 'action.confirm': 'Confirmar', 'action.back': 'Voltar', 'action.next': 'Próximo', 'action.previous': 'Anterior', 'action.submit': 'Enviar', 'action.loading': 'Carregando...', 'action.exit': 'Sair', 'action.retry': 'Tentar novamente', 'action.stop': 'Parar',
      'auth.login': 'Entrar', 'auth.register': 'Registrar', 'auth.logout': 'Sair', 'auth.email': 'Email', 'auth.password': 'Senha', 'auth.name': 'Nome', 'auth.forgotPassword': 'Esqueceu a senha?', 'auth.rememberMe': 'Lembrar-me', 'auth.noAccount': 'Sem conta?', 'auth.haveAccount': 'Já tem uma conta?', 'auth.confirmPassword': 'Confirmar senha', 'auth.changePassword': 'Alterar senha', 'auth.resetPassword': 'Redefinir senha', 'auth.sendResetLink': 'Enviar link de redefinição',
      'notification.levelUp': 'Nível aumentado', 'notification.achievement': 'Conquista desbloqueada', 'notification.challenge': 'Desafio concluído', 'notification.streak': 'Sequência mantida', 'notification.newDay': 'Novo dia', 'notification.dailyReward': 'Recompensa diária',
      'error.invalidEmail': 'Formato de email inválido', 'error.passwordTooShort': 'Senha mínima de 8 caracteres', 'error.passwordsMismatch': 'Senhas não coincidem', 'error.network': 'Erro de rede', 'error.server': 'Erro do servidor', 'error.unknown': 'Erro desconhecido', 'error.required': 'Campo obrigatório', 'error.tooShort': 'Muito curto', 'error.tooLong': 'Muito longo', 'error.weakPassword': 'Senha fraca', 'error.emailInUse': 'Email já em uso', 'error.userNotFound': 'Usuário não encontrado', 'error.wrongPassword': 'Senha incorreta',
      'exercise.mainRow': 'Linha principal', 'exercise.topRow': 'Linha superior', 'exercise.bottomRow': 'Linha inferior', 'exercise.words': 'Palavras', 'exercise.sentences': 'Frases', 'exercise.code': 'Código', 'exercise.custom': 'Personalizado',
      'mode.practice': 'Prática', 'mode.sprint': 'Sprint', 'mode.speedtest': 'Teste de velocidade', 'mode.challenge': 'Desafio', 'mode.game': 'Jogo', 'mode.hardcore': 'Hardcore', 'mode.reaction': 'Reação',
      'stats.title': 'Estatísticas', 'stats.history': 'Histórico', 'stats.progress': 'Progresso', 'stats.achievements': 'Conquistas', 'stats.leaderboard': 'Classificação', 'stats.session': 'Sessão', 'stats.activityHeatmap': 'Mapa de atividade', 'stats.activeDays': 'Dias ativos', 'stats.totalSessions': 'Sessões totais', 'stats.bestWpm': 'Melhor PPM', 'stats.bestAccuracy': 'Melhor precisão', 'stats.bestCpm': 'Melhor CPM', 'stats.longestStreak': 'Maior sequência', 'stats.totalTime': 'Tempo total', 'stats.weeklyComparison': 'Comparação semanal', 'stats.thisWeek': 'Esta semana', 'stats.lastWeek': 'Semana passada', 'stats.charsTyped': 'Caracteres digitados', 'stats.less': 'menos', 'stats.more': 'mais', 'stats.sessions': 'sessões',
      'misc.theme': 'Tema', 'misc.themeAuto': 'Automático', 'misc.sound': 'Som', 'misc.keyboard': 'Teclado', 'misc.language': 'Idioma', 'misc.settings': 'Configurações', 'misc.profile': 'Perfil', 'misc.help': 'Ajuda', 'misc.about': 'Sobre', 'misc.footer': 'FastFingers — Treinador de digitação', 'misc.copyright': '© 2026 FastFingers', 'misc.fontSize': 'Tamanho da fonte', 'misc.highContrast': 'Alto contraste',
      'music.title': 'Música', 'music.genre': 'Gênero', 'music.tempo': 'Tempo', 'music.volume': 'Volume', 'music.key': 'Tonalidade', 'music.playing': 'Reproduzindo',
      'tip.posture': 'Postura', 'tip.postureDesc': 'Sente-se reto, costas contra o encosto. Distância da tela 50-70 cm.', 'tip.hands': 'Posição das mãos', 'tip.handsDesc': 'Cotovelos a 90°, pulsos não caídos.', 'tip.home': 'Posição base', 'tip.homeDesc': 'Esquerda: mindinho A, anelar S, médio D, indicador F. Direita: indicador J, médio K, anelar L, mindinho ;', 'tip.zones': 'Zonas dos dedos', 'tip.zonesDesc': 'Cada dedo tem teclas específicas. Indicadores são os mais ativos.', 'tip.look': 'Não olhe', 'tip.lookDesc': 'Regra de ouro da digitação! Cubra as mãos se necessário.', 'tip.accuracy': 'Precisão primeiro', 'tip.accuracyDesc': 'Não busque velocidade. Foque na técnica correta.', 'tip.regular': 'Prática regular', 'tip.regularDesc': 'Melhor 15 minutos por dia que 2 horas uma vez por semana.', 'tip.games': 'Jogos', 'tip.gamesDesc': 'Use sprint e desafios para variar treinos.', 'tip.breaks': 'Pausas', 'tip.breaksDesc': 'A cada 25-30 minutos, pausa de 5 minutos.', 'tip.exercise': 'Exercícios das mãos', 'tip.exerciseDesc': 'Gire os pulsos, feche e abra os punhos.', 'tip.eyes': 'Ginástica ocular', 'tip.eyesDesc': 'A cada 20 minutos, olhe para 6 metros por 20 segundos.', 'tip.progress': 'Acompanhe progresso', 'tip.progressDesc': 'Comemore cada conquista! Cada pequeno passo conta.',
      'quote.practice1': 'A prática leva à perfeição.', 'quote.practice2': 'Consistência é mais importante que intensidade.', 'quote.practice3': 'Seus dedos sabem mais do que você pensa.', 'quote.practice4': 'Ritmo é mais importante que velocidade.',
      'quote.learning1': 'Velocidade vem com precisão.', 'quote.learning2': 'Cada erro é oportunidade de aprender.', 'quote.learning3': 'Maestria é uma jornada, não destino.', 'quote.learning4': 'Velocidade sem precisão é apenas errar rápido.', 'quote.learning5': 'Não olhe para o teclado.',
      'quote.motivation1': 'Não se compare com outros, compare-se com você mesmo.', 'quote.motivation2': 'Único modo de fazer grande trabalho é amar o que faz.', 'quote.motivation3': 'Não tenha medo de errar, mas de não tentar.', 'quote.motivation4': 'Todo expert já foi iniciante.',
      'quote.success1': 'Sucesso é soma de pequenos esforços repetidos.', 'quote.success2': 'Progresso pode ser lento, mas consistência compensa.',
      'quote.fastfingers': 'FastFingers', 'quote.collier': 'Robert Collier', 'quote.jobs': 'Steve Jobs',
    }
  },
  ja: {
    translation: {
      'nav.practice': '練習', 'nav.sprint': 'スプリント', 'nav.test': 'テスト', 'nav.custom': 'カスタム', 'nav.tips': 'ヒント', 'nav.week': '週間', 'nav.game': 'ゲーム', 'nav.learning': '学習', 'nav.statistics': '統計', 'nav.history': '履歴', 'nav.reaction': '反応',
      'common.wpm': 'WPM', 'common.cpm': 'CPM', 'common.accuracy': '精度', 'common.errors': 'エラー', 'common.time': '時間', 'common.level': 'レベル', 'common.xp': 'XP', 'common.streak': '連続', 'common.days': '日', 'common.words': '単語', 'common.chars': '文字', 'common.best': '最高', 'common.current': '現在', 'common.total': '合計', 'common.speed': '速度',
      'status.completed': '完了', 'status.failed': '失敗', 'status.inProgress': '進行中', 'status.locked': 'ロック', 'status.available': '利用可能',
      'action.start': '開始', 'action.restart': '再開', 'action.continue': '続行', 'action.skip': 'スキップ', 'action.save': '保存', 'action.cancel': 'キャンセル', 'action.delete': '削除', 'action.export': 'エクスポート', 'action.import': 'インポート', 'action.edit': '編集', 'action.view': '表示', 'action.close': '閉じる', 'action.confirm': '確認', 'action.back': '戻る', 'action.next': '次へ', 'action.previous': '前へ', 'action.submit': '送信', 'action.loading': '読込中...', 'action.exit': '終了', 'action.retry': '再試行', 'action.stop': '停止',
      'auth.login': 'ログイン', 'auth.register': '登録', 'auth.logout': 'ログアウト', 'auth.email': 'メール', 'auth.password': 'パスワード', 'auth.name': '名前', 'auth.forgotPassword': 'パスワードをお忘れ？', 'auth.rememberMe': 'ログイン状態を保持', 'auth.noAccount': 'アカウントをお持ちでない？', 'auth.haveAccount': '既にアカウントをお持ち？', 'auth.confirmPassword': 'パスワード確認', 'auth.changePassword': 'パスワード変更', 'auth.resetPassword': 'パスワードリセット', 'auth.sendResetLink': 'リセットリンクを送信',
      'notification.levelUp': 'レベルアップ', 'notification.achievement': '実績解除', 'notification.challenge': 'チャレンジ完了', 'notification.streak': '連続記録更新', 'notification.newDay': '新しい日', 'notification.dailyReward': 'デイリー報酬',
      'error.invalidEmail': '無効なメール形式', 'error.passwordTooShort': 'パスワードは 8 文字以上', 'error.passwordsMismatch': 'パスワードが一致しません', 'error.network': 'ネットワークエラー', 'error.server': 'サーバーエラー', 'error.unknown': '不明なエラー', 'error.required': '必須項目', 'error.tooShort': '短すぎます', 'error.tooLong': '長すぎます', 'error.weakPassword': '弱いパスワード', 'error.emailInUse': '既に使用されているメール', 'error.userNotFound': 'ユーザーが見つかりません', 'error.wrongPassword': 'パスワードが間違っています',
      'exercise.mainRow': 'ホーム列', 'exercise.topRow': '上段', 'exercise.bottomRow': '下段', 'exercise.words': '単語', 'exercise.sentences': '文', 'exercise.code': 'コード', 'exercise.custom': 'カスタム',
      'mode.practice': '練習', 'mode.sprint': 'スプリント', 'mode.speedtest': '速度テスト', 'mode.challenge': 'チャレンジ', 'mode.game': 'ゲーム', 'mode.hardcore': 'ハードコア', 'mode.reaction': '反応',
      'stats.title': '統計', 'stats.history': '履歴', 'stats.progress': '進捗', 'stats.achievements': '実績', 'stats.leaderboard': 'リーダーボード', 'stats.session': 'セッション', 'stats.activityHeatmap': 'アクティビティヒートマップ', 'stats.activeDays': 'アクティブ日', 'stats.totalSessions': '総セッション', 'stats.bestWpm': '最高 WPM', 'stats.bestAccuracy': '最高精度', 'stats.bestCpm': '最高 CPM', 'stats.longestStreak': '最長連続', 'stats.totalTime': '総時間', 'stats.weeklyComparison': '週間比較', 'stats.thisWeek': '今週', 'stats.lastWeek': '先週', 'stats.charsTyped': '入力文字数', 'stats.less': '少ない', 'stats.more': '多い', 'stats.sessions': 'セッション',
      'misc.theme': 'テーマ', 'misc.themeAuto': '自動', 'misc.sound': 'サウンド', 'misc.keyboard': 'キーボード', 'misc.language': '言語', 'misc.settings': '設定', 'misc.profile': 'プロフィール', 'misc.help': 'ヘルプ', 'misc.about': 'について', 'misc.footer': 'FastFingers — タイピングトレーナー', 'misc.copyright': '© 2026 FastFingers', 'misc.fontSize': 'フォントサイズ', 'misc.highContrast': 'ハイコントラスト',
      'music.title': '音楽', 'music.genre': 'ジャンル', 'music.tempo': 'テンポ', 'music.volume': '音量', 'music.key': 'キー', 'music.playing': '再生中',
      'tip.posture': '姿勢', 'tip.postureDesc': '背筋を伸ばし、画面から 50-70cm 離す。', 'tip.hands': '手の位置', 'tip.handsDesc': '肘を 90 度、手首を下げない。', 'tip.home': 'ホームポジション', 'tip.homeDesc': '左手：小指 A、薬指 S、中指 D、人差し指 F。右手：人差し指 J、中指 K、薬指 L、小指；', 'tip.zones': '指のゾーン', 'tip.zonesDesc': '各指に担当キーがある。人差し指が最も活発。', 'tip.look': '見ない', 'tip.lookDesc': 'ブラインドタッチの黄金律！必要なら手を隠す。', 'tip.accuracy': '精度重視', 'tip.accuracyDesc': '速度を追わない。正しい技術に集中。', 'tip.regular': '定期的な練習', 'tip.regularDesc': '週 1 回 2 時間より毎日 15 分。', 'tip.games': 'ゲーム', 'tip.gamesDesc': 'スプリントとチャレンジで変化を。', 'tip.breaks': '休憩', 'tip.breaksDesc': '25-30 分ごとに 5 分休憩。', 'tip.exercise': '手の運動', 'tip.exerciseDesc': '手首を回し、拳を握りしめる。', 'tip.eyes': '目の体操', 'tip.eyesDesc': '20 分ごとに 6 メートル先を 20 秒見る。', 'tip.progress': '進捗の追跡', 'tip.progressDesc': 'すべての成果を祝う！小さな一歩も重要。',
      'quote.practice1': '練習は完璧を作る。', 'quote.practice2': '継続は力なり。', 'quote.practice3': '指はあなたが思うより知っている。', 'quote.practice4': 'リズムは速度より重要。',
      'quote.learning1': '速度は精度と共に来る。', 'quote.learning2': '各エラーは学習の機会。', 'quote.learning3': '習得は旅であり、目的地ではない。', 'quote.learning4': '精度のない速度はただの速い間違い。', 'quote.learning5': 'キーボードを見ない。',
      'quote.motivation1': '他人と比較せず、昨日の自分と比較。', 'quote.motivation2': '偉大な仕事をする唯一の方法は愛すること。', 'quote.motivation3': '失敗を恐れるな、挑戦しないことを恐れろ。', 'quote.motivation4': 'すべての専門家は初心者だった。',
      'quote.success1': '成功は小さな努力の積み重ね。', 'quote.success2': '進歩は緩やかでも、継続は必ず報われる。',
      'quote.fastfingers': 'FastFingers', 'quote.collier': 'ロバート・コリアー', 'quote.jobs': 'スティーブ・ジョブズ',
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
    lng: 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en', 'zh', 'he', 'de', 'fr', 'es', 'it', 'pt', 'ja'],
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

i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'he' || lng === 'ar'
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
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
