import { memo, useState, useEffect } from 'react'
import { useAppTranslation } from '../../i18n/config'
import type { SpeedTestDuration } from '../../hooks/useGameMode'

export interface SpeedTestDropdownProps {
  isActive: boolean
  duration: SpeedTestDuration
  onDurationChange: (duration: SpeedTestDuration) => void
  onGameModeChange: (mode: 'speedtest') => void
}

const durationIcons: Record<SpeedTestDuration, string> = {
  15: '⚡',
  30: '⭐',
  60: '🔥',
}

export const SpeedTestDropdown = memo<SpeedTestDropdownProps>(function SpeedTestDropdown({
  isActive,
  onDurationChange,
  onGameModeChange,
}) {
  const { t } = useAppTranslation()
  const [showDropdown, setShowDropdown] = useState(false)

  const durationLabels: Record<SpeedTestDuration, string> = {
    15: `15 ${t('common.seconds')}`,
    30: `30 ${t('common.seconds')}`,
    60: `60 ${t('common.seconds')}`,
  }

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
    <div className="relative">
      <button
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
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
        <span className="text-lg">🕐</span>
        <span className="hidden sm:inline">{t('label.test')}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showDropdown && (
        <div data-speedtest-dropdown className="absolute top-full left-0 mt-2 glass p-2 rounded-xl z-50 min-w-[160px] animate-scale-in shadow-xl border border-dark-700/50">
          {Object.entries(durationLabels).map(([key, label]) => {
            const d = Number(key) as SpeedTestDuration
            return (
              <button
                key={d}
                onClick={() => {
                  onDurationChange(d)
                  setShowDropdown(false)
                }}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-dark-800/50 rounded-lg transition-all font-medium flex items-center justify-between"
              >
                <span>{label}</span>
                <span className="text-xs text-dark-500">{durationIcons[d]}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})
