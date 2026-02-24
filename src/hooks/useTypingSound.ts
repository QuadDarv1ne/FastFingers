import { useRef, useCallback, useEffect, useState } from 'react'
import { SoundTheme } from '../utils/soundThemes'

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

  const playSound = useCallback((_soundName: 'correct' | 'error' | 'complete' | 'click', _key?: string) => {
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

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(gainNodeRef.current)

      oscillator.frequency.value = 440
      oscillator.type = 'sine'

      const ctxNow = ctx.currentTime
      gainNode.gain.setValueAtTime(options.volume, ctxNow)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctxNow + 0.1)

      oscillator.start(ctxNow)
      oscillator.stop(ctxNow + 0.1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio play failed'
      setError(message)
      console.warn(message, err)
    }
  }, [options.enabled, options.volume, options.theme, isReady, initAudio, currentTheme])

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
