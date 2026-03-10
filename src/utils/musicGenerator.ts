/**
 * Музыкальный генератор для FastFingers
 * Генерирует музыку в реальном времени в разных жанрах
 */

export type MusicGenre = 'ambient' | 'electronic' | 'classical' | 'jazz' | 'lofi' | 'cinematic'

export interface MusicGeneratorOptions {
  genre: MusicGenre
  tempo: number // BPM
  volume: number // 0-1
  key: string // музыкальная тональность
}

interface Scale {
  name: string
  intervals: number[]
}

const SCALES: Record<string, Scale> = {
  C: { name: 'C major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  Am: { name: 'A minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  D: { name: 'D major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  Em: { name: 'E minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  G: { name: 'G major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  F: { name: 'F major', intervals: [0, 2, 4, 5, 7, 9, 11] },
}

const BASE_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
}

export class MusicGenerator {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isPlaying: boolean = false
  private tempo: number = 90
  private volume: number = 0.3
  private currentGenre: MusicGenre = 'ambient'
  private currentKey: string = 'C'
  private nextNoteTime: number = 0
  private currentBeat: number = 0
  private schedulerTimer: number | null = null
  private lookahead: number = 25 // ms
  private scheduleAheadTime: number = 0.1 // seconds
  private activeNotes: Set<number> = new Set()

  constructor() {}

  init(): void {
    if (!this.audioContext) {
      const AudioContextClass = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as typeof AudioContext
      this.audioContext = new AudioContextClass()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = this.volume
    }
  }

  setOptions(options: Partial<MusicGeneratorOptions>): void {
    if (options.genre) this.currentGenre = options.genre
    if (options.tempo) this.tempo = options.tempo
    if (options.volume !== undefined) {
      this.volume = options.volume
      if (this.masterGain) {
        this.masterGain.gain.value = this.volume
      }
    }
    if (options.key) this.currentKey = options.key
  }

  play(): void {
    this.init()
    if (this.isPlaying || !this.audioContext) return

    this.isPlaying = true
    this.currentBeat = 0
    this.nextNoteTime = this.audioContext.currentTime

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    this.scheduler()
  }

  stop(): void {
    this.isPlaying = false
    if (this.schedulerTimer !== null) {
      window.clearTimeout(this.schedulerTimer)
      this.schedulerTimer = null
    }
    this.activeNotes.clear()
  }

  private scheduler(): void {
    if (!this.isPlaying || !this.audioContext) return

    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime)
      this.nextNoteTime += (60 / this.tempo)
      this.currentBeat = (this.currentBeat + 1) % 16
    }

    this.schedulerTimer = window.setTimeout(() => this.scheduler(), this.lookahead)
  }

  private scheduleNote(beat: number, time: number): void {
    switch (this.currentGenre) {
      case 'ambient':
        this.playAmbient(beat, time)
        break
      case 'electronic':
        this.playElectronic(beat, time)
        break
      case 'classical':
        this.playClassical(beat, time)
        break
      case 'jazz':
        this.playJazz(beat, time)
        break
      case 'lofi':
        this.playLofi(beat, time)
        break
      case 'cinematic':
        this.playCinematic(beat, time)
        break
    }
  }

  private getFrequency(noteIndex: number, octave: number = 4): number {
    const scale = SCALES[this.currentKey] || SCALES['C']
    const baseFreq = BASE_FREQUENCIES['C'] || 261.63
    const intervalIndex = noteIndex % (scale?.intervals.length || 7)
    const semitones = (scale?.intervals[intervalIndex] || 0) + (octave - 4) * 12
    return baseFreq * Math.pow(2, semitones / 12)
  }

  private createOscillator(
    type: OscillatorType,
    frequency: number,
    startTime: number,
    duration: number,
    velocity: number = 0.5
  ): void {
    if (!this.audioContext || !this.masterGain) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = type
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(velocity, startTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  private playChord(notes: number[], time: number, duration: number, type: OscillatorType = 'sine'): void {
    notes.forEach((noteIndex, i) => {
      const freq = this.getFrequency(noteIndex, 4)
      this.createOscillator(type, freq, time + i * 0.02, duration, 0.3)
    })
  }

  private playBass(frequency: number, time: number, duration: number): void {
    this.createOscillator('triangle', frequency / 2, time, duration, 0.4)
  }

  private playAmbient(beat: number, time: number): void {
    const scale = SCALES[this.currentKey] || SCALES['C']
    const intervalsLen = scale?.intervals.length || 7

    // Длинные аккорды каждые 4 бита
    if (beat % 4 === 0) {
      const chordRoot = Math.floor(beat / 4) % 4
      const chord = [
        chordRoot,
        (chordRoot + 2) % intervalsLen,
        (chordRoot + 4) % intervalsLen,
      ]
      this.playChord(chord, time, 4 * (60 / this.tempo), 'sine')
    }

    // Лёгкая мелодия
    if (beat % 2 === 0) {
      const noteIndex = Math.floor(Math.random() * intervalsLen)
      const freq = this.getFrequency(noteIndex, 5)
      this.createOscillator('sine', freq, time, 2 * (60 / this.tempo), 0.15)
    }

    // Бас
    if (beat % 8 === 0) {
      const bassNote = beat % 16 < 8 ? 0 : 3
      const freq = this.getFrequency(bassNote, 3)
      this.playBass(freq, time, 8 * (60 / this.tempo))
    }
  }

  private playElectronic(beat: number, time: number): void {
    // Kick drum
    if (beat % 4 === 0) {
      this.playKick(time)
    }

    // Hi-hat
    if (beat % 2 === 0) {
      this.playHiHat(time, 0.05)
    }

    // Snare
    if (beat % 8 === 4) {
      this.playSnare(time)
    }

    // Bass line
    if (beat % 2 === 0) {
      const bassPattern = [0, 0, 3, 0, 5, 3, 0, 5] as const
      const noteIndex = bassPattern[beat % 8]
      if (noteIndex !== undefined) {
        const freq = this.getFrequency(noteIndex, 2)
        this.playBass(freq, time, 0.2)
      }
    }

    // Lead synth
    if (beat % 4 === 0 || beat % 4 === 3) {
      const melodyPattern = [0, 2, 4, 5, 4, 2, 0, 7] as const
      const noteIndex = melodyPattern[beat % 8]
      if (noteIndex !== undefined) {
        const freq = this.getFrequency(noteIndex, 5)
        this.createOscillator('sawtooth', freq, time, 0.3, 0.15)
      }
    }
  }

  private playClassical(beat: number, time: number): void {
    // Арпеджио левой руки
    if (beat % 2 === 0) {
      const arpeggio = [0, 2, 4] as const
      const noteIndex = arpeggio[(beat / 2) % 3]
      if (noteIndex !== undefined) {
        const freq = this.getFrequency(noteIndex, 3)
        this.createOscillator('triangle', freq, time, 0.5, 0.25)
      }
    }

    // Мелодия правой руки
    if (beat % 4 === 0 || beat % 4 === 2) {
      const melodyPattern = [0, 1, 2, 3, 4, 3, 2, 1] as const
      const noteIndex = melodyPattern[beat % 8]
      if (noteIndex !== undefined) {
        const freq = this.getFrequency(noteIndex, 5)
        this.createOscillator('sine', freq, time, 0.8, 0.3)
      }
    }

    // Бас
    if (beat % 8 === 0) {
      const bassNote = beat < 8 ? 0 : 4
      const freq = this.getFrequency(bassNote, 2)
      this.playBass(freq, time, 1.5)
    }
  }

  private playJazz(beat: number, time: number): void {
    const scale = SCALES[this.currentKey]

    // Swing rhythm
    const swingOffset = beat % 2 === 1 ? 0.1 : 0

    // Ride cymbal pattern
    if (beat % 3 === 0 || beat % 3 === 1) {
      this.playHiHat(time + swingOffset, 0.1, true)
    }

    // Walking bass
    const bassPattern = [0, 2, 4, 5, 6, 4, 2, 1] as const
    const noteIndex = bassPattern[beat % 8]
    if (noteIndex !== undefined) {
      const freq = this.getFrequency(noteIndex, 2)
      this.playBass(freq, time, 0.4)
    }

    // Piano chords (comping)
    if (beat % 4 === 0 || beat % 4 === 2) {
      const intervalsLen = scale?.intervals.length || 7
      const chord = [
        (beat / 2) % 4,
        ((beat / 2) % 4 + 2) % intervalsLen,
        ((beat / 2) % 4 + 4) % intervalsLen,
        ((beat / 2) % 4 + 6) % intervalsLen,
      ]
      this.playChord(chord, time + swingOffset, 0.5, 'triangle')
    }
  }

  private playLofi(beat: number, time: number): void {
    // Downtempo kick
    if (beat % 4 === 0) {
      this.playKick(time, 0.5)
    }

    // Snare on 2 and 4
    if (beat % 4 === 2) {
      this.playSnare(time, 0.3)
    }

    // Hi-hat with swing
    if (beat % 2 === 0) {
      this.playHiHat(time, 0.05, false, 0.2)
    }

    // Mellow chords
    if (beat % 8 === 0) {
      const chord = [0, 3, 7, 10]
      this.playChord(chord, time, 2 * (60 / this.tempo), 'sine')
    }

    // Simple melody
    if (beat % 4 === 1 || beat % 4 === 3) {
      const melodyPattern = [5, 7, 5, 4, 2, 0, 2, 4]
      const noteIndex = melodyPattern[beat % 8] ?? 0
      const freq = this.getFrequency(noteIndex, 5)
      this.createOscillator('sine', freq, time, 0.4, 0.2)
    }
  }

  private playCinematic(beat: number, time: number): void {
    const scale = SCALES[this.currentKey] ?? SCALES.C
    const scaleIntervals = scale?.intervals ?? [0, 2, 4, 5, 7, 9, 11]

    // Deep bass drone
    if (beat % 16 === 0) {
      const freq = this.getFrequency(0, 1)
      this.createOscillator('sine', freq, time, 16 * (60 / this.tempo), 0.3)
    }

    // Building strings
    if (beat % 4 === 0) {
      const chord = [0, 3, 7]
      const progression = Math.floor(beat / 16) % 4
      const rootNote = [0, 3, 5, 7][progression] ?? 0
      const transposedChord = chord.map(n => (rootNote + n) % scaleIntervals.length)
      this.playChord(transposedChord, time, 4 * (60 / this.tempo), 'triangle')
    }

    // Dramatic hits
    if (beat % 16 === 0 || beat % 16 === 8) {
      const freq = this.getFrequency(0, 2)
      this.createOscillator('sawtooth', freq, time, 0.5, 0.2)
      this.playKick(time, 0.8)
    }

    // Ethereal melody
    if (beat % 8 === 4) {
      const noteIndex = (beat / 4) % 7
      const freq = this.getFrequency(noteIndex, 6)
      this.createOscillator('sine', freq, time, 2 * (60 / this.tempo), 0.15)
    }
  }

  private playKick(time: number, duration: number = 0.3): void {
    if (!this.audioContext || !this.masterGain) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.frequency.setValueAtTime(150, time)
    oscillator.frequency.exponentialRampToValueAtTime(0.01, time + duration)

    gainNode.gain.setValueAtTime(0.7, time)
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(time)
    oscillator.stop(time + duration)
  }

  private playSnare(time: number, duration: number = 0.2): void {
    if (!this.audioContext || !this.masterGain) return

    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseFilter = this.audioContext.createBiquadFilter()
    noiseFilter.type = 'highpass'
    noiseFilter.frequency.value = 1000

    const noiseEnvelope = this.audioContext.createGain()
    noiseEnvelope.gain.setValueAtTime(0.5, time)
    noiseEnvelope.gain.exponentialRampToValueAtTime(0.001, time + duration)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseEnvelope)
    noiseEnvelope.connect(this.masterGain)

    noise.start(time)
  }

  private playHiHat(time: number, duration: number, open: boolean = false, velocity: number = 0.3): void {
    if (!this.audioContext || !this.masterGain) return

    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = noiseBuffer

    const filter = this.audioContext.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 7000

    const envelope = this.audioContext.createGain()
    const hatDuration = open ? duration * 3 : duration
    envelope.gain.setValueAtTime(velocity, time)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + hatDuration)

    noise.connect(filter)
    filter.connect(envelope)
    envelope.connect(this.masterGain)

    noise.start(time)
  }

  getGenre(): MusicGenre {
    return this.currentGenre
  }

  isPlayingStatus(): boolean {
    return this.isPlaying
  }
}

export const musicGenerator = new MusicGenerator()
