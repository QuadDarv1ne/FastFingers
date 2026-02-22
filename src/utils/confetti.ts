import confetti from 'canvas-confetti'

interface ConfettiOptions {
  type?: 'default' | 'achievement' | 'levelup' | 'celebration'
  duration?: number
}

type ConfettiParams = Parameters<typeof confetti>[0]

export function triggerConfetti(options: ConfettiOptions = {}) {
  const { type = 'default', duration = 3000 } = options

  const end = Date.now() + duration

  // Цвета для разных типов
  const colorsMap = {
    default: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff'],
    achievement: ['#ffd700', '#ffec8b', '#ffffff', '#ffa500'],
    levelup: ['#8b5cf6', '#a855f7', '#d8b4fe', '#ffffff'],
    celebration: ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff'],
  }
  const colors = colorsMap[type]

  const baseParams: ConfettiParams = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
  }

  // Основной взрыв
  confetti(baseParams)

  // Боковые залпы
  const sideConfetti = () => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: colors,
    })
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: colors,
    })
  }

  // Запускаем боковые залпы несколько раз
  setTimeout(() => sideConfetti(), 300)
  setTimeout(() => sideConfetti(), 600)
  setTimeout(() => sideConfetti(), 900)

  // Продолжаем основной эффект
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

// Эффект дождя из конфетти
export function triggerConfettiRain(duration = 5000) {
  const end = Date.now() + duration
  const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff', '#ffd700']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 90,
      spread: 30,
      origin: { x: Math.random(), y: -0.1 },
      colors: colors,
      gravity: 0.5,
      scalar: Math.random() * 0.5 + 0.5,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

// Взрыв в конкретной точке
export function triggerConfettiAt(x: number, y: number) {
  confetti({
    particleCount: 50,
    startVelocity: 30,
    spread: 100,
    origin: { x, y },
    colors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff'],
  })
}
