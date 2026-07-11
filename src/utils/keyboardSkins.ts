import type { KeyboardSkin } from '../types'

export interface KeyboardSkinColors {
  keyBg: string
  keyBgActive: string
  keyText: string
  keyBorder: string
  keyActiveText: string
  highlight: string
  highlightGlow: string
  zoneColors: Record<string, string>
  spacebarGradient: string
}

export const keyboardSkins: Record<KeyboardSkin, KeyboardSkinColors> = {
  classic: {
    keyBg: '#1e293b',
    keyBgActive: '#334155',
    keyText: '#94a3b8',
    keyBorder: 'rgba(148, 163, 184, 0.2)',
    keyActiveText: '#ffffff',
    highlight: '#7c3aed',
    highlightGlow: 'rgba(124, 58, 237, 0.5)',
    zoneColors: {
      'left-pinky': '#ef4444',
      'left-ring': '#f97316',
      'left-middle': '#eab308',
      'left-index': '#22c55e',
      'right-index': '#06b6d4',
      'right-middle': '#3b82f6',
      'right-ring': '#8b5cf6',
      'right-pinky': '#ec4899',
      thumb: '#64748b',
    },
    spacebarGradient: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
  },

  neon: {
    keyBg: '#0f0f1a',
    keyBgActive: '#1a1a2e',
    keyText: '#64ffda',
    keyBorder: 'rgba(100, 255, 218, 0.3)',
    keyActiveText: '#ffffff',
    highlight: '#00ffff',
    highlightGlow: 'rgba(0, 255, 255, 0.6)',
    zoneColors: {
      'left-pinky': '#ff006e',
      'left-ring': '#ff4d00',
      'left-middle': '#ffcc00',
      'left-index': '#00ff88',
      'right-index': '#00ddff',
      'right-middle': '#0066ff',
      'right-ring': '#aa00ff',
      'right-pinky': '#ff00aa',
      thumb: '#64ffda',
    },
    spacebarGradient: 'linear-gradient(90deg, #ff006e 0%, #00ff88 50%, #00ddff 100%)',
  },

  cyberpunk: {
    keyBg: '#1a0b2e',
    keyBgActive: '#2d1b4e',
    keyText: '#fbbf24',
    keyBorder: 'rgba(251, 191, 36, 0.3)',
    keyActiveText: '#ffffff',
    highlight: '#f472b6',
    highlightGlow: 'rgba(244, 114, 182, 0.6)',
    zoneColors: {
      'left-pinky': '#dc2626',
      'left-ring': '#ea580c',
      'left-middle': '#ca8a04',
      'left-index': '#16a34a',
      'right-index': '#0891b2',
      'right-middle': '#4f46e5',
      'right-ring': '#9333ea',
      'right-pinky': '#db2777',
      thumb: '#fbbf24',
    },
    spacebarGradient: 'linear-gradient(90deg, #dc2626 0%, #fbbf24 25%, #16a34a 50%, #0891b2 75%, #9333ea 100%)',
  },

  minimal: {
    keyBg: '#f1f5f9',
    keyBgActive: '#cbd5e1',
    keyText: '#475569',
    keyBorder: 'rgba(71, 85, 105, 0.2)',
    keyActiveText: '#0f172a',
    highlight: '#3b82f6',
    highlightGlow: 'rgba(59, 130, 246, 0.3)',
    zoneColors: {
      'left-pinky': '#fca5a5',
      'left-ring': '#fdba74',
      'left-middle': '#fde047',
      'left-index': '#86efac',
      'right-index': '#67e8f9',
      'right-middle': '#93c5fd',
      'right-ring': '#d8b4fe',
      'right-pinky': '#f9a8d4',
      thumb: '#94a3b8',
    },
    spacebarGradient: 'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
  },

  ocean: {
    keyBg: '#0c1929',
    keyBgActive: '#1e3a5f',
    keyText: '#7dd3fc',
    keyBorder: 'rgba(125, 211, 252, 0.25)',
    keyActiveText: '#ffffff',
    highlight: '#38bdf8',
    highlightGlow: 'rgba(56, 189, 248, 0.5)',
    zoneColors: {
      'left-pinky': '#f43f5e',
      'left-ring': '#fb923c',
      'left-middle': '#fbbf24',
      'left-index': '#34d399',
      'right-index': '#22d3ee',
      'right-middle': '#60a5fa',
      'right-ring': '#a78bfa',
      'right-pinky': '#f472b6',
      thumb: '#7dd3fc',
    },
    spacebarGradient: 'linear-gradient(90deg, #0c1929 0%, #1e3a5f 50%, #0c1929 100%)',
  },

  sunset: {
    keyBg: '#1c1410',
    keyBgActive: '#3d2817',
    keyText: '#fdba74',
    keyBorder: 'rgba(251, 191, 36, 0.25)',
    keyActiveText: '#ffffff',
    highlight: '#f97316',
    highlightGlow: 'rgba(249, 115, 22, 0.5)',
    zoneColors: {
      'left-pinky': '#dc2626',
      'left-ring': '#ea580c',
      'left-middle': '#f59e0b',
      'left-index': '#84cc16',
      'right-index': '#14b8a6',
      'right-middle': '#06b6d4',
      'right-ring': '#6366f1',
      'right-pinky': '#ec4899',
      thumb: '#fdba74',
    },
    spacebarGradient: 'linear-gradient(90deg, #dc2626 0%, #f97316 33%, #fbbf24 66%, #84cc16 100%)',
  },

  matrix: {
    keyBg: '#0a0a0a',
    keyBgActive: '#111111',
    keyText: '#00ff00',
    keyBorder: 'rgba(0, 255, 0, 0.3)',
    keyActiveText: '#000000',
    highlight: '#00ff00',
    highlightGlow: 'rgba(0, 255, 0, 0.6)',
    zoneColors: {
      'left-pinky': '#00cc00',
      'left-ring': '#00dd00',
      'left-middle': '#00ee00',
      'left-index': '#00ff00',
      'right-index': '#00ff00',
      'right-middle': '#00ee00',
      'right-ring': '#00dd00',
      'right-pinky': '#00cc00',
      thumb: '#00aa00',
    },
    spacebarGradient: 'linear-gradient(90deg, #003300 0%, #006600 50%, #003300 100%)',
  },

  monokai: {
    keyBg: '#272822',
    keyBgActive: '#3e3d32',
    keyText: '#a6a6a6',
    keyBorder: 'rgba(166, 166, 166, 0.2)',
    keyActiveText: '#f8f8f2',
    highlight: '#a6e22e',
    highlightGlow: 'rgba(166, 226, 46, 0.4)',
    zoneColors: {
      'left-pinky': '#f92672',
      'left-ring': '#fd971f',
      'left-middle': '#e6db74',
      'left-index': '#a6e22e',
      'right-index': '#66d9ef',
      'right-middle': '#ae81ff',
      'right-ring': '#f92672',
      'right-pinky': '#fd971f',
      thumb: '#a6a6a6',
    },
    spacebarGradient: 'linear-gradient(90deg, #272822 0%, #3e3d32 50%, #272822 100%)',
  },

  galaxy: {
    keyBg: '#0d0616',
    keyBgActive: '#1a0f2e',
    keyText: '#c084fc',
    keyBorder: 'rgba(192, 132, 252, 0.3)',
    keyActiveText: '#ffffff',
    highlight: '#e879f9',
    highlightGlow: 'rgba(232, 121, 249, 0.6)',
    zoneColors: {
      'left-pinky': '#f43f5e',
      'left-ring': '#f97316',
      'left-middle': '#fbbf24',
      'left-index': '#22c55e',
      'right-index': '#06b6d4',
      'right-middle': '#6366f1',
      'right-ring': '#a855f7',
      'right-pinky': '#ec4899',
      thumb: '#c084fc',
    },
    spacebarGradient: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 50%, #e879f9 100%)',
  },
}

