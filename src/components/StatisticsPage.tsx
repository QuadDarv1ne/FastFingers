import { memo, useMemo, Suspense, lazy, useState, useEffect } from 'react'
import { useTypingHistory } from '../hooks/useTypingHistory'
import { useAdvancedStats } from '../hooks/useAdvancedStats'
import { useStatsWorker } from '../hooks/useStatsWorker'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from './LazyRecharts'
import { PersonalRecords } from './PersonalRecords'
import { WeeklyComparison } from './WeeklyComparison'
import { LoadingFallback } from './LoadingFallback'
import type { TypingStats } from '../types'

// Lazy loading для тяжёлых компонентов
const ActivityHeatmap = lazy(() => import('./ActivityHeatmap').then(module => ({ default: module.ActivityHeatmap })))

interface StatisticsPageProps {
  onBack: () => void
}

export const StatisticsPage = memo<StatisticsPageProps>(function StatisticsPage({ onBack }: StatisticsPageProps) {
  const { history, getStatsForPeriod } = useTypingHistory()
  const { wpmTrend: _wpmTrend, activityByDayOfWeek: _activityByDayOfWeek } = useAdvancedStats()
  const { isReady, analyzeTimeOfDay, analyzeFunnel, calculateCorrelationMatrix } = useStatsWorker()

  // Расширенная аналитика через Web Worker
  const [timeAnalysis, setTimeAnalysis] = useState<Array<{ timeOfDay: string; avgWpm: number; avgAccuracy: number; sessions: number }>>([])
  const [funnelData, setFunnelData] = useState<Array<{ name: string; percentage: number; count: number }> | null>(null)
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Преобразование сессий для Web Worker
  const sessionsForWorker = useMemo<TypingStats[]>(() =>
    history.sessions.map(s => ({
      date: s.date,
      wpm: s.wpm,
      accuracy: s.accuracy,
      cpm: s.cpm,
      errors: s.errors,
      correctChars: 0,
      totalChars: 0,
      timeElapsed: s.duration,
    } as TypingStats)),
    [history.sessions]
  )

  // Запуск анализа через Web Worker
  useEffect(() => {
    if (!isReady || sessionsForWorker.length === 0) return

    const runAnalysis = async () => {
      setIsAnalyzing(true)
      try {
        const [timeResult, funnelResult, correlationResult] = await Promise.all([
          analyzeTimeOfDay(sessionsForWorker),
          analyzeFunnel(sessionsForWorker, [20, 40, 60, 80, 100]),
          calculateCorrelationMatrix(sessionsForWorker),
        ])
        setTimeAnalysis(timeResult)
        setFunnelData(funnelResult)
        setCorrelationMatrix(correlationResult)
      } catch (error) {
        console.error('Analysis error:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }

    runAnalysis()
  }, [isReady, sessionsForWorker, analyzeTimeOfDay, analyzeFunnel, calculateCorrelationMatrix])

  // Данные за разные периоды
  const stats24h = getStatsForPeriod(1)
  const stats7d = getStatsForPeriod(7)
  const stats30d = getStatsForPeriod(30)

  // Данные для графика WPM по сессиям
  const wpmTrendData = useMemo(() => {
    return history.sessions
      .slice(0, 30)
      .reverse()
      .map((session, index) => ({
        index: index + 1,
        wpm: session.wpm,
        accuracy: session.accuracy,
        date: new Date(session.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      }))
  }, [history.sessions])

  // Данные для графика активности по дням недели
  const activityByDay = useMemo(() => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const data = days.map(day => ({ day, sessions: 0, avgWpm: 0 }))

    history.sessions.forEach(session => {
      const date = new Date(session.date)
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
      const dayData = data[dayIndex]
      if (dayData) {
        dayData.sessions += 1
        dayData.avgWpm += session.wpm ?? 0
      }
    })

    return data.map(d => ({
      ...d,
      avgWpm: d.sessions > 0 ? Math.round(d.avgWpm / d.sessions) : 0,
    }))
  }, [history.sessions])

  // Данные для круговой диаграммы точности
  const accuracyDistribution = useMemo(() => {
    const ranges = [
      { name: '< 70%', value: 0, color: '#ef4444' },
      { name: '70-80%', value: 0, color: '#f97316' },
      { name: '80-90%', value: 0, color: '#eab308' },
      { name: '90-95%', value: 0, color: '#84cc16' },
      { name: '95%+', value: 0, color: '#22c55e' },
    ]

    history.sessions.forEach(session => {
      const accuracy = session.accuracy ?? 0
      let rangeIndex = 4
      if (accuracy < 70) rangeIndex = 0
      else if (accuracy < 80) rangeIndex = 1
      else if (accuracy < 90) rangeIndex = 2
      else if (accuracy < 95) rangeIndex = 3

      const range = ranges[rangeIndex]
      if (range) {
        range.value++
      }
    })

    return ranges.filter(r => r.value > 0)
  }, [history.sessions])

  // Данные для графика времени практики
  const practiceTimeData = useMemo(() => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      if (!dateStr) continue
      const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' })

      const sessionsOnDay = history.sessions.filter(s => s.date.startsWith(dateStr))
      const totalTime = sessionsOnDay.reduce((sum, s) => sum + s.duration, 0)

      last7Days.push({
        day: dayName,
        minutes: Math.round(totalTime / 60),
      })
    }
    return last7Days
  }, [history.sessions])

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Статистика</h1>
            <p className="text-dark-400 mt-1">Детальный анализ вашего прогресса</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            ← Назад
          </button>
        </div>

        {/* Сводные карточки */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Всего тренировок"
            value={history.totalSessions.toString()}
            icon="📊"
            trend="+12%"
          />
          <StatCard
            title="Время практики"
            value={`${Math.round(history.totalTime / 60)}ч`}
            icon="⏱️"
            trend="+5ч"
          />
          <StatCard
            title="Лучший WPM"
            value={stats30d.bestWpm.toString()}
            icon="🚀"
            trend="рекорд"
            highlight
          />
          <StatCard
            title="Средняя точность"
            value={`${stats30d.avgAccuracy}%`}
            icon="🎯"
            trend="+2%"
          />
        </div>

        {/* Персональные рекорды */}
        <PersonalRecords className="mb-8" />

        {/* Сравнение с прошлой неделей */}
        <WeeklyComparison className="mb-8" />

        {/* Тепловая карта активности */}
        <Suspense fallback={<LoadingFallback />}>
          <ActivityHeatmap months={6} />
        </Suspense>

        {/* Графики */}
        <h2 className="text-2xl font-bold mb-4 text-gradient">📊 Расширенная аналитика</h2>

        {/* Индикатор загрузки анализа */}
        {isAnalyzing && (
          <div className="glass rounded-xl p-6 mb-8 flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span>Анализ данных через Web Worker...</span>
          </div>
        )}

        {/* Анализ времени суток */}
        {timeAnalysis.length > 0 && (
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">🕐 Производительность по времени суток</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timeAnalysis.map(slot => (
                <div key={slot.timeOfDay} className="text-center p-4 bg-dark-800/50 rounded-lg">
                  <div className="text-sm text-dark-400 mb-1">
                    {slot.timeOfDay === 'morning' && '🌅 Утро'}
                    {slot.timeOfDay === 'afternoon' && '☀️ День'}
                    {slot.timeOfDay === 'evening' && '🌆 Вечер'}
                    {slot.timeOfDay === 'night' && '🌙 Ночь'}
                  </div>
                  <div className="text-2xl font-bold text-primary-400">{slot.avgWpm} WPM</div>
                  <div className="text-sm text-dark-500">{slot.avgAccuracy}% точности</div>
                  <div className="text-xs text-dark-600 mt-1">{slot.sessions} сессий</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Воронка конверсии */}
        {funnelData && funnelData.length > 0 && (
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">📊 Воронка производительности</h3>
            <div className="space-y-3">
              {funnelData.map((stage) => (
                <div key={stage.name} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-dark-400">{stage.name}</div>
                  <div className="flex-1 h-8 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-sm font-medium">{stage.count} ({stage.percentage}%)</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Матрица корреляции */}
        {correlationMatrix.length > 0 && (
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">🔗 Корреляция метрик</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="p-2 text-left text-dark-400">Метрика</th>
                    <th className="p-2 text-center text-dark-400">WPM</th>
                    <th className="p-2 text-center text-dark-400">Точность</th>
                    <th className="p-2 text-center text-dark-400">CPM</th>
                    <th className="p-2 text-center text-dark-400">Ошибки</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dark-800">
                    <td className="p-2 font-medium">WPM</td>
                    <td className="p-2 text-center bg-primary-900/20">1.00</td>
                    <td className="p-2 text-center">{correlationMatrix[0]?.[1]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center">{correlationMatrix[0]?.[2]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center">{correlationMatrix[0]?.[3]?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr className="border-b border-dark-800">
                    <td className="p-2 font-medium">Точность</td>
                    <td className="p-2 text-center">{correlationMatrix[1]?.[0]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center bg-primary-900/20">1.00</td>
                    <td className="p-2 text-center">{correlationMatrix[1]?.[2]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center">{correlationMatrix[1]?.[3]?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr className="border-b border-dark-800">
                    <td className="p-2 font-medium">CPM</td>
                    <td className="p-2 text-center">{correlationMatrix[2]?.[0]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center">{correlationMatrix[2]?.[1]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center bg-primary-900/20">1.00</td>
                    <td className="p-2 text-center">{correlationMatrix[2]?.[3]?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Ошибки</td>
                    <td className="p-2 text-center">{correlationMatrix[3]?.[0]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center">{correlationMatrix[3]?.[1]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center">{correlationMatrix[3]?.[2]?.toFixed(2) || '0.00'}</td>
                    <td className="p-2 text-center bg-primary-900/20">1.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-dark-500 mt-4">
              * Значения близкие к 1 — сильная положительная корреляция, к -1 — сильная отрицательная
            </p>
          </div>
        )}

        {/* Существующие графики */}
        <h2 className="text-2xl font-bold mb-4 text-gradient">📈 Детальная статистика</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* График WPM */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Прогресс скорости (WPM)</h3>
            <div className="h-64">
              {wpmTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wpmTrendData}>
                    <defs>
                      <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="index" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="wpm" stroke="#8b5cf6" fillOpacity={1} fill="url(#wpmGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-dark-500">
                  Нет данных для отображения
                </div>
              )}
            </div>
          </div>

          {/* График точности */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Распределение точности</h3>
            <div className="h-64">
              {accuracyDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accuracyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {accuracyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-dark-500">
                  Нет данных для отображения
                </div>
              )}
            </div>
          </div>

          {/* График активности по дням */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Активность по дням недели</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* График времени практики */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Время практики (последние 7 дней)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={practiceTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="minutes" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Статистика по периодам */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PeriodStats title="24 часа" stats={stats24h} />
          <PeriodStats title="7 дней" stats={stats7d} />
          <PeriodStats title="30 дней" stats={stats30d} />
        </div>

        {/* Последние сессии */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Последние сессии</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Дата</th>
                  <th className="text-center py-3 px-4 text-dark-400 font-medium">WPM</th>
                  <th className="text-center py-3 px-4 text-dark-400 font-medium">Точность</th>
                  <th className="text-center py-3 px-4 text-dark-400 font-medium">Ошибки</th>
                  <th className="text-right py-3 px-4 text-dark-400 font-medium">Время</th>
                </tr>
              </thead>
              <tbody>
                {history.sessions.slice(0, 10).map((session) => (
                  <tr key={session.id} className="border-b border-dark-800/50">
                    <td className="py-3 px-4 text-dark-300">
                      {new Date(session.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-primary-400 font-bold">{session.wpm}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={session.accuracy >= 95 ? 'text-success' : session.accuracy >= 85 ? 'text-yellow-400' : 'text-error'}>
                        {session.accuracy}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-error">{session.errors}</td>
                    <td className="text-right py-3 px-4 text-dark-400">
                      {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.onBack === nextProps.onBack
})

function StatCard({ title, value, icon, trend, highlight = false }: { 
  title: string
  value: string
  icon: string
  trend: string
  highlight?: boolean
}) {
  return (
    <div className={`glass rounded-xl p-4 ${highlight ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-success bg-success/20 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <p className="text-sm text-dark-400">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}

function PeriodStats({ title, stats }: { title: string; stats: { avgWpm: number; avgAccuracy: number; bestWpm: number; sessions: number } }) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-dark-400">Сессий</span>
          <span className="font-medium">{stats.sessions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">Средний WPM</span>
          <span className="font-medium text-primary-400">{stats.avgWpm}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">Средняя точность</span>
          <span className="font-medium">{stats.avgAccuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">Лучший WPM</span>
          <span className="font-medium text-success">{stats.bestWpm}</span>
        </div>
      </div>
    </div>
  )
}
