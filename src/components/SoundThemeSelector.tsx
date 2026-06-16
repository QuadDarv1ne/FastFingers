import type { SoundTheme } from '../types'
import { useAppTranslation } from '../i18n/config'

interface SoundThemeSelectorProps {
  currentTheme: SoundTheme
  onThemeChange: (theme: SoundTheme) => void
}

const THEME_ICONS: Record<SoundTheme, string> = {
  default: '🔊',
  piano: '🎹',
  mechanical: '⌨️',
  soft: '🌸',
  retro: '👾',
  asmr: '🎧',
}

const THEME_I18N_KEYS: Record<SoundTheme, string> = {
  default: 'sound.themeDefault',
  piano: 'sound.themePiano',
  mechanical: 'sound.themeMechanical',
  soft: 'sound.themeSoft',
  retro: 'sound.themeRetro',
  asmr: 'sound.themeAsmr',
}

export function SoundThemeSelector({ currentTheme, onThemeChange }: SoundThemeSelectorProps) {
  const { t } = useAppTranslation()
  const themes: SoundTheme[] = ['default', 'piano', 'mechanical', 'soft', 'retro', 'asmr']
  const id = 'sound-theme-selector'

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm font-medium text-dark-300">
        {t('sound.theme')}
      </label>

      <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {themes.map((themeId) => {
          const isSelected = currentTheme === themeId

          return (
            <button
              key={themeId}
              onClick={() => onThemeChange(themeId)}
              role="radio"
              aria-checked={isSelected}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary-600/20 border-primary-500 ring-2 ring-primary-500/50'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {THEME_ICONS[themeId]}
                </span>
                <div>
                  <p className={`font-medium ${isSelected ? 'text-white' : 'text-dark-300'}`}>
                    {t(THEME_I18N_KEYS[themeId])}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 rounded-full bg-primary-400" title={t('sound.correct')} />
                <span className="w-2 h-2 rounded-full bg-error" title={t('sound.error')} />
                <span className="w-2 h-2 rounded-full bg-success" title={t('sound.complete')} />
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-dark-500">
        {t('sound.tip')}
      </p>
    </div>
  )
}
