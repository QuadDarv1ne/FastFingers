import { memo, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationBell from './NotificationBell'
import FontSizeSelector from './FontSizeSelector'
import ContrastToggle from './ContrastToggle'
import { useClickOutside } from '@hooks/useClickOutside'
import { useAppTranslation } from '../i18n/config'

interface HeaderProps {
  level: number
  xp: number
  xpToNextLevel: number
  onProfileClick?: () => void
}

const XPProgress = memo(function XPProgress({ xp, xpToNextLevel, progress }: { xp: number; xpToNextLevel: number; progress: string }) {
  return (
    <div className="w-36 lg:w-44">
      <div className="w-full h-2 bg-dark-800/60 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={xpToNextLevel}>
        <motion.div
          className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full relative overflow-hidden"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
      <p className="text-[10px] text-dark-500 mt-1 font-medium text-right">{xp} / {xpToNextLevel} XP</p>
    </div>
  )
})

export const Header = memo(function Header({ level, xp, xpToNextLevel, onProfileClick }: HeaderProps) {
  const { t } = useAppTranslation()
  const progress = xpToNextLevel > 0 ? ((xp / xpToNextLevel) * 100).toFixed(0) : '0'
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const handleClickOutside = useCallback(() => setShowSettings(false), [])

  useClickOutside(settingsRef, handleClickOutside)

  return (
    <header className="glass border-b border-dark-700/30 sticky top-0 z-30" role="banner">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5 flex-shrink-0"
            whileHover="hover"
            initial="rest"
          >
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25"
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.05, boxShadow: '0 12px 32px -8px rgba(124,58,237,0.5)' },
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gradient tracking-tight leading-none">FastFingers</h1>
              <p className="text-[10px] text-dark-500 font-medium mt-0.5">{t('misc.about')}</p>
            </div>
          </motion.div>

          {/* Center: Level + XP */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs mx-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.span
                className="text-xl font-bold text-gradient"
                key={level}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                #{level}
              </motion.span>
              <span className="text-xs text-dark-500 font-medium">{t('common.level')}</span>
            </div>
            <XPProgress xp={xp} xpToNextLevel={xpToNextLevel} progress={progress} />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile level pill */}
            <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-800/60 rounded-lg">
              <span className="text-sm font-bold text-gradient">#{level}</span>
              <div className="w-12 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Profile button */}
            {onProfileClick && (
              <motion.button
                onClick={onProfileClick}
                className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                whileHover={{ scale: 1.08, boxShadow: '0 10px 30px -8px rgba(124,58,237,0.5)' }}
                whileTap={{ scale: 0.93 }}
                title={t('misc.profile')}
                aria-label={t('misc.profile')}
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.button>
            )}

            <NotificationBell />
            <LanguageSwitcher />

            {/* Settings dropdown */}
            <div className="relative" ref={settingsRef}>
              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-dark-800/60 hover:bg-dark-700/60 text-dark-400 hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                aria-label={t('misc.settings')}
                aria-expanded={showSettings}
                aria-haspopup="true"
                title={t('misc.settings')}
              >
                <motion.svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  animate={showSettings ? { rotate: 90 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </motion.svg>
              </motion.button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 glass p-3 z-50 min-w-[200px] shadow-xl border border-dark-700/30 rounded-xl"
                  >
                    <h4 className="text-[10px] font-semibold text-dark-500 mb-2 uppercase tracking-wider">{t('misc.settings')}</h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-300">{t('misc.fontSize')}</span>
                        <FontSizeSelector />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-300">{t('misc.highContrast')}</span>
                        <ContrastToggle />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})
