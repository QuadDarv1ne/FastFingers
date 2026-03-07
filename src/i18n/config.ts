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
