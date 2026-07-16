import { memo, useMemo, Suspense, lazy } from 'react'
import { ModeButton } from './ui/ModeButton'
import { SpeedTestDropdown } from './ui/SpeedTestDropdown'
import LoadingFallback from './LoadingFallback'
import { useAppTranslation } from '../i18n/config'
import type { GameMode, View, SpeedTestDuration } from '../hooks/useGameMode'
import type { ThemeColor } from '../utils/themes'
import type { KeyboardSkin } from '../types'

type ThemeOption = ThemeColor | 'auto'

const ThemeToggle = lazy(() => import('./ThemeToggle').then((module) => ({ default: module.ThemeToggle })))
const KeyboardSkinSelector = lazy(() => import('./KeyboardSkinSelector').then((module) => ({ default: module.KeyboardSkinSelector })))

interface GameModeNavbarProps {
  gameMode: GameMode
  view: View
  speedTestDuration: SpeedTestDuration
  userRole?: string
  keyboardSkin: KeyboardSkin
  theme: ThemeColor
  themeOption: ThemeOption
  onPracticeClick: () => void
  onSprintClick: () => void
  onHardcoreClick: () => void
  onGameModeClick: (mode: GameMode) => void
  onViewClick: (view: View) => void
  onSpeedTestDurationChange: (d: SpeedTestDuration) => void
  onGameModeChange: (mode: GameMode) => void
  onSkinChange: (skin: KeyboardSkin) => void
  onThemeChange: (theme: ThemeColor) => void
  onThemeOptionChange: (option: ThemeOption) => void
}

export const GameModeNavbar = memo(function GameModeNavbar({
  gameMode,
  view,
  speedTestDuration,
  userRole,
  keyboardSkin,
  theme,
  themeOption,
  onPracticeClick,
  onSprintClick,
  onHardcoreClick,
  onGameModeClick,
  onViewClick,
  onSpeedTestDurationChange,
  onGameModeChange,
  onSkinChange,
  onThemeChange,
  onThemeOptionChange,
}: GameModeNavbarProps) {
  const { t } = useAppTranslation()

  const gameModeButtons = useMemo(() => [
    { mode: 'reaction' as const, icon: '🎮', label: t('nav.reaction'), title: t('mode.game') },
    { mode: 'marathon' as const, icon: '🏃', label: t('label.marathon'), title: t('tooltip.marathon') },
    { mode: 'code' as const, icon: '💻', label: t('label.code'), title: t('tooltip.code') },
    { mode: 'duel' as const, icon: '⚔️', label: t('label.duel'), title: t('tooltip.duel') },
    { mode: 'tournament' as const, icon: '🏆', label: t('label.tournament'), title: t('tooltip.tournament') },
  ], [t])

  const viewButtons = useMemo(() => [
    { view: 'custom-exercise' as const, icon: '✏️', label: t('nav.custom'), title: t('exercise.custom') },
    { view: 'tips' as const, icon: '💡', label: t('nav.tips'), title: t('nav.tips') },
    { view: 'weekly' as const, icon: '📈', label: t('nav.week'), title: t('stats.progress') },
    { view: 'statistics' as const, icon: '📊', label: t('nav.statistics'), title: t('stats.title') },
    { view: 'learning' as const, icon: '📚', label: t('nav.learning'), title: t('nav.learning') },
  ], [t])

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <nav className="glass rounded-xl overflow-x-auto scrollbar-none px-1.5 py-1 shadow-sm" aria-label={t('modes.select')}>
        <div className="flex items-center gap-0.5 min-w-max">
          <ModeButton
            isActive={gameMode === 'practice' && view === 'main'}
            onClick={onPracticeClick}
            icon="📝"
            label={t('nav.practice')}
            title={t('mode.practice')}
          />
          <span className="w-px h-4 bg-dark-700/40 mx-0.5" aria-hidden="true" />
          <ModeButton
            isActive={gameMode === 'sprint'}
            onClick={onSprintClick}
            icon="⚡"
            label={t('nav.sprint')}
            title={t('tooltip.sprint')}
          />
          <ModeButton
            isActive={gameMode === 'hardcore'}
            onClick={onHardcoreClick}
            icon="💀"
            label={t('mode.hardcore')}
            title={t('tooltip.hardcore')}
          />
          <SpeedTestDropdown
            isActive={gameMode === 'speedtest'}
            duration={speedTestDuration}
            onDurationChange={onSpeedTestDurationChange}
            onGameModeChange={onGameModeChange}
          />
        </div>

        <div className="flex items-center gap-0.5 min-w-max">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-dark-500 px-1.5 select-none">{t('nav.extra')}</span>
          {gameModeButtons.map(b => (
            <ModeButton
              key={b.mode}
              isActive={gameMode === b.mode}
              onClick={() => onGameModeClick(b.mode)}
              icon={b.icon}
              label={b.label}
              title={b.title}
            />
          ))}
        </div>

        <div className="flex items-center gap-0.5 min-w-max">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-dark-500 px-1.5 select-none">{t('nav.views')}</span>
          {viewButtons.map(b => (
            <ModeButton
              key={b.view}
              isActive={view === b.view}
              onClick={() => onViewClick(b.view)}
              icon={b.icon}
              label={b.label}
              title={b.title}
            />
          ))}
          {userRole === 'admin' && (
            <ModeButton
              isActive={view === 'admin'}
              onClick={() => onViewClick('admin')}
              icon="⚙️"
              label={t('label.admin', 'Admin')}
              title={t('tooltip.admin')}
            />
          )}
        </div>
      </nav>

      <div className="flex items-center gap-1.5">
        <Suspense fallback={<LoadingFallback />}>
          <KeyboardSkinSelector
            skin={keyboardSkin}
            onSkinChange={onSkinChange}
          />
          <ThemeToggle theme={theme} themeOption={themeOption} onThemeChange={onThemeChange} onThemeOptionChange={onThemeOptionChange} />
        </Suspense>
      </div>
    </div>
  )
})
