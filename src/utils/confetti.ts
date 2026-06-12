import type confetti from 'canvas-confetti'

interface ConfettiOptions {
  type?: 'default' | 'achievement' | 'levelup' | 'celebration'
  duration?: number
}

let _confetti: typeof confetti | null = null

async function getConfetti(): Promise<typeof confetti> {
  if (!_confetti) {
    const mod = await import('canvas-confetti')
    _confetti = mod.default
  }
  return _confetti
}

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

let activeAnimationIds = new Set<number>()
let activeTimeouts: ReturnType<typeof setTimeout>[] = []
let generation = 0

function clearAllConfetti() {
  generation++
  for (const id of activeAnimationIds) {
    cancelAnimationFrame(id)
  }
  activeAnimationIds.clear()

  for (const timeout of activeTimeouts) {
    clearTimeout(timeout)
  }
  activeTimeouts = []
}

function trackAnimation(id: number) {
  activeAnimationIds.add(id)
  return id
}

function untrackAnimation(id: number) {
  activeAnimationIds.delete(id)
}

export async function triggerConfetti(options: ConfettiOptions = {}) {
  clearAllConfetti()
  const currentGen = generation
  const { type = 'default', duration = 3000 } = options
  const end = Date.now() + duration
  const colors = COLORS[type]
  const confetti = await getConfetti()

  confetti({ ...CONFETTI_CONFIG.base, colors })

  const sideConfetti = () => {
    confetti({ ...CONFETTI_CONFIG.side, origin: { x: 0, y: 0.6 }, colors })
    confetti({ ...CONFETTI_CONFIG.side, origin: { x: 1, y: 0.6 }, colors })
  }

  const sideTimeouts: ReturnType<typeof setTimeout>[] = []
  for (let i = 0; i < SIDE_SHOT_DELAYS.length; i++) {
    const timeout = setTimeout(sideConfetti, SIDE_SHOT_DELAYS[i])
    sideTimeouts.push(timeout)
    activeTimeouts.push(timeout)
  }

  let continuousId: number
  const frame = () => {
    confetti({ ...CONFETTI_CONFIG.continuous, angle: 60, origin: { x: 0 }, colors })
    confetti({ ...CONFETTI_CONFIG.continuous, angle: 120, origin: { x: 1 }, colors })

    if (Date.now() < end) {
      continuousId = requestAnimationFrame(frame)
    } else {
      untrackAnimation(continuousId)
    }
  }
  continuousId = trackAnimation(requestAnimationFrame(frame))

  return () => {
    if (generation !== currentGen) return
    for (const timeout of sideTimeouts) {
      clearTimeout(timeout)
      const idx = activeTimeouts.indexOf(timeout)
      if (idx !== -1) activeTimeouts.splice(idx, 1)
    }
    cancelAnimationFrame(continuousId)
    untrackAnimation(continuousId)
  }
}


