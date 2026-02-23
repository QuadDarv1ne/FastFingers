import confetti from 'canvas-confetti'

interface ConfettiOptions {
  type?: 'default' | 'achievement' | 'levelup' | 'celebration'
  duration?: number
}

type ConfettiParams = Parameters<typeof confetti>[0]

const COLORS = {
  default: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff'],
  achievement: ['#ffd700', '#ffec8b', '#ffffff', '#ffa500'],
  levelup: ['#8b5cf6', '#a855f7', '#d8b4fe', '#ffffff'],
  celebration: ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff'],
}

const CONFETTI_CONFIG = {
  base: {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  },
  side: {
    particleCount: 30,
    angle: 60,
    spread: 55,
    origin: { y: 0.6 },
  },
  continuous: {
    particleCount: 5,
    spread: 55,
  },
  rain: {
    particleCount: 3,
    angle: 90,
    spread: 30,
    origin: { y: -0.1 },
    gravity: 0.5,
    scalarMin: 0.5,
    scalarMax: 1,
  },
  burst: {
    particleCount: 50,
    startVelocity: 30,
    spread: 100,
  },
} as const

const SIDE_SHOT_DELAYS = [300, 600, 900] as const

export function triggerConfetti(options: ConfettiOptions = {}) {
  const { type = 'default', duration = 3000 } = options
  const end = Date.now() + duration
  const colors = COLORS[type]

  const baseParams: ConfettiParams = {
    ...CONFETTI_CONFIG.base,
    colors,
  }

  confetti(baseParams)

  const sideConfetti = () => {
    confetti({
      ...CONFETTI_CONFIG.side,
      origin: { x: 0, y: CONFETTI_CONFIG.side.origin.y },
      colors,
    })
    confetti({
      ...CONFETTI_CONFIG.side,
      origin: { x: 1, y: CONFETTI_CONFIG.side.origin.y },
      colors,
    })
  }

  SIDE_SHOT_DELAYS.forEach(delay => setTimeout(() => sideConfetti(), delay))

  const frame = () => {
    confetti({
      ...CONFETTI_CONFIG.continuous,
      angle: 60,
      origin: { x: 0 },
      colors,
    })
    confetti({
      ...CONFETTI_CONFIG.continuous,
      angle: 120,
      origin: { x: 1 },
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

export function triggerConfettiRain(duration = 5000) {
  const end = Date.now() + duration
  const colors = COLORS.default

  const frame = () => {
    confetti({
      ...CONFETTI_CONFIG.rain,
      origin: { x: Math.random(), y: CONFETTI_CONFIG.rain.origin.y },
      scalar: Math.random() * (CONFETTI_CONFIG.rain.scalarMax - CONFETTI_CONFIG.rain.scalarMin) + CONFETTI_CONFIG.rain.scalarMin,
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

export function triggerConfettiAt(x: number, y: number) {
  confetti({
    ...CONFETTI_CONFIG.burst,
    origin: { x, y },
    colors: COLORS.default,
  })
}
