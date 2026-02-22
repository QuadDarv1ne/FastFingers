import { useMemo } from 'react'
import { useTypingHistory } from '../hooks/useTypingHistory'

interface WeeklyProgressProps {
  compact?: boolean
}

export function WeeklyProgress({ compact = false }: WeeklyProgressProps) {
  const { history } = useTypingHistory()

  // Получаем данные за последние 7 дней
  const weeklyData = useMemo(() => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const today = new Date()
    const result = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]

      const sessionsOnDay = history.sessions.filter(s => 
        s.date.startsWith(dateStr)
      )

      const totalXp = sessionsOnDay.reduce((sum, s) => sum + s.xp, 0)
      const avgWpm = sessionsOnDay.length > 0
        ? Math.round(sessionsOnDay.reduce((sum, s) => sum + s.wpm, 0) / sessionsOnDay.length)
        : 0
      const totalTime = sessionsOnDay.reduce((sum, s) => sum + s.duration, 0)

      result.push({
        date: dateStr,
        dayName,
        dayNum: date.getDate(),
        sessions: sessionsOnDay.length,
        xp: totalXp,
        avgWpm,
        totalTime,
      })
    }

    return result
  }, [history.sessions])

  const maxSessions = Math.max(...weeklyData.map(d => d.sessions), 1)
  const maxXp = Math.max(...weeklyData.map(d => d.xp), 1)

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-dark-400">Эта неделя</h3>
          <span className="text-xs text-primary-400">
            {weeklyData.reduce((sum, d) => sum + d.sessions, 0)} тренировок
          </span>
        </div>
        <div className="flex gap-1 h-16">
          {weeklyData.map((day, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col justify-end group relative"
            >
              <div
                className="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all hover:from-primary-500 hover:to-primary-300"
                style={{
                  height: `${(day.sessions / maxSessions) * 100}%`,
                  minHeight: day.sessions > 0 ? '4px' : '0',
                }}
              />
              {/* Тултип */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 
                            bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 
                            transition-opacity whitespace-nowrap pointer-events-none z-10">
                {day.sessions} тренировок
                <br />
                {day.xp} XP
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-dark-500">
          {weeklyData.map((day, index) => (
            <span key={index} className="flex-1 text-center">{day.dayName}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Прогресс за неделю</h2>
          <p className="text-sm text-dark-400">Активность за последние 7 дней</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-dark-400">Всего</p>
          <p className="text-xl font-bold text-primary-400">
            {weeklyData.reduce((sum, d) => sum + d.sessions, 0)}
          </p>
          <p className="text-xs text-dark-500">тренировок</p>
        </div>
      </div>

      {/* График тренировок */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Тренировки по дням</h3>
        <div className="flex gap-2 h-32">
          {weeklyData.map((day, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col justify-end group relative"
            >
              <div
                className="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg 
                          transition-all hover:from-primary-500 hover:to-primary-300"
                style={{
                  height: `${(day.sessions / maxSessions) * 100}%`,
                  minHeight: day.sessions > 0 ? '8px' : '0',
                }}
              />
              {/* Тултип */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                            bg-dark-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 
                            transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                <p className="font-bold">{day.dayName}, {day.dayNum}</p>
                <p className="text-primary-400">{day.sessions} тренировок</p>
                <p className="text-yellow-400">{day.xp} XP</p>
                <p className="text-dark-400">{Math.round(day.totalTime / 60)} мин</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          {weeklyData.map((day, index) => (
            <div
              key={index}
              className="flex-1 text-center text-xs text-dark-500"
            >
              <p>{day.dayName}</p>
              <p className="text-dark-600">{day.dayNum}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика по XP */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Заработанный XP</h3>
        <div className="flex gap-2 h-20">
          {weeklyData.map((day, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col justify-end group relative"
            >
              <div
                className="bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg 
                          transition-all hover:from-yellow-500 hover:to-yellow-300"
                style={{
                  height: `${(day.xp / maxXp) * 100}%`,
                  minHeight: day.xp > 0 ? '8px' : '0',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">Тренировок</p>
          <p className="text-lg font-bold text-primary-400">
            {weeklyData.reduce((sum, d) => sum + d.sessions, 0)}
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">XP</p>
          <p className="text-lg font-bold text-yellow-400">
            {weeklyData.reduce((sum, d) => sum + d.xp, 0)}
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">Ср. WPM</p>
          <p className="text-lg font-bold text-success">
            {weeklyData.filter(d => d.avgWpm > 0).length > 0
              ? Math.round(weeklyData.filter(d => d.avgWpm > 0)
                  .reduce((sum, d) => sum + d.avgWpm, 0) / 
                  weeklyData.filter(d => d.avgWpm > 0).length)
              : 0}
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <p className="text-xs text-dark-400">Время</p>
          <p className="text-lg font-bold text-dark-300">
            {Math.round(weeklyData.reduce((sum, d) => sum + d.totalTime, 0) / 60)} мин
          </p>
        </div>
      </div>
    </div>
  )
}
