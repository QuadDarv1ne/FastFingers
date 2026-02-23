import { motion } from 'framer-motion'

interface TypingProgressProps {
  current: number
  total: number
  wpm: number
  accuracy: number
}

export function TypingProgress({ current, total, wpm, accuracy }: TypingProgressProps) {
  const progress = (current / total) * 100

  return (
    <div className="space-y-4">
      {/* Основной прогресс */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-dark-200">Прогресс</span>
            <span className="text-xs text-dark-500">
              {current} / {total} символов
            </span>
          </div>
          <motion.span
            key={Math.floor(progress)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-lg font-bold text-primary-400"
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
        
        <div className="relative h-4 bg-dark-800 rounded-full overflow-hidden shadow-inner">
          {/* Фоновая анимация */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          {/* Прогресс-бар */}
          <motion.div
            className="relative h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 shadow-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Блики */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Мини-статистика */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400">⚡</span>
            <span className="text-dark-400">WPM:</span>
            <motion.span
              key={wpm}
              initial={{ scale: 1.2, color: '#60a5fa' }}
              animate={{ scale: 1, color: '#94a3b8' }}
              className="font-bold"
            >
              {wpm}
            </motion.span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-green-400">🎯</span>
            <span className="text-dark-400">Точность:</span>
            <motion.span
              key={accuracy}
              initial={{ scale: 1.2, color: '#34d399' }}
              animate={{ scale: 1, color: '#94a3b8' }}
              className="font-bold"
            >
              {accuracy}%
            </motion.span>
          </div>
        </div>

        {/* Оставшееся время (примерная оценка) */}
        {wpm > 0 && (
          <div className="flex items-center gap-1.5 text-dark-500">
            <span>⏱️</span>
            <span>~{Math.ceil((total - current) / (wpm * 5 / 60))}с</span>
          </div>
        )}
      </div>
    </div>
  )
}
