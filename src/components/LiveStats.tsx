import { motion } from 'framer-motion'

interface LiveStatsProps {
  wpm: number
  accuracy: number
  errors: number
  timeElapsed: number
  isActive: boolean
}

export function LiveStats({ wpm, accuracy, errors, timeElapsed, isActive }: LiveStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getWpmColor = (wpm: number) => {
    if (wpm >= 60) return 'text-green-400'
    if (wpm >= 40) return 'text-blue-400'
    if (wpm >= 20) return 'text-yellow-400'
    return 'text-dark-400'
  }

  const getAccuracyColor = (acc: number) => {
    if (acc >= 95) return 'text-green-400'
    if (acc >= 85) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* WPM */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wide">WPM</p>
          </div>
          <motion.p
            key={wpm}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-4xl font-bold ${getWpmColor(wpm)}`}
          >
            {wpm}
          </motion.p>
        </div>

        {/* Точность */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wide">Точность</p>
          </div>
          <motion.p
            key={accuracy}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-4xl font-bold ${getAccuracyColor(accuracy)}`}
          >
            {accuracy}%
          </motion.p>
        </div>

        {/* Ошибки */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{errors === 0 ? '✅' : '❌'}</span>
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wide">Ошибки</p>
          </div>
          <motion.p
            key={errors}
            initial={{ scale: errors > 0 ? 1.3 : 1 }}
            animate={{ scale: 1 }}
            className={`text-4xl font-bold ${errors === 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {errors}
          </motion.p>
        </div>

        {/* Время */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">⏱️</span>
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wide">Время</p>
          </div>
          <p className="text-4xl font-bold text-primary-400 font-mono">
            {formatTime(timeElapsed)}
          </p>
        </div>
      </div>

      {/* Прогресс-бары */}
      <div className="mt-6 space-y-3">
        {/* WPM прогресс */}
        <div>
          <div className="flex justify-between text-xs text-dark-400 mb-1">
            <span>Скорость</span>
            <span>{wpm} / 100 WPM</span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((wpm / 100) * 100, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Точность прогресс */}
        <div>
          <div className="flex justify-between text-xs text-dark-400 mb-1">
            <span>Точность</span>
            <span>{accuracy}%</span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                accuracy >= 95 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                accuracy >= 85 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                'bg-gradient-to-r from-red-600 to-rose-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
