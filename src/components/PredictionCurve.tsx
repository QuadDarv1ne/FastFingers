import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts'
import { TypingStats, WeeklyProgress } from '@/types'
import {
  calculateLearningVelocity,
  predictGoalAchievement,
} from '@/utils/stats'

interface PredictionCurveProps {
  sessions: (TypingStats & { timestamp: string })[]
  targetWpm?: number
}

/**
 * Prediction Curve — прогноз достижения цели
 * Показывает, когда пользователь достигнет целевого WPM
 */
export function PredictionCurve({
  sessions,
  targetWpm = 60,
}: PredictionCurveProps) {
  const [customTarget, setCustomTarget] = useState(targetWpm)

  const { weeklyData, prediction, chartData } = useMemo(() => {
    // Группировка сессий по неделям
    const weeklyMap = new Map<string, { wpm: number; count: number }[]>()

    sessions.forEach(session => {
      const date = new Date(session.timestamp)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = (weekStart.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]) as string

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, [])
      }
      const weekData = weeklyMap.get(weekKey)
      if (weekData) {
        weekData.push({ wpm: session.wpm, count: 1 })
      }
    })

    const weekly: WeeklyProgress[] = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => {
        const avg = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.wpm, 0) / data.length) : 0
        return { week: week || '', avgWpm: avg, sessions: data.length }
      }) as WeeklyProgress[]

    const velocity = calculateLearningVelocity(weekly)
    const lastWeekData = weekly.length > 0 ? weekly[weekly.length - 1] : undefined
    const currentWpm = lastWeekData?.avgWpm ?? 0

    // Прогноз достижения цели
    const pred = predictGoalAchievement(currentWpm, customTarget, velocity)

    // Генерация данных для графика прогноза
    const chart: Array<{
      week: string
      actual: number | null
      predicted: number | null
      target: number | null
    }> = []

    // Исторические данные
    weekly.forEach(w => {
      chart.push({
        week: formatWeek(w.week),
        actual: w.avgWpm,
        predicted: null,
        target: null,
      })
    })

    // Прогнозируемые данные
    if (pred.achievable && pred.weeks > 0 && velocity > 0) {
      const weeksToPredict = Math.min(Math.ceil(pred.weeks), 12)
      const lastWeek = weekly.length > 0 ? weekly[weekly.length - 1] : null
      const lastWeekDate = lastWeek?.week ? new Date(lastWeek.week) : new Date()

      for (let i = 1; i <= weeksToPredict; i++) {
        const futureDate = new Date(lastWeekDate)
        futureDate.setDate(futureDate.getDate() + i * 7)
        const predictedWpm = Math.round(currentWpm + velocity * i)

        chart.push({
          week: formatWeek(futureDate.toISOString()),
          actual: null,
          predicted: predictedWpm,
          target: null,
        })
      }
    }

    // Добавляем линию цели
    const targetPoint = {
      week: 'Цель',
      actual: null,
      predicted: null,
      target: customTarget,
    }

    return { weeklyData: weekly, prediction: pred, chartData: [...chart, targetPoint] }
  }, [sessions, customTarget])

  const hasData = chartData.length > 0 && chartData.some(d => d.actual !== null)

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📈</span>
        Прогноз достижения цели
      </h3>

      {/* Выбор цели */}
      <div className="mb-6">
        <label className="text-sm text-dark-400 mb-2 block">
          Целевой WPM:
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="20"
            max="150"
            step="5"
            value={customTarget}
            onChange={e => setCustomTarget(Number(e.target.value))}
            className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <span className="text-2xl font-bold text-gradient w-20 text-center">
            {customTarget}
          </span>
        </div>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-dark-800/50 rounded-xl">
          <p className="text-xs text-dark-400 mb-1">Текущий WPM</p>
          <p className="text-2xl font-bold text-gradient">
            {weeklyData.length > 0 ? weeklyData[weeklyData.length - 1]?.avgWpm ?? 0 : 0}
          </p>
        </div>
        <div className="p-4 bg-dark-800/50 rounded-xl">
          <p className="text-xs text-dark-400 mb-1">Прирост/нед</p>
          <p
            className={`text-2xl font-bold ${
              calculateLearningVelocity(weeklyData) > 0
                ? 'text-green-400'
                : calculateLearningVelocity(weeklyData) < 0
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}
          >
            {calculateLearningVelocity(weeklyData) > 0 ? '+' : ''}
            {calculateLearningVelocity(weeklyData)}
          </p>
        </div>
        <div className="p-4 bg-dark-800/50 rounded-xl">
          <p className="text-xs text-dark-400 mb-1">До цели</p>
          <p className="text-2xl font-bold text-primary-400">
            {prediction.achievable && prediction.weeks !== Infinity
              ? `${prediction.weeks} нед.`
              : '—'}
          </p>
        </div>
        <div className="p-4 bg-dark-800/50 rounded-xl">
          <p className="text-xs text-dark-400 mb-1">Дата цели</p>
          <p className="text-lg font-bold text-dark-300">
            {prediction.projectedDate
              ? new Date(prediction.projectedDate).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>
      </div>

      {/* График */}
      {hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.filter(d => d.week !== 'Цель')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="week"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }}>
                <Label
                  value="WPM"
                  angle={-90}
                  position="insideLeft"
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
              <ReferenceLine
                y={customTarget}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: `Цель: ${customTarget} WPM`,
                  fill: '#10b981',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Фактический"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', r: 4 }}
                name="Прогноз"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-dark-400">
          <p>Нет данных для построения графика</p>
        </div>
      )}

      {/* Рекомендации */}
      <div className="mt-6 pt-6 border-t border-dark-700">
        <h4 className="text-sm font-semibold text-dark-300 mb-3">
          💡 Прогноз:
        </h4>
        <div className="space-y-2 text-sm text-dark-400">
          {!prediction.achievable && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-red-400">⚠️</span>
              <p>
                <strong>Прогноз неблагоприятный:</strong> Ваш текущий прогресс
                не позволяет достичь цели. Увеличьте частоту тренировок или
                пересмотрите цель.
              </p>
            </div>
          )}
          {prediction.achievable && prediction.weeks === 0 && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-green-400">🎉</span>
              <p>
                <strong>Поздравляем</strong> Вы уже достигли цели в{' '}
                {customTarget} WPM. Установите новую цель.
              </p>
            </div>
          )}
          {prediction.achievable && prediction.weeks > 0 && (
            <>
              <div className="flex items-start gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <span className="text-primary-400">📅</span>
                <p>
                  <strong>Прогнозируемая дата достижения:</strong>{' '}
                  {new Date(prediction.projectedDate).toLocaleDateString(
                    'ru-RU',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                  . Продолжайте в том же духе
                </p>
              </div>
              {prediction.weeks > 12 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <span className="text-yellow-400">⏱️</span>
                  <p>
                    <strong>Долгосрочная цель:</strong> Для достижения цели
                    потребуется более 3 месяцев. Рассмотрите возможность
                    увеличения интенсивности тренировок.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function formatWeek(isoString: string | undefined): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const isCurrentWeek =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() <= now.getDate() &&
    date.getDate() >= now.getDate() - 7

  if (isCurrentWeek) return 'Эта неделя'

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}
