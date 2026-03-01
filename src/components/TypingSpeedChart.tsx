import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TypingStats } from '@/types'

interface TypingSpeedChartProps {
  sessions: (TypingStats & { timestamp: string })[]
  metric: 'wpm' | 'accuracy' | 'both'
  timeRange: '7d' | '30d' | 'all'
}

export function TypingSpeedChart({
  sessions,
  metric,
  timeRange,
}: TypingSpeedChartProps) {
  const filteredData = useMemo(() => {
    const now = Date.now()
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    }

    return sessions
      .filter(session => {
        const sessionTime = new Date(session.timestamp).getTime()
        return now - sessionTime <= ranges[timeRange]
      })
      .map((session, index) => ({
        session: index + 1,
        wpm: session.wpm,
        accuracy: session.accuracy,
        date: new Date(session.timestamp).toLocaleDateString('ru-RU', {
          month: 'short',
          day: 'numeric',
        }),
      }))
  }, [sessions, timeRange])

  if (filteredData.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">Нет данных</h3>
        <p className="text-dark-400">
          Начните тренироваться, чтобы увидеть график прогресса
        </p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length) {
      const typedPayload = payload as Array<{
        payload: { date: string }
        name: string
        value: number
        color: string
      }>
      return (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-dark-400 mb-2">{typedPayload[0].payload.date}</p>
          {typedPayload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
              {entry.name === 'WPM' ? '' : '%'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (metric === 'both') {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📈</span>
          График прогресса
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wpm"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
              name="WPM"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Точность"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const dataKey = metric === 'wpm' ? 'wpm' : 'accuracy'
  const color = metric === 'wpm' ? '#8b5cf6' : '#10b981'
  const name = metric === 'wpm' ? 'WPM' : 'Точность'

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📈</span>
        {name} - График прогресса
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={filteredData}>
          <defs>
            <linearGradient id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#color${metric})`}
            name={name}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-700">
        <div className="text-center">
          <p className="text-xs text-dark-400 mb-1">Среднее</p>
          <p className="text-xl font-bold" style={{ color }}>
            {(
              filteredData.reduce((sum, d) => sum + d[dataKey], 0) /
              filteredData.length
            ).toFixed(1)}
            {metric === 'accuracy' ? '%' : ''}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-400 mb-1">Лучшее</p>
          <p className="text-xl font-bold" style={{ color }}>
            {Math.max(...filteredData.map(d => d[dataKey])).toFixed(1)}
            {metric === 'accuracy' ? '%' : ''}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-400 mb-1">Сессий</p>
          <p className="text-xl font-bold" style={{ color }}>
            {filteredData.length}
          </p>
        </div>
      </div>
    </div>
  )
}
