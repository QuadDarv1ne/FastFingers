import { TypingStats } from '../types'

/**
 * Утилиты для расширенной аналитики прогресса пользователя
 */

export interface ProgressTrend {
  direction: 'up' | 'down' | 'stable'
  percentage: number
  description: string
}

export interface TypingAnalytics {
  wpmTrend: ProgressTrend
  accuracyTrend: ProgressTrend
  consistencyScore: number
  improvementRate: number
  weakestKeys: string[]
  strongestKeys: string[]
  recommendations: string[]
}

/**
 * Вычисляет тренд на основе исторических данных
 */
export function calculateTrend(
  current: number,
  previous: number
): ProgressTrend {
  if (previous === 0) {
    return {
      direction: 'stable',
      percentage: 0,
      description: 'Недостаточно данных',
    }
  }

  const change = ((current - previous) / previous) * 100
  const absChange = Math.abs(change)

  if (absChange < 2) {
    return {
      direction: 'stable',
      percentage: absChange,
      description: 'Стабильно',
    }
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: absChange,
    description: change > 0 ? 'Улучшение' : 'Снижение',
  }
}

/**
 * Вычисляет оценку консистентности (стабильности результатов)
 */
export function calculateConsistency(stats: TypingStats[]): number {
  if (stats.length < 2) return 100

  const wpms = stats.map(s => s.wpm)
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length
  const variance =
    wpms.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpms.length
  const stdDev = Math.sqrt(variance)

  // Коэффициент вариации (CV)
  const cv = (stdDev / mean) * 100

  // Преобразуем в оценку от 0 до 100 (меньше вариация = выше оценка)
  return Math.max(0, Math.min(100, 100 - cv))
}

/**
 * Вычисляет скорость улучшения (WPM за сессию)
 */
export function calculateImprovementRate(stats: TypingStats[]): number {
  if (stats.length < 2) return 0

  const recentStats = stats.slice(-10)
  if (recentStats.length < 2) return 0

  const firstWpm = recentStats[0]?.wpm ?? 0
  const lastWpm = recentStats[recentStats.length - 1]?.wpm ?? 0

  return (lastWpm - firstWpm) / recentStats.length
}

/**
 * Анализирует клавиши с наибольшим количеством ошибок
 */
export function analyzeKeyPerformance(
  heatmap: Record<string, { errors: number; total: number; accuracy: number }>
): { weakest: string[]; strongest: string[] } {
  const keys = Object.entries(heatmap)
    .filter(([_, data]) => data.total >= 5) // Минимум 5 нажатий
    .sort((a, b) => a[1].accuracy - b[1].accuracy)

  return {
    weakest: keys.slice(0, 5).map(([key]) => key),
    strongest: keys.slice(-5).map(([key]) => key),
  }
}

/**
 * Генерирует персонализированные рекомендации
 */
export function generateRecommendations(
  analytics: Partial<TypingAnalytics>,
  stats: TypingStats[]
): string[] {
  const recommendations: string[] = []

  // Рекомендации по WPM
  if (analytics.wpmTrend?.direction === 'down') {
    recommendations.push(
      '📉 Скорость печати снизилась. Попробуйте режим обучения для отработки базовых навыков.'
    )
  } else if (analytics.wpmTrend?.direction === 'up') {
    recommendations.push(
      '🚀 Отличный прогресс! Продолжайте в том же духе.'
    )
  }

  // Рекомендации по точности
  const avgAccuracy =
    stats.reduce((sum, s) => sum + s.accuracy, 0) / stats.length
  if (avgAccuracy < 90) {
    recommendations.push(
      '🎯 Сосредоточьтесь на точности. Замедлитесь и печатайте аккуратнее.'
    )
  }

  // Рекомендации по консистентности
  if (
    analytics.consistencyScore !== undefined &&
    analytics.consistencyScore < 70
  ) {
    recommendations.push(
      '📊 Результаты нестабильны. Старайтесь тренироваться регулярно в одно и то же время.'
    )
  }

  // Рекомендации по проблемным клавишам
  if (analytics.weakestKeys && analytics.weakestKeys.length > 0) {
    recommendations.push(
      `⌨️ Проблемные клавиши: ${analytics.weakestKeys.join(', ')}. Создайте упражнение для их отработки.`
    )
  }

  // Общие рекомендации
  if (stats.length < 10) {
    recommendations.push(
      '💡 Продолжайте тренироваться! Для точной аналитики нужно больше данных.'
    )
  }

  return recommendations
}

/**
 * Полный анализ прогресса пользователя
 */
export function analyzeTypingProgress(
  recentStats: TypingStats[],
  heatmap: Record<string, { errors: number; total: number; accuracy: number }>
): TypingAnalytics {
  if (recentStats.length === 0) {
    return {
      wpmTrend: {
        direction: 'stable',
        percentage: 0,
        description: 'Нет данных',
      },
      accuracyTrend: {
        direction: 'stable',
        percentage: 0,
        description: 'Нет данных',
      },
      consistencyScore: 0,
      improvementRate: 0,
      weakestKeys: [],
      strongestKeys: [],
      recommendations: ['Начните тренироваться для получения аналитики!'],
    }
  }

  const midpoint = Math.floor(recentStats.length / 2)
  const firstHalf = recentStats.slice(0, midpoint)
  const secondHalf = recentStats.slice(midpoint)

  const avgWpmFirst =
    firstHalf.reduce((sum, s) => sum + s.wpm, 0) / firstHalf.length
  const avgWpmSecond =
    secondHalf.reduce((sum, s) => sum + s.wpm, 0) / secondHalf.length

  const avgAccFirst =
    firstHalf.reduce((sum, s) => sum + s.accuracy, 0) / firstHalf.length
  const avgAccSecond =
    secondHalf.reduce((sum, s) => sum + s.accuracy, 0) / secondHalf.length

  const wpmTrend = calculateTrend(avgWpmSecond, avgWpmFirst)
  const accuracyTrend = calculateTrend(avgAccSecond, avgAccFirst)
  const consistencyScore = calculateConsistency(recentStats)
  const improvementRate = calculateImprovementRate(recentStats)
  const { weakest, strongest } = analyzeKeyPerformance(heatmap)

  const analytics: TypingAnalytics = {
    wpmTrend,
    accuracyTrend,
    consistencyScore,
    improvementRate,
    weakestKeys: weakest,
    strongestKeys: strongest,
    recommendations: [],
  }

  analytics.recommendations = generateRecommendations(analytics, recentStats)

  return analytics
}
