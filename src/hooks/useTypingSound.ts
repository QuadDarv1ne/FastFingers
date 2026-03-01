import { useRef, useCallback, useEffect, useState } from 'react'
import { SoundTheme } from '../types'

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
}

const SOUND_CONFIGS: Record<'correct' | 'error' | 'complete' | 'click', SoundConfig> = {
  correct: { frequency: 880, type: 'sine', duration: 0.1, decay: 0.05 },
  error: { frequency: 220, type: 'sawtooth', duration: 0.15, decay: 0.1 },
  complete: { frequency: 1320, type: 'sine', duration: 0.3, decay: 0.2 },
  click: { frequency: 660, type: 'triangle', duration: 0.05, decay: 0.03 },
} as const

const THEME_CONFIGS: Record<SoundTheme, { baseFreq: number; waveType: OscillatorType }> = {
  default: { baseFreq: 1, waveType: 'sine' },
  piano: { baseFreq: 1, waveType: 'sine' },
  mechanical: { baseFreq: 1, waveType: 'square' },
  soft: { baseFreq: 0.8, waveType: 'sine' },
  retro: { baseFreq: 0.9, waveType: 'square' },
} as const

export function useTypingSound(initialOptions: SoundOptions): UseTypingSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const lastPlayTimeRef = useRef<number>(0)
  const throttleMs = 30
  const isInitialisedRef = useRef(false)

  const [options, setOptions] = useState<SoundOptions>(initialOptions)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initAudio = useCallback(() => {
    if (isInitialisedRef.current) return

    isInitialisedRef.current = true

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
      }

      if (!gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.connect(audioContextRef.current.destination)
        gainNodeRef.current.gain.value = options.volume
        setIsReady(true)
        setError(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize audio'
      setError(message)
      setIsReady(false)
      console.error('Audio init error:', err)
    }
  }, [options.volume])

  const setVolume = useCallback((volume: number) => {
    setOptions(prev => ({ ...prev, volume }))
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    setOptions(prev => ({ ...prev, enabled }))
  }, [])

  const setTheme = useCallback((theme: SoundTheme) => {
    setOptions(prev => ({ ...prev, theme }))
  }, [])

  const playSound = useCallback((soundName: 'correct' | 'error' | 'complete' | 'click', _key?: string) => {
    if (!options.enabled || !isReady) return

    const now = Date.now()
    if (now - lastPlayTimeRef.current < throttleMs) return

    lastPlayTimeRef.current = now

    try {
      if (!audioContextRef.current || !gainNodeRef.current) {
        initAudio()
        return
      }

      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const baseConfig = SOUND_CONFIGS[soundName]
      const themeConfig = THEME_CONFIGS[options.theme]

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(gainNodeRef.current)

      oscillator.frequency.value = baseConfig.frequency * themeConfig.baseFreq
      oscillator.type = themeConfig.waveType

      const ctxNow = ctx.currentTime
      gainNode.gain.setValueAtTime(options.volume, ctxNow)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctxNow + baseConfig.decay)

      oscillator.start(ctxNow)
      oscillator.stop(ctxNow + baseConfig.duration)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio play failed'
      setError(message)
      console.warn(message, err)
    }
  }, [options.enabled, options.volume, options.theme, isReady, initAudio])

  useEffect(() => {
    initAudio()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
        gainNodeRef.current = null
        isInitialisedRef.current = false
        setIsReady(false)
      }
    }
  }, [initAudio])

  return {
    playCorrect: (key?: string) => playSound('correct', key),
    playError: () => playSound('error'),
    playComplete: () => playSound('complete'),
    playClick: (key?: string) => playSound('click', key),
    setVolume,
    setEnabled,
    setTheme,
    initAudio,
    isReady,
    isEnabled: options.enabled,
    error,
  }
}
