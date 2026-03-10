/**
 * Утилиты для проверки контрастности цветов по WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */

/**
 * Парсит hex цвет в RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result || !result[1] || !result[2] || !result[3]) return null
  
  const r = Number.parseInt(result[1], 16)
  const g = Number.parseInt(result[2], 16)
  const b = Number.parseInt(result[3], 16)
  
  return { r, g, b }
}

/**
 * Вычисляет относительную яркость цвета
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const values = [r, g, b].map(c => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  const [rs, gs, bs] = values as [number, number, number]
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Вычисляет коэффициент контрастности между двумя цветами
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    return 0
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Уровни соответствия WCAG
 */
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5,    // Обычный текст AA
  AA_LARGE: 3,       // Крупный текст AA (18pt+ или 14pt+ bold)
  AAA_NORMAL: 7,     // Обычный текст AAA
  AAA_LARGE: 4.5,    // Крупный текст AAA
} as const

/**
 * Проверяет соответствие цветов WCAG 2.1
 */
export function checkWcagCompliance(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): {
  ratio: number
  aa: boolean
  aaa: boolean
  level: 'AA' | 'AAA' | 'fail'
} {
  const ratio = getContrastRatio(foreground, background)
  const threshold = isLargeText ? WCAG_LEVELS.AA_LARGE : WCAG_LEVELS.AA_NORMAL
  const aaaThreshold = isLargeText ? WCAG_LEVELS.AAA_LARGE : WCAG_LEVELS.AAA_NORMAL

  return {
    ratio,
    aa: ratio >= threshold,
    aaa: ratio >= aaaThreshold,
    level: ratio >= aaaThreshold ? 'AAA' : ratio >= threshold ? 'AA' : 'fail',
  }
}

/**
 * Проверяет все основные комбинации цветов в приложении
 */
export function checkAppContrast(): Record<string, {
  ratio: number
  aa: boolean
  aaa: boolean
  level: 'AA' | 'AAA' | 'fail'
}> {
  // Тёмная тема (по умолчанию)
  const darkTheme = {
    bg: '#0f0f0f',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.1)',
    primary: '#7c3aed',
    success: '#22c55e',
    error: '#ef4444',
  }

  // Высококонтрастная тема
  const highContrastTheme = {
    bg: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#cccccc',
    primary: '#7c3aed',
    success: '#22c55e',
    error: '#ef4444',
  }

  // Светлая тема
  const lightTheme = {
    bg: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#7c3aed',
    success: '#22c55e',
    error: '#ef4444',
  }

  const results: Record<string, ReturnType<typeof checkWcagCompliance>> = {}

  // Проверка тёмной темы
  results['dark: text/bg'] = checkWcagCompliance(darkTheme.text, darkTheme.bg)
  results['dark: textMuted/bg'] = checkWcagCompliance(darkTheme.textMuted, darkTheme.bg)
  results['dark: text/surface'] = checkWcagCompliance(darkTheme.text, darkTheme.surface)
  results['dark: primary/bg'] = checkWcagCompliance(darkTheme.primary, darkTheme.bg)
  results['dark: success/bg'] = checkWcagCompliance(darkTheme.success, darkTheme.bg)
  results['dark: error/bg'] = checkWcagCompliance(darkTheme.error, darkTheme.bg)

  // Проверка высококонтрастной темы
  results['high-contrast: text/bg'] = checkWcagCompliance(highContrastTheme.text, highContrastTheme.bg)
  results['high-contrast: textMuted/bg'] = checkWcagCompliance(highContrastTheme.textMuted, highContrastTheme.bg)
  results['high-contrast: primary/bg'] = checkWcagCompliance(highContrastTheme.primary, highContrastTheme.bg)

  // Проверка светлой темы
  results['light: text/bg'] = checkWcagCompliance(lightTheme.text, lightTheme.bg)
  results['light: textMuted/bg'] = checkWcagCompliance(lightTheme.textMuted, lightTheme.bg)
  results['light: text/surface'] = checkWcagCompliance(lightTheme.text, lightTheme.surface)
  results['light: primary/bg'] = checkWcagCompliance(lightTheme.primary, lightTheme.bg)
  results['light: success/bg'] = checkWcagCompliance(lightTheme.success, lightTheme.bg)
  results['light: error/bg'] = checkWcagCompliance(lightTheme.error, lightTheme.bg)

  return results
}

/**
 * Генерирует отчёт о контрастности
 */
export function generateContrastReport(): string {
  const results = checkAppContrast()
  const lines: string[] = []

  lines.push('=== WCAG Contrast Report ===\n')

  for (const [name, result] of Object.entries(results)) {
    const status = result.level === 'AAA' ? '✅ AAA' : result.level === 'AA' ? '✅ AA' : '❌ FAIL'
    lines.push(`${name}: ${result.ratio.toFixed(2)} — ${status}`)
  }

  const failCount = Object.values(results).filter(r => r.level === 'fail').length
  lines.push(`\nTotal: ${Object.keys(results).length} checks, ${failCount} failures`)

  return lines.join('\n')
}

// Экспорт для использования в консоли
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).checkContrast = () => {
    console.warn(generateContrastReport())
  }
}
