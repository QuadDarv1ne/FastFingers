/**
 * useTypingSoundEnhanced — Улучшенный хук для звуков печати с ASMR
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */
import { useRef, useCallback, useEffect, useState } from 'react'
import { SoundTheme } from '../types'
import { logger } from '../utils/logger'

interface SoundOptions {
  enabled: boolean
  volume: number
  theme: SoundTheme
}

interface UseTypingSoundEnhancedReturn {
  playCorrect: (key?: string) => void
  playError: () => void
  playComplete: () => void
  playClick: (key?: string) => void
  playMilestone: () => void
  setVolume: (volume: number) => void
  setEnabled: (enabled: boolean) => void
  setTheme: (theme: SoundTheme) => void
  initAudio: () => void
  isReady: boolean
  isEnabled: boolean
  error: string | null
  currentTheme: SoundTheme
}

interface SoundConfig {
  frequency: number
  type: OscillatorType
  duration: number
  decay: number
  harmonics?: number[]
}

const SOUND_CONFIGS: Record<'correct' | 'error' | 'complete' | 'click' | 'milestone', SoundConfig> = {
  correct: { frequency: 880, type: 'sine', duration: 0.08, decay: 0.04 },
  error: { frequency: 220, type: 'sawtooth', duration: 0.12, decay: 0.08 },
  complete: { frequency: 1320, type: 'sine', duration: 0.25, decay: 0.15 },
  click: { frequency: 660, type: 'triangle', duration: 0.04, decay: 0.02 },
  milestone: { frequency: 1760, type: 'sine', duration: 0.4, decay: 0.3, harmonics: [220, 440, 880] },
}

const THEME_CONFIGS: Record<SoundTheme, { baseFreq: number; waveType: OscillatorType; reverb: number; pitchVariation: number; attack: number; release: number }> = {
  default: { baseFreq: 1, waveType: 'sine', reverb: 0.1, pitchVariation: 0.05, attack: 0.01, release: 0.1 },
  piano: { baseFreq: 1, waveType: 'sine', reverb: 0.3, pitchVariation: 0.02, attack: 0.02, release: 0.3 },
  mechanical: { baseFreq: 1, waveType: 'square', reverb: 0.05, pitchVariation: 0.1, attack: 0.005, release: 0.05 },
  soft: { baseFreq: 0.8, waveType: 'sine', reverb: 0.2, pitchVariation: 0.03, attack: 0.03, release: 0.2 },
  retro: { baseFreq: 0.9, waveType: 'square', reverb: 0.1, pitchVariation: 0.15, attack: 0.01, release: 0.1 },
  asmr: { baseFreq: 0.7, waveType: 'sine', reverb: 0.4, pitchVariation: 0.01, attack: 0.05, release: 0.4 },
}

// Частоты для разных клавиш (пентатоника для приятного звучания)
const KEY_FREQUENCIES: Record<string, number> = {
  'a': 261.63, 's': 293.66, 'd': 329.63, 'f': 349.23, 'g': 392.00, 'h': 440.00, 'j': 523.25, 'k': 587.33, 'l': 659.25, ';': 783.99,
  'q': 261.63, 'w': 293.66, 'e': 329.63, 'r': 349.23, 't': 392.00, 'y': 440.00, 'u': 523.25, 'i': 587.33, 'o': 659.25, 'p': 783.99,
  'z': 329.63, 'x': 349.23, 'c': 392.00, 'v': 440.00, 'b': 523.25, 'n': 587.33, 'm': 659.25,
}

