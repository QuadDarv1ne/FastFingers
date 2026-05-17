import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { User, UserRole } from '../../types/auth'

const USERS_STORAGE_KEY = 'fastfingers_users'

interface StoredUser extends User {
  password: string
}

type DisplayUser = User

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function stripPasswords(users: StoredUser[]): DisplayUser[] {
  return users.map(({ password: _, ...rest }) => rest)
}

export function UserAdmin() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<DisplayUser[]>([])
  const [rawUsers, setRawUsers] = useState<StoredUser[]>([])

  useEffect(() => {
    const loaded = loadUsers()
    setRawUsers(loaded)
    setUsers(stripPasswords(loaded))
  }, [])

  function toggleRole(userId: string, currentRole: UserRole) {
    const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin'
    const next = rawUsers.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole }
      }
      return u
    })
    saveUsers(next)
    setRawUsers(next)
    setUsers(stripPasswords(next))
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-dark-400">{users.length} зарегистрированных пользователей</p>

      {users.length === 0 && (
        <p className="text-center text-dark-500 py-8 text-sm">
          Нет зарегистрированных пользователей
        </p>
      )}

      {users.map(u => (
        <div key={u.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-white">{u.name || u.email}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                u.role === 'admin'
                  ? 'bg-accent-500/20 text-accent-400'
                  : 'bg-dark-700 text-dark-300'
              }`}>
                {u.role === 'admin' ? 'Админ' : 'Пользователь'}
              </span>
              {u.id === currentUser?.id && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Вы</span>
              )}
            </div>
            <p className="text-xs text-dark-400">{u.email}</p>
            {u.lastLogin && (
              <p className="text-xs text-dark-500 mt-1">Последний вход: {formatDate(u.lastLogin)}</p>
            )}
            <p className="text-xs text-dark-500">Регистрация: {formatDate(u.createdAt)}</p>
            <p className="text-xs text-dark-500">
              Уровень {u.stats.level} · {u.stats.totalXp} XP · {u.stats.totalWordsTyped} слов
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            {u.id !== currentUser?.id && (
              <button
                onClick={() => toggleRole(u.id, u.role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  u.role === 'admin'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-accent-500/20 text-accent-400 hover:bg-accent-500/30'
                }`}
              >
                {u.role === 'admin' ? 'Снять админа' : 'Назначить админом'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
