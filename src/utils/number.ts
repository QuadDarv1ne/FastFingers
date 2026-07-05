export function safeParseInt(value: string | null | undefined): number {
  if (value == null) return 0
  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function isInRange(num: number, min: number, max: number): boolean {
  const safeNum = Number(num) || 0
  const safeMin = Number(min) || 0
  const safeMax = Number(max) || 0
  return safeNum >= safeMin && safeNum <= safeMax
}

/**
 * Форматировать длительность в ММ:СС
 */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
