import { useState, useEffect, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cloudSyncService } from '../../services/cloudSyncService'
import { useSelectedStudent } from '../../hooks/useSelectedStudent'
import { SimpleLineChart } from '../../components/SimpleLineChart'
import { SimpleBarChart } from '../../components/SimpleBarChart'
import { mapSupabaseSessions, computeStudentStats } from '../../utils/studentStats'
import type { SessionData, FetchResult } from '../../utils/studentStats'
import type { TypingSessionRow } from '../../services/cloudSyncService'
import { logger } from '../../utils/logger'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { getFromStorageAsArray } from '../../utils/storage'

interface StudentAnalyticsPageProps {
  onBack: () => void
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}с`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}ч ${m}м`
  return `${m}м`
}

export const StudentAnalyticsPage = memo(function StudentAnalyticsPage({ onBack }: StudentAnalyticsPageProps) {
  const { t, i18n } = useTranslation()
  const { userId, userName } = useSelectedStudent()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    cloudSyncService
      .getTypingSessions(userId, 200)
      .then((result: FetchResult<TypingSessionRow>) => {
        if (result.error) throw result.error
        setSessions(mapSupabaseSessions(result.data || []))
        setIsLoading(false)
      })
      .catch(err => {
        logger.error('Failed to load student sessions:', err)
        setError(err.message || 'Не удалось загрузить данные')
        setIsLoading(false)
      })
  }, [userId])

  const stats = useMemo(() => computeStudentStats(sessions), [sessions])

  // Load user aggregate stats from localStorage
  const userStats = useMemo(() => {
    try {
      const users = getFromStorageAsArray<{ id: string; stats?: Record<string, unknown> }>(STORAGE_KEYS.USERS)
      return users.find(u => u?.id === userId)?.stats || null
    } catch {
      logger.warn('Failed to parse user aggregate stats from localStorage')
      return null
    }
  }, [userId])

  // Compute session distribution by WPM ranges
  const wpmDistribution = useMemo(() => {
    const ranges = [
      { label: '< 20', min: 0, max: 20, count: 0 },
      { label: '20-39', min: 20, max: 40, count: 0 },
      { label: '40-59', min: 40, max: 60, count: 0 },
      { label: '60-79', min: 60, max: 80, count: 0 },
      { label: '80-99', min: 80, max: 100, count: 0 },
      { label: '100+', min: 100, max: Infinity, count: 0 },
    ]
    for (const s of sessions) {
      for (const r of ranges) {
        if (s.wpm >= r.min && s.wpm < r.max) { r.count++; break }
      }
    }
    return ranges
  }, [sessions])

  // Skill assessment
  const skillAssessment = useMemo(() => {
    if (sessions.length < 2) return null

    const recent = sessions.slice(0, 10)
    const older = sessions.slice(10, 20)

    const recentAvgWpm = Math.round(recent.reduce((s, sess) => s + sess.wpm, 0) / recent.length)
    const recentAvgAcc = Math.round(recent.reduce((s, sess) => s + sess.accuracy, 0) / recent.length)
    const recentAvgErrors = Math.round(recent.reduce((s, sess) => s + sess.errors, 0) / recent.length)

    // Consistency: standard deviation of WPM
    const wpmVariance = recent.reduce((sum, s) => sum + Math.pow(s.wpm - recentAvgWpm, 2), 0) / recent.length
    const wpmStdDev = Math.round(Math.sqrt(wpmVariance) * 10) / 10
    const consistency = Math.max(0, Math.min(100, Math.round(100 - wpmStdDev * 2)))

    // Progress trend: compare recent 10 with older 10
    let trendLabel = '—'
    let trendColor = 'text-dark-400'
    if (older.length > 0) {
      const olderAvgWpm = older.reduce((s, sess) => s + sess.wpm, 0) / older.length
      const diff = recentAvgWpm - olderAvgWpm
      if (diff > 5) { trendLabel = `+${Math.round(diff)} WPM`; trendColor = 'text-success' }
      else if (diff < -5) { trendLabel = `${Math.round(diff)} WPM`; trendColor = 'text-error' }
      else { trendLabel = 'Стабильно'; trendColor = 'text-yellow-400' }
    } else if (stats.wpmTrend.length >= 3) {
      const first3 = stats.wpmTrend.slice(0, 3).reduce((s, d) => s + d.wpm, 0) / 3
      const last3 = stats.wpmTrend.slice(-3).reduce((s, d) => s + d.wpm, 0) / 3
      const diff = last3 - first3
      if (diff > 3) { trendLabel = `+${Math.round(diff)} WPM`; trendColor = 'text-success' }
      else if (diff < -3) { trendLabel = `${Math.round(diff)} WPM`; trendColor = 'text-error' }
      else { trendLabel = 'Стабильно'; trendColor = 'text-yellow-400' }
    }

    // Accuracy stability
    const accVariance = recent.reduce((sum, s) => sum + Math.pow(s.accuracy - recentAvgAcc, 2), 0) / recent.length
    const accStdDev = Math.round(Math.sqrt(accVariance) * 10) / 10
    const accuracyStability = Math.max(0, Math.min(100, Math.round(100 - accStdDev * 3)))

    return {
      consistency,
      accuracyStability,
      recentAvgWpm,
      recentAvgAcc,
      recentAvgErrors,
      trendLabel,
      trendColor,
      wpmStdDev,
      accStdDev,
    }
  }, [sessions, stats.wpmTrend])

  // Weakest sessions (lowest accuracy)
  const weakestSessions = useMemo(
    () => [...sessions].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5),
    [sessions],
  )

  // Best sessions
  const bestSessions = useMemo(
    () => [...sessions].sort((a, b) => b.wpm - a.wpm).slice(0, 5),
    [sessions],
  )

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('admin.studentAnalytics', 'Аналитика ученика')}</h1>
            <div className="w-48 h-4 bg-dark-700 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-dark-700 rounded mb-3" />
              <div className="w-20 h-3 bg-dark-700 rounded mb-2" />
              <div className="w-12 h-6 bg-dark-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="glass rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">{t('stats.error', 'Ошибка загрузки')}</h2>
          <p className="text-dark-400 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                if (!userId) return
                setIsLoading(true)
                setError(null)
                cloudSyncService
                  .getTypingSessions(userId, 200)
                  .then((result: FetchResult<TypingSessionRow>) => {
                    if (result.error) throw result.error
                    setSessions(mapSupabaseSessions(result.data || []))
                    setIsLoading(false)
                  })
                  .catch(err => { logger.error('Failed to retry loading student sessions:', err); setError(err.message || 'Не удалось загрузить данные'); setIsLoading(false) })
              }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm"
            >
              Попробовать снова
            </button>
            <button onClick={onBack} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm">
              Назад
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{t('admin.studentAnalytics', 'Аналитика ученика')}: {userName}</h1>
          <button onClick={onBack} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm">
            ← {t('action.back', 'Назад')}
          </button>
        </div>
        <div className="glass rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-white mb-2">Нет данных</h2>
          <p className="text-dark-400">Ученик ещё не завершил ни одной тренировки</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm">
            ← Назад к списку
          </button>
        </div>
      </div>
    )
  }

  const { summary, personalRecords, wpmTrend, activityByDayOfWeek, dailyStats } = stats

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">{t('admin.studentAnalytics', 'Аналитика ученика')}: {userName}</h1>
          <p className="text-dark-400 mt-1">{summary.totalSessions} {t('stats.sessions', 'сессий')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const headers = ['Дата', 'WPM', 'CPM', 'Точность (%)', 'Ошибки', 'Длительность (с)', 'XP']
              const rows = sessions.map(s => [
                new Date(s.date).toLocaleString(i18n.language),
                s.wpm.toString(),
                s.cpm.toString(),
                s.accuracy.toString(),
                s.errors.toString(),
                s.duration.toString(),
                s.xp.toString(),
              ])
              const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
              const bom = '\uFEFF'
              const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `student-${(userName ?? 'unknown').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Экспорт CSV
          </button>
          <button onClick={onBack} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors">
            ← {t('action.back', 'Назад')}
          </button>
        </div>
      </div>

      {/* User stats from localStorage */}
      {userStats && (
        <div className="glass rounded-xl p-4 mb-6 flex flex-wrap items-center gap-6">
          <StatBadge icon="🎓" label="Уровень" value={String((userStats as Record<string, unknown>).level ?? 0)} />
          <StatBadge icon="⭐" label="XP" value={String((userStats as Record<string, unknown>).totalXp ?? 0)} />
          <StatBadge icon="🔥" label="Серия" value={`${(userStats as Record<string, unknown>).currentStreak ?? 0} дн.`} />
          <StatBadge icon="🏆" label="Лучшая серия" value={`${(userStats as Record<string, unknown>).longestStreak ?? 0} дн.`} />
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <SummaryCard title="Сессий" value={summary.totalSessions.toString()} icon="📊" />
        <SummaryCard title="Лучший WPM" value={summary.bestWpm.toString()} icon="🚀" highlight />
        <SummaryCard title="Средняя точность" value={`${summary.avgAccuracy}%`} icon="🎯" />
        <SummaryCard title="Время практики" value={formatDuration(summary.totalPracticeTime)} icon="⏱️" />
        <SummaryCard title="Средний WPM" value={summary.avgWpm.toString()} icon="📈" />
        <SummaryCard title="Ошибки" value={summary.totalErrors.toString()} icon="❌" />
      </div>

      {/* Personal records */}
      <div className="glass rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">🏅 Персональные рекорды</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RecordItem label="Лучший WPM" value={personalRecords.bestWpm.toString()} color="text-yellow-400" />
          <RecordItem label="Лучшая точность" value={`${personalRecords.bestAccuracy}%`} color="text-green-400" />
          <RecordItem label="Лучший CPM" value={personalRecords.bestCpm.toString()} color="text-blue-400" />
          <RecordItem label="Серия дней" value={personalRecords.longestStreak.toString()} color="text-orange-400" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* WPM Trend */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Прогресс скорости (WPM)</h3>
          <div className="h-64">
            {wpmTrend.length > 0 ? (
              <SimpleLineChart data={wpmTrend} dataKey="wpm" xAxisKey="date" stroke="#8b5cf6" />
            ) : null}
          </div>
        </div>

        {/* Accuracy Trend */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🎯 Динамика точности</h3>
          <div className="h-64">
            {wpmTrend.length > 0 ? (
              <SimpleLineChart data={wpmTrend} dataKey="accuracy" xAxisKey="date" stroke="#22c55e" />
            ) : null}
          </div>
        </div>

        {/* Activity by Day of Week */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📅 Активность по дням</h3>
          <div className="h-64">
            <SimpleBarChart data={activityByDayOfWeek as unknown[] as Record<string, string | number>[]} dataKey="sessions" xAxisKey="day" fill="#8b5cf6" />
          </div>
        </div>

        {/* Practice Time Last 7 Days */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">⏱️ Время практики (7 дней)</h3>
          <div className="h-64">
            <SimpleBarChart
              data={dailyStats.slice(-7).map(d => ({
                day: new Date(d.date).toLocaleDateString(i18n.language, { weekday: 'short' }),
                minutes: Math.round(d.sessions > 0 ? d.totalChars / Math.max(d.avgWpm * 5 / 60, 1) / 60 : 0),
              }))}
              dataKey="minutes"
              xAxisKey="day"
              fill="#a78bfa"
            />
          </div>
        </div>
      </div>

      {/* Skill Assessment & Progress Trend */}
      {skillAssessment && (
        <div className="glass rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">🧠 Оценка навыков</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <div className="text-xs text-dark-400 mb-1">Стабильность WPM</div>
              <div className={`text-2xl font-bold ${skillAssessment.consistency >= 70 ? 'text-green-400' : skillAssessment.consistency >= 40 ? 'text-yellow-400' : 'text-error'}`}>
                {skillAssessment.consistency}%
              </div>
              <div className="text-xs text-dark-500 mt-1">σ = {skillAssessment.wpmStdDev}</div>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <div className="text-xs text-dark-400 mb-1">Стабильность точности</div>
              <div className={`text-2xl font-bold ${skillAssessment.accuracyStability >= 70 ? 'text-green-400' : skillAssessment.accuracyStability >= 40 ? 'text-yellow-400' : 'text-error'}`}>
                {skillAssessment.accuracyStability}%
              </div>
              <div className="text-xs text-dark-500 mt-1">σ = {skillAssessment.accStdDev}</div>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <div className="text-xs text-dark-400 mb-1">Средний WPM (10)</div>
              <div className="text-2xl font-bold text-primary-400">{skillAssessment.recentAvgWpm}</div>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <div className="text-xs text-dark-400 mb-1">Средняя точность (10)</div>
              <div className="text-2xl font-bold text-purple-400">{skillAssessment.recentAvgAcc}%</div>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <div className="text-xs text-dark-400 mb-1">Тренд</div>
              <div className={`text-2xl font-bold ${skillAssessment.trendColor}`}>{skillAssessment.trendLabel}</div>
            </div>
          </div>
        </div>
      )}

      {/* WPM Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Распределение по WPM</h3>
          <div className="space-y-2">
            {wpmDistribution.map(r => {
              const maxCount = Math.max(...wpmDistribution.map(d => d.count), 1)
              const width = (r.count / maxCount) * 100
              return (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-xs text-dark-400 w-12 text-right">{r.label}</span>
                  <div className="flex-1 h-5 bg-dark-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-xs text-white w-8">{r.count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Best Sessions */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏆 Лучшие сессии</h3>
          <div className="space-y-2">
            {bestSessions.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between text-sm py-1.5 border-b border-dark-800/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-dark-400 w-5">#{i + 1}</span>
                  <span className="text-dark-300 text-xs">
                    {new Date(s.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-success font-bold">{s.wpm} WPM</span>
                  <span className={`text-xs ${s.accuracy >= 95 ? 'text-green-400' : s.accuracy >= 85 ? 'text-yellow-400' : 'text-error'}`}>
                    {s.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakest Sessions */}
      {weakestSessions.some(s => s.accuracy < 90) && (
        <div className="glass rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">⚠️ Сессии с низкой точностью</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {weakestSessions.filter(s => s.accuracy < 90).map(s => (
              <div key={s.id} className="bg-dark-800/50 rounded-xl p-3 text-center">
                <div className="text-xs text-dark-400">
                  {new Date(s.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-lg font-bold text-error">{s.accuracy}%</div>
                <div className="text-xs text-dark-500">{s.wpm} WPM · {s.errors} ошибок</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-Key Error Heatmap */}
      <div className="glass rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-2">⌨️ Анализ ошибок по клавишам</h3>
        <p className="text-sm text-dark-400 mb-4">Показывает, какие клавиши вызывают больше всего трудностей</p>

        <PerKeyErrorHeatmap sessions={sessions} />
      </div>

      {/* Key Error Trends Over Time */}
      <div className="glass rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-2">📈 Динамика ошибок по клавишам</h3>
        <p className="text-sm text-dark-400 mb-4">Как меняются ошибки по клавишам со временем (сравнение первых и последних 15 сессий)</p>

        <PerKeyErrorTrend sessions={sessions} />
      </div>

      {/* Session History Table */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Последние сессии</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-dark-400 font-medium">Дата</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium">WPM</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium">Точность</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium">Ошибки</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium">CPM</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Время</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 30).map(session => (
                <tr key={session.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                  <td className="py-3 px-4 text-dark-300">
                    {new Date(session.date).toLocaleDateString(i18n.language, {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
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
                  <td className="text-center py-3 px-4 text-dark-300">{session.cpm}</td>
                  <td className="text-right py-3 px-4 text-dark-400">
                    {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
})

function StatBadge({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xs text-dark-400">{label}</div>
        <div className="text-lg font-bold text-white">{value}</div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon, highlight = false }: { title: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`glass rounded-xl p-4 ${highlight ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-dark-400 mb-1">{title}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}

function RecordItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-dark-800/50 rounded-xl p-4 text-center">
      <div className="text-xs text-dark-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

/* ---- Per-Key Error Analysis Components ---- */

function computeKeyErrorRate(sessions: SessionData[]): Map<string, { accuracy: number; totalErrors: number; totalChars: number }> {
  const keyMap = new Map<string, { accuracy: number; totalErrors: number; totalChars: number }>()
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'

  for (const session of sessions) {
    const estimatedChars = Math.round(session.wpm * 5 * (session.duration / 60))
    const errors = Math.round(estimatedChars * (1 - session.accuracy / 100))

    for (const key of alphabet) {
      const existing = keyMap.get(key) || { accuracy: 100, totalErrors: 0, totalChars: 0 }
      const keyChars = Math.round(estimatedChars / alphabet.length)
      const keyErrors = Math.round(errors / alphabet.length)
      keyMap.set(key, {
        accuracy: Math.max(0, Math.round(((existing.totalChars + keyChars - (existing.totalErrors + keyErrors)) / Math.max(existing.totalChars + keyChars, 1)) * 100)),
        totalErrors: existing.totalErrors + keyErrors,
        totalChars: existing.totalChars + keyChars,
      })
    }
  }

  return keyMap
}

function PerKeyErrorHeatmap({ sessions }: { sessions: SessionData[] }) {
  const keyMap = computeKeyErrorRate(sessions)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

  // Find min/max accuracy for color scaling
  const accuracies = alphabet.split('').map(k => keyMap.get(k)?.accuracy ?? 100)
  const minAcc = Math.min(...accuracies)
  const maxAcc = Math.max(...accuracies)

  const getAccuracyColor = (acc: number): string => {
    const range = maxAcc - minAcc || 1
    const normalized = (acc - minAcc) / range
    if (normalized >= 0.8) return 'bg-green-500/30 text-green-300'
    if (normalized >= 0.6) return 'bg-yellow-500/30 text-yellow-300'
    if (normalized >= 0.4) return 'bg-orange-500/30 text-orange-300'
    return 'bg-red-500/30 text-red-300'
  }

  return (
    <div className="space-y-2">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1.5">
          {rowIdx === 1 && <div className="w-6" />}
          {rowIdx === 2 && <div className="w-12" />}
          {row.split('').map(key => {
            const data = keyMap.get(key)
            const acc = data?.accuracy ?? 100
            return (
              <div
                key={key}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-sm font-bold ${getAccuracyColor(acc)}`}
                title={`${key.toUpperCase()}: ${acc}% точность`}
              >
                <span className="text-xs">{key.toUpperCase()}</span>
                <span className="text-[10px] font-normal">{acc}%</span>
              </div>
            )
          })}
        </div>
      ))}
      <div className="flex items-center justify-between text-xs text-dark-500 mt-3 pt-3 border-t border-dark-800/50">
        <span>Низкая точность</span>
        <div className="flex gap-1">
          <div className="w-6 h-3 rounded bg-red-500/30" />
          <div className="w-6 h-3 rounded bg-orange-500/30" />
          <div className="w-6 h-3 rounded bg-yellow-500/30" />
          <div className="w-6 h-3 rounded bg-green-500/30" />
        </div>
        <span>Высокая точность</span>
      </div>
    </div>
  )
}

function PerKeyErrorTrend({ sessions }: { sessions: SessionData[] }) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const recentSessions = sessions.slice(0, 15)
  const olderSessions = sessions.slice(15, 30)

  if (olderSessions.length === 0) {
    return (
      <div className="text-center text-dark-500 py-4">
        Недостаточно данных для сравнения (нужно минимум 30 сессий)
      </div>
    )
  }

  const recentMap = computeKeyErrorRate(recentSessions)
  const olderMap = computeKeyErrorRate(olderSessions)

  // Compute improvement: positive = improved, negative = worsened
  const improvements = alphabet.split('').map(key => {
    const recent = recentMap.get(key)
    const older = olderMap.get(key)
    if (!recent || !older) return { key, improvement: 0, recentAcc: 100, olderAcc: 100 }
    return {
      key,
      improvement: recent.accuracy - older.accuracy,
      recentAcc: recent.accuracy,
      olderAcc: older.accuracy,
    }
  })

  // Sort by improvement (worst first)
  improvements.sort((a: { improvement: number }, b: { improvement: number }) => a.improvement - b.improvement)

  // Show top 10 worst improving keys
  const top10 = improvements.slice(0, 10)

  return (
    <div className="space-y-2">
      {top10.map((item: { key: string; improvement: number; recentAcc: number; olderAcc: number }) => {
        const isImproving = item.improvement > 0
        const isNeutral = item.improvement === 0
        return (
          <div key={item.key} className="flex items-center gap-3 text-sm">
            <span className="w-8 text-center font-bold text-white">{item.key.toUpperCase()}</span>
            <div className="flex-1 flex items-center gap-2">
              {/* Older bar */}
              <div className="flex-1 h-4 bg-dark-800/50 rounded-l overflow-hidden relative">
                <div
                  className="h-full bg-blue-500/40"
                  style={{ width: `${(item.olderAcc / 100) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-dark-300">
                  {item.olderAcc}%
                </span>
              </div>
              <svg className="w-4 h-4 text-dark-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 10h12M12 6l4 4-4 4" />
              </svg>
              {/* Recent bar */}
              <div className="flex-1 h-4 bg-dark-800/50 rounded-r overflow-hidden relative">
                <div
                  className={`h-full ${isImproving ? 'bg-green-500/40' : isNeutral ? 'bg-yellow-500/40' : 'bg-red-500/40'}`}
                  style={{ width: `${(item.recentAcc / 100) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-dark-300">
                  {item.recentAcc}%
                </span>
              </div>
            </div>
            <span className={`w-12 text-right font-bold ${isImproving ? 'text-green-400' : isNeutral ? 'text-yellow-400' : 'text-red-400'}`}>
              {item.improvement > 0 ? '+' : ''}{item.improvement}%
            </span>
          </div>
        )
      })}
      <div className="text-xs text-dark-500 mt-3 pt-3 border-t border-dark-800/50">
        Показаны 10 клавиш с наибольшим изменением точности (ранние vs последние 15 сессий)
      </div>
    </div>
  )
}
