/**
 * PWAInstallPrompt — Компонент уведомления об установке PWA
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWAInstall } from '../hooks/usePWAInstall'
import { useAppTranslation } from '../i18n/config'

interface PWAInstallPromptProps {
  onDismiss?: () => void
}

export const PWAInstallPrompt = memo<PWAInstallPromptProps>(function PWAInstallPrompt({
  onDismiss,
}: PWAInstallPromptProps) {
  const { t } = useAppTranslation()
  const { isReady, isInstalled, promptInstall, dismissPrompt } = usePWAInstall()

  const handleInstall = async () => {
    await promptInstall()
    onDismiss?.()
  }

  const handleDismiss = () => {
    dismissPrompt()
    onDismiss?.()
    // Remember user dismissed to not show again
    try {
      localStorage.setItem('fastfingers_pwa_dismissed', 'true')
    } catch (e) {
      console.warn('PWA dismiss storage failed:', e)
    }
  }

  // Don't show if already installed or prompt not ready
  if (isInstalled || !isReady) return null

  // Check if user previously dismissed
  try {
    const dismissed = localStorage.getItem('fastfingers_pwa_dismissed')
    if (dismissed === 'true') return null
  } catch (e) {
    console.warn('PWA dismissed check failed:', e)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        role="alertdialog"
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-desc"
      >
        <div className="glass p-4 rounded-2xl shadow-2xl border border-primary-500/30 bg-dark-900/95 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 id="pwa-install-title" className="text-sm font-semibold text-white mb-1">
                {t('misc.installApp')}
              </h3>
              <p id="pwa-install-desc" className="text-xs text-dark-400 mb-3">
                Установите FastFingers для быстрого доступа без браузера
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-primary-500/30"
                >
                  Установить
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm font-medium transition-all text-dark-300"
                >
                  Позже
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-dark-500 hover:text-white transition-colors p-1"
              aria-label="Закрыть"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})