/** Получить скин по названию */
export function getKeyboardSkin(skin: KeyboardSkin): KeyboardSkinColors {
  return keyboardSkins[skin] || keyboardSkins.classic
}

/** Список всех скинов с метаданными */
export const keyboardSkinPresets = [
  { value: 'classic' as KeyboardSkin, labelKey: 'skin.classic', icon: '⌨️', descriptionKey: 'skin.classicDesc' },
  { value: 'neon' as KeyboardSkin, labelKey: 'skin.neon', icon: '✨', descriptionKey: 'skin.neonDesc' },
  { value: 'cyberpunk' as KeyboardSkin, labelKey: 'skin.cyberpunk', icon: '🤖', descriptionKey: 'skin.cyberpunkDesc' },
  { value: 'minimal' as KeyboardSkin, labelKey: 'skin.minimal', icon: '⚪', descriptionKey: 'skin.minimalDesc' },
  { value: 'ocean' as KeyboardSkin, labelKey: 'skin.ocean', icon: '🌊', descriptionKey: 'skin.oceanDesc' },
  { value: 'sunset' as KeyboardSkin, labelKey: 'skin.sunset', icon: '🌅', descriptionKey: 'skin.sunsetDesc' },
  { value: 'matrix' as KeyboardSkin, labelKey: 'skin.matrix', icon: '🟩', descriptionKey: 'skin.matrixDesc' },
  { value: 'monokai' as KeyboardSkin, labelKey: 'skin.monokai', icon: '🎨', descriptionKey: 'skin.monokaiDesc' },
  { value: 'galaxy' as KeyboardSkin, labelKey: 'skin.galaxy', icon: '🌌', descriptionKey: 'skin.galaxyDesc' },
] as const
