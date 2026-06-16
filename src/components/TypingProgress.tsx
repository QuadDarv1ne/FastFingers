import { motion, AnimatePresence } from 'framer-motion'
import { useAppTranslation } from '../i18n/config'

interface TypingProgressProps {
  current: number
  total: number
  wpm: number
  accuracy: number
}

export function TypingProgress({ current, total, wpm, accuracy }: TypingProgressProps) {
  const { t } = useAppTranslation()
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-dark-300">{t('trainer.progressLabel')}</span>
          <span className="text-[10px] text-dark-500 font-medium">
            {current} / {total}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={Math.floor(progress / 5) * 5}
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="text-xs font-bold font-mono text-primary-400"
          >
            {Math.round(progress)}%
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative h-2.5 bg-dark-800/60 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="relative h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent rounded-full" />
        </motion.div>
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span className="text-dark-500 font-medium">{t('common.wpm')}:</span>
            <motion.span
              key={wpm}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="font-bold text-primary-400 font-mono"
            >
              {wpm}
            </motion.span>
          </div>
          <div className="flex items-center gap-1">
            <span>🎯</span>
            <span className="text-dark-500 font-medium">{t('common.accuracy')}:</span>
            <motion.span
              key={accuracy}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`font-bold font-mono ${accuracy >= 95 ? 'text-green-400' : accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'}`}
            >
              {accuracy}%
            </motion.span>
          </div>
        </div>

        {wpm > 0 && current > 0 && (
          <div className="flex items-center gap-1 text-dark-500">
            <span>⏱️</span>
            <span className="font-medium">~{Math.max(1, Math.ceil((total - current) / Math.max(1, wpm / 12)))}s</span>
          </div>
        )}
      </div>
    </div>
  )
}
