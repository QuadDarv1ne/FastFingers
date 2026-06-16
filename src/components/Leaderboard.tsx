import { memo, useState, useMemo, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { useLeaderboard, useUserRank } from '@hooks/useLeaderboard'
import { useAppTranslation } from '../i18n/config'
import type { LeaderboardEntry as SupabaseLeaderboardEntry } from '@hooks/useLeaderboard'

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

function adaptLeaderboardEntry(entry: SupabaseLeaderboardEntry): LeaderboardEntry {
  return {
    id: entry.user_id,
    name: entry.name,
    wpm: entry.wpm,
    accuracy: entry.accuracy,
    level: entry.level,
    totalWords: Math.floor(entry.score / 10),
    streak: 0,
    lastActive: entry.created_at,
  }
}

interface LeaderboardProps {
  currentUser?: LeaderboardEntry
  onClose: () => void
  userId?: string
  gameMode?: 'classic' | 'hardcore' | 'duel'
}

type SortBy = 'wpm' | 'accuracy' | 'level' | 'words' | 'streak'
type TimeFilter = 'today' | 'week' | 'month' | 'all'

export const Leaderboard = memo<LeaderboardProps>(function Leaderboard({
  currentUser,
  onClose,
  gameMode = 'classic'
}: LeaderboardProps) {
  const { t } = useAppTranslation()
  const [sortBy, setSortBy] = useState<SortBy>('wpm')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const containerRef = useRef<HTMLDivElement>(null)

  useFocusTrap(containerRef, true)

  const { data: supabaseEntries, isLoading, error } = useLeaderboard({
    gameMode,
    timeFilter,
    sortBy: sortBy === 'wpm' || sortBy === 'accuracy' || sortBy === 'level' ? sortBy : 'score',
    limit: 100,
  })

  const { data: userRankData } = useUserRank(currentUser?.id, gameMode)

  const entries: LeaderboardEntry[] = useMemo(() => {
    if (!supabaseEntries) return []
    return supabaseEntries.map(adaptLeaderboardEntry)
  }, [supabaseEntries])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const currentUserRank = useMemo(() => {
    if (userRankData?.rank) return userRankData.rank
    if (!currentUser) return null
    const index = entries.findIndex(e => e.id === currentUser.id)
    return index >= 0 ? index + 1 : null
  }, [entries, currentUser, userRankData])

  const currentUserPercentile = useMemo(() => {
    if (!currentUser || entries.length === 0) return null
    const betterThan = entries.filter(e =>
      e.wpm < currentUser.wpm || (e.wpm === currentUser.wpm && e.accuracy < currentUser.accuracy)
    ).length
    return Math.round((betterThan / entries.length) * 100)
  }, [entries, currentUser])

  const getSortLabel = (s: SortBy): string => {
    switch (s) {
      case 'wpm': return t('common.wpm')
      case 'accuracy': return t('common.accuracy')
      case 'level': return t('common.level')
      case 'words': return t('common.words')
      case 'streak': return t('common.streak')
      default: return ''
    }
  }

  const getSortValue = (entry: LeaderboardEntry, s: SortBy): string => {
    switch (s) {
      case 'wpm': return entry.wpm.toString()
      case 'accuracy': return `${entry.accuracy}%`
      case 'level': return entry.level.toString()
      case 'words': return entry.totalWords.toLocaleString()
      case 'streak': return `${entry.streak} ${t('common.days')}`
      default: return ''
    }
  }

  const timeFilters: { key: TimeFilter; labelKey: string }[] = [
    { key: 'today', labelKey: 'leaderboard.day' },
    { key: 'week', labelKey: 'leaderboard.week' },
    { key: 'month', labelKey: 'leaderboard.month' },
    { key: 'all', labelKey: 'leaderboard.all' },
  ]

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 id="leaderboard-title" className="text-2xl font-bold flex items-center gap-2">
              <span>🏆</span>
              {t('stats.leaderboard')}
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              {t('leaderboard.subtitle')}
            </p>
            {isLoading && <p className="text-primary-400 text-xs mt-2">{t('action.loading')}</p>}
            {error && <p className="text-red-400 text-xs mt-2">{t('leaderboard.loadError')}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
            aria-label={t('action.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-dark-400">{t('action.loading')}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-red-400">{t('leaderboard.loadError')}</p>
              <p className="text-sm text-dark-500 mt-2">{t('leaderboard.checkConnection')}</p>
            </div>
          )}

          {!isLoading && !error && entries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">{t('leaderboard.noData')}</h3>
              <p className="text-dark-400">{t('leaderboard.noDataHint')}</p>
            </div>
          )}

          {!isLoading && !error && entries.length > 0 && (
            <>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="leaderboard-sort" className="block text-sm text-dark-400 mb-2">{t('leaderboard.sortBy')}</label>
              <select
                id="leaderboard-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="wpm">⚡ {t('common.speed')} ({t('common.wpm')})</option>
                <option value="accuracy">🎯 {t('common.accuracy')}</option>
                <option value="level">📊 {t('common.level')}</option>
                <option value="words">📚 {t('common.words')}</option>
                <option value="streak">🔥 {t('common.streak')}</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="leaderboard-period" id="leaderboard-period-label" className="block text-sm text-dark-400 mb-2">{t('leaderboard.period')}</label>
              <div role="radiogroup" aria-labelledby="leaderboard-period-label" className="flex gap-2">
                {timeFilters.map(filter => (
                  <button
                    key={filter.key}
                    id={`leaderboard-period-${filter.key}`}
                    onClick={() => setTimeFilter(filter.key)}
                    role="radio"
                    aria-checked={timeFilter === filter.key}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeFilter === filter.key
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white'
                    }`}
                  >
                    {t(filter.labelKey)}
                  </button>
                ))}
              </div>
              <input type="hidden" id="leaderboard-period" value={timeFilter} />
            </div>
          </div>

          {currentUser && currentUserRank && (
            <div className="card p-4 border-2 border-primary-500/50 bg-primary-500/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary-400">
                    #{currentUserRank}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t('leaderboard.yourPosition')}</p>
                    <p className="text-sm text-dark-400">
                      {getSortLabel(sortBy)}: {getSortValue(currentUser, sortBy)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-sm text-dark-400">{t('leaderboard.toTop10')}</p>
                    <p className="font-semibold text-primary-400">
                      {currentUserRank <= 10 ? `✅ ${t('leaderboard.inTop')}` : `${currentUserRank - 10} ${t('leaderboard.places')}`}
                    </p>
                  </div>
                  {currentUserPercentile !== null && (
                    <div className="text-right">
                      <p className="text-sm text-dark-400">{t('common.rank')}</p>
                      <p className="font-semibold text-primary-400">
                        {t('leaderboard.fasterThan', { pct: currentUserPercentile })}
                      </p>
                      <div className="mt-1 w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all"
                          style={{ width: `${currentUserPercentile}%` }}
                          role="progressbar"
                          aria-valuenow={currentUserPercentile}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={t('leaderboard.fasterThan', { pct: currentUserPercentile })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {entries.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {entries.slice(0, 3).map((entry, index) => (
                <TopCard
                  key={entry.id}
                  entry={entry}
                  rank={index + 1}
                  sortBy={sortBy}
                  isCurrentUser={currentUser?.id === entry.id}
                  getSortLabel={getSortLabel}
                  getSortValue={getSortValue}
                />
              ))}
            </div>
          )}

          {entries.length > 3 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-4">{t('leaderboard.otherParticipants')}</h3>
              <VirtualLeaderboardList
                entries={entries.slice(3)}
                startRank={4}
                sortBy={sortBy}
                currentUserId={currentUser?.id}
                getSortLabel={getSortLabel}
                getSortValue={getSortValue}
              />
            </div>
          )}
            </>
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
  getSortLabel,
  getSortValue,
}: {
  entry: LeaderboardEntry
  rank: number
  sortBy: SortBy
  isCurrentUser: boolean
  getSortLabel: (s: SortBy) => string
  getSortValue: (e: LeaderboardEntry, s: SortBy) => string
}) {
  const { t } = useAppTranslation()
  const medals = ['🥇', '🥈', '🥉']
  const colors = [
    'from-yellow-500 to-orange-500',
    'from-gray-400 to-gray-500',
    'from-orange-600 to-orange-700',
  ]

  return (
    <div className={`card p-6 text-center ${isCurrentUser ? 'border-2 border-primary-500' : ''}`}>
      <div className="text-6xl mb-4">{medals[rank - 1]}</div>
      <div className="mb-4">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors[rank - 1]} mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white`}>
          {entry.avatar || entry.name.charAt(0).toUpperCase()}
        </div>
        <h4 className="font-bold text-lg">{entry.name}</h4>
        <p className="text-sm text-dark-400">{t('common.level')} {entry.level}</p>
      </div>
      <div className="space-y-2">
        <div className="p-3 bg-dark-800/50 rounded-lg">
          <p className="text-xs text-dark-400">{getSortLabel(sortBy)}</p>
          <p className="text-2xl font-bold text-gradient">{getSortValue(entry, sortBy)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-dark-800/30 rounded">
            <p className="text-dark-500">{t('common.wpm')}</p>
            <p className="font-semibold">{entry.wpm}</p>
          </div>
          <div className="p-2 bg-dark-800/30 rounded">
            <p className="text-dark-500">{t('common.accuracy')}</p>
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
  getSortLabel,
  getSortValue,
}: {
  entry: LeaderboardEntry
  rank: number
  sortBy: SortBy
  isCurrentUser: boolean
  getSortLabel: (s: SortBy) => string
  getSortValue: (e: LeaderboardEntry, s: SortBy) => string
}) {
  const { t } = useAppTranslation()

  return (
    <div className={`card p-4 flex items-center gap-4 hover:bg-dark-800/70 transition-colors ${isCurrentUser ? 'border-2 border-primary-500' : ''}`}>
      <div className="w-12 text-center">
        <span className="text-xl font-bold text-dark-400">#{rank}</span>
      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white">
        {entry.avatar || entry.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1">
        <h4 className="font-semibold">{entry.name}</h4>
        <p className="text-xs text-dark-400">{t('common.level')} {entry.level}</p>
      </div>

      <div className="hidden md:flex gap-4 text-sm">
        <div className="text-center">
          <p className="text-dark-400 text-xs">{t('common.wpm')}</p>
          <p className="font-semibold">{entry.wpm}</p>
        </div>
        <div className="text-center">
          <p className="text-dark-400 text-xs">{t('common.accuracy')}</p>
          <p className="font-semibold">{entry.accuracy}%</p>
        </div>
        <div className="text-center">
          <p className="text-dark-400 text-xs">{t('common.words')}</p>
          <p className="font-semibold">{entry.totalWords.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-dark-400 text-xs">{t('common.streak')}</p>
          <p className="font-semibold">{entry.streak} 🔥</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-primary-400">{getSortValue(entry, sortBy)}</p>
        <p className="text-xs text-dark-400">{getSortLabel(sortBy)}</p>
      </div>
    </div>
  )
}

function VirtualLeaderboardList({
  entries,
  startRank,
  sortBy,
  currentUserId,
  getSortLabel,
  getSortValue,
}: {
  entries: LeaderboardEntry[]
  startRank: number
  sortBy: SortBy
  currentUserId?: string
  getSortLabel: (s: SortBy) => string
  getSortValue: (e: LeaderboardEntry, s: SortBy) => string
}) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  return (
    <div
      ref={parentRef}
      className="max-h-96 overflow-y-auto"
      style={{ height: '384px' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const entry = entries[virtualRow.index]
          if (!entry) return null
          return (
            <div
              key={entry.id}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <LeaderboardRow
                entry={entry}
                rank={startRank + virtualRow.index}
                sortBy={sortBy}
                isCurrentUser={currentUserId === entry.id}
                getSortLabel={getSortLabel}
                getSortValue={getSortValue}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
