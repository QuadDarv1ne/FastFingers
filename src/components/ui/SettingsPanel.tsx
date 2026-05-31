import { memo } from 'react'
import { useAppTranslation } from '../../i18n/config'
import type { UserSettings, KeyboardLayout, SoundTheme } from '../../types'
import { Toggle } from './Toggle'

export interface SettingsPanelProps {
  settings: UserSettings
  onSettingChange: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
  onShowStreakRewards: () => void
  streak: number
}

export const SettingsPanel = memo<SettingsPanelProps>(function SettingsPanel({
  settings,
  onSettingChange,
  onShowStreakRewards,
  streak,
}) {
  const { t } = useAppTranslation()
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{t('misc.settings')}</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="layout-select" className="block text-sm text-dark-400 mb-2">
            {t('misc.keyboard')}
          </label>
          <select
            id="layout-select"
            value={settings.layout}
            onChange={(e) => onSettingChange('layout', e.target.value as KeyboardLayout)}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('misc.keyboard')}
          >
            <option value="jcuken">{t('layout.jcuken')}</option>
            <option value="qwerty">{t('layout.qwerty')}</option>
            <option value="dvorak">{t('layout.dvorak')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="sound-theme-select" className="block text-sm text-dark-400 mb-2">
            {t('misc.sound')}
          </label>
          <select
            id="sound-theme-select"
            value={settings.soundTheme}
            onChange={(e) => onSettingChange('soundTheme', e.target.value as SoundTheme)}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('misc.sound')}
          >
            <option value="default">🔊 {t('misc.theme')}</option>
            <option value="piano">🎹 {t('sound.piano')}</option>
            <option value="mechanical">⌨️ {t('sound.mechanical')}</option>
            <option value="soft">🌸 {t('sound.soft')}</option>
            <option value="retro">👾 {t('sound.retro')}</option>
          </select>
        </div>

        <Toggle
          label={t('misc.sound')}
          checked={settings.soundEnabled}
          onChange={(checked) => onSettingChange('soundEnabled', checked)}
        />

        <Toggle
          label={t('misc.keyboard')}
          checked={settings.showKeyboard}
          onChange={(checked) => onSettingChange('showKeyboard', checked)}
        />

        <button
          onClick={onShowStreakRewards}
          className="w-full py-2 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 hover:from-orange-600/30 hover:to-yellow-600/30 border border-orange-500/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          aria-label={t('notification.streak')}
        >
          <span aria-hidden="true">🔥</span>
          {t('notification.streak')} ({streak} {t('common.days')})
        </button>
      </div>
    </div>
  )
})
