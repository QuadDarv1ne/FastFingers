import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppTranslation } from '../../i18n/config'
import type { SpeedTestDuration } from '../../hooks/useGameMode'

export interface SpeedTestDropdownProps {
  isActive: boolean
  duration: SpeedTestDuration
  onDurationChange: (duration: SpeedTestDuration) => void
  onGameModeChange: (mode: 'speedtest') => void
}

const durationOptions: Array<{ value: SpeedTestDuration; icon: string }> = [
  { value: 15, icon: '⚡' },
  { value: 30, icon: '⭐' },
  { value: 60, icon: '🔥' },
] as const

export const SpeedTestDropdown = memo<SpeedTestDropdownProps>(function SpeedTestDropdown({
  isActive,
  onDurationChange,
  onGameModeChange,
}) {
  const { t } = useAppTranslation()
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!showDropdown) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-speedtest-dropdown]')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showDropdown])

  return (
    <div className="relative" data-speedtest-dropdown>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer select-none ${
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
        }`}
        onClick={() => {
          onGameModeChange('speedtest')
          setShowDropdown((prev) => !prev)
        }}
        aria-expanded={showDropdown}
        aria-haspopup="true"
        title={t('tooltip.speedtest')}
      >
        <span className="text-lg" aria-hidden="true">🕐</span>
        <span className="hidden sm:inline">{t('label.test')}</span>
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          animate={{ rotate: showDropdown ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 glass p-2 rounded-xl z-50 min-w-[180px] shadow-xl border border-dark-700/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-dark-500 px-2 pb-1.5">
              {t('common.time')}
            </p>
            <div className="space-y-0.5">
              {durationOptions.map(({ value, icon }) => {
                const label = `${value} ${t('common.seconds')}`
                return (
                  <motion.button
                    key={value}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      onDurationChange(value)
                      setShowDropdown(false)
                    }}
                    className={`w-full px-3 py-2.5 text-sm text-left rounded-lg transition-all font-medium flex items-center justify-between hover:bg-dark-800/50 text-dark-300`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base" aria-hidden="true">{icon}</span>
                      <span>{label}</span>
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
