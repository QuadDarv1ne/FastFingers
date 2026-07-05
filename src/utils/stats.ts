/**
 * Stats — Утилиты для расчёта статистики
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import type {
  TypingStats,
  KeyHeatmapData,
} from '../types'

export type KeyHeatmap = KeyHeatmapData

// Константы для calculateSessionXp
const XP_PER_10_SECONDS = 1
const XP_PERFECT_ACCURACY = 50
const XP_GREAT_ACCURACY = 30
const XP_GOOD_ACCURACY = 20
const XP_DECENT_ACCURACY = 10
const XP_HIGH_WPM = 50
const XP_MEDIUM_WPM = 30
const XP_LOW_WPM = 20
const PENALTY_PER_ERROR = 2

const ACCURACY_PERFECT = 95
const ACCURACY_GREAT = 90
const ACCURACY_GOOD = 85
const ACCURACY_DECENT = 80
const WPM_HIGH = 60
const WPM_MEDIUM = 40
const WPM_LOW = 20

/**
 * Расчёт статистики печати с защитой от некорректных значений
 */
export function calculateStats(
  correctChars: number,
  totalChars: number,
  errors: number,
  timeElapsed: number
): TypingStats {
  // Валидация входных параметров
  const safeCorrectChars = Math.max(0, Math.floor(correctChars) || 0)
  const safeTotalChars = Math.max(0, Math.floor(totalChars) || 0)
  const safeErrors = Math.max(0, Math.floor(errors) || 0)
  const safeTimeElapsed = Math.max(0, timeElapsed || 0)

  // При нулевом времени возвращаем 0 для WPM и CPM
  if (safeTimeElapsed === 0) {
    return {
      wpm: 0,
      cpm: 0,
      accuracy: safeTotalChars === 0 ? 100 : Math.min(100, Math.max(0, Math.round((safeCorrectChars / safeTotalChars) * 100))),
      errors: safeErrors,
      correctChars: safeCorrectChars,
      totalChars: safeTotalChars,
      timeElapsed: 0,
    }
  }

  const timeInMinutes = safeTimeElapsed / 60

  const cpm = Math.round(safeCorrectChars / timeInMinutes)
  const wpm = Math.round(safeCorrectChars / 5 / timeInMinutes)
  const accuracy = safeTotalChars > 0
    ? Math.min(100, Math.max(0, Math.round((safeCorrectChars / safeTotalChars) * 100)))
    : 100

  return {
    wpm,
    cpm,
    accuracy,
    errors: safeErrors,
    correctChars: safeCorrectChars,
    totalChars: safeTotalChars,
    timeElapsed: safeTimeElapsed,
  }
}

/**
 * Расчёт уровня пользователя на основе XP
 * @param xp - Текущий опыт пользователя
 * @returns Номер уровня (начиная с 1)
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Расчёт необходимого XP для следующего уровня
 * @param level - Номер уровня
 * @returns Количество XP, необходимое для достижения уровня
 */
export function xpForLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

/**
 * Расчёт прогресса до следующего уровня (0-100%)
 * @param xp - Текущий опыт пользователя
 * @returns Процент прогресса (0-100)
 */
export function calculateSessionXp(stats: TypingStats): number {
  let xp = Math.floor(stats.timeElapsed / 10) * XP_PER_10_SECONDS

  if (stats.accuracy >= ACCURACY_PERFECT) xp += XP_PERFECT_ACCURACY
  else if (stats.accuracy >= ACCURACY_GREAT) xp += XP_GREAT_ACCURACY
  else if (stats.accuracy >= ACCURACY_GOOD) xp += XP_GOOD_ACCURACY
  else if (stats.accuracy >= ACCURACY_DECENT) xp += XP_DECENT_ACCURACY

  if (stats.wpm >= WPM_HIGH) xp += XP_HIGH_WPM
  else if (stats.wpm >= WPM_MEDIUM) xp += XP_MEDIUM_WPM
  else if (stats.wpm >= WPM_LOW) xp += XP_LOW_WPM

  xp -= stats.errors * PENALTY_PER_ERROR

  return Math.max(0, xp)
}

const ACHIEVEMENT_CHECKS: Record<string, (p: { bestWpm: number; bestAccuracy: number; totalWordsTyped: number }, s: TypingStats) => boolean> = {
  'first-steps': (_, s) => s.wpm >= 10,
  'speed-demon': (p) => p.bestWpm >= 40,
  'accuracy-master': (p) => p.bestAccuracy >= 95,
  'word-warrior': (p) => p.totalWordsTyped >= 1000,
  'perfectionist': (_, s) => s.accuracy === 100 && s.wpm >= 30,
  'marathon': (p) => p.totalWordsTyped >= 10000,
}

export function checkAchievement(
  achievementId: string,
  progress: { bestWpm: number; bestAccuracy: number; totalWordsTyped: number },
  stats: TypingStats
): boolean {
  return ACHIEVEMENT_CHECKS[achievementId]?.(progress, stats) ?? false
}

export function updateKeyHeatmap(
  heatmap: KeyHeatmap,
  key: string,
  isCorrect: boolean
): KeyHeatmap {
  const existing = heatmap[key]
  const total = (existing?.total ?? 0) + 1
  const errors = (existing?.errors ?? 0) + (isCorrect ? 0 : 1)
  const accuracy = Math.round(((total - errors) / total) * 100)

  return {
    ...heatmap,
    [key]: { errors, total, accuracy },
  }
}

export function getHeatmapColor(accuracy: number): string {
  if (accuracy >= 95) return '#22c55e';
  if (accuracy >= 85) return '#84cc16';
  if (accuracy >= 75) return '#eab308';
  if (accuracy >= 60) return '#f97316';
  return '#ef4444';
}


