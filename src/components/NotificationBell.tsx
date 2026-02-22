import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../contexts/NotificationContext'

interface NotificationBellProps {
  onOpenPanel: () => void
}

export function NotificationBell({ onOpenPanel }: NotificationBellProps) {
  const { unreadCount } = useNotifications()

  return (
    <button
      onClick={onOpenPanel}
      className="relative p-2 hover:bg-dark-800 rounded-lg transition-colors"
      title="Уведомления"
    >
      <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </button>
  )
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    return `${days} дн назад`
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-600/20 border-yellow-600/50'
      case 'challenge':
        return 'bg-success/20 border-success/50'
      case 'streak':
        return 'bg-orange-600/20 border-orange-600/50'
      case 'level':
        return 'bg-primary-600/20 border-primary-600/50'
      default:
        return 'bg-dark-800 border-dark-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="relative w-full max-w-md h-full glass border-l border-dark-700 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Уведомления</h2>
            <p className="text-sm text-dark-400">
              {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитаны'}
            </p>
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 text-sm bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  Прочитать все
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 text-sm bg-error/20 hover:bg-error/30 text-error rounded-lg transition-colors"
                >
                  Очистить
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Список уведомлений */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔔</span>
                </div>
                <p className="text-dark-400">Нет уведомлений</p>
              </motion.div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-xl border ${getTypeStyles(notification.type)} ${
                    !notification.read ? 'ring-1 ring-primary-500/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{notification.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${!notification.read ? 'text-white' : 'text-dark-300'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-dark-500 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-dark-400">{notification.message}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="p-1 hover:bg-dark-800 rounded transition-colors text-dark-500"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Подвал */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-dark-700">
            <p className="text-xs text-dark-500 text-center">
              Показано {notifications.length} из {notifications.length} уведомлений
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
