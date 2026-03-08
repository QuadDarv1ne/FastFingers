import { useMemo } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { TypingStats, KeystrokeData } from '@/types'
import { calculateSkillProfile } from '@/utils/stats'

interface SpiderChartProps {
  stats: TypingStats
  keystrokes: KeystrokeData[]
  historicalData?: Array<{
    name: string
    data: Record<string, number>
  }>
}

/**
 * Spider Chart — профиль навыков по категориям
 * Отображает сильные и слабые стороны пользователя
 */
export function SpiderChart({ stats, keystrokes, historicalData }: SpiderChartProps) {
  const chartData = useMemo(() => {
    const currentProfile = calculateSkillProfile(stats, keystrokes)

    // Преобразуем в формат для Recharts
    const categories = Object.keys(currentProfile)
    const data = categories.map(category => ({
      category,
      current: currentProfile[category] || 0,
      ...Object.fromEntries(
        historicalData?.map(h => [h.name, h.data[category] || 0]) || []
      ),
    }))

    return data
  }, [stats, keystrokes, historicalData])

  const hasData = chartData.length > 0 && chartData.some(d => d.current > 0)

  if (!hasData) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">🕸️</div>
        <h3 className="text-lg font-semibold mb-2">Нет данных для анализа</h3>
        <p className="text-dark-400">
          Начните тренировку, чтобы увидеть профиль навыков
        </p>
      </div>
    )
  }

  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🕸️</span>
        Профиль навыков
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Текущая"
            dataKey="current"
            stroke={colors[0]}
            strokeWidth={2}
            fill={colors[0]}
            fillOpacity={0.3}
          />
          {historicalData?.map((historical, index) => (
            <Radar
              key={historical.name}
              name={historical.name}
              dataKey={historical.name}
              stroke={colors[(index + 1) % colors.length]}
              strokeWidth={2}
              fill={colors[(index + 1) % colors.length]}
              fillOpacity={0.1}
            />
          ))}
          <Legend />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#9CA3AF' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Легенда метрик */}
      <div className="mt-6 pt-6 border-t border-dark-700">
        <h4 className="text-sm font-semibold text-dark-300 mb-3">
          Расшифровка метрик:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-dark-400">
          <div className="flex items-start gap-2">
            <span className="text-primary-400">⚡</span>
            <div>
              <strong>Скорость (WPM)</strong>
              <p>Слов в минуту</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🎯</span>
            <div>
              <strong>Точность</strong>
              <p>Процент правильных нажатий</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">🎵</span>
            <div>
              <strong>Ритм</strong>
              <p>Равномерность печати</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400">⚙️</span>
            <div>
              <strong>Эффективность</strong>
              <p>Производительность × точность</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">⚖️</span>
            <div>
              <strong>Баланс рук</strong>
              <p>Распределение между руками</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-400">⚡</span>
            <div>
              <strong>Реакция</strong>
              <p>Скорость исправления ошибок</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
