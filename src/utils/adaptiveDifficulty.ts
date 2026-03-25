/**
 * FastFingers — Адаптивная сложность
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { TypingStats } from '../types'
import { PracticeText } from '../data/practiceTexts'

export interface AdaptiveDifficultyState {
  currentLevel: number // 1-10
  targetWpm: number
  targetAccuracy: number
  consecutiveSuccesses: number
  consecutiveFailures: number
  history: DifficultyAdjustment[]
  lastAdjustment: number | null
}

export interface DifficultyAdjustment {
  timestamp: number
  previousLevel: number
  newLevel: number
  reason: 'speed_increase' | 'speed_decrease' | 'accuracy_increase' | 'accuracy_decrease' | 'manual'
  wpm: number
  accuracy: number
}

export interface AdaptiveTextSelection {
  text: PracticeText
  reason: string
  difficultyDelta: number
}

const MIN_LEVEL = 1
const MAX_LEVEL = 10
const SUCCESS_THRESHOLD = 3 // Повышаем уровень после 3 успешных сессий
const FAILURE_THRESHOLD = 2 // Понижаем уровень после 2 провальных сессий

/**
 * Создаёт начальное состояние адаптивной сложности
 */
export function createAdaptiveState(): AdaptiveDifficultyState {
  return {
    currentLevel: 5, // Начинаем со среднего уровня
    targetWpm: 40,
    targetAccuracy: 90,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    history: [],
    lastAdjustment: null,
  }
}

/**
 * Оценивает успешность сессии
 */
export function evaluateSession(
  stats: TypingStats,
  state: AdaptiveDifficultyState
): { success: boolean; metrics: SessionMetrics } {
  const metrics: SessionMetrics = {
    wpmScore: calculateWpmScore(stats.wpm, state.targetWpm),
    accuracyScore: calculateAccuracyScore(stats.accuracy, state.targetAccuracy),
    consistencyScore: calculateConsistencyScore(stats),
    overallScore: 0,
  }

  metrics.overallScore = (metrics.wpmScore + metrics.accuracyScore + metrics.consistencyScore) / 3

  // Успешная сессия: общий score > 70% и точность > 85%
  const success = metrics.overallScore >= 0.7 && stats.accuracy >= 85

  return { success, metrics }
}

export interface SessionMetrics {
  wpmScore: number
  accuracyScore: number
  consistencyScore: number
  overallScore: number
}

function calculateWpmScore(currentWpm: number, targetWpm: number): number {
  if (currentWpm >= targetWpm) return 1.0
  return Math.max(0, currentWpm / targetWpm)
}

function calculateAccuracyScore(currentAccuracy: number, targetAccuracy: number): number {
  if (currentAccuracy >= targetAccuracy) return 1.0
  return Math.max(0, currentAccuracy / targetAccuracy)
}

function calculateConsistencyScore(stats: TypingStats): number {
  // Используем стандартное отклонение WPM если доступно
  if ('wpmStdDev' in stats && stats.wpmStdDev != null) {
    // Меньше отклонение = выше консистентность
    return Math.max(0, 1 - (stats.wpmStdDev as number) / 50)
  }
  // Fallback: используем соотношение ошибок
  const errorRate = 1 - stats.accuracy / 100
  return Math.max(0, 1 - errorRate * 2)
}

/**
 * Обновляет состояние адаптивной сложности после сессии
 */
export function updateAdaptiveState(
  state: AdaptiveDifficultyState,
  sessionResult: { success: boolean; metrics: SessionMetrics },
  stats: TypingStats
): AdaptiveDifficultyState {
  const newState = { ...state }
  const adjustment: DifficultyAdjustment = {
    timestamp: Date.now(),
    previousLevel: state.currentLevel,
    newLevel: state.currentLevel,
    reason: 'manual',
    wpm: stats.wpm,
    accuracy: stats.accuracy,
  }

  if (sessionResult.success) {
    newState.consecutiveSuccesses++
    newState.consecutiveFailures = 0

    // Повышаем уровень после SUCCESS_THRESHOLD успешных сессий
    if (newState.consecutiveSuccesses >= SUCCESS_THRESHOLD && state.currentLevel < MAX_LEVEL) {
      newState.currentLevel++
      newState.targetWpm = Math.round(state.targetWpm * 1.1) // +10% к целевой скорости
      newState.targetAccuracy = Math.min(98, state.targetAccuracy + 1) // +1% к точности (макс 98%)
      newState.consecutiveSuccesses = 0
      adjustment.newLevel = newState.currentLevel
      adjustment.reason = 'speed_increase'
      newState.lastAdjustment = Date.now()
    }
  } else {
    newState.consecutiveFailures++
    newState.consecutiveSuccesses = 0

    // Понижаем уровень после FAILURE_THRESHOLD провальных сессий
    if (newState.consecutiveFailures >= FAILURE_THRESHOLD && state.currentLevel > MIN_LEVEL) {
      newState.currentLevel--
      newState.targetWpm = Math.round(state.targetWpm * 0.9) // -10% к целевой скорости
      newState.targetAccuracy = Math.max(80, state.targetAccuracy - 2) // -2% к точности (мин 80%)
      newState.consecutiveFailures = 0
      adjustment.newLevel = newState.currentLevel
      adjustment.reason = 'speed_decrease'
      newState.lastAdjustment = Date.now()
    }
  }

  // Добавляем запись в историю
  if (adjustment.newLevel !== adjustment.previousLevel) {
    newState.history = [...state.history, adjustment].slice(-50) // Храним последние 50 изменений
  }

  return newState
}

