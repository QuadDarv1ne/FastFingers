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
 * Generates personalized practice recommendations
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

  // Speed recommendations
  if (currentWpm < 20) {
    recommendations.push({
      id: 'speed-beginner',
      title: 'Start with basics',
      description:
        'Focus on proper finger placement. Speed will come with practice.',
      priority: 'high',
      category: 'speed',
      icon: '🌱',
      action: { type: 'mode', value: 'learning' },
    })
  } else if (currentWpm < 40 && analytics.wpmTrend.direction === 'down') {
    recommendations.push({
      id: 'speed-declining',
      title: 'Restore your pace',
      description:
        'Your speed dropped. Try short sprints to warm up.',
      priority: 'high',
      category: 'speed',
      icon: '📉',
      action: { type: 'mode', value: 'sprint' },
    })
  } else if (currentWpm >= 40 && currentWpm < 60) {
    recommendations.push({
      id: 'speed-intermediate',
      title: 'Increase speed',
      description:
        'You are at a good level! Practice sprints to reach 60 WPM.',
      priority: 'medium',
      category: 'speed',
      icon: '🚀',
      action: { type: 'mode', value: 'sprint' },
    })
  }

  // Accuracy recommendations
  if (currentAccuracy < 85) {
    recommendations.push({
      id: 'accuracy-low',
      title: 'Slow down for accuracy',
      description:
        'Accuracy matters more than speed. Type slower but error-free.',
      priority: 'high',
      category: 'accuracy',
      icon: '🎯',
      action: { type: 'mode', value: 'practice' },
    })
  } else if (currentAccuracy < 95 && analytics.accuracyTrend.direction === 'down') {
    recommendations.push({
      id: 'accuracy-declining',
      title: 'Improve accuracy',
      description:
        'Your accuracy is declining. Focus on correctness, not speed.',
      priority: 'medium',
      category: 'accuracy',
      icon: '⚠️',
    })
  }

  // Consistency recommendations
  if (analytics.consistencyScore < 70) {
    recommendations.push({
      id: 'consistency-low',
      title: 'Practice regularly',
      description:
        'Your results are unstable. Try to practice every day at the same time.',
      priority: 'medium',
      category: 'consistency',
      icon: '📊',
    })
  }

  // Problem keys recommendations
  if (analytics.weakestKeys.length > 0) {
    const keys = analytics.weakestKeys.slice(0, 3).join(', ')
    recommendations.push({
      id: 'keys-weak',
      title: 'Practice problem keys',
      description: `Keys ${keys} need more practice. Create an exercise for them.`,
      priority: 'high',
      category: 'keys',
      icon: '⌨️',
      action: { type: 'exercise', value: 'custom' },
    })
  }

  // Improvement recommendations
  if (analytics.improvementRate > 0 && analytics.improvementRate < 0.5) {
    recommendations.push({
      id: 'improvement-slow',
      title: 'Vary your practice',
      description:
        'Progress has slowed. Try different exercise types and modes.',
      priority: 'medium',
      category: 'general',
      icon: '🔄',
    })
  } else if (analytics.improvementRate > 1) {
    recommendations.push({
      id: 'improvement-fast',
      title: 'Great progress!',
      description:
        'You are improving fast! Keep it up and increase the difficulty.',
      priority: 'low',
      category: 'general',
      icon: '🌟',
    })
  }

  // General recommendations
  if (recentStats.length < 10) {
    recommendations.push({
      id: 'general-more-practice',
      title: 'More practice',
      description:
        'More data is needed for accurate analytics. Keep training!',
      priority: 'low',
      category: 'general',
      icon: '💪',
    })
  }

  // Break recommendations
  const avgSessionTime =
    recentStats.reduce((sum, s) => sum + s.timeElapsed, 0) / recentStats.length
  if (avgSessionTime > 600) {
    // more than 10 minutes
    recommendations.push({
      id: 'general-breaks',
      title: 'Take breaks',
      description:
        'Long sessions can lead to fatigue. Take a break every 10 minutes.',
      priority: 'medium',
      category: 'general',
      icon: '☕',
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations.slice(0, 5) // Maximum 5 recommendations
}

/**
 * Beginner recommendations
 */
function getBeginnerRecommendations(): PracticeRecommendation[] {
  return [
    {
      id: 'beginner-1',
      title: 'Start with learning mode',
      description:
        'Learn proper finger placement and basic keys.',
      priority: 'high',
      category: 'general',
      icon: '📚',
      action: { type: 'mode', value: 'learning' },
    },
    {
      id: 'beginner-2',
      title: 'Practice the home row',
      description:
        'Start with ASDF JKL; keys — the foundation of touch typing.',
      priority: 'high',
      category: 'keys',
      icon: '⌨️',
      action: { type: 'exercise', value: 'home-row' },
    },
    {
      id: 'beginner-3',
      title: 'Don\'t look at the keyboard',
      description:
        'Try to type without looking at the keys. This is the key skill of touch typing.',
      priority: 'high',
      category: 'general',
      icon: '👀',
    },
    {
      id: 'beginner-4',
      title: 'Accuracy over speed',
      description:
        'First learn to type correctly, speed will come later.',
      priority: 'medium',
      category: 'accuracy',
      icon: '🎯',
    },
    {
      id: 'beginner-5',
      title: 'Practice regularly',
      description:
        'Even 10-15 minutes of daily practice will bring great results.',
      priority: 'medium',
      category: 'general',
      icon: '📅',
    },
  ]
}

/**
 * Get recommendations by category
 */
export function getRecommendationsByCategory(
  recommendations: PracticeRecommendation[],
  category: PracticeRecommendation['category']
): PracticeRecommendation[] {
  return recommendations.filter(r => r.category === category)
}

/**
 * Get high priority recommendations
 */
export function getHighPriorityRecommendations(
  recommendations: PracticeRecommendation[]
): PracticeRecommendation[] {
  return recommendations.filter(r => r.priority === 'high')
}

/**
 * Format recommendation for display
 */
export function formatRecommendation(rec: PracticeRecommendation): string {
  return `${rec.icon} ${rec.title}: ${rec.description}`
}
