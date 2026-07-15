import { memo, useMemo, Suspense, lazy, useState, useEffect } from 'react'
import { useTypingHistory } from '../hooks/useTypingHistory'
import { useStatsWorker } from '../hooks/useStatsWorker'
import { useAppTranslation } from '../i18n/config'
import { SimpleBarChart } from './SimpleBarChart'
import { SimpleAreaChart } from './SimpleAreaChart'
import { SimplePieChart } from './SimplePieChart'
import { PersonalRecords } from './PersonalRecords'
import { WeeklyComparison } from './WeeklyComparison'
import { StatCard } from './ui/StatCard'
import LoadingFallback from './LoadingFallback'
import type { TypingStats } from '../types'
import { logger } from '../utils/logger'

// Lazy loading для тяжёлых компонентов
const ActivityHeatmap = lazy(() => import('./ActivityHeatmap').then(module => ({ default: module.ActivityHeatmap })))

interface StatisticsPageProps {
  onBack: () => void
}

const TIME_OF_DAY_LABELS: Record<string, string> = {
  morning: 'stats.timeOfDay.morning',
  afternoon: 'stats.timeOfDay.afternoon',
  evening: 'stats.timeOfDay.evening',
  night: 'stats.timeOfDay.night',
}

const CORRELATION_METRICS = ['stats.metric.wpm', 'stats.metric.accuracy', 'stats.metric.cpm', 'stats.metric.errors']

