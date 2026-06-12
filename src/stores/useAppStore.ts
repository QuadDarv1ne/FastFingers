import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { KeyboardLayout, SoundTheme, Theme, KeyboardSkin, FontSize } from '../types'

interface AppState {
  layout: KeyboardLayout
  soundTheme: SoundTheme
  theme: Theme
  keyboardSkin: KeyboardSkin
  soundEnabled: boolean
  soundVolume: number
  showKeyboard: boolean
  showStats: boolean
  vibrationEnabled: boolean
  fontSize: FontSize
  setLayout: (layout: KeyboardLayout) => void
  setSoundTheme: (theme: SoundTheme) => void
  setTheme: (theme: Theme) => void
  setKeyboardSkin: (skin: KeyboardSkin) => void
  setSoundEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  setShowKeyboard: (show: boolean) => void
  setShowStats: (show: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
  setFontSize: (size: FontSize) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS = {
  layout: 'jcuken' as KeyboardLayout,
  soundTheme: 'default' as SoundTheme,
  theme: 'dark' as Theme,
  keyboardSkin: 'classic' as KeyboardSkin,
  soundEnabled: true,
  soundVolume: 0.5,
  showKeyboard: true,
  showStats: true,
  vibrationEnabled: true,
  fontSize: 'medium' as FontSize,
}

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as Array<keyof typeof DEFAULT_SETTINGS>

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setLayout: (layout) => set({ layout }),
      setSoundTheme: (soundTheme) => set({ soundTheme }),
      setTheme: (theme) => set({ theme }),
      setKeyboardSkin: (keyboardSkin) => set({ keyboardSkin }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSoundVolume: (soundVolume) => set({ soundVolume }),
      setShowKeyboard: (showKeyboard) => set({ showKeyboard }),
      setShowStats: (showStats) => set({ showStats }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
      setFontSize: (fontSize) => set({ fontSize }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'fastfingers-settings',
      partialize: (state) =>
        Object.fromEntries(SETTINGS_KEYS.map((key) => [key, state[key]])),
    }
  )
)
