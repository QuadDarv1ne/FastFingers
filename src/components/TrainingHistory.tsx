import { useMemo } from 'react'
import { useTypingHistory } from '../hooks/useTypingHistory'

interface TrainingHistoryProps {
  onBack: () => void
}

export function TrainingHistory({ onBack }: TrainingHistoryProps) {
  const { history, clearHistory, getStatsForPeriod } = useTypingHistory()

  // Статистика за разные периоды
  const stats24h = useMemo(() => getStatsForPeriod(1), [getStatsForPeriod])
  const stats7d = useMemo(() => getStatsForPeriod(7), [getStatsForPeriod])
  const stats30d = useMemo(() => getStatsForPeriod(30), [getStatsForPeriod])

  // Данные для графика WPM по сессиям
  const wpmData = useMemo(() => {
    return history.sessions.slice(0, 20).reverse().map((s, i) => ({
      index: i + 1,
      wpm: s.wpm,
      accuracy: s.accuracy,
    }))
  }, [history.sessions])

  // Максимальный WPM для масштаба графика
  const maxWpm = Math.max(...wpmData.map(d => d.wpm), 1)

  return (
    <div className="glass rounded-xl p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">История тренировок</h2>
          <p className="text-sm text-dark-400">Ваш прогресс и достижения</p>
        </div>
        
        <button
          onClick={onBack}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          title="Назад"
        >
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Всего сессий" 
          value={history.totalSessions.toString()} 
          icon="📊"
        />
        <StatCard 
          label="Время тренировок" 
          value={`${formatTime(history.totalTime)}`} 
          icon="⏱️"
        />
        <StatCard 
          label="Лучший WPM" 
          value={stats30d.bestWpm.toString()} 
          icon="🚀"
          highlight
        />
        <StatCard 
          label="Средняя точность" 
          value={`${stats30d.avgAccuracy}%`} 
          icon="🎯"
        />
      </div>

      {/* Статистика по периодам */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PeriodCard 
          period="24 часа" 
          stats={stats24h}
        />
        <PeriodCard 
          period="7 дней" 
          stats={stats7d}
        />
        <PeriodCard 
          period="30 дней" 
          stats={stats30d}
        />
      </div>

      {/* График WPM */}
      {wpmData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Прогресс WPM</h3>
          <div className="bg-dark-800 rounded-xl p-4 h-48 flex items-end gap-1">
            {wpmData.map((d) => (
              <div
                key={d.index}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="relative w-full">
                  <div
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all duration-300 group-hover:from-primary-500 group-hover:to-primary-300"
                    style={{ 
                      height: `${Math.max(4, (d.wpm / maxWpm) * 160)}px`,
                      minHeight: '4px'
                    }}
                  />
                  {/* Тултип */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {d.wpm} WPM
                  </div>
                </div>
                <span className="text-xs text-dark-500">{d.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* График точности */}
      {wpmData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Точность</h3>
          <div className="bg-dark-800 rounded-xl p-4 h-48 flex items-end gap-1">
            {wpmData.map((d) => (
              <div
                key={d.index}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="relative w-full">
                  <div
                    className={`w-full rounded-t transition-all duration-300 group-hover:opacity-80 ${
                      d.accuracy >= 95 ? 'bg-gradient-to-t from-success/60 to-success/30' :
                      d.accuracy >= 85 ? 'bg-gradient-to-t from-yellow-500/60 to-yellow-400/30' :
                      'bg-gradient-to-t from-error/60 to-error/30'
                    }`}
                    style={{ 
                      height: `${(d.accuracy / 100) * 160}px`,
                      minHeight: '4px'
                    }}
                  />
                  {/* Тултип */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {d.accuracy}%
                  </div>
                </div>
                <span className="text-xs text-dark-500">{d.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Последние сессии */}
      {history.sessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Последние сессии</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.sessions.slice(0, 10).map((session, index) => (
              <div
                key={session.id}
                className="bg-dark-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{session.wpm} WPM</p>
                    <p className="text-xs text-dark-500">
                      {new Date(session.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-medium ${
                      session.accuracy >= 95 ? 'text-success' : 
                      session.accuracy >= 85 ? 'text-yellow-400' : 'text-error'
                    }`}>
                      {session.accuracy}%
                    </p>
                    <p className="text-xs text-dark-500">{session.errors} ошибок</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка очистки */}
      {history.sessions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-dark-700">
          <button
            onClick={clearHistory}
            className="w-full py-3 bg-error/20 hover:bg-error/30 text-error rounded-lg font-medium transition-colors"
          >
            Очистить историю
          </button>
        </div>
      )}

      {/* Пустое состояние */}
      {history.sessions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">История пуста</h3>
          <p className="text-dark-400 mb-4">Завершите хотя бы одну тренировку</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
          >
            Начать тренировку
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  icon,
  highlight = false 
}: { 
  label: string
  value: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`bg-dark-800 rounded-xl p-4 ${highlight ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-dark-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function PeriodCard({
  period,
  stats
}: {
  period: string
  stats: { avgWpm: number; avgAccuracy: number; bestWpm: number; sessions: number }
}) {
  return (
    <div className="bg-dark-800/50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-dark-400 mb-3">{period}</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-dark-500">Сессий</span>
          <span className="text-sm">{stats.sessions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-dark-500">Средний WPM</span>
          <span className="text-sm text-primary-400">{stats.avgWpm}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-dark-500">Средняя точность</span>
          <span className="text-sm">{stats.avgAccuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-dark-500">Лучший WPM</span>
          <span className="text-sm text-success">{stats.bestWpm}</span>
        </div>
      </div>
    </div>
  )
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}ч ${mins}м`
}