export const StatisticsPage = memo<StatisticsPageProps>(function StatisticsPage({ onBack }: StatisticsPageProps) {
  const { t, i18n } = useAppTranslation()
  const { history, getStatsForPeriod } = useTypingHistory()
  const { isReady, analyzeTimeOfDay, analyzeFunnel, calculateCorrelationMatrix } = useStatsWorker()

  // Расширенная аналитика через Web Worker
  const [timeAnalysis, setTimeAnalysis] = useState<Array<{ timeOfDay: string; avgWpm: number; avgAccuracy: number; sessions: number }>>([])
  const [funnelData, setFunnelData] = useState<Array<{ name: string; percentage: number; count: number }> | null>(null)
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Преобразование сессий для Web Worker
  const sessionsForWorker = useMemo<TypingStats[]>(() =>
    history.sessions.map(s => {
      // Estimate chars based on WPM and duration: WPM * 5 chars/word * duration/60
      const estimatedChars = Math.round(s.wpm * 5 * (s.duration / 60))
      const correctChars = Math.round((s.accuracy / 100) * estimatedChars)
      return {
        date: s.date,
        wpm: s.wpm,
        accuracy: s.accuracy,
        cpm: s.cpm,
        errors: s.errors,
        correctChars,
        totalChars: estimatedChars,
        timeElapsed: s.duration,
      } as TypingStats
    }),
    [history.sessions]
  )

  // Запуск анализа через Web Worker
  useEffect(() => {
    if (!isReady || sessionsForWorker.length === 0) return

    let cancelled = false
    const runAnalysis = async () => {
      setIsAnalyzing(true)
      try {
        const [timeResult, funnelResult, correlationResult] = await Promise.all([
          analyzeTimeOfDay(sessionsForWorker),
          analyzeFunnel(sessionsForWorker, [20, 40, 60, 80, 100]),
          calculateCorrelationMatrix(sessionsForWorker),
        ])
        if (!cancelled) {
          setTimeAnalysis(timeResult)
          setFunnelData(funnelResult.stages)
          setCorrelationMatrix(correlationResult)
        }
      } catch (error) {
        logger.error('Analysis error:', error)
      } finally {
        if (!cancelled) setIsAnalyzing(false)
      }
    }

    runAnalysis()
    return () => { cancelled = true }
  }, [isReady, sessionsForWorker, analyzeTimeOfDay, analyzeFunnel, calculateCorrelationMatrix])

  // Данные за разные периоды
  const stats24h = getStatsForPeriod(1)
  const stats7d = getStatsForPeriod(7)
  const stats30d = getStatsForPeriod(30)

  // Вычисление реальных трендов
  const trends = useMemo(() => {
    const stats7 = getStatsForPeriod(7)
    const stats14 = getStatsForPeriod(14)
    const stats30 = getStatsForPeriod(30)

    // Сессии: сравниваем последние 7 дней с предыдущими 7 днями
    const sessionChange = stats7.sessions > 0 && stats14.sessions > 0 && stats7.sessions !== stats14.sessions
      ? Math.round(((stats7.sessions - (stats14.sessions - stats7.sessions)) / (stats14.sessions - stats7.sessions)) * 100)
      : 0

    // Время практики
    const time24h = Math.round(history.totalTime / 60)
    const timeChange = time24h > 0 ? `+${time24h}${t('stats.hoursShort', 'h')}` : '—'

    // Лучший WPM
    const bestWpmChange = stats30.bestWpm > 0 && stats7.bestWpm > 0 && stats30.bestWpm !== stats7.bestWpm
      ? `${stats30.bestWpm}`
      : 'record'

    // Точность
    const accuracyChange = stats7.avgAccuracy > 0 && stats14.avgAccuracy > 0 && stats7.avgAccuracy !== stats14.avgAccuracy
      ? `${stats7.avgAccuracy - stats14.avgAccuracy > 0 ? '+' : ''}${(stats7.avgAccuracy - stats14.avgAccuracy).toFixed(1)}%`
      : '—'

    return {
      sessions: sessionChange !== 0 ? `${sessionChange > 0 ? '+' : ''}${sessionChange}%` : '—',
      time: timeChange,
      bestWpm: bestWpmChange,
      accuracy: accuracyChange,
    }
  }, [history.totalTime, getStatsForPeriod, t])

  // Данные для графика WPM по сессиям
  const wpmTrendData = useMemo(() => {
    return history.sessions
      .slice(0, 30)
      .reverse()
      .map((session, index) => ({
        index: index + 1,
        wpm: session.wpm,
        accuracy: session.accuracy,
        date: new Date(session.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }),
      }))
  }, [history.sessions, i18n.language])

  // Данные для графика активности по дням недели
  const activityByDay = useMemo(() => {
    const dayKeys = ['stats.day.mon', 'stats.day.tue', 'stats.day.wed', 'stats.day.thu', 'stats.day.fri', 'stats.day.sat', 'stats.day.sun']
    const days = dayKeys.map(k => t(k))
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
  }, [history.sessions, t])

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
      const dayName = date.toLocaleDateString(i18n.language, { weekday: 'short' })

      const sessionsOnDay = history.sessions.filter(s => s.date.startsWith(dateStr))
      const totalTime = sessionsOnDay.reduce((sum, s) => sum + s.duration, 0)

      last7Days.push({
        day: dayName,
        minutes: Math.round(totalTime / 60),
      })
    }
    return last7Days
  }, [history.sessions, i18n.language])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">{t('stats.title')}</h1>
            <p className="text-dark-400 mt-1">{t('stats.subtitle')}</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            ← {t('action.back')}
          </button>
        </div>

        {/* Сводные карточки */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={t('stats.totalSessionsLabel')}
            value={history.totalSessions.toString()}
            icon="📊"
            trend={trends.sessions}
          />
          <StatCard
            label={t('stats.practiceTime')}
            value={`${Math.round(history.totalTime / 60)}${t('stats.hoursShort', 'h')}`}
            icon="⏱️"
            trend={trends.time}
          />
          <StatCard
            label={t('stats.bestWpm')}
            value={stats30d.bestWpm.toString()}
            icon="🚀"
            trend={trends.bestWpm === 'record' ? t('stats.record') : trends.bestWpm}
            highlight
          />
          <StatCard
            label={t('stats.avgAccuracy')}
            value={`${stats30d.avgAccuracy}%`}
            icon="🎯"
            trend={trends.accuracy}
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
        <h2 className="text-2xl font-bold mb-4 text-gradient">📊 {t('stats.advancedAnalytics')}</h2>

        {/* Индикатор загрузки анализа */}
        {isAnalyzing && (
          <div className="glass rounded-xl p-6 mb-8 flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span>{t('stats.analyzing')}</span>
          </div>
        )}

        {/* Анализ времени суток */}
        {timeAnalysis.length > 0 && (
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">🕐 {t('stats.performanceByTime')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timeAnalysis.map(slot => (
                <div key={slot.timeOfDay} className="text-center p-4 bg-dark-800/50 rounded-lg">
                  <div className="text-sm text-dark-400 mb-1">
                    {t(TIME_OF_DAY_LABELS[slot.timeOfDay] || `stats.timeOfDay.${slot.timeOfDay}`)}
                  </div>
                  <div className="text-2xl font-bold text-primary-400">{slot.avgWpm} WPM</div>
                  <div className="text-sm text-dark-500">{slot.avgAccuracy}% {t('stats.accuracy')}</div>
                  <div className="text-xs text-dark-600 mt-1">{slot.sessions} {t('stats.sessions')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Воронка конверсии */}
        {funnelData && funnelData.length > 0 && (
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">📊 {t('stats.performanceFunnel')}</h3>
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
            <h3 className="text-lg font-semibold mb-4">🔗 {t('stats.metricCorrelation')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="p-2 text-left text-dark-400">{t('stats.metric')}</th>
                    {CORRELATION_METRICS.map((key, i) => (
                      <th key={i} className="p-2 text-center text-dark-400">{t(key)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CORRELATION_METRICS.map((key, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-dark-800">
                      <td className="p-2 font-medium">{t(key)}</td>
                      {CORRELATION_METRICS.map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className={`p-2 text-center ${rowIdx === colIdx ? 'bg-primary-900/20' : ''}`}
                        >
                          {correlationMatrix[rowIdx]?.[colIdx]?.toFixed(2) || '0.00'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-dark-500 mt-4">
              {t('stats.correlationNote')}
            </p>
          </div>
        )}

        {/* Существующие графики */}
        <h2 className="text-2xl font-bold mb-4 text-gradient">📈 {t('stats.detailedStats')}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* График WPM */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{t('stats.speedProgress')}</h3>
            <div className="h-64">
              {wpmTrendData.length > 0 ? (
                <SimpleAreaChart
                  data={wpmTrendData}
                  dataKey="wpm"
                  xAxisKey="date"
                  stroke="#8b5cf6"
                  fillGradientId="wpmGradient"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-dark-500">
                  {t('stats.noData')}
                </div>
              )}
            </div>
          </div>

          {/* График точности */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{t('stats.accuracyDistribution')}</h3>
            <div className="h-64">
              {accuracyDistribution.length > 0 ? (
                <SimplePieChart data={accuracyDistribution} />
              ) : (
                <div className="h-full flex items-center justify-center text-dark-500">
                  {t('stats.noData')}
                </div>
              )}
            </div>
          </div>

          {/* График активности по дням */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{t('stats.activityByDay')}</h3>
            <div className="h-64">
              <SimpleBarChart
                data={activityByDay}
                dataKey="sessions"
                xAxisKey="day"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </div>
          </div>

          {/* График времени практики */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{t('stats.practiceTime7days')}</h3>
            <div className="h-64">
              <SimpleBarChart
                data={practiceTimeData}
                dataKey="minutes"
                xAxisKey="day"
                fill="#a78bfa"
                radius={[4, 4, 0, 0]}
              />
            </div>
          </div>
        </div>

        {/* Статистика по периодам */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PeriodStats title={t('stats.period24h', '24 hours')} stats={stats24h} t={t} />
          <PeriodStats title={t('stats.period7d', '7 days')} stats={stats7d} t={t} />
          <PeriodStats title={t('stats.period30d', '30 days')} stats={stats30d} t={t} />
        </div>

        {/* Последние сессии */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t('stats.recentSessions')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">{t('stats.date')}</th>
                  <th className="text-center py-3 px-4 text-dark-400 font-medium">WPM</th>
                  <th className="text-center py-3 px-4 text-dark-400 font-medium">{t('stats.accuracy')}</th>
                  <th className="text-center py-3 px-4 text-dark-400 font-medium">{t('stats.errors')}</th>
                  <th className="text-right py-3 px-4 text-dark-400 font-medium">{t('stats.time')}</th>
                </tr>
              </thead>
              <tbody>
                {history.sessions.slice(0, 10).map((session) => (
                  <tr key={session.id} className="border-b border-dark-800/50">
                    <td className="py-3 px-4 text-dark-300">
                      {formatDate(session.date)}
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

function PeriodStats({ title, stats, t }: { title: string; stats: { avgWpm: number; avgAccuracy: number; bestWpm: number; sessions: number }; t: (key: string) => string }) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-dark-400">{t('stats.sessions')}</span>
          <span className="font-medium">{stats.sessions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">{t('stats.avgWpm')}</span>
          <span className="font-medium text-primary-400">{stats.avgWpm}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">{t('stats.avgAccuracyLabel')}</span>
          <span className="font-medium">{stats.avgAccuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">{t('stats.bestWpm')}</span>
          <span className="font-medium text-success">{stats.bestWpm}</span>
        </div>
      </div>
    </div>
  )
}
