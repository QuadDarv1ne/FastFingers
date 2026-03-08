import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from 'recharts'
import { TypingStats, TimeOfDayPerformance } from '@/types'
import { analyzeTimeOfDayPerformance } from '@/utils/stats'

interface CorrelationMatrixProps {
  sessions: (TypingStats & { timestamp: string })[]
}

/**
 * Correlation Matrix — связь времени суток с результатами
 * Показывает, в какое время пользователь показывает лучшие результаты
 */
export function CorrelationMatrix({ sessions }: CorrelationMatrixProps) {
  const timeData = useMemo(() => {
    return analyzeTimeOfDayPerformance(sessions)
  }, [sessions])

  if (timeData.length === 0 || timeData.every(d => d.sessions === 0)) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">🌡️</div>
        <h3 className="text-lg font-semibold mb-2">Нет данных для анализа</h3>
        <p className="text-dark-400">
          Проведите несколько тренировок в разное время суток
        </p>
      </div>
    )
  }

  // Преобразуем данные для графика
  const chartData = timeData.map(item => ({
    timeOfDay: getTimeLabel(item.timeOfDay),
    wpm: item.avgWpm,
    accuracy: item.avgAccuracy,
    sessions: item.sessions,
    icon: getTimeIcon(item.timeOfDay),
  }))

  // Определение лучшего времени
  const bestWpmTime = timeData.reduce((best, current) =>
    current.avgWpm > best.avgWpm ? current : best
  )
  const bestAccuracyTime = timeData.reduce((best, current) =>
    current.avgAccuracy > best.avgAccuracy ? current : best
  )

  // Цвета для времени суток
  const timeColors: Record<string, string> = {
    morning: '#fbbf24', // янтарный (рассвет)
    afternoon: '#3b82f6', // синий (день)
    evening: '#f97316', // оранжевый (закат)
    night: '#8b5cf6', // фиолетовый (ночь)
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🌡️</span>
        Время суток vs Результаты
      </h3>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {timeData.map(item => (
          <div
            key={item.timeOfDay}
            className={`p-4 rounded-xl border transition-all ${
              item.timeOfDay === bestWpmTime.timeOfDay
                ? 'bg-gradient-to-br from-primary-600/20 to-primary-500/10 border-primary-500/30'
                : 'bg-dark-800/50 border-dark-700/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getTimeIcon(item.timeOfDay)}</span>
              <p className="text-xs text-dark-400 font-medium">
                {getTimeLabel(item.timeOfDay)}
              </p>
            </div>
            <p className="text-2xl font-bold text-gradient">
              {item.avgWpm} WPM
            </p>
            <p className="text-xs text-dark-500 mt-1">
              {item.avgAccuracy}% точность
            </p>
            <p className="text-xs text-dark-600 mt-1">
              {item.sessions} тренировок
            </p>
          </div>
        ))}
      </div>

      {/* График */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timeOfDay"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: '12px' }}>
              <Label
                value="WPM"
                angle={-90}
                position="insideLeft"
                fill="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
            </YAxis>
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            >
              <Label
                value="Точность %"
                angle={90}
                position="insideRight"
                fill="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
            </YAxis>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar yAxisId="left" dataKey="wpm" name="WPM" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    timeColors[
                      Object.keys(timeColors).find(
                        k => getTimeLabel(k as TimeOfDayPerformance['timeOfDay']) === entry.timeOfDay
                      ) as keyof typeof timeColors
                    ]
                  }
                />
              ))}
            </Bar>
            <Bar
              yAxisId="right"
              dataKey="accuracy"
              name="Точность"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Рекомендации */}
      <div className="mt-6 pt-6 border-t border-dark-700">
        <h4 className="text-sm font-semibold text-dark-300 mb-3">
          💡 Инсайты:
        </h4>
        <div className="space-y-2 text-sm text-dark-400">
          {bestWpmTime.sessions > 0 && (
            <div className="flex items-start gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <span className="text-primary-400">⚡</span>
              <p>
                <strong>Лучшее время для скорости:</strong>{' '}
                {getTimeLabel(bestWpmTime.timeOfDay)} ({bestWpmTime.avgWpm} WPM).
                Планируйте важные тренировки на это время.
              </p>
            </div>
          )}
          {bestAccuracyTime.sessions > 0 &&
            bestAccuracyTime.timeOfDay !== bestWpmTime.timeOfDay && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-green-400">🎯</span>
                <p>
                  <strong>Лучшее время для точности:</strong>{' '}
                  {getTimeLabel(bestAccuracyTime.timeOfDay)} (
                  {bestAccuracyTime.avgAccuracy}%). Хорошо для работы над
                  ошибками.
                </p>
              </div>
            )}
          {timeData.some(t => t.sessions === 0) && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <span className="text-yellow-400">📊</span>
              <p>
                <strong>Недостаточно данных:</strong> Некоторые периоды суток
                не охвачены. Попробуйте тренироваться в разное время для
                полной картины.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getTimeLabel(timeOfDay: TimeOfDayPerformance['timeOfDay']): string {
  const labels: Record<TimeOfDayPerformance['timeOfDay'], string> = {
    morning: 'Утро (5-12)',
    afternoon: 'День (12-17)',
    evening: 'Вечер (17-22)',
    night: 'Ночь (22-5)',
  }
  return labels[timeOfDay]
}

function getTimeIcon(timeOfDay: TimeOfDayPerformance['timeOfDay']): string {
  const icons: Record<TimeOfDayPerformance['timeOfDay'], string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙',
  }
  return icons[timeOfDay]
}
