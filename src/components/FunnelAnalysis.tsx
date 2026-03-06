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
  LabelList,
} from 'recharts'
import { TypingStats } from '@/types'
import { analyzeFunnel } from '@/utils/stats'

interface FunnelAnalysisProps {
  sessions: (TypingStats & { timestamp: string })[]
  thresholds?: {
    started: number
    completed50: number // секунды
    completed80: number // секунды
    completed100: number // секунды
    highAccuracy: number // процент
  }
}

/**
 * Funnel Analysis — анализ оттока пользователей
 * Показывает, на каких этапах пользователи бросают тренировки
 */
export function FunnelAnalysis({ sessions, thresholds }: FunnelAnalysisProps) {
  const funnelData = useMemo(() => {
    const defaultThresholds = {
      started: 0,
      completed50: 30, // 30 секунд
      completed80: 60, // 60 секунд
      completed100: 90, // 90 секунд
      highAccuracy: 90, // 90% точность
    }

    const usedThresholds = thresholds || defaultThresholds
    return analyzeFunnel(sessions, usedThresholds)
  }, [sessions, thresholds])

  if (funnelData.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">Нет данных для анализа</h3>
        <p className="text-dark-400">
          Проведите несколько тренировок для анализа воронки
        </p>
      </div>
    )
  }

  // Цвета для каждого этапа воронки
  const colors = [
    '#8b5cf6', // Начали
    '#7c3aed', // 50%
    '#6d28d9', // 80%
    '#5b21b6', // 100%
    '#10b981', // Высокая точность
  ]

  // Преобразуем данные для горизонтальной воронки
  const chartData = funnelData.map((stage, index) => ({
    name: stage.stage,
    value: stage.percentage,
    count: stage.count,
    fill: colors[index % colors.length],
  }))

  // Расчёт ключевых метрик воронки
  const dropOffRate = funnelData.length > 1
    ? Math.round(100 - (funnelData[funnelData.length - 1]?.percentage ?? 0))
    : 0

  const completionRate =
    funnelData.find(f => f.stage === '100% сессии')?.percentage ?? 0

  const highAccuracyRate =
    funnelData.find(f => f.stage === 'Высокая точность')?.percentage ?? 0

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📊</span>
        Воронка тренировок
      </h3>

      {/* KPI карточки */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-dark-800/50 rounded-xl">
          <p className="text-xs text-dark-400 mb-1">Всего тренировок</p>
          <p className="text-2xl font-bold text-gradient">
            {funnelData[0]?.count || 0}
          </p>
        </div>
        <div className="p-4 bg-dark-800/50 rounded-xl">
          <p className="text-xs text-dark-400 mb-1">Завершено</p>
          <p className="text-2xl font-bold text-gradient-success">
            {completionRate}%
          </p>
        </div>
        <div className="p-4 bg-dark-800/50 rounded-xl">
          <p className="text-xs text-dark-400 mb-1">Отток</p>
          <p
            className={`text-2xl font-bold ${
              dropOffRate > 50 ? 'text-red-400' : 'text-yellow-400'
            }`}
          >
            {dropOffRate}%
          </p>
        </div>
      </div>

      {/* График воронки */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={value => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#9CA3AF"
              style={{ fontSize: '11px' }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string, props: unknown) => {
                const typedProps = props as { payload: { count: number } }
                return [`${value}% (${typedProps.payload.count})`, name]
              }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                fill="#9CA3AF"
                style={{ fontSize: '12px' }}
                formatter={(value: number | undefined) => `${value ?? 0}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Рекомендации */}
      <div className="mt-6 pt-6 border-t border-dark-700">
        <h4 className="text-sm font-semibold text-dark-300 mb-3">
          💡 Рекомендации:
        </h4>
        <div className="space-y-2 text-sm text-dark-400">
          {dropOffRate > 50 && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-red-400">⚠️</span>
              <p>
                Высокий отток ({dropOffRate}%). Рассмотрите возможность
                сокращения длительности тренировок или добавления
                промежуточных наград.
              </p>
            </div>
          )}
          {completionRate < 30 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <span className="text-yellow-400">📈</span>
              <p>
                Низкая завершаемость ({completionRate}%). Добавьте
                мотивационные сообщения на последних этапах тренировки.
              </p>
            </div>
          )}
          {highAccuracyRate < 50 && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-blue-400">🎯</span>
              <p>
                Только {highAccuracyRate}% пользователей достигают высокой
                точности. Добавьте подсказки по технике печати.
              </p>
            </div>
          )}
          {dropOffRate <= 50 && completionRate >= 30 && highAccuracyRate >= 50 && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-green-400">✅</span>
              <p>
                Отличные показатели! Пользователи хорошо вовлечены в
                тренировочный процесс.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
