import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { TextManager } from './TextManager'
import { UserAdmin } from './UserAdmin'
import { practiceTexts } from '../../data/practiceTexts'

const APP_VERSION = '0.1.0'

type AdminTab = 'overview' | 'texts' | 'users'

function safeParseLength(key: string): number {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

function AdminOverview() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const totalUsers = useMemo(() => safeParseLength('fastfingers_users'), [])
  const customTexts = useMemo(() => safeParseLength('fastfingers_admin_texts'), [])
  const totalSessions = useMemo(() => safeParseLength('fastfingers_history'), [])
  const staticTextsCount = useMemo(() => practiceTexts.length, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{totalUsers}</div>
          <div className="text-sm text-dark-400 mt-1">{t('admin.users', 'Пользователей')}</div>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{customTexts}</div>
          <div className="text-sm text-dark-400 mt-1">{t('admin.customTexts', 'Пользовательских текстов')}</div>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-white">{totalSessions}</div>
          <div className="text-sm text-dark-400 mt-1">{t('admin.sessions', 'Тренировок')}</div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">{t('admin.systemInfo', 'Информация о системе')}</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.version', 'Версия приложения')}</dt>
            <dd className="text-white">{APP_VERSION}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.authMode', 'Режим аутентификации')}</dt>
            <dd className="text-white">localStorage</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.administrator', 'Администратор')}</dt>
            <dd className="text-white">{user?.name || user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-400">{t('admin.staticTexts', 'Всего статических текстов')}</dt>
            <dd className="text-white">{staticTextsCount}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: t('admin.tabOverview', 'Обзор'), icon: '📊' },
    { id: 'texts', label: t('admin.tabTexts', 'Тексты'), icon: '📝' },
    { id: 'users', label: t('admin.tabUsers', 'Пользователи'), icon: '👥' },
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
          <h2 className="text-2xl font-bold text-white">{t('admin.title', 'Панель администратора')}</h2>
          <button onClick={onClose} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors text-sm">
            {t('action.close', 'Закрыть')}
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
