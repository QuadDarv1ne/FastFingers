import { memo } from 'react'
import { motion } from 'framer-motion'
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
    <div id="settings" className="glass rounded-xl p-4 space-y-3.5">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-dark-200">{t('misc.settings')}</span>
      </h3>

      <div className="space-y-2.5">
        <div>
          <label htmlFor="layout-select" className="block text-[10px] font-medium text-dark-500 mb-1 uppercase tracking-wider">
            {t('misc.keyboard')}
          </label>
          <select
            id="layout-select"
            value={settings.layout}
            onChange={(e) => onSettingChange('layout', e.target.value as KeyboardLayout)}
            className="w-full bg-dark-800/50 border border-dark-700/40 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-dark-600/60"
            aria-label={t('misc.keyboard')}
          >
            <option value="jcuken">{t('layout.jcuken')}</option>
            <option value="qwerty">{t('layout.qwerty')}</option>
            <option value="dvorak">{t('layout.dvorak')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="sound-theme-select" className="block text-[10px] font-medium text-dark-500 mb-1 uppercase tracking-wider">
            {t('misc.sound')}
          </label>
          <select
            id="sound-theme-select"
            value={settings.soundTheme}
            onChange={(e) => onSettingChange('soundTheme', e.target.value as SoundTheme)}
            className="w-full bg-dark-800/50 border border-dark-700/40 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-dark-600/60"
            aria-label={t('misc.sound')}
          >
            <option value="default">🔊 {t('misc.theme')}</option>
            <option value="piano">🎹 {t('sound.piano')}</option>
            <option value="mechanical">⌨️ {t('sound.mechanical')}</option>
            <option value="soft">🌸 {t('sound.soft')}</option>
            <option value="retro">👾 {t('sound.retro')}</option>
          </select>
        </div>

        <div className="pt-0.5 space-y-1.5">
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
        </div>

        <motion.button
          onClick={onShowStreakRewards}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 bg-gradient-to-r from-orange-600/15 to-yellow-600/15 hover:from-orange-600/25 hover:to-yellow-600/25 border border-orange-500/30 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
          aria-label={t('notification.streak')}
        >
          <span aria-hidden="true">🔥</span>
          <span className="text-dark-300">{t('notification.streak')}</span>
          <span className="px-1.5 py-0.5 bg-orange-500/20 rounded text-[10px] font-bold text-orange-400">{streak}</span>
        </motion.button>
      </div>
    </div>
  )
})
