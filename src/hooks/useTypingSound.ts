import { useRef, useCallback, useEffect } from 'react'
import { SoundTheme, soundThemes, pianoNotes } from '../utils/soundThemes'

interface SoundOptions {
  enabled: boolean
  volume: number
  theme: SoundTheme
}

export function useTypingSound(options: SoundOptions) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const lastPlayTimeRef = useRef<number>(0)
  const throttleMs = 30
  const isInitialisedRef = useRef(false)

  const initAudio = useCallback(() => {
    if (isInitialisedRef.current) return
    
    isInitialisedRef.current = true
    
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }
    
    if (!gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = options.volume
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
      }
    }
  }, [initAudio])

  const playSound = useCallback((soundName: 'correct' | 'error' | 'complete' | 'click', key?: string) => {
    if (!options.enabled) return
    
    const now = Date.now()
    if (now - lastPlayTimeRef.current < throttleMs) return
    
    lastPlayTimeRef.current = now
    
    try {
      if (!audioContextRef.current) {
        initAudio()
      }
      
      const ctx = audioContextRef.current
      if (!ctx || !gainNodeRef.current) return
      
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
      
      const now = ctx.currentTime
      gainNode.gain.setValueAtTime(options.volume, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + sound.duration)
      
      oscillator.start(now)
      oscillator.stop(now + sound.duration)
    } catch (e) {
      console.warn('Audio play failed:', e)
    }
  }, [options.enabled, options.volume, options.theme, initAudio])

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
  }
}
