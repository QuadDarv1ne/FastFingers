interface NotificationData {
  type: 'achievement' | 'challenge' | 'streak' | 'level' | 'info'
  title: string
  message: string
  icon: string
}

/**
 * Создать уведомление о достижении
 */
export const createAchievementNotification = (achievement: { title: string; description: string; icon: string }): NotificationData => ({
  type: 'achievement',
  title: '🏆 Достижение разблокировано!',
  message: achievement.title,
  icon: achievement.icon,
})

/**
 * Создать уведомление о повышении уровня
 */
export const createLevelUpNotification = (level: number): NotificationData => ({
  type: 'level',
  title: '⭐ Уровень повышен!',
  message: `Вы достигли ${level} уровня!`,
  icon: '🎉',
})

/**
 * Создать уведомление о серии
 */
export const createStreakNotification = (days: number, bonus: number): NotificationData => ({
  type: 'streak',
  title: '🔥 Серия!',
  message: `${days} дней подряд! +${bonus} XP бонус`,
  icon: '💪',
})

/**
 * Создать уведомление о завершении челленджа
 */
export const createChallengeCompleteNotification = (wpm: number): NotificationData => ({
  type: 'challenge',
  title: '✅ Челлендж завершён!',
  message: `Ваша скорость: ${wpm} WPM`,
  icon: '🎯',
})
