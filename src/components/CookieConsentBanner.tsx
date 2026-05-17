import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COOKIE_CONSENT_KEY = 'fastfingers_cookie_consent'

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
          role="dialog"
          aria-label="Уведомление об использовании файлов cookie"
        >
          <div className="max-w-4xl mx-auto bg-dark-800/95 backdrop-blur-sm border border-dark-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-3xl flex-shrink-0">🍪</div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Мы используем файлы cookie</h3>
                <p className="text-dark-400 text-sm">
                  Файлы cookie необходимы для работы приложения, авторизации и сохранения вашего прогресса.
                  Подробнее в <a href="/cookie-policy.md" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">Политике использования cookies</a> и <a href="/privacy-policy.md" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">Политике конфиденциальности</a>.
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 text-sm text-dark-400 hover:text-white border border-dark-600 hover:border-dark-500 rounded-lg transition-all"
                >
                  Отклонить
                </button>
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-all"
                >
                  Принять
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
