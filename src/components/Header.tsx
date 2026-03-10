import { memo, useState, useRef } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NotificationBell } from './NotificationBell'
import { FontSizeSelector } from './FontSizeSelector'
import { ContrastToggle } from './ContrastToggle'
import { useClickOutside } from '@hooks/useClickOutside'
import { useAppTranslation } from '../i18n/config'

interface HeaderProps {
  level: number
  xp: number
  xpToNextLevel: number
  onProfileClick?: () => void
  onNotificationsClick?: () => void
}

export const Header = memo(function Header({ level, xp, xpToNextLevel, onProfileClick, onNotificationsClick }: HeaderProps) {
  const { t } = useAppTranslation()
  const progress = ((xp / xpToNextLevel) * 100).toFixed(0)
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useClickOutside(settingsRef, () => setShowSettings(false))

  return (
    <header className="glass border-b border-dark-700 sticky top-0 z-30 backdrop-blur-xl" role="banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient tracking-tight">FastFingers</h1>
              <p className="text-xs text-dark-400 font-medium">{t('misc.about')}</p>
            </div>
          </div>

          {/* Уровень и XP */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-3xl font-bold text-gradient">#{level}</span>
                <span className="text-sm text-dark-400 font-medium">{t('common.level')}</span>
              </div>
              <div className="w-40 h-2.5 bg-dark-800 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={xpToNextLevel} aria-label={`${t('common.level')} ${level}`}>
                <div
                  className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 progress-bar shadow-glow"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1.5 font-medium">{xp} / {xpToNextLevel} XP ({progress}%)</p>
            </div>

            {/* Мобильная версия уровня */}
            <div className="sm:hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-gradient">#{level}</span>
              </div>
              <div className="w-20 h-1.5 bg-dark-800 rounded-full overflow-hidden mt-1" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={xpToNextLevel} aria-label={`${t('common.level')} ${level}`}>
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-400 progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Кнопка профиля */}
            {onProfileClick && (
              <button
                onClick={onProfileClick}
                className="w-11 h-11 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30"
                title={t('misc.profile')}
                aria-label={t('misc.profile')}
              >
                <span className="text-xl">👤</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <NotificationBell onOpenPanel={onNotificationsClick} />
              <LanguageSwitcher />
              
              {/* Настройки (шрифт и контраст) */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-all"
                  aria-label={t('misc.settings')}
                  title={t('misc.settings')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {showSettings && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-2 card p-3 z-50 min-w-[180px] animate-scale-in shadow-xl border border-dark-700">
                      <h4 className="text-xs font-semibold text-dark-400 mb-2 uppercase tracking-wider">{t('misc.settings')}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-dark-300">{t('misc.fontSize')}</span>
                          <FontSizeSelector />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-dark-300">{t('misc.highContrast')}</span>
                          <ContrastToggle />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})
