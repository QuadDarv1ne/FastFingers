import { motion } from 'framer-motion'
import { TypingStats } from '../types'

interface SessionSummaryProps {
  stats: TypingStats
  xpEarned: number
  levelUp?: boolean
  onClose: () => void
  onRetry?: () => void
}

export function SessionSummary({ 
  stats, 
  xpEarned, 
  levelUp = false,
  onClose, 
  onRetry 
}: SessionSummaryProps) {
  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-2xl p-8 relative overflow-hidden">
          {/* Эффект повышения уровня */}
          {levelUp && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="absolute top-4 right-4"
            >
              <span className="text-4xl">🎉</span>
            </motion.div>
          )}

          {/* Заголовок */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-2">
              {levelUp ? 'Уровень повышен!' : 'Тренировка завершена!'}
            </h2>
            {levelUp && (
              <p className="text-primary-400">Продолжайте в том же духе!</p>
            )}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-800 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-dark-400 mb-1">Скорость</p>
              <p className="text-3xl font-bold text-primary-400">{stats.wpm}</p>
              <p className="text-xs text-dark-500 mt-1">WPM</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-800 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-dark-400 mb-1">Точность</p>
              <p className={`text-3xl font-bold ${
                stats.accuracy >= 95 ? 'text-success' : 
                stats.accuracy >= 85 ? 'text-yellow-400' : 'text-error'
              }`}>
                {stats.accuracy}%
              </p>
              <p className="text-xs text-dark-500 mt-1">{stats.errors} ошибок</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-dark-800 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-dark-400 mb-1">Символы</p>
              <p className="text-2xl font-bold text-dark-300">{stats.correctChars}/{stats.totalChars}</p>
              <p className="text-xs text-dark-500 mt-1">CPM: {stats.cpm}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-dark-800 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-dark-400 mb-1">Время</p>
              <p className="text-2xl font-bold text-dark-300">
                {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-dark-500 mt-1">мин:сек</p>
            </motion.div>
          </div>

          {/* XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/50 rounded-xl p-4 text-center mb-6"
          >
            <p className="text-sm text-dark-400 mb-1">Заработано XP</p>
            <p className="text-4xl font-bold text-yellow-400">+{xpEarned}</p>
          </motion.div>

          {/* Прогресс до следующего уровня */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-400">До следующего уровня</span>
              <span className="text-sm text-dark-400">осталось XP</span>
            </div>
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (xpEarned / 100) * 100)}%` }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full bg-gradient-to-r from-primary-600 to-purple-500"
              />
            </div>
          </motion.div>

          {/* Кнопки */}
          <div className="flex gap-3">
            {onRetry && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={onRetry}
                className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
              >
                Повторить
              </motion.button>
            )}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={onClose}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
            >
              Продолжить
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
