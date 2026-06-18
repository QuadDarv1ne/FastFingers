import type { TypingStats, KeyHeatmapData } from '../types'
import { analyzeTypingProgress } from './analytics'

export interface PracticeRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'speed' | 'accuracy' | 'consistency' | 'keys' | 'general'
  icon: string
  action?: {
    type: 'exercise' | 'mode' | 'setting'
    value: string
  }
}

/**
 * Генерирует персонализированные рекомендации для практики
 */
export function generatePracticeRecommendations(
  recentStats: TypingStats[],
  heatmap: KeyHeatmapData,
  currentWpm: number,
  currentAccuracy: number
): PracticeRecommendation[] {
  const recommendations: PracticeRecommendation[] = []

  if (recentStats.length === 0) {
    return getBeginnerRecommendations()
  }

  const analytics = analyzeTypingProgress(recentStats, heatmap)

  // Рекомендации по скорости
  if (currentWpm < 20) {
    recommendations.push({
      id: 'speed-beginner',
      title: 'Начните с основ',
      description:
        'Сосредоточьтесь на правильной постановке пальцев. Скорость придёт с практикой.',
      priority: 'high',
      category: 'speed',
      icon: '🌱',
      action: { type: 'mode', value: 'learning' },
    })
  } else if (currentWpm < 40 && analytics.wpmTrend.direction === 'down') {
    recommendations.push({
      id: 'speed-declining',
      title: 'Восстановите темп',
      description:
        'Ваша скорость снизилась. Попробуйте короткие спринты для разминки.',
      priority: 'high',
      category: 'speed',
      icon: '📉',
      action: { type: 'mode', value: 'sprint' },
    })
  } else if (currentWpm >= 40 && currentWpm < 60) {
    recommendations.push({
      id: 'speed-intermediate',
      title: 'Увеличьте скорость',
      description:
        'Вы на хорошем уровне! Практикуйте спринты для достижения 60 WPM.',
      priority: 'medium',
      category: 'speed',
      icon: '🚀',
      action: { type: 'mode', value: 'sprint' },
    })
  }

  // Рекомендации по точности
  if (currentAccuracy < 85) {
    recommendations.push({
      id: 'accuracy-low',
      title: 'Замедлитесь для точности',
      description:
        'Точность важнее скорости. Печатайте медленнее, но без ошибок.',
      priority: 'high',
      category: 'accuracy',
      icon: '🎯',
      action: { type: 'mode', value: 'practice' },
    })
  } else if (currentAccuracy < 95 && analytics.accuracyTrend.direction === 'down') {
    recommendations.push({
      id: 'accuracy-declining',
      title: 'Улучшите точность',
      description:
        'Ваша точность снижается. Сосредоточьтесь на правильности, а не на скорости.',
      priority: 'medium',
      category: 'accuracy',
      icon: '⚠️',
    })
  }

  // Рекомендации по консистентности
  if (analytics.consistencyScore < 70) {
    recommendations.push({
      id: 'consistency-low',
      title: 'Тренируйтесь регулярно',
      description:
        'Ваши результаты нестабильны. Старайтесь практиковаться каждый день в одно время.',
      priority: 'medium',
      category: 'consistency',
      icon: '📊',
    })
  }

  // Рекомендации по проблемным клавишам
  if (analytics.weakestKeys.length > 0) {
    const keys = analytics.weakestKeys.slice(0, 3).join(', ')
    recommendations.push({
      id: 'keys-weak',
      title: 'Отработайте проблемные клавиши',
      description: `Клавиши ${keys} требуют дополнительной практики. Создайте упражнение для них.`,
      priority: 'high',
      category: 'keys',
      icon: '⌨️',
      action: { type: 'exercise', value: 'custom' },
    })
  }

  // Рекомендации по улучшению
  if (analytics.improvementRate > 0 && analytics.improvementRate < 0.5) {
    recommendations.push({
      id: 'improvement-slow',
      title: 'Разнообразьте практику',
      description:
        'Прогресс замедлился. Попробуйте разные типы упражнений и режимы.',
      priority: 'medium',
      category: 'general',
      icon: '🔄',
    })
  } else if (analytics.improvementRate > 1) {
    recommendations.push({
      id: 'improvement-fast',
      title: 'Отличный прогресс!',
      description:
        'Вы быстро улучшаетесь! Продолжайте в том же духе и повышайте сложность.',
      priority: 'low',
      category: 'general',
      icon: '🌟',
    })
  }

  // Общие рекомендации
  if (recentStats.length < 10) {
    recommendations.push({
      id: 'general-more-practice',
      title: 'Больше практики',
      description:
        'Для точной аналитики нужно больше данных. Продолжайте тренироваться!',
      priority: 'low',
      category: 'general',
      icon: '💪',
    })
  }

  // Рекомендации по перерывам
  const avgSessionTime =
    recentStats.reduce((sum, s) => sum + s.timeElapsed, 0) / recentStats.length
  if (avgSessionTime > 600) {
    // более 10 минут
    recommendations.push({
      id: 'general-breaks',
      title: 'Делайте перерывы',
      description:
        'Длинные сессии могут привести к усталости. Делайте перерыв каждые 10 минут.',
      priority: 'medium',
      category: 'general',
      icon: '☕',
    })
  }

  // Сортировка по приоритету
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations.slice(0, 5) // Максимум 5 рекомендаций
}

/**
 * Рекомендации для начинающих
 */
function getBeginnerRecommendations(): PracticeRecommendation[] {
  return [
    {
      id: 'beginner-1',
      title: 'Начните с режима обучения',
      description:
        'Изучите правильную постановку пальцев и основные клавиши.',
      priority: 'high',
      category: 'general',
      icon: '📚',
      action: { type: 'mode', value: 'learning' },
    },
    {
      id: 'beginner-2',
      title: 'Практикуйте основной ряд',
      description:
        'Начните с клавиш ФЫВА ОЛДЖ (или ASDF JKL;) - это основа слепой печати.',
      priority: 'high',
      category: 'keys',
      icon: '⌨️',
      action: { type: 'exercise', value: 'home-row' },
    },
    {
      id: 'beginner-3',
      title: 'Не смотрите на клавиатуру',
      description:
        'Старайтесь печатать, не глядя на клавиши. Это главный навык слепой печати.',
      priority: 'high',
      category: 'general',
      icon: '👀',
    },
    {
      id: 'beginner-4',
      title: 'Точность важнее скорости',
      description:
        'Сначала научитесь печатать правильно, скорость придёт позже.',
      priority: 'medium',
      category: 'accuracy',
      icon: '🎯',
    },
    {
      id: 'beginner-5',
      title: 'Тренируйтесь регулярно',
      description:
        'Даже 10-15 минут ежедневной практики дадут отличные результаты.',
      priority: 'medium',
      category: 'general',
      icon: '📅',
    },
  ]
}

/**
 * Получить рекомендацию по категории
 */
export function getRecommendationsByCategory(
  recommendations: PracticeRecommendation[],
  category: PracticeRecommendation['category']
): PracticeRecommendation[] {
  return recommendations.filter(r => r.category === category)
}

/**
 * Получить приоритетные рекомендации
 */
export function getHighPriorityRecommendations(
  recommendations: PracticeRecommendation[]
): PracticeRecommendation[] {
  return recommendations.filter(r => r.priority === 'high')
}

/**
 * Форматировать рекомендацию для отображения
 */
export function formatRecommendation(rec: PracticeRecommendation): string {
  return `${rec.icon} ${rec.title}: ${rec.description}`
}
