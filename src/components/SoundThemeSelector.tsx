import { SoundTheme, soundThemes } from '../utils/soundThemes'

interface SoundThemeSelectorProps {
  currentTheme: SoundTheme
  onThemeChange: (theme: SoundTheme) => void
}

export function SoundThemeSelector({ currentTheme, onThemeChange }: SoundThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-dark-300">
        Звуковая тема
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(soundThemes) as SoundTheme[]).map((themeId) => {
          const theme = soundThemes[themeId]
          const isSelected = currentTheme === themeId
          
          return (
            <button
              key={themeId}
              onClick={() => onThemeChange(themeId)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary-600/20 border-primary-500 ring-2 ring-primary-500/50'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{theme.icon}</span>
                <div>
                  <p className={`font-medium ${isSelected ? 'text-white' : 'text-dark-300'}`}>
                    {theme.name}
                  </p>
                  <p className="text-xs text-dark-500">{theme.description}</p>
                </div>
              </div>
              
              {/* Предпрослушивание звуков */}
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 rounded-full bg-primary-400" title="Правильно" />
                <span className="w-2 h-2 rounded-full bg-error" title="Ошибка" />
                <span className="w-2 h-2 rounded-full bg-success" title="Завершение" />
              </div>
            </button>
          )
        })}
      </div>
      
      <p className="text-xs text-dark-500">
        💡 Нажмите на тему, чтобы выбрать её. Звуки воспроизводятся при вводе текста.
      </p>
    </div>
  )
}
