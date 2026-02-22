export type SoundTheme = 'default' | 'piano' | 'mechanical' | 'soft' | 'retro'

export interface SoundThemeConfig {
  id: SoundTheme
  name: string
  icon: string
  description: string
  correct: { freq: number; duration: number; type: OscillatorType }
  error: { freq: number; duration: number; type: OscillatorType }
  complete: { freq: number; duration: number; type: OscillatorType }
  click: { freq: number; duration: number; type: OscillatorType }
}

export const soundThemes: Record<SoundTheme, SoundThemeConfig> = {
  default: {
    id: 'default',
    name: 'По умолчанию',
    icon: '🔊',
    description: 'Стандартные звуковые сигналы',
    correct: { freq: 800, duration: 0.05, type: 'sine' },
    error: { freq: 200, duration: 0.1, type: 'sawtooth' },
    complete: { freq: 1200, duration: 0.3, type: 'triangle' },
    click: { freq: 600, duration: 0.02, type: 'sine' },
  },
  piano: {
    id: 'piano',
    name: 'Пианино',
    icon: '🎹',
    description: 'Фортепианные ноты для каждого нажатия',
    correct: { freq: 523.25, duration: 0.3, type: 'sine' }, // C5
    error: { freq: 130.81, duration: 0.4, type: 'triangle' }, // C3
    complete: { freq: 659.25, duration: 0.5, type: 'sine' }, // E5 (major chord)
    click: { freq: 440, duration: 0.15, type: 'sine' }, // A4
  },
  mechanical: {
    id: 'mechanical',
    name: 'Механическая',
    icon: '⌨️',
    description: 'Звук механической клавиатуры',
    correct: { freq: 3000, duration: 0.015, type: 'square' },
    error: { freq: 150, duration: 0.15, type: 'sawtooth' },
    complete: { freq: 2000, duration: 0.2, type: 'square' },
    click: { freq: 2500, duration: 0.01, type: 'square' },
  },
  soft: {
    id: 'soft',
    name: 'Мягкий',
    icon: '🌸',
    description: 'Тихие мягкие звуки',
    correct: { freq: 660, duration: 0.08, type: 'sine' },
    error: { freq: 330, duration: 0.12, type: 'sine' },
    complete: { freq: 880, duration: 0.25, type: 'sine' },
    click: { freq: 550, duration: 0.05, type: 'sine' },
  },
  retro: {
    id: 'retro',
    name: 'Ретро',
    icon: '👾',
    description: '8-битные звуки из игр',
    correct: { freq: 1000, duration: 0.1, type: 'square' },
    error: { freq: 150, duration: 0.2, type: 'sawtooth' },
    complete: { freq: 800, duration: 0.1, type: 'square' },
    click: { freq: 1200, duration: 0.05, type: 'square' },
  },
}

// Ноты для пианино темы
export const pianoNotes = {
  'й': 523.25, // C5
  'ц': 554.37, // C#5
  'у': 587.33, // D5
  'к': 622.25, // D#5
  'е': 659.25, // E5
  'н': 698.46, // F5
  'г': 739.99, // F#5
  'ш': 783.99, // G5
  'щ': 830.61, // G#5
  'з': 880,    // A5
  'х': 932.33, // A#5
  'ъ': 987.77, // B5
  'ф': 493.88, // B4
  'ы': 466.16, // A#4
  'в': 440,    // A4
  'а': 415.30, // G#4
  'п': 392,    // G4
  'р': 369.99, // F#4
  'о': 349.23, // F4
  'л': 329.63, // E4
  'д': 311.13, // D#4
  'ж': 293.66, // D4
  'э': 277.18, // C#4
  'я': 261.63, // C4
  'ч': 277.18, // C#4
  'с': 293.66, // D4
  'м': 311.13, // D#4
  'и': 329.63, // E4
  'т': 349.23, // F4
  'ь': 369.99, // F#4
  'б': 392,    // G4
  'ю': 415.30, // G#4
  '.': 440,    // A4
}
