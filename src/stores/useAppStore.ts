import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { KeyboardLayout, SoundTheme, Theme, KeyboardSkin } from '../types'

interface AppState {
  layout: KeyboardLayout
  soundTheme: SoundTheme
  theme: Theme
  keyboardSkin: KeyboardSkin
  soundEnabled: boolean
  vibrationEnabled: boolean
  setLayout: (layout: KeyboardLayout) => void
  setSoundTheme: (theme: SoundTheme) => void
  setTheme: (theme: Theme) => void
  setKeyboardSkin: (skin: KeyboardSkin) => void
  setSoundEnabled: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: Pick<AppState, 'layout' | 'soundTheme' | 'theme' | 'keyboardSkin' | 'soundEnabled' | 'vibrationEnabled'> = {
  layout: 'jcuken',
  soundTheme: 'default',
  theme: 'dark',
  keyboardSkin: 'classic',
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
