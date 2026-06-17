import { useMemo } from 'react'
import { useAppTranslation } from '../i18n/config'
import { TypingStats, KeyHeatmapData } from '@/types'
import {
  generatePracticeRecommendations,
  PracticeRecommendation,
} from '@utils/practiceRecommendations'

interface PracticeRecommendationsProps {
  recentStats: TypingStats[]
  heatmap: KeyHeatmapData
  currentWpm: number
  currentAccuracy: number
  onActionClick?: (action: PracticeRecommendation['action']) => void
}

export function PracticeRecommendations({
  recentStats,
  heatmap,
  currentWpm,
  currentAccuracy,
  onActionClick,
}: PracticeRecommendationsProps) {
  const { t } = useAppTranslation()

  const recommendations = useMemo(
    () =>
      generatePracticeRecommendations(
        recentStats,
        heatmap,
        currentWpm,
        currentAccuracy
      ),
    [recentStats, heatmap, currentWpm, currentAccuracy]
  )

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>💡</span>
        {t('practiceRec.title')}
      </h3>

      <div className="space-y-3">
        {recommendations.map(rec => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onActionClick={onActionClick}
          />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-dark-700 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-dark-400">{t('practiceRec.priorityHigh')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-dark-400">{t('practiceRec.priorityMedium')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-dark-400">{t('practiceRec.priorityLow')}</span>
        </div>
      </div>
    </div>
  )
}

function RecommendationCard({
  recommendation,
  onActionClick,
}: {
  recommendation: PracticeRecommendation
  onActionClick?: (action: PracticeRecommendation['action']) => void
}) {
  const { t } = useAppTranslation()

  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-green-500/50 bg-green-500/10',
  }

  const priorityDots = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  const categoryIcons = {
    speed: '⚡',
    accuracy: '🎯',
    consistency: '📊',
    keys: '⌨️',
    general: '💡',
  }

  return (
    <div
      className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${priorityColors[recommendation.priority]}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{recommendation.icon}</div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-white flex items-center gap-2">
                {recommendation.title}
                <span className="text-xs px-2 py-0.5 bg-dark-800 rounded-full">
                  {categoryIcons[recommendation.category]}
                </span>
              </h4>
              <p className="text-sm text-dark-300 mt-1">
                {recommendation.description}
              </p>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${priorityDots[recommendation.priority]}`}
              title={t('practiceRec.priority', { priority: recommendation.priority })}
            />
          </div>

          {recommendation.action && onActionClick && (
            <button
              onClick={() => onActionClick(recommendation.action)}
              className="mt-3 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {getActionLabel(recommendation.action, t)}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function getActionLabel(action: PracticeRecommendation['action'], t: (key: string, params?: Record<string, string>) => string): string {
  if (!action) return ''

  switch (action.type) {
    case 'mode':
      return t('practiceRec.goToMode', { mode: getModeLabel(action.value, t) })
    case 'exercise':
      return t('practiceRec.startExercise')
    case 'setting':
      return t('practiceRec.changeSetting')
    default:
      return t('practiceRec.execute')
  }
}

function getModeLabel(mode: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    practice: t('practiceRec.modePractice'),
    sprint: t('practiceRec.modeSprint'),
    learning: t('practiceRec.modeLearning'),
    speedtest: t('practiceRec.modeSpeedtest'),
  }
  return labels[mode] || mode
}
