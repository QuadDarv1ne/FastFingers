import { Suspense, lazy } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import LoadingFallback from './LoadingFallback'
import { SectionError } from './ui/SectionError'
import { SettingsPanel } from './ui/SettingsPanel'
import { useAppTranslation } from '../i18n/config'
import type { UserSettings, TypingStats, UserProgress } from '../types'

const ClockWidget = lazy(() => import('./ClockWidget'))
const MotivationalQuote = lazy(() => import('./MotivationalQuote').then((module) => ({ default: module.MotivationalQuote })))
const MusicControls = lazy(() => import('./MusicControls').then((module) => ({ default: module.MusicControls })))
const Stats = lazy(() => import('./Stats').then((module) => ({ default: module.Stats })))
const ExportImport = lazy(() => import('./ExportImport'))

interface AppSidebarProps {
  settings: UserSettings
  currentStats: TypingStats | null
  progress: UserProgress
  challengeStats: {
    total: number
    completed: number
    completionRate: number
  }
  streak: number
  onSettingChange: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
  onViewHistory: () => void
  onViewAchievements: () => void
  onShowStreakRewards: () => void
}

export function AppSidebar({
  settings,
  currentStats,
  progress,
  challengeStats,
  streak,
  onSettingChange,
  onViewHistory,
  onViewAchievements,
  onShowStreakRewards,
}: AppSidebarProps) {
  const { t } = useAppTranslation()

  return (
    <div className="space-y-4">
      <ErrorBoundary key="widgets" fallback={<SectionError message={t('error.widgetsFailed', 'Failed to load widgets')} />}>
        <Suspense fallback={<LoadingFallback />}>
          <ClockWidget />
          <MotivationalQuote />
          <MusicControls />
        </Suspense>
      </ErrorBoundary>

      {settings.showStats && (
        <ErrorBoundary key="stats-panel" fallback={<SectionError message={t('error.statsFailed', 'Failed to load statistics')} />}>
          <Suspense fallback={<LoadingFallback />}>
            <Stats
              progress={progress}
              currentStats={currentStats}
              onViewHistory={onViewHistory}
              onViewAchievements={onViewAchievements}
              challengeStats={challengeStats}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <ErrorBoundary key="settings-panel" fallback={<SectionError message={t('error.settingsFailed', 'Failed to load settings')} />}>
        <SettingsPanel
          settings={settings}
          onSettingChange={onSettingChange}
          onShowStreakRewards={onShowStreakRewards}
          streak={streak}
        />
      </ErrorBoundary>

      <ErrorBoundary key="export-import" fallback={<SectionError message={t('error.exportImportFailed', 'Failed to load export/import')} />}>
        <div className="glass rounded-xl p-6">
          <ExportImport />
        </div>
      </ErrorBoundary>
    </div>
  )
}
