import { memo, useState, useMemo } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'

export interface LeaderboardEntry {
  id: string
  name: string
  wpm: number
  accuracy: number
  level: number
  totalWords: number
  streak: number
  lastActive: string
  avatar?: string
}

interface LeaderboardProps {
  currentUser?: LeaderboardEntry
  onClose: () => void
}

type SortBy = 'wpm' | 'accuracy' | 'level' | 'words' | 'streak'
type TimeFilter = 'today' | 'week' | 'month' | 'all'

export const Leaderboard = memo<LeaderboardProps>(function Leaderboard({ currentUser, onClose }: LeaderboardProps) {
  const [entries] = useLocalStorageState<LeaderboardEntry[]>('fastfingers_leaderboard', [])
  const [sortBy, setSortBy] = useState<SortBy>('wpm')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  const filteredAndSorted = useMemo(() => {
    let filtered = [...entries]

    // Фильтрация по времени
    const now = Date.now()
    const timeRanges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    }

    filtered = filtered.filter(entry => {
      const lastActive = new Date(entry.lastActive).getTime()
      return now - lastActive <= timeRanges[timeFilter]
    })

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'wpm':
          return b.wpm - a.wpm
        case 'accuracy':
          return b.accuracy - a.accuracy
        case 'level':
          return b.level - a.level
        case 'words':
          return b.totalWords - a.totalWords
        case 'streak':
          return b.streak - a.streak
        default:
          return 0
      }
    })

    return filtered
  }, [entries, sortBy, timeFilter])

  const currentUserRank = useMemo(() => {
    if (!currentUser) return null
    const index = filteredAndSorted.findIndex(e => e.id === currentUser.id)
    return index >= 0 ? index + 1 : null
  }, [filteredAndSorted, currentUser])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🏆</span>
              Таблица лидеров
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              Соревнуйтесь с другими пользователями
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Фильтры */}
          <div className="flex flex-wrap gap-4">
            {/* Сортировка */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="leaderboard-sort" className="block text-sm text-dark-400 mb-2">Сортировать по</label>
              <select
                id="leaderboard-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="wpm">⚡ Скорость (WPM)</option>
                <option value="accuracy">🎯 Точность</option>
                <option value="level">📊 Уровень</option>
                <option value="words">📚 Слова</option>
                <option value="streak">🔥 Серия</option>
              </select>
            </div>

            {/* Временной фильтр */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="leaderboard-period" id="leaderboard-period-label" className="block text-sm text-dark-400 mb-2">Период</label>
              <div role="radiogroup" aria-labelledby="leaderboard-period-label" className="flex gap-2">
                {(['today', 'week', 'month', 'all'] as TimeFilter[]).map(filter => (
                  <button
                    key={filter}
                    id={`leaderboard-period-${filter}`}
                    onClick={() => setTimeFilter(filter)}
                    role="radio"
                    aria-checked={timeFilter === filter}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeFilter === filter
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white'
                    }`}
                  >
                    {filter === 'today' && 'День'}
                    {filter === 'week' && 'Неделя'}
                    {filter === 'month' && 'Месяц'}
                    {filter === 'all' && 'Все'}
                  </button>
                ))}
              </div>
              <input type="hidden" id="leaderboard-period" value={timeFilter} />
            </div>
          </div>

          {/* Текущий пользователь */}
          {currentUser && currentUserRank && (
            <div className="card p-4 border-2 border-primary-500/50 bg-primary-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary-400">
                    #{currentUserRank}
                  </div>
                  <div>
                    <p className="font-semibold text-white">Ваша позиция</p>
                    <p className="text-sm text-dark-400">
                      {getSortLabel(sortBy)}: {getSortValue(currentUser, sortBy)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dark-400">До топ-10</p>
                  <p className="font-semibold text-primary-400">
                    {currentUserRank <= 10 ? '✅ В топе!' : `${currentUserRank - 10} мест`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Топ-3 */}
          {filteredAndSorted.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredAndSorted.slice(0, 3).map((entry, index) => (
                <TopCard
                  key={entry.id}
                  entry={entry}
                  rank={index + 1}
                  sortBy={sortBy}
                  isCurrentUser={currentUser?.id === entry.id}
                />
              ))}
            </div>
          )}

          {/* Остальные */}
          {filteredAndSorted.length > 3 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-4">Остальные участники</h3>
              {filteredAndSorted.slice(3).map((entry, index) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  rank={index + 4}
                  sortBy={sortBy}
                  isCurrentUser={currentUser?.id === entry.id}
                />
              ))}
            </div>
          )}

          {/* Пустое состояние */}
          {filteredAndSorted.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Нет данных</h3>
              <p className="text-dark-400">
                Начните тренироваться, чтобы попасть в рейтинг
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.onClose === nextProps.onClose &&
    prevProps.currentUser?.id === nextProps.currentUser?.id
})

function TopCard({
  entry,
  rank,
  sortBy,
  isCurrentUser,
}: {
  entry: LeaderboardEntry
  rank: number
  sortBy: SortBy
  isCurrentUser: boolean
}) {
  const medals = ['🥇', '🥈', '🥉']
  const colors = [
    'from-yellow-500 to-orange-500',
    'from-gray-400 to-gray-500',
    'from-orange-600 to-orange-700',
  ]

  return (
    <div
      className={`card p-6 text-center ${
        isCurrentUser ? 'border-2 border-primary-500' : ''
      }`}
    >
      <div className="text-6xl mb-4">{medals[rank - 1]}</div>
      <div className="mb-4">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors[rank - 1]} mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white`}
        >
          {entry.avatar || entry.name.charAt(0).toUpperCase()}
        </div>
        <h4 className="font-bold text-lg">{entry.name}</h4>
        <p className="text-sm text-dark-400">Уровень {entry.level}</p>
      </div>
      <div className="space-y-2">
        <div className="p-3 bg-dark-800/50 rounded-lg">
          <p className="text-xs text-dark-400">{getSortLabel(sortBy)}</p>
          <p className="text-2xl font-bold text-gradient">
            {getSortValue(entry, sortBy)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-dark-800/30 rounded">
            <p className="text-dark-500">WPM</p>
            <p className="font-semibold">{entry.wpm}</p>
          </div>
          <div className="p-2 bg-dark-800/30 rounded">
            <p className="text-dark-500">Точность</p>
            <p className="font-semibold">{entry.accuracy}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaderboardRow({
  entry,
  rank,
  sortBy,
  isCurrentUser,
}: {
  entry: LeaderboardEntry
  rank: number
  sortBy: SortBy
  isCurrentUser: boolean
}) {
  return (
    <div
      className={`card p-4 flex items-center gap-4 hover:bg-dark-800/70 transition-colors ${
        isCurrentUser ? 'border-2 border-primary-500' : ''
      }`}
    >
      <div className="w-12 text-center">
        <span className="text-xl font-bold text-dark-400">#{rank}</span>
      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white">
        {entry.avatar || entry.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1">
        <h4 className="font-semibold">{entry.name}</h4>
        <p className="text-xs text-dark-400">Уровень {entry.level}</p>
      </div>

      <div className="hidden md:flex gap-4 text-sm">
        <div className="text-center">
          <p className="text-dark-400 text-xs">WPM</p>
          <p className="font-semibold">{entry.wpm}</p>
        </div>
        <div className="text-center">
          <p className="text-dark-400 text-xs">Точность</p>
          <p className="font-semibold">{entry.accuracy}%</p>
        </div>
        <div className="text-center">
          <p className="text-dark-400 text-xs">Слова</p>
          <p className="font-semibold">{entry.totalWords.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-dark-400 text-xs">Серия</p>
          <p className="font-semibold">{entry.streak} 🔥</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-primary-400">
          {getSortValue(entry, sortBy)}
        </p>
        <p className="text-xs text-dark-400">{getSortLabel(sortBy)}</p>
      </div>
    </div>
  )
}

function getSortLabel(sortBy: SortBy): string {
  const labels = {
    wpm: 'WPM',
    accuracy: 'Точность',
    level: 'Уровень',
    words: 'Слова',
    streak: 'Серия',
  }
  return labels[sortBy]
}

function getSortValue(entry: LeaderboardEntry, sortBy: SortBy): string {
  switch (sortBy) {
    case 'wpm':
      return entry.wpm.toString()
    case 'accuracy':
      return `${entry.accuracy}%`
    case 'level':
      return entry.level.toString()
    case 'words':
      return entry.totalWords.toLocaleString()
    case 'streak':
      return `${entry.streak} дн.`
    default:
      return ''
  }
}
