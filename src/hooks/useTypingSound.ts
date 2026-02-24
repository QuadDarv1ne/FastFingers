import { useRef, useCallback, useEffect, useState } from 'react'
import { SoundTheme, soundThemes, pianoNotes } from '../utils/soundThemes'

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
  initAudio: () => void
  isReady: boolean
  error: string | null
}

export function useTypingSound(options: SoundOptions): UseTypingSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const lastPlayTimeRef = useRef<number>(0)
  const throttleMs = 30
  const isInitialisedRef = useRef(false)
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

  const playSound = useCallback((soundName: 'correct' | 'error' | 'complete' | 'click', key?: string) => {
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

      const theme = soundThemes[options.theme]
      const sound = soundName === 'click' && options.theme === 'piano' && key
        ? { freq: pianoNotes[key as keyof typeof pianoNotes] || 440, duration: 0.15, type: 'sine' as const }
        : theme[soundName]

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(gainNodeRef.current)

      oscillator.frequency.value = sound.freq
      oscillator.type = sound.type

      const ctxNow = ctx.currentTime
      gainNode.gain.setValueAtTime(options.volume, ctxNow)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctxNow + sound.duration)

      oscillator.start(ctxNow)
      oscillator.stop(ctxNow + sound.duration)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio play failed'
      setError(message)
      console.warn(message, err)
    }
  }, [options.enabled, options.volume, options.theme, isReady, initAudio])

  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [])

  return {
    playCorrect: (key?: string) => playSound('correct', key),
    playError: () => playSound('error'),
    playComplete: () => playSound('complete'),
    playClick: (key?: string) => playSound('click', key),
    setVolume,
    initAudio,
    isReady,
    error,
  }
}