/**
 * Выбирает текст на основе текущего уровня сложности
 */
export function selectAdaptiveText(
  texts: PracticeText[],
  state: AdaptiveDifficultyState,
  recentPerformance?: { wpm: number; accuracy: number }
): AdaptiveTextSelection | null {
  if (texts.length === 0) return null

  // Определяем целевую сложность на основе уровня
  const targetDifficulty = calculateTargetDifficulty(state.currentLevel)

  // Если есть данные о недавней производительности, корректируем сложность
  let adjustedDifficulty = targetDifficulty
  if (recentPerformance) {
    if (recentPerformance.accuracy < 80) {
      adjustedDifficulty = Math.max(MIN_LEVEL, targetDifficulty - 1)
    } else if (recentPerformance.accuracy > 95 && recentPerformance.wpm > state.targetWpm * 1.2) {
      adjustedDifficulty = Math.min(MAX_LEVEL, targetDifficulty + 1)
    }
  }

  // Находим тексты с подходящей сложностью
  let suitableTexts = texts.filter(t => {
    const diffDelta = Math.abs(t.difficulty - adjustedDifficulty)
    return diffDelta <= 2 // Допускаем отклонение на 2 уровня
  })

  // Если не нашли подходящих текстов, берём все
  if (suitableTexts.length === 0) {
    suitableTexts = texts
  }

  // Выбираем случайный текст из подходящих
  const selectedText = suitableTexts[Math.floor(Math.random() * suitableTexts.length)]
  if (!selectedText) return null

  const difficultyDelta = selectedText.difficulty - adjustedDifficulty

  let reason = `Уровень ${state.currentLevel}, целевая сложность ${adjustedDifficulty}`
  if (difficultyDelta > 0) {
    reason += ' (текст сложнее целевого)'
  } else if (difficultyDelta < 0) {
    reason += ' (текст проще целевого)'
  }

  return {
    text: selectedText,
    reason,
    difficultyDelta,
  }
}

function calculateTargetDifficulty(level: number): number {
  // Уровень 1 = сложность 1-2
  // Уровень 5 = сложность 4-6
  // Уровень 10 = сложность 8-9
  const base = Math.floor((level - 1) / 2) + 1
  return Math.min(9, Math.max(1, base))
}

/**
 * Получает множитель сложности для текста
 */
export function getDifficultyMultiplier(level: number): number {
  // Уровень 1 = 0.5x, Уровень 5 = 1.0x, Уровень 10 = 2.0x
  return 0.5 + (level - 1) * 0.15
}

/**
 * Получает описание текущего уровня
 */
export function getLevelDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: 'Новичок',
    2: 'Начинающий',
    3: 'Ученик',
    4: 'Практик',
    5: 'Средний',
    6: 'Продвинутый',
    7: 'Опытный',
    8: 'Эксперт',
    9: 'Мастер',
    10: 'Легенда',
  }
  return descriptions[level] ?? 'Средний'
}

/**
 * Получает значок уровня
 */
export function getLevelBadge(level: number): string {
  const badges: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🪴',
    4: '🌳',
    5: '⭐',
    6: '⭐⭐',
    7: '⭐⭐⭐',
    8: '🏆',
    9: '👑',
    10: '💎',
  }
  return badges[level] ?? '⭐'
}

/**
 * Анализирует историю изменений сложности
 */
export function analyzeDifficultyHistory(
  history: DifficultyAdjustment[],
  windowSize = 10
): DifficultyTrend {
  if (history.length === 0) {
    return {
      direction: 'stable',
      averageLevel: 0,
      volatility: 0,
      totalAdjustments: 0,
    }
  }

  const recent = history.slice(-windowSize)
  const levels = recent.map(h => h.newLevel)
  const averageLevel = levels.reduce((a, b) => a + b, 0) / levels.length

  // Определяем направление тренда
  const firstHalf = levels.slice(0, Math.floor(levels.length / 2))
  const secondHalf = levels.slice(Math.floor(levels.length / 2))
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  let direction: 'up' | 'down' | 'stable' = 'stable'
  if (secondAvg > firstAvg + 0.5) direction = 'up'
  else if (secondAvg < firstAvg - 0.5) direction = 'down'

  // Вычисляем волатильность (стандартное отклонение)
  const variance = levels.reduce((sum, level) => sum + Math.pow(level - averageLevel, 2), 0) / levels.length
  const volatility = Math.sqrt(variance)

  return {
    direction,
    averageLevel: Math.round(averageLevel * 10) / 10,
    volatility: Math.round(volatility * 100) / 100,
    totalAdjustments: history.length,
  }
}

export interface DifficultyTrend {
  direction: 'up' | 'down' | 'stable'
  averageLevel: number
  volatility: number
  totalAdjustments: number
}

/**
 * Сбрасывает состояние адаптивной сложности
 */
export function resetAdaptiveState(): AdaptiveDifficultyState {
  return createAdaptiveState()
}

/**
 * Сериализует состояние для сохранения
 */
export function serializeAdaptiveState(state: AdaptiveDifficultyState): string {
  return JSON.stringify(state)
}

/**
 * Десериализует состояние из JSON
 */
export function deserializeAdaptiveState(json: string): AdaptiveDifficultyState {
  try {
    const parsed = JSON.parse(json)
    return {
      ...createAdaptiveState(),
      ...parsed,
      history: parsed.history || [],
    }
  } catch {
    return createAdaptiveState()
  }
}
