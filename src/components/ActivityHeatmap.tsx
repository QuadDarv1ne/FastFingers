import { useMemo } from 'react'
import { useTypingHistory } from '../hooks/useTypingHistory'
import { useAppTranslation } from '../i18n/config'

interface ActivityHeatmapProps {
  months?: number
}

interface DayData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  wpm?: number
}

interface WeekData {
  days: DayData[]
}

const LEVEL_COLORS = [
  'bg-dark-800',
  'bg-primary-900',
  'bg-primary-800',
  'bg-primary-600',
  'bg-primary-400',
]

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export function ActivityHeatmap({ months = 6 }: ActivityHeatmapProps) {
  const { t } = useAppTranslation()
  const { history } = useTypingHistory()

  const heatmapData = useMemo(() => {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    // Считаем сессии по дням
    const sessionsByDate = new Map<string, { count: number; totalWpm: number }>()
    history.sessions.forEach((session: { date: string; wpm: number }) => {
      const date = new Date(session.date).toISOString().split('T')[0] || ''
      const existing = sessionsByDate.get(date) || { count: 0, totalWpm: 0 }
      existing.count++
      existing.totalWpm += session.wpm
      sessionsByDate.set(date, existing)
    })

    // Определяем уровень активности
    const maxCount = Math.max(...Array.from(sessionsByDate.values()).map(v => v.count), 1)

    const weeks: WeekData[] = []
    let currentWeek: DayData[] = []

    // Заполняем пустые дни до первого дня
    const dayOfWeek = startDate.getDay()
    for (let i = 0; i < dayOfWeek; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() - (dayOfWeek - i))
      const dateStr = date.toISOString().split('T')[0] || ''
      currentWeek.push({
        date: dateStr,
        count: 0,
        level: 0,
      })
    }

    // Генерируем данные по дням
    const currentDate = new Date(startDate)
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0] || ''
      const sessionData = sessionsByDate.get(dateStr)

      if (sessionData) {
        const level = Math.ceil((sessionData.count / maxCount) * 4) as 0 | 1 | 2 | 3 | 4
        currentWeek.push({
          date: dateStr,
          count: sessionData.count,
          level,
          wpm: Math.round(sessionData.totalWpm / sessionData.count),
        })
      } else {
        currentWeek.push({
          date: dateStr,
          count: 0,
          level: 0,
        })
      }

      // Новая неделя
      if (currentDate.getDay() === 6) {
        weeks.push({ days: currentWeek })
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Добавляем последнюю неделю
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDate = new Date(currentWeek[currentWeek.length - 1]?.date || Date.now())
        lastDate.setDate(lastDate.getDate() + 1)
        const dateStr = lastDate.toISOString().split('T')[0] || ''
        currentWeek.push({
          date: dateStr,
          count: 0,
          level: 0,
        })
      }
      weeks.push({ days: currentWeek })
    }

    return { weeks, totalSessions: history.totalSessions }
  }, [history.sessions, history.totalSessions, months])

  const totalActiveDays = useMemo(() => {
    return heatmapData.weeks.reduce((acc, week) => {
      return acc + week.days.filter(d => d.count > 0).length
    }, 0)
  }, [heatmapData])

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('stats.activityHeatmap')}</h3>
        <p className="text-sm text-dark-400">
          {totalActiveDays} {t('stats.activeDays')} • {heatmapData.totalSessions} {t('stats.totalSessions')}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {heatmapData.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.days.map((day) => (
                <Tooltip key={day.date} day={day}>
                  <div
                    className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[day.level]} transition-colors hover:ring-2 hover:ring-primary-400 hover:ring-offset-1 hover:ring-offset-dark-900`}
                    data-date={day.date}
                    data-count={day.count}
                  />
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-dark-500">
        <div className="flex items-center gap-1">
          <span>{t('stats.less')}</span>
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className={`w-2 h-2 rounded-sm ${color}`} />
          ))}
          <span>{t('stats.more')}</span>
        </div>
        <div className="flex gap-2">
          {heatmapData.weeks.length > 0 && heatmapData.weeks[0]?.days[0] && (
            <>
              <span>{MONTH_NAMES[new Date(heatmapData.weeks[0].days[0].date).getMonth()]}</span>
              <span>→</span>
              <span>{MONTH_NAMES[new Date().getMonth()]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Tooltip({ day, children }: { day: DayData; children: React.ReactNode }) {
  const { t } = useAppTranslation()
  const date = new Date(day.date)
  const dateStr = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-dark-900 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
        <div className="font-semibold">{day.count} {t('stats.sessions')}</div>
        {day.wpm && <div className="text-dark-400">{day.wpm} WPM</div>}
        <div className="text-dark-500">{dateStr}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-dark-900" />
      </div>
    </div>
  )
}
