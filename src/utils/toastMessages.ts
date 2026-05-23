/**
 * FastFingers — Утилиты для toast-уведомлений
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { ToastType } from '../contexts/ToastContext'

export interface ToastMessage {
  success: string
  error: string
  info?: string
}

export interface AchievementToast {
  type: 'achievement'
  title: string
  description: string
  icon: string
}

export interface MilestoneToast {
  type: 'milestone'
  title: string
  value: number | string
  icon: string
}

export interface LevelUpToast {
  type: 'levelup'
  level: number
  title: string
  icon: string
}

/**
 * Создаёт toast для достижения
 */
export function createAchievementToast(
  title: string,
  description: string,
  icon: string
): AchievementToast {
  return {
    type: 'achievement',
    title,
    description,
    icon,
  }
}

/**
 * Создаёт toast для рекорда
 */
export function createMilestoneToast(
  title: string,
  value: number | string,
  icon: string
): MilestoneToast {
  return {
    type: 'milestone',
    title,
    value,
    icon,
  }
}

/**
 * Создаёт toast для повышения уровня
 */
export function createLevelUpToast(
  level: number,
  title: string,
  icon: string = '🎉'
): LevelUpToast {
  return {
    type: 'levelup',
    level,
    title,
    icon,
  }
}

/**
 * Сообщения для успешных действий
 */
export const SUCCESS_MESSAGES: Record<string, string> = {
  sessionComplete: 'Сессия завершена! Отличная работа!',
  newRecord: 'Новый рекорд! Поздравляем!',
  challengeComplete: 'Челлендж выполнен! +100 XP',
  levelUp: 'Уровень повышен! Продолжайте в том же духе!',
  settingsSaved: 'Настройки сохранены',
  exerciseCreated: 'Упражнение создано',
  exportSuccess: 'Экспорт выполнен успешно',
  importSuccess: 'Данные импортированы',
}

/**
 * Сообщения для ошибок
 */
export const ERROR_MESSAGES: Record<string, string> = {
  sessionError: 'Ошибка при сохранении сессии',
  exportError: 'Ошибка экспорта',
  importError: 'Ошибка импорта данных',
  settingsError: 'Не удалось сохранить настройки',
  networkError: 'Ошибка сети. Проверьте подключение.',
  unknownError: 'Произошла неизвестная ошибка',
}

/**
 * Сообщения для информационных уведомлений
 */
export const INFO_MESSAGES: Record<string, string> = {
  sessionStarted: 'Сессия началась. Удачи!',
  autoSaveEnabled: 'Автосохранение включено',
  offlineMode: 'Режим офлайн. Данные сохраняются локально.',
  practiceStreak: 'Серия: {{days}} дней подряд! 🔥',
  dailyChallenge: 'Ежедневный челлендж доступен!',
}

/**
 * Получает toast сообщение для завершения сессии
 */
export function getSessionCompleteToast(
  wpm: number,
  accuracy: number
): ToastMessage {
  return {
    success: `Сессия завершена! WPM: ${wpm}, Точность: ${accuracy}%`,
    error: 'Ошибка при сохранении статистики',
    info: 'Статистика сохранена в историю',
  }
}

/**
 * Получает toast сообщение для нового рекорда
 */
export function getNewRecordToast(
  metric: string,
  value: number
): ToastMessage {
  return {
    success: `Новый рекорд: ${metric} = ${value}! 🏆`,
    error: 'Ошибка при сохранении рекорда',
    info: `Предыдущий рекорд был превзойдён`,
  }
}

/**
 * Определяет тип toast на основе производительности
 */
export function getPerformanceToastType(
  wpm: number,
  accuracy: number,
  avgWpm: number
): ToastType {
  if (accuracy >= 95 && wpm > avgWpm * 1.2) {
    return 'success'
  }
  if (accuracy < 80) {
    return 'warning'
  }
  return 'info'
}

/**
 * Получает сообщение для toast на основе производительности
 */
export function getPerformanceToastMessage(
  wpm: number,
  accuracy: number,
  avgWpm: number
): string {
  if (accuracy >= 95 && wpm > avgWpm * 1.2) {
    return `Отличная работа! WPM: ${wpm}, Точность: ${accuracy}% 🌟`
  }
  if (accuracy < 80) {
    return `Точность ниже обычной (${accuracy}%). Сосредоточьтесь на правильности.`
  }
  if (wpm < avgWpm * 0.8) {
    return `Скорость ниже обычной (${wpm} WPM). Отдохните и попробуйте снова.`
  }
  return `Сессия завершена. WPM: ${wpm}, Точность: ${accuracy}%`
}
