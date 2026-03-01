import { SoundTheme } from '../types'

export interface SoundThemeConfig {
  id: SoundTheme
  name: string
  description: string
  icon: string
  sounds: {
    keyPress: string
    error: string
    complete: string
  }
}

export const SOUND_THEMES: SoundThemeConfig[] = [
  {
    id: 'default',
    name: 'По умолчанию',
    description: 'Стандартные звуки',
    icon: '🔊',
    sounds: {
      keyPress: 'default-click',
      error: 'default-error',
      complete: 'default-complete',
    },
  },
  {
    id: 'piano',
    name: 'Пианино',
    description: 'Звуки пианино',
    icon: '🎹',
    sounds: {
      keyPress: 'piano-key',
      error: 'piano-low',
      complete: 'piano-chord',
    },
  },
  {
    id: 'mechanical',
    name: 'Механическая клавиатура',
    description: 'Классический звук механических переключателей',
    icon: '⌨️',
    sounds: {
      keyPress: 'mechanical-click',
      error: 'mechanical-error',
      complete: 'mechanical-complete',
    },
  },
  {
    id: 'soft',
    name: 'Мягкая клавиатура',
    description: 'Тихие и приятные звуки',
    icon: '🌸',
    sounds: {
      keyPress: 'soft-tap',
      error: 'soft-error',
      complete: 'soft-complete',
    },
  },
  {
    id: 'retro',
    name: 'Ретро',
    description: 'Электронные звуки в ретро стиле',
    icon: '👾',
    sounds: {
      keyPress: 'retro-beep',
      error: 'retro-error',
      complete: 'retro-complete',
    },
  },
]
