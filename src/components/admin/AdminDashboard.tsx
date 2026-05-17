import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { TextManager } from './TextManager'
import { UserAdmin } from './UserAdmin'

type AdminTab = 'overview' | 'texts' | 'users'

function AdminOverview() {
  const { user } = useAuth()
  const totalUsers = JSON.parse(localStorage.getItem('fastfingers_users') || '[]').length
  const customTexts = JSON.parse(localStorage.getItem('fastfingers_admin_texts') || '[]').length
  const totalSessions = (() => {
    try {
      const history = JSON.parse(localStorage.getItem('fastfingers_history') || '[]')
      return history.length
    } catch {
      return 0
    }
  })()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{totalUsers}</div>
          <div className="text-sm text-dark-400 mt-1">Пользователей</div>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{customTexts}</div>
          <div className="text-sm text-dark-400 mt-1">Пользовательских текстов</div>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{totalSessions}</div>
          <div className="text-sm text-dark-400 mt-1">Тренировок</div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Информация о системе</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark-400">Версия приложения</dt>
            <dd className="text-white">0.1.0</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">Режим аутентификации</dt>
            <dd className="text-white">localStorage</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">Администратор</dt>
            <dd className="text-white">{user?.name || user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">Всего статических текстов</dt>
            <dd className="text-white">170+</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Обзор', icon: '📊' },
    { id: 'texts', label: 'Тексты', icon: '📝' },
    { id: 'users', label: 'Пользователи', icon: '👥' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Панель администратора</h2>
          <button onClick={onClose} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors text-sm">
            Закрыть
          </button>
        </div>

        <div className="flex gap-1 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-500 text-white'
                  : 'bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'texts' && <TextManager />}
        {activeTab === 'users' && <UserAdmin />}
      </div>
    </motion.div>
  )
}
