import { memo } from 'react'
import { motion } from 'framer-motion'
import type { TypingStats } from '../types'
import { useAppTranslation } from '../i18n/config'

interface SessionSummaryProps {
  stats: TypingStats
  xpEarned: number
  levelUp?: boolean
  onClose: () => void
  onRetry?: () => void
}

const SessionSummary = memo(function SessionSummary({
  stats,
  xpEarned,
  levelUp = false,
  onClose,
  onRetry
}: SessionSummaryProps) {
  const { t } = useAppTranslation()

  return (
    <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/5 rounded-full blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl" aria-hidden="true" />

          {levelUp && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
              className="absolute top-3 right-3"
            >
              <span className="text-3xl">🎉</span>
            </motion.div>
          )}

          <div className="text-center mb-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
              className="w-14 h-14 bg-gradient-to-br from-green-500/25 to-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl font-bold"
            >
              {levelUp ? (
                <span className="text-gradient">{t('summary.levelUp')}</span>
              ) : (
                t('summary.trainingComplete')
              )}
            </motion.h2>
            {levelUp && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-xs text-primary-400/80 mt-0.5"
              >
                {t('summary.keepItUp')}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: t('common.speed'), value: stats.wpm, unit: t('common.wpm'), color: 'text-primary-400', delay: 0.2, dir: 'x' as const, neg: -15 },
              { label: t('common.accuracy'), value: `${stats.accuracy}%`, unit: t('summary.errorsCount', { count: stats.errors }), color: stats.accuracy >= 95 ? 'text-green-400' : stats.accuracy >= 85 ? 'text-yellow-400' : 'text-red-400', delay: 0.25, dir: 'x' as const, neg: 15 },
              { label: t('common.characters'), value: `${stats.correctChars}/${stats.totalChars}`, unit: `CPM: ${stats.cpm}`, color: 'text-dark-200', delay: 0.3, dir: 'y' as const, neg: 15 },
              { label: t('common.time'), value: `${Math.floor(stats.timeElapsed / 60)}:${(stats.timeElapsed % 60).toString().padStart(2, '0')}`, unit: t('summary.minSec'), color: 'text-dark-200', delay: 0.35, dir: 'y' as const, neg: 15 },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, [item.dir === 'x' ? 'x' : 'y']: item.neg }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: item.delay, duration: 0.35 }}
                className="bg-dark-800/50 rounded-xl p-3 text-center"
              >
                <p className="text-[10px] text-dark-500 mb-0.5 font-medium uppercase tracking-wider">{item.label}</p>
                <p className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-dark-500 mt-0.5">{item.unit}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-yellow-600/15 to-orange-600/15 border border-yellow-600/40 rounded-xl p-3.5 text-center mb-4"
          >
            <p className="text-[10px] text-dark-500 mb-0.5 font-medium uppercase tracking-wider">{t('summary.xpEarned')}</p>
            <p className="text-3xl font-bold text-yellow-400">+{xpEarned}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-dark-500 font-medium">{t('summary.toNextLevel')}</span>
              <span className="text-[10px] text-dark-500 font-medium">{t('summary.xpRemaining')}</span>
            </div>
            <div className="w-full h-1.5 bg-dark-800/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpEarned * 2)}%` }}
                transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-600 to-purple-500 rounded-full"
              />
            </div>
          </motion.div>

          <div className="flex gap-2.5">
            {onRetry && (
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                onClick={onRetry}
                className="flex-1 py-2.5 bg-dark-800/60 hover:bg-dark-700/60 rounded-xl font-medium transition-colors text-sm border border-dark-700/30"
              >
                {t('action.retry')}
              </motion.button>
            )}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl font-medium transition-colors text-sm shadow-md"
            >
              {t('action.continue')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
})

export { SessionSummary }
