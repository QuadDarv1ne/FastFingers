import { motion } from 'framer-motion'

interface NotFound404Props {
  onBack: () => void
  onHome: () => void
}

export function NotFound404({ onBack, onHome }: NotFound404Props) {

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        {/* Анимированная 404 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-9xl font-bold text-gradient mb-8"
        >
          404
        </motion.div>

        {/* Иконка */}
        <div className="w-24 h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl"
          >
            🤔
          </motion.span>
        </div>

        {/* Текст */}
        <h1 className="text-3xl font-bold mb-4">Упс! Страница не найдена</h1>
        <p className="text-dark-400 mb-8">
          Похоже, вы заблудились в лабиринте клавиатуры. Не волнуйтесь, мы поможем вам вернуться!
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </button>
          <button
            onClick={onHome}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            На главную
          </button>
        </div>

        {/* Совет */}
        <div className="mt-12 p-4 bg-dark-800/50 rounded-lg">
          <p className="text-sm text-dark-400">
            <strong>💡 Совет:</strong> Используйте горячие клавиши для навигации:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-dark-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-dark-700 rounded">Ctrl+1</kbd>
              <span>Практика</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-dark-700 rounded">Ctrl+2</kbd>
              <span>Спринт</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-dark-700 rounded">Ctrl+3</kbd>
              <span>Статистика</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-dark-700 rounded">Ctrl+4</kbd>
              <span>Обучение</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
