import { useState, useEffect, useMemo } from 'react'
import { useAppTranslation } from '../../i18n/config'
import { useAuth } from '../../hooks/useAuth'
import type { User, UserRole } from '../../types/auth'
import { getFromStorageAsArray } from '../../utils/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'

interface StoredUser extends User {
  password: string
}

type DisplayUser = User

function loadUsers(): StoredUser[] {
  return getFromStorageAsArray(STORAGE_KEYS.USERS)
}

function saveUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  } catch {
    // Ignore storage errors
  }
}

function stripPasswords(users: StoredUser[]): DisplayUser[] {
  return users.map(({ password: _, ...rest }) => rest)
}

function loadHistory(): Array<{ userId: string; date: string; wpm: number; accuracy: number; duration: number; errors: number; wordsTyped: number }> {
  return getFromStorageAsArray(STORAGE_KEYS.HISTORY)
}

type SortField = 'name' | 'level' | 'xp' | 'wpm' | 'lastLogin' | 'createdAt'

interface UserAdminProps {
  onViewStudent?: (userId: string, userName: string) => void
}

export function UserAdmin({ onViewStudent }: UserAdminProps) {
  const { user: currentUser } = useAuth()
  const { t, i18n } = useAppTranslation()
  const [users, setUsers] = useState<DisplayUser[]>([])
  const [rawUsers, setRawUsers] = useState<StoredUser[]>([])
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('xp')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    const loaded = loadUsers()
    setRawUsers(loaded)
    setUsers(stripPasswords(loaded))
  }, [])

  const history = useMemo(() => loadHistory(), [])

  const userSessionCounts = useMemo(() => {
    const counts: Record<string, { sessions: number; totalWords: number; totalTime: number }> = {}
    for (const h of history) {
      const entry = counts[h.userId] || { sessions: 0, totalWords: 0, totalTime: 0 }
      entry.sessions++
      entry.totalWords += h.wordsTyped || 0
      entry.totalTime += h.duration || 0
      counts[h.userId] = entry
    }
    return counts
  }, [history])

  const filteredAndSorted = useMemo(() => {
    let result = users
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
      )
    }
    return [...result].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name': cmp = (a.name || a.email).localeCompare(b.name || b.email); break
        case 'level': cmp = (a.stats.level ?? 0) - (b.stats.level ?? 0); break
        case 'xp': cmp = (a.stats.totalXp ?? 0) - (b.stats.totalXp ?? 0); break
        case 'wpm': cmp = (a.stats.bestWpm ?? 0) - (b.stats.bestWpm ?? 0); break
        case 'lastLogin': cmp = (a.lastLogin || '').localeCompare(b.lastLogin || ''); break
        case 'createdAt': cmp = (a.createdAt || '').localeCompare(b.createdAt || ''); break
        default: break
      }
      return sortAsc ? cmp : -cmp
    })
  }, [users, search, sortField, sortAsc])

  function toggleRole(userId: string, currentRole: UserRole) {
    const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin'
    const next = rawUsers.map(u => {
      if (u.id === userId) return { ...u, role: newRole }
      return u
    })
    saveUsers(next)
    setRawUsers(next)
    setUsers(stripPasswords(next))
  }

  function deleteUser(userId: string) {
    if (!confirm(t('admin.deleteConfirm'))) return
    const next = rawUsers.filter(u => u.id !== userId)
    saveUsers(next)
    setRawUsers(next)
    setUsers(stripPasswords(next))
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString(i18n.language, {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(prev => !prev)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-dark-600 ml-1">⇅</span>
    return <span className="text-primary-400 ml-1">{sortAsc ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-4">
      {/* Search and sort */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder={t('admin.searchPlaceholder', '🔍 Search by name, email or ID...')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="flex gap-1">
          {(['xp', 'wpm', 'level', 'lastLogin'] as SortField[]).map(field => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center ${
                sortField === field
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-dark-700 text-dark-400 hover:text-white'
              }`}
            >
              {field === 'xp' ? 'XP' : field === 'wpm' ? 'WPM' : field === 'level' ? t('admin.sortLevel') : t('admin.sortLastLogin')}
              <SortIcon field={field} />
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-dark-400">
        {t('admin.userCount', { count: filteredAndSorted.length, total: users.length })}
        {search && ` · поиск: "${search}"`}
      </p>

      {filteredAndSorted.length === 0 && (
        <p className="text-center text-dark-500 py-8 text-sm">
          {users.length === 0 ? t('admin.noUsers', 'No registered users') : t('admin.noResults', 'Nothing found')}
        </p>
      )}

      {filteredAndSorted.map(u => {
        const sessions = userSessionCounts[u.id]?.sessions ?? 0
        const totalWords = userSessionCounts[u.id]?.totalWords ?? 0
        const totalTime = userSessionCounts[u.id]?.totalTime ?? 0
        const timeStr = totalTime < 60 ? `${Math.round(totalTime)}с` : `${Math.round(totalTime / 60)}мин`

        return (
          <div key={u.id} className="glass rounded-xl p-4">
            <div
              role="button"
              tabIndex={0}
              className="cursor-pointer hover:opacity-80 transition-opacity mb-3"
              onClick={() => onViewStudent?.(u.id, u.name || u.email)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewStudent?.(u.id, u.name || u.email) }}
              title={t('admin.viewAnalytics', 'View analytics')}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{u.name || u.email}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  u.role === 'admin'
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'bg-dark-700 text-dark-300'
                }`}>
                  {u.role === 'admin' ? t('admin.roleAdmin', 'Admin') : t('admin.roleUser', 'User')}
                </span>
                {u.id === currentUser?.id && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Вы</span>
                )}
              </div>
              <p className="text-xs text-dark-400">{u.email}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-dark-500">
                {u.lastLogin && <span>Последний вход: {formatDate(u.lastLogin)}</span>}
                <span>Регистрация: {formatDate(u.createdAt)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-dark-500">
                <span>Уровень {u.stats?.level ?? 0} · {u.stats?.totalXp ?? 0} XP</span>
                <span>{u.stats?.bestWpm ?? 0} WPM · {u.stats?.totalWordsTyped ?? 0} слов</span>
                {sessions > 0 && <span>{sessions} тренировок · {totalWords} слов · {timeStr}</span>}
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {onViewStudent && (
                <button
                  onClick={() => onViewStudent(u.id, u.name || u.email)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
                >
                  📊 Аналитика
                </button>
              )}
              {u.id !== currentUser?.id && (
                <>
                  <button
                    onClick={() => toggleRole(u.id, u.role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      u.role === 'admin'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-accent-500/20 text-accent-400 hover:bg-accent-500/30'
                    }`}
                  >
                    {u.role === 'admin' ? t('admin.removeAdmin', 'Remove admin') : t('admin.assignAdmin', 'Assign admin')}
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-error/10 text-error hover:bg-error/20 transition-colors"
                  >
                    🗑 Удалить
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
