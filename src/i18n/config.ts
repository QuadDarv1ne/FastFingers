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

export type SupportedLanguage = 'ru' | 'en' | 'zh' | 'he'

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
      'misc.sound': '声音',
      'misc.keyboard': '键盘',
      'misc.language': '语言',
      'misc.settings': '设置',
      'misc.profile': '个人资料',
      'misc.help': '帮助',
      'misc.about': '关于',
      'misc.footer': 'FastFingers — 打字训练器',
      'misc.copyright': '© 2026 FastFingers',
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
      'misc.sound': 'צליל',
      'misc.keyboard': 'מקלדת',
      'misc.language': 'שפה',
      'misc.settings': 'הגדרות',
      'misc.profile': 'פרופיל',
      'misc.help': 'עזרה',
      'misc.about': 'אודות',
      'misc.footer': 'FastFingers — מאמן הקלדה עיוורת',
      'misc.copyright': '© 2026 FastFingers',
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
  }
}

// ============================================
// Инициализация i18n
// ============================================

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: undefined,
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en', 'zh', 'he'],
    interpolation: {
      escapeValue: false,
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

i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'he'
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
