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

type OscillatorPreset = { freq: number; duration: number; type: OscillatorType }

const OSC = {
  sine: (freq: number, duration: number): OscillatorPreset => ({ freq, duration, type: 'sine' }),
  triangle: (freq: number, duration: number): OscillatorPreset => ({ freq, duration, type: 'triangle' }),
  square: (freq: number, duration: number): OscillatorPreset => ({ freq, duration, type: 'square' }),
  sawtooth: (freq: number, duration: number): OscillatorPreset => ({ freq, duration, type: 'sawtooth' }),
} as const

const FREQ = {
  C3: 130.81, C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63, F4: 349.23,
  'F#4': 369.99, G4: 392, 'G#4': 415.30, A4: 440, 'A#4': 466.16, B4: 493.88, C5: 523.25,
  'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25, F5: 698.46, 'F#5': 739.99, G5: 783.99,
  'G#5': 830.61, A5: 880, 'A#5': 932.33, B5: 987.77,
  LOW_ERROR: 150, MID_ERROR: 200, MID_ERROR_2: 330, HIGH_1: 600, HIGH_2: 660, HIGH_3: 800,
  HIGH_4: 880, HIGH_5: 1000, HIGH_6: 1200, MECH_HIGH: 2500, MECH_ULTRA: 3000,
} as const

const DUR = {
  CLICK: 0.02, CLICK_2: 0.01, CLICK_3: 0.05, SHORT: 0.05, SHORT_2: 0.08, SHORT_3: 0.1,
  SHORT_4: 0.12, MED: 0.15, MED_2: 0.2, MED_3: 0.25, LONG: 0.3, LONG_2: 0.4, LONG_3: 0.5,
} as const

export const soundThemes: Record<SoundTheme, SoundThemeConfig> = {
  default: {
    id: 'default',
    name: 'По умолчанию',
    icon: '🔊',
    description: 'Стандартные звуковые сигналы',
    correct: OSC.sine(FREQ.HIGH_3, DUR.SHORT),
    error: OSC.sawtooth(FREQ.MID_ERROR, DUR.MED),
    complete: OSC.triangle(FREQ.HIGH_6, DUR.LONG),
    click: OSC.sine(FREQ.HIGH_1, DUR.CLICK),
  },
  piano: {
    id: 'piano',
    name: 'Пианино',
    icon: '🎹',
    description: 'Фортепианные ноты для каждого нажатия',
    correct: OSC.sine(FREQ.C5, DUR.LONG),
    error: OSC.triangle(FREQ.C3, DUR.LONG_2),
    complete: OSC.sine(FREQ.E5, DUR.LONG_3),
    click: OSC.sine(FREQ.A4, DUR.MED),
  },
  mechanical: {
    id: 'mechanical',
    name: 'Механическая',
    icon: '⌨️',
    description: 'Звук механической клавиатуры',
    correct: OSC.square(FREQ.MECH_ULTRA, DUR.CLICK_2),
    error: OSC.sawtooth(FREQ.LOW_ERROR, DUR.MED_2),
    complete: OSC.square(FREQ.MECH_HIGH, DUR.MED_2),
    click: OSC.square(FREQ.MECH_HIGH, DUR.CLICK_2),
  },
  soft: {
    id: 'soft',
    name: 'Мягкий',
    icon: '🌸',
    description: 'Тихие мягкие звуки',
    correct: OSC.sine(FREQ.HIGH_2, DUR.SHORT_2),
    error: OSC.sine(FREQ.MID_ERROR_2, DUR.SHORT_4),
    complete: OSC.sine(FREQ.HIGH_4, DUR.MED_3),
    click: OSC.sine(550, DUR.CLICK_3),
  },
  retro: {
    id: 'retro',
    name: 'Ретро',
    icon: '👾',
    description: '8-битные звуки из игр',
    correct: OSC.square(FREQ.HIGH_5, DUR.SHORT_3),
    error: OSC.sawtooth(FREQ.LOW_ERROR, DUR.MED_2),
    complete: OSC.square(FREQ.HIGH_3, DUR.SHORT_3),
    click: OSC.square(FREQ.HIGH_6, DUR.CLICK),
  },
}

export const pianoNotes: Record<string, number> = {
  'й': FREQ.C5, 'ц': FREQ['C#5'], 'у': FREQ.D5, 'к': FREQ['D#5'], 'е': FREQ.E5,
  'н': FREQ.F5, 'г': FREQ['F#5'], 'ш': FREQ.G5, 'щ': FREQ['G#5'], 'з': FREQ.A5,
  'х': FREQ['A#5'], 'ъ': FREQ.B5, 'ф': FREQ.B4, 'ы': FREQ['A#4'], 'в': FREQ.A4,
  'а': FREQ['G#4'], 'п': FREQ.G4, 'р': FREQ['F#4'], 'о': FREQ.F4, 'л': FREQ.E4,
  'д': FREQ['D#4'], 'ж': FREQ.D4, 'э': FREQ['C#4'], 'я': FREQ.C4, 'ч': FREQ['C#4'],
  'с': FREQ.D4, 'м': FREQ['D#4'], 'и': FREQ.E4, 'т': FREQ.F4, 'ь': FREQ['F#4'],
  'б': FREQ.G4, 'ю': FREQ['G#4'], '.': FREQ.A4,
}
