/**
 * getThemeColors — Get CSS variable colors for SVG/chart components
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

/** Read a CSS custom property from :root */
export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

let _chartColorsCache: ReturnType<typeof getChartColorsLive> | null = null

function getChartColorsLive() {
  return {
    text: getCssVar('--color-text') || '#f8fafc',
    textMuted: getCssVar('--color-text-muted') || '#94a3b8',
    surface: getCssVar('--color-surface') || '#1e293b',
    border: getCssVar('--color-border') || 'rgba(255,255,255,0.1)',
  }
}

/** Theme-aware colors for SVG charts and visualizations. Cached — call invalidateChartColors() on theme toggle. */
export function getChartColors() {
  if (!_chartColorsCache) _chartColorsCache = getChartColorsLive()
  return _chartColorsCache
}

/** Invalidate the chart colors cache so the next getChartColors() call reads fresh CSS variables. */
export function invalidateChartColors() {
  _chartColorsCache = null
}
