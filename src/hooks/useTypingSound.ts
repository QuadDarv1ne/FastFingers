import { useRef, useCallback } from 'react'

interface SoundOptions {
  enabled: boolean
  volume: number
}

// Частоты для разных звуков
const SOUNDS = {
  // Правильное нажатие - высокий приятный тон
  correct: { freq: 800, duration: 0.05, type: 'sine' as const },
  // Ошибка - низкий неприятный тон
  error: { freq: 200, duration: 0.1, type: 'sawtooth' as const },
  // Завершение упражнения - победный аккорд
  complete: { freq: 1200, duration: 0.3, type: 'triangle' as const },
  // Клик клавиши - тихий щелчок
  click: { freq: 600, duration: 0.02, type: 'sine' as const },
}

export function useTypingSound(options: SoundOptions) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const lastPlayTimeRef = useRef<number>(0)
  const throttleMs = 30 // Минимальный интервал между звуками

  // Инициализация аудио контекста
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = options.volume
    }
  }, [options.volume])

  // Воспроизведение звука
  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
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
      
      // Возобновление контекста если приостановлен
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      
      const sound = SOUNDS[soundName]
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(gainNodeRef.current)
      
      oscillator.frequency.value = sound.freq
      oscillator.type = sound.type
      
      // Плавное затухание
      const now = ctx.currentTime
      gainNode.gain.setValueAtTime(options.volume, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + sound.duration)
      
      oscillator.start(now)
      oscillator.stop(now + sound.duration)
    } catch (e) {
      // Игнорируем ошибки аудио (например, в Safari без жеста пользователя)
      console.warn('Audio play failed:', e)
    }
  }, [options.enabled, options.volume, initAudio])

  // Обновление громкости
  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [])

  // Очистка
  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      gainNodeRef.current = null
    }
  }, [])

  return {
    playCorrect: () => playSound('correct'),
    playError: () => playSound('error'),
    playComplete: () => playSound('complete'),
    playClick: () => playSound('click'),
    setVolume,
    cleanup,
    initAudio,
  }
}
