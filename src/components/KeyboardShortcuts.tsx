import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Shortcut {
  keys: string[]
  description: string
  category: 'navigation' | 'actions' | 'general'
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', '1'], description: 'Режим практики', category: 'navigation' },
  { keys: ['Ctrl', '2'], description: 'Режим спринта', category: 'navigation' },
  { keys: ['Ctrl', '3'], description: 'Статистика', category: 'navigation' },
  { keys: ['Ctrl', '4'], description: 'Обучение', category: 'navigation' },
  { keys: ['Ctrl', '5'], description: 'Советы', category: 'navigation' },
  { keys: ['Ctrl', 'P'], description: 'Профиль', category: 'navigation' },
  { keys: ['Ctrl', 'N'], description: 'Новое упражнение', category: 'actions' },
  { keys: ['Esc'], description: 'Закрыть модальное окно', category: 'general' },
]

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Кнопка открытия */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-dark-800 hover:bg-dark-700 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 border border-dark-700"
        title="Горячие клавиши (Shift + ?)"
      >
        <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>

      {/* Модальное окно */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Оверлей */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Контент */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] overflow-auto z-50"
            >
              <div className="card m-4">
                {/* Заголовок */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Горячие клавиши</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 hover:bg-dark-800 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Навигация */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🧭</span>
                    Навигация
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.filter(s => s.category === 'navigation').map((shortcut, i) => (
                      <ShortcutItem key={i} shortcut={shortcut} />
                    ))}
                  </div>
                </div>

                {/* Действия */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>⚡</span>
                    Действия
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.filter(s => s.category === 'actions').map((shortcut, i) => (
                      <ShortcutItem key={i} shortcut={shortcut} />
                    ))}
                  </div>
                </div>

                {/* Общие */}
                <div>
                  <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🔧</span>
                    Общие
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.filter(s => s.category === 'general').map((shortcut, i) => (
                      <ShortcutItem key={i} shortcut={shortcut} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function ShortcutItem({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg hover:bg-dark-800/50 transition-colors">
      <span className="text-sm text-dark-200">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-dark-700 border border-dark-600 rounded text-xs font-mono text-dark-200 shadow-sm">
              {key}
            </kbd>
            {i < shortcut.keys.length - 1 && (
              <span className="text-dark-500 text-xs">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
