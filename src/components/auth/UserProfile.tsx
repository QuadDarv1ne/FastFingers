import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface UserProfileProps {
  onClose: () => void
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, logout, updateUserStats } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      await updateUserStats({}) // В реальном приложении здесь было бы обновление профиля
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!user) return null

  const stats = user.stats

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl my-8"
      >
        <div className="glass rounded-2xl p-6 md:p-8">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="p-2 text-success hover:bg-success/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setName(user.name)
                      }}
                      className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-dark-400">{user.email}</p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="⭐"
              label="Уровень"
              value={stats.level.toString()}
              color="text-yellow-400"
            />
            <StatCard
              icon="💎"
              label="Всего XP"
              value={stats.totalXp.toLocaleString()}
              color="text-primary-400"
            />
            <StatCard
              icon="⚡"
              label="Лучший WPM"
              value={stats.bestWpm.toString()}
              color="text-success"
            />
            <StatCard
              icon="🎯"
              label="Точность"
              value={`${stats.bestAccuracy}%`}
              color="text-purple-400"
            />
          </div>

          {/* Дополнительная статистика */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📚</span>
                <span className="text-sm text-dark-400">Всего слов</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalWordsTyped.toLocaleString()}</p>
            </div>
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⏱️</span>
                <span className="text-sm text-dark-400">Время практики</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round(stats.totalPracticeTime / 60)} ч
              </p>
            </div>
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔥</span>
                <span className="text-sm text-dark-400">Текущая серия</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">{stats.currentStreak} дн.</p>
            </div>
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏆</span>
                <span className="text-sm text-dark-400">Рекордная серия</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{stats.longestStreak} дн.</p>
            </div>
          </div>

          {/* Информация об аккаунте */}
          <div className="bg-dark-800/50 rounded-xl p-4 mb-8">
            <h3 className="font-semibold mb-3">Информация об аккаунте</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Зарегистрирован:</span>
                <span>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
              {user.lastLogin && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Последний вход:</span>
                  <span>{new Date(user.lastLogin).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {isEditing ? 'Отмена' : 'Редактировать'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 bg-error/20 hover:bg-error/30 text-error rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-dark-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