export function useTypingSoundEnhanced(initialOptions: SoundOptions): UseTypingSoundEnhancedReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const reverbNodeRef = useRef<ConvolverNode | null>(null)
  const compressorRef = useRef<DynamicsCompressorNode | null>(null)
  const lastPlayTimeRef = useRef<number>(0)
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set())

  const [isReady, setIsReady] = useState(false)
  const [isEnabled, setIsEnabled] = useState(initialOptions.enabled)
  const [error, setError] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<SoundTheme>(initialOptions.theme)
  const [options, setOptions] = useState<SoundOptions>(initialOptions)

  // Инициализация аудио контекста
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return

    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || window.AudioContext
      const audioContext = new AudioContextClass()

      // Создаём цепочку узлов
      const gainNode = audioContext.createGain()
      const compressor = audioContext.createDynamicsCompressor()
      const reverbNode = audioContext.createConvolver()

      // Настройка компрессора
      compressor.threshold.value = -50
      compressor.knee.value = 40
      compressor.ratio.value = 12
      compressor.attack.value = 0.003
      compressor.release.value = 0.25

      // Создание импульса для реверберации
      const sampleRate = audioContext.sampleRate
      const length = sampleRate * 2
      const impulse = audioContext.createBuffer(2, length, sampleRate)
      const impulseL = impulse.getChannelData(0)
      const impulseR = impulse.getChannelData(1)
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2)
        impulseL[i] = (Math.random() * 2 - 1) * decay
        impulseR[i] = (Math.random() * 2 - 1) * decay
      }
      reverbNode.buffer = impulse

      // Подключение узлов
      gainNode.connect(compressor)
      compressor.connect(reverbNode)
      reverbNode.connect(audioContext.destination)

      audioContextRef.current = audioContext
      gainNodeRef.current = gainNode
      reverbNodeRef.current = reverbNode
      compressorRef.current = compressor
      gainNode.gain.value = options.volume
      setIsReady(true)
    } catch (err) {
      logger.error('Failed to initialize audio:', err)
      setError('Failed to initialize audio')
    }
  }, [options.volume])

  // Воспроизведение звука
  const playSound = useCallback((
    config: SoundConfig,
    key?: string
  ) => {
    if (!isEnabled || !audioContextRef.current || !gainNodeRef.current) return

    const audioContext = audioContextRef.current
    const now = audioContext.currentTime
    const themeConfig = THEME_CONFIGS[currentTheme]

    // Ограничение частоты воспроизведения
    if (now - lastPlayTimeRef.current < 0.03) return
    lastPlayTimeRef.current = now

    // Получение частоты для клавиши
    let baseFrequency = config.frequency
    if (key) {
      const keyFreq = KEY_FREQUENCIES[key.toLowerCase()]
      if (keyFreq !== undefined) {
        baseFrequency = keyFreq * themeConfig.baseFreq
      } else {
        baseFrequency *= (1 + (Math.random() - 0.5) * themeConfig.pitchVariation * 2)
      }
    } else {
      baseFrequency *= (1 + (Math.random() - 0.5) * themeConfig.pitchVariation * 2)
    }

    // Создание осциллятора
    const oscillator = audioContext.createOscillator()
    const noteGain = audioContext.createGain()
    oscillator.type = config.type
    oscillator.frequency.setValueAtTime(baseFrequency, now)

    // Добавление гармоник для богатого звучания
    if (config.harmonics) {
      config.harmonics.forEach((harmonic, index) => {
        const harmonicOsc = audioContext.createOscillator()
        const harmonicGain = audioContext.createGain()
        harmonicOsc.type = config.type
        harmonicOsc.frequency.setValueAtTime(harmonic, now)
        harmonicGain.gain.setValueAtTime(options.volume * 0.3 / (index + 1), now)
        harmonicOsc.connect(harmonicGain)
        harmonicGain.connect(noteGain)
        harmonicOsc.start(now)
        harmonicOsc.stop(now + config.duration)
        activeOscillatorsRef.current.add(harmonicOsc)
        setTimeout(() => {
          activeOscillatorsRef.current.delete(harmonicOsc)
        }, config.duration * 1000)
      })
    }

    // ADSR огибающая
    const attack = themeConfig.attack || config.duration * 0.1
    const decay = config.decay
    const sustain = options.volume * 0.7
    const release = themeConfig.release || config.decay

    noteGain.gain.setValueAtTime(0, now)
    noteGain.gain.linearRampToValueAtTime(options.volume, now + attack)
    noteGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
    noteGain.gain.linearRampToValueAtTime(0, now + config.duration + release)

    // Подключение
    oscillator.connect(noteGain)
    noteGain.connect(gainNodeRef.current)

    // Запуск
    oscillator.start(now)
    oscillator.stop(now + config.duration + release)
    activeOscillatorsRef.current.add(oscillator)
    setTimeout(() => {
      activeOscillatorsRef.current.delete(oscillator)
    }, (config.duration + release) * 1000)
  }, [isEnabled, currentTheme, options.volume])

  // Плейбэк для разных событий
  const playCorrect = useCallback((key?: string) => {
    if (!isEnabled) return
    playSound(SOUND_CONFIGS.correct, key)
  }, [isEnabled, playSound])

  const playError = useCallback(() => {
    if (!isEnabled) return
    playSound(SOUND_CONFIGS.error)
  }, [isEnabled, playSound])

  const playComplete = useCallback(() => {
    if (!isEnabled) return
    playSound(SOUND_CONFIGS.complete)
  }, [isEnabled, playSound])

  const playClick = useCallback((key?: string) => {
    if (!isEnabled) return
    playSound(SOUND_CONFIGS.click, key)
  }, [isEnabled, playSound])

  const playMilestone = useCallback(() => {
    if (!isEnabled) return
    playSound(SOUND_CONFIGS.milestone)
  }, [isEnabled, playSound])

  // Сеттеры
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    setOptions(prev => ({ ...prev, volume: clampedVolume }))
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(clampedVolume, audioContextRef.current.currentTime)
    }
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled)
    setOptions(prev => ({ ...prev, enabled }))
  }, [])

  const setTheme = useCallback((theme: SoundTheme) => {
    setCurrentTheme(theme)
    setOptions(prev => ({ ...prev, theme }))
  }, [])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const oscillators = activeOscillatorsRef.current
      oscillators.forEach(osc => {
        try {
          osc.stop()
        } catch {
          // Игнорируем ошибки остановки
        }
      })
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Обновление громкости при изменении опций
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(options.volume, audioContextRef.current.currentTime)
    }
  }, [options.volume])

  // Обновление реверберации при смене темы
  useEffect(() => {
    if (reverbNodeRef.current && gainNodeRef.current) {
      const themeConfig = THEME_CONFIGS[currentTheme]
      reverbNodeRef.current.disconnect()
      if (themeConfig.reverb > 0.2) {
        reverbNodeRef.current.connect(gainNodeRef.current)
      } else {
        reverbNodeRef.current.disconnect()
        const destination = audioContextRef.current?.destination
        if (destination) {
          gainNodeRef.current.connect(destination)
        }
      }
    }
  }, [currentTheme])

  return {
    playCorrect,
    playError,
    playComplete,
    playClick,
    playMilestone,
    setVolume,
    setEnabled,
    setTheme,
    initAudio,
    isReady,
    isEnabled,
    error,
    currentTheme,
  }
}

export default useTypingSoundEnhanced
