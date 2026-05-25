import { useState, useEffect, useCallback, useRef } from 'react'
import { musicGenerator, type MusicGenre } from '../utils/musicGenerator'
import { logger } from '../utils/logger'
import { STORAGE_KEYS } from '../constants/storageKeys'

interface UseMusicGeneratorReturn {
  isPlaying: boolean
  genre: MusicGenre
  tempo: number
  volume: number
  key: string
  play: () => void
  stop: () => void
  toggle: () => void
  setGenre: (genre: MusicGenre) => void
  setTempo: (tempo: number) => void
  setVolume: (volume: number) => void
  setKey: (key: string) => void
  availableGenres: GenreInfo[]
  availableKeys: KeyInfo[]
}

const GENRES: { value: MusicGenre; label: string; icon: string; description: string }[] = [
  { value: 'ambient', label: 'Ambient', icon: '🌊', description: 'Атмосферная, спокойная музыка' },
  { value: 'electronic', label: 'Electronic', icon: '🎹', description: 'Электронные биты' },
  { value: 'classical', label: 'Classical', icon: '🎻', description: 'Классическая музыка' },
  { value: 'jazz', label: 'Jazz', icon: '🎷', description: 'Джазовые импровизации' },
  { value: 'lofi', label: 'Lo-Fi', icon: '📻', description: 'Расслабляющий лоу-фай' },
  { value: 'cinematic', label: 'Cinematic', icon: '🎬', description: 'Кинематографичная музыка' },
]

const KEYS = [
  { value: 'C', label: 'C Major' },
  { value: 'Am', label: 'A Minor' },
  { value: 'D', label: 'D Major' },
  { value: 'Em', label: 'E Minor' },
  { value: 'G', label: 'G Major' },
  { value: 'F', label: 'F Major' },
]

export interface GenreInfo {
  value: MusicGenre
  label: string
  icon: string
  description: string
}

export interface KeyInfo {
  value: string
  label: string
}

export function useMusicGenerator(): UseMusicGeneratorReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [genre, setGenreState] = useState<MusicGenre>('ambient')
  const [tempo, setTempoState] = useState(90)
  const [volume, setVolumeState] = useState(0.3)
  const [key, setKeyState] = useState('C')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      try {
        const savedGenre = localStorage.getItem(STORAGE_KEYS.MUSIC_GENRE) as MusicGenre | null
        const savedTempo = localStorage.getItem(STORAGE_KEYS.MUSIC_TEMPO)
        const savedVolume = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME)
        const savedKey = localStorage.getItem(STORAGE_KEYS.MUSIC_KEY)

        if (savedGenre && GENRES.find(g => g.value === savedGenre)) {
          setGenreState(savedGenre)
        }
        if (savedTempo) setTempoState(Number(savedTempo))
        if (savedVolume) setVolumeState(Number(savedVolume))
        if (savedKey && KEYS.find(k => k.value === savedKey)) {
          setKeyState(savedKey)
        }
      } catch {
        logger.warn('Operation failed in hooks/useMusicGenerator.ts')
        // Ignore errors
      }
      initializedRef.current = true
    }

    return () => {
      musicGenerator.destroy()
    }
  }, [])

  useEffect(() => {
    musicGenerator.setOptions({ genre, tempo, volume, key })
    try {
      localStorage.setItem(STORAGE_KEYS.MUSIC_GENRE, genre)
      localStorage.setItem(STORAGE_KEYS.MUSIC_TEMPO, String(tempo))
      localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, String(volume))
      localStorage.setItem(STORAGE_KEYS.MUSIC_KEY, key)
    } catch {
      logger.warn('Operation failed in hooks/useMusicGenerator.ts')
      // Ignore errors
    }
  }, [genre, tempo, volume, key])

  const play = useCallback(() => {
    musicGenerator.play()
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    musicGenerator.stop()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop()
    } else {
      play()
    }
  }, [isPlaying, play, stop])

  const setGenre = useCallback((newGenre: MusicGenre) => {
    setGenreState(newGenre)
  }, [])

  const setTempo = useCallback((newTempo: number) => {
    setTempoState(Math.max(60, Math.min(180, newTempo)))
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)))
  }, [])

  const setKey = useCallback((newKey: string) => {
    setKeyState(newKey)
  }, [])

  return {
    isPlaying,
    genre,
    tempo,
    volume,
    key,
    play,
    stop,
    toggle,
    setGenre,
    setTempo,
    setVolume,
    setKey,
    availableGenres: GENRES,
    availableKeys: KEYS,
  }
}
