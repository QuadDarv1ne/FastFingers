import { useRef, useCallback, useEffect, useState } from 'react'
import { SoundTheme } from '../types'
import { logger } from '../utils/logger'

interface SoundOptions {
  enabled: boolean
  volume: number
  theme: SoundTheme
}

interface UseTypingSoundReturn {
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

// Частоты для клавиш (пентатоника для приятного звучания)
const KEY_FREQUENCIES: Record<string, number> = {
  'a': 261.63, 's': 293.66, 'd': 329.63, 'f': 349.23, 'g': 392.00, 'h': 440.00, 'j': 523.25, 'k': 587.33, 'l': 659.25, ';': 783.99,
  'q': 261.63, 'w': 293.66, 'e': 329.63, 'r': 349.23, 't': 392.00, 'y': 440.00, 'u': 523.25, 'i': 587.33, 'o': 659.25, 'p': 783.99,
  'z': 329.63, 'x': 349.23, 'c': 392.00, 'v': 440.00, 'b': 523.25, 'n': 587.33, 'm': 659.25,
}

export function useTypingSound(initialOptions: SoundOptions): UseTypingSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const reverbNodeRef = useRef<ConvolverNode | null>(null)
  const compressorRef = useRef<DynamicsCompressorNode | null>(null)
  const lastPlayTimeRef = useRef<number>(0)
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set())
  const cleanupTimeoutsRef = useRef<Set<number>>(new Set())
  const throttleMs = 30
  const isInitialisedRef = useRef(false)
  const isMountedRef = useRef(true)

  const [options, setOptions] = useState<SoundOptions>(initialOptions)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentThemeRef = useRef<SoundTheme>(initialOptions.theme)
  const optionsRef = useRef<SoundOptions>(initialOptions)
  currentThemeRef.current = options.theme
  optionsRef.current = options

  const cleanupOscillator = useCallback((oscillator: OscillatorNode) => {
    activeOscillatorsRef.current.delete(oscillator)
    try {
      oscillator.disconnect()
    } catch {
      // Ignore cleanup errors
    }
  }, [])

  const initAudio = useCallback(() => {
    if (isInitialisedRef.current) return

    isInitialisedRef.current = true

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        const audioContext = new AudioContextClass()

        // Audio chain: gain -> compressor -> reverb -> destination
        const gainNode = audioContext.createGain()
        const compressor = audioContext.createDynamicsCompressor()
        compressor.threshold.value = -50
        compressor.knee.value = 40
        compressor.ratio.value = 12
        compressor.attack.value = 0.003
        compressor.release.value = 0.25

        // Impulse response for reverb
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
        const reverbNode = audioContext.createConvolver()
        reverbNode.buffer = impulse

        gainNode.connect(compressor)
        compressor.connect(reverbNode)
        reverbNode.connect(audioContext.destination)

        audioContextRef.current = audioContext
        gainNodeRef.current = gainNode
        reverbNodeRef.current = reverbNode
        compressorRef.current = compressor
        gainNode.gain.value = options.volume
      }

      if (isMountedRef.current) {
        setIsReady(true)
        setError(null)
      }
    } catch (err) {
      logger.error('Audio initialisation failed:', err)
      if (isMountedRef.current) {
        setIsReady(false)
        setError('Audio initialisation failed')
      }
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    setOptions(prev => ({ ...prev, volume: clamped }))
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(clamped, audioContextRef.current.currentTime)
    }
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    setOptions(prev => ({ ...prev, enabled }))
  }, [])

  const setTheme = useCallback((theme: SoundTheme) => {
    setOptions(prev => ({ ...prev, theme }))
  }, [])

  const playSound = useCallback((soundName: 'correct' | 'error' | 'complete' | 'click' | 'milestone', _key?: string) => {
    const opts = optionsRef.current
    if (!opts.enabled || !isReady) return

    const audioContext = audioContextRef.current
    if (!audioContext || !gainNodeRef.current) {
      initAudio()
      return
    }

    const now = audioContext.currentTime
    if (now - lastPlayTimeRef.current < throttleMs / 1000) return
    lastPlayTimeRef.current = now

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => setError('Audio context resume failed'))
    }

    const baseConfig = SOUND_CONFIGS[soundName]
    const themeConfig = THEME_CONFIGS[currentThemeRef.current]

    // Resolve frequency: per-key for known keys, otherwise pitch variation
    let baseFrequency = baseConfig.frequency
    if (_key) {
      const keyFreq = KEY_FREQUENCIES[_key.toLowerCase()]
      baseFrequency = keyFreq !== undefined
        ? keyFreq * themeConfig.baseFreq
        : baseFrequency * (1 + (Math.random() - 0.5) * themeConfig.pitchVariation * 2)
    } else {
      baseFrequency *= (1 + (Math.random() - 0.5) * themeConfig.pitchVariation * 2)
    }

    try {
      const oscillator = audioContext.createOscillator()
      const noteGain = audioContext.createGain()
      oscillator.type = baseConfig.type
      oscillator.frequency.setValueAtTime(baseFrequency, now)

      // ADSR envelope
      const attack = themeConfig.attack || baseConfig.duration * 0.1
      const decay = baseConfig.decay
      const sustain = opts.volume * 0.7
      const release = themeConfig.release || baseConfig.decay

      noteGain.gain.setValueAtTime(0, now)
      noteGain.gain.linearRampToValueAtTime(opts.volume, now + attack)
      noteGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
      noteGain.gain.linearRampToValueAtTime(0, now + baseConfig.duration + release)

      // Harmonics for richer sounds (milestone)
      if (baseConfig.harmonics) {
        baseConfig.harmonics.forEach((harmonic, index) => {
          const hOsc = audioContext.createOscillator()
          const hGain = audioContext.createGain()
          hOsc.type = baseConfig.type
          hOsc.frequency.setValueAtTime(harmonic, now)
          hGain.gain.setValueAtTime(opts.volume * 0.3 / (index + 1), now)
          hOsc.connect(hGain)
          hGain.connect(noteGain)
          hOsc.start(now)
          hOsc.stop(now + baseConfig.duration)
          activeOscillatorsRef.current.add(hOsc)
          const hTimeout = window.setTimeout(() => {
            cleanupTimeoutsRef.current.delete(hTimeout)
            cleanupOscillator(hOsc)
          }, baseConfig.duration * 1000)
          cleanupTimeoutsRef.current.add(hTimeout)
        })
      }

      oscillator.connect(noteGain)
      noteGain.connect(gainNodeRef.current)
      oscillator.start(now)
      oscillator.stop(now + baseConfig.duration + release)

      activeOscillatorsRef.current.add(oscillator)
      const timeoutId = window.setTimeout(() => {
        cleanupTimeoutsRef.current.delete(timeoutId)
        cleanupOscillator(oscillator)
      }, (baseConfig.duration + release) * 1000)
      cleanupTimeoutsRef.current.add(timeoutId)
    } catch (err) {
      logger.error('Audio play failed:', err)
      if (isMountedRef.current) {
        setError('Audio play failed')
      }
    }
  }, [isReady, initAudio, cleanupOscillator])

  useEffect(() => {
    isMountedRef.current = true
    initAudio()

    const timeouts = cleanupTimeoutsRef.current
    const oscillators = activeOscillatorsRef.current

    return () => {
      isMountedRef.current = false
      timeouts.forEach(clearTimeout)
      timeouts.clear()

      oscillators.forEach(osc => {
        try {
          osc.stop()
          osc.disconnect()
        } catch {
          // Ignore cleanup errors
        }
      })
      oscillators.clear()

      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
        gainNodeRef.current = null
        reverbNodeRef.current = null
        compressorRef.current = null
        isInitialisedRef.current = false
        setIsReady(false)
      }
    }
  }, [initAudio])

  // Update reverb routing when theme changes
  useEffect(() => {
    if (!reverbNodeRef.current || !gainNodeRef.current) return
    const themeConfig = THEME_CONFIGS[optionsRef.current.theme]
    reverbNodeRef.current.disconnect()
    if (themeConfig.reverb > 0.2) {
      reverbNodeRef.current.connect(gainNodeRef.current)
    } else {
      audioContextRef.current?.destination && gainNodeRef.current.connect(audioContextRef.current.destination)
    }
  }, [options.theme])

  return {
    playCorrect: (key?: string) => playSound('correct', key),
    playError: () => playSound('error'),
    playComplete: () => playSound('complete'),
    playClick: (key?: string) => playSound('click', key),
    playMilestone: () => playSound('milestone'),
    setVolume,
    setEnabled,
    setTheme,
    initAudio,
    isReady,
    isEnabled: options.enabled,
    error,
  }
}
