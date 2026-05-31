/**
 * getThemeColors — Get CSS variable colors for SVG/chart components
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

/** Read a CSS custom property from :root */
export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Theme-aware colors for SVG charts and visualizations */
export function getChartColors() {
  return {
    text: getCssVar('--color-text') || '#f8fafc',
    textMuted: getCssVar('--color-text-muted') || '#94a3b8',
    surface: getCssVar('--color-surface') || '#1e293b',
    border: getCssVar('--color-border') || 'rgba(255,255,255,0.1)',
  }
}
