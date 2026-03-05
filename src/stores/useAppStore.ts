import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { KeyboardLayout, SoundTheme, Theme, KeyboardSkin } from '../types'

interface AppState {
  // Настройки
  layout: KeyboardLayout
  soundTheme: SoundTheme
  theme: Theme
  keyboardSkin: KeyboardSkin
  soundEnabled: boolean
  vibrationEnabled: boolean

  // Действия
  setLayout: (layout: KeyboardLayout) => void
  setSoundTheme: (theme: SoundTheme) => void
  setTheme: (theme: Theme) => void
  setKeyboardSkin: (skin: KeyboardSkin) => void
  setSoundEnabled: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void

  // Сброс
  resetSettings: () => void
}

const DEFAULT_SETTINGS = {
  layout: 'jcuken' as KeyboardLayout,
  soundTheme: 'default' as SoundTheme,
  theme: 'dark' as Theme,
  keyboardSkin: 'classic' as KeyboardSkin,
  soundEnabled: true,
  vibrationEnabled: true,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      
      setLayout: (layout) => set({ layout }),
      setSoundTheme: (soundTheme) => set({ soundTheme }),
      setTheme: (theme) => set({ theme }),
      setKeyboardSkin: (keyboardSkin) => set({ keyboardSkin }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'fastfingers-settings',
      partialize: (state) => ({
        layout: state.layout,
        soundTheme: state.soundTheme,
        theme: state.theme,
        keyboardSkin: state.keyboardSkin,
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled,
      }),
    }
  )
)
