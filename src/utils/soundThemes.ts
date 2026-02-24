export interface SoundTheme {
  id: string
  name: string
  description: string
  icon: string
  sounds: {
    keyPress: string
    error: string
    complete: string
  }
}

export const SOUND_THEMES: SoundTheme[] = [
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
    id: 'typewriter',
    name: 'Печатная машинка',
    description: 'Ностальгический звук печатной машинки',
    icon: '📠',
    sounds: {
      keyPress: 'typewriter-click',
      error: 'typewriter-bell',
      complete: 'typewriter-ding',
    },
  },
  {
    id: 'soft',
    name: 'Мягкая клавиатура',
    description: 'Тихие и приятные звуки',
    icon: '🎹',
    sounds: {
      keyPress: 'soft-tap',
      error: 'soft-error',
      complete: 'soft-complete',
    },
  },
  {
    id: 'futuristic',
    name: 'Футуристическая',
    description: 'Электронные звуки будущего',
    icon: '🚀',
    sounds: {
      keyPress: 'beep',
      error: 'error-beep',
      complete: 'success-beep',
    },
  },
  {
    id: 'silent',
    name: 'Без звука',
    description: 'Тихий режим без звуковых эффектов',
    icon: '🔇',
    sounds: {
      keyPress: '',
      error: '',
      complete: '',
    },
  },
]
