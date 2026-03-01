import { useMemo } from 'react'
import { TypingStats, KeyHeatmapData } from '@/types'
import { analyzeTypingProgress, TypingAnalytics } from '@utils/analytics'

interface AdvancedAnalyticsProps {
  recentStats: TypingStats[]
  heatmap: KeyHeatmapData
  onClose: () => void
}

/**
 * Компонент расширенной аналитики прогресса
 */
export function AdvancedAnalytics({
  recentStats,
  heatmap,
  onClose,
}: AdvancedAnalyticsProps) {
  const analytics: TypingAnalytics = useMemo(
    () => analyzeTypingProgress(recentStats, heatmap),
    [recentStats, heatmap]
  )

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '➡️'
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">📊 Расширенная аналитика</h2>
            <p className="text-dark-400 text-sm mt-1">
              Детальный анализ вашего прогресса
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
            aria-label="Закрыть"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Тренды */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WPM Тренд */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Скорость печати</h3>
                <span className="text-2xl">
                  {getTrendIcon(analytics.wpmTrend.direction)}
                </span>
              </div>
              <div className="space-y-2">
                <div
                  className={`text-3xl font-bold ${getTrendColor(analytics.wpmTrend.direction)}`}
                >
                  {analytics.wpmTrend.direction === 'stable'
                    ? analytics.wpmTrend.description
                    : `${analytics.wpmTrend.percentage.toFixed(1)}%`}
                </div>
                <p className="text-dark-400 text-sm">
                  {analytics.wpmTrend.description}
                </p>
              </div>
            </div>

            {/* Accuracy Тренд */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Точность</h3>
                <span className="text-2xl">
                  {getTrendIcon(analytics.accuracyTrend.direction)}
                </span>
              </div>
              <div className="space-y-2">
                <div
                  className={`text-3xl font-bold ${getTrendColor(analytics.accuracyTrend.direction)}`}
                >
                  {analytics.accuracyTrend.direction === 'stable'
                    ? analytics.accuracyTrend.description
                    : `${analytics.accuracyTrend.percentage.toFixed(1)}%`}
                </div>
                <p className="text-dark-400 text-sm">
                  {analytics.accuracyTrend.description}
                </p>
              </div>
            </div>
          </div>

          {/* Консистентность и улучшение */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Консистентность */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">
                Стабильность результатов
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Оценка:</span>
                  <span
                    className={`text-2xl font-bold ${getConsistencyColor(analytics.consistencyScore)}`}
                  >
                    {analytics.consistencyScore.toFixed(0)}/100
                  </span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analytics.consistencyScore >= 80
                        ? 'bg-green-500'
                        : analytics.consistencyScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${analytics.consistencyScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Скорость улучшения */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">
                Скорость прогресса
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">WPM за сессию:</span>
                  <span
                    className={`text-2xl font-bold ${
                      analytics.improvementRate > 0
                        ? 'text-green-500'
                        : analytics.improvementRate < 0
                          ? 'text-red-500'
                          : 'text-gray-500'
                    }`}
                  >
                    {analytics.improvementRate > 0 ? '+' : ''}
                    {analytics.improvementRate.toFixed(2)}
                  </span>
                </div>
                <p className="text-dark-400 text-sm">
                  {analytics.improvementRate > 0
                    ? 'Вы улучшаетесь с каждой тренировкой!'
                    : analytics.improvementRate < 0
                      ? 'Возможно, стоит отдохнуть'
                      : 'Стабильные результаты'}
                </p>
              </div>
            </div>
          </div>

          {/* Проблемные и сильные клавиши */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Проблемные клавиши */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>⚠️</span>
                Проблемные клавиши
              </h3>
              {analytics.weakestKeys.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.weakestKeys.map(key => (
                    <span
                      key={key}
                      className="px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg font-mono text-sm"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-dark-400 text-sm">
                  Недостаточно данных для анализа
                </p>
              )}
            </div>

            {/* Сильные клавиши */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>✨</span>
                Сильные клавиши
              </h3>
              {analytics.strongestKeys.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.strongestKeys.map(key => (
                    <span
                      key={key}
                      className="px-3 py-2 bg-green-500/20 border border-green-500/50 rounded-lg font-mono text-sm"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-dark-400 text-sm">
                  Недостаточно данных для анализа
                </p>
              )}
            </div>
          </div>

          {/* Рекомендации */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>💡</span>
              Персональные рекомендации
            </h3>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-dark-800/50 rounded-lg"
                >
                  <span className="text-primary-500 font-bold">
                    {index + 1}.
                  </span>
                  <p className="text-sm flex-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
