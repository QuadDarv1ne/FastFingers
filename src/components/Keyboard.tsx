/**
 * Keyboard — Компонент виртуальной клавиатуры
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { memo, useMemo, useCallback } from 'react'
import { KeyboardLayout, KeyHeatmapData, KeyboardSkin } from '../types'
import { layouts, fingerZones } from '../utils/layouts'
import { getHeatmapColor } from '../utils/stats'
import { getKeyboardSkin } from '../utils/keyboardSkins'
import { useAppTranslation } from '../i18n/config'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

interface KeyboardProps {
  layout: KeyboardLayout
  highlightKey?: string | null
  heatmap?: KeyHeatmapData
  showHeatmap?: boolean
  onToggleHeatmap?: (show: boolean) => void
  skin?: KeyboardSkin
  onKeyTouch?: (key: string) => void
}

export const Keyboard = memo<KeyboardProps>(function Keyboard({
  layout,
  highlightKey = null,
  heatmap = {},
  showHeatmap = false,
  onToggleHeatmap,
  skin = 'classic',
  onKeyTouch,
}: KeyboardProps) {
  const { t } = useAppTranslation()
  const layoutData = layouts[layout]
  const skinColors = getKeyboardSkin(skin)

  const { vibrate } = useHapticFeedback()

  const handleKeyTouch = useCallback((key: string) => {
    vibrate([10]) // light haptic feedback
    onKeyTouch?.(key)
  }, [vibrate, onKeyTouch])

  // Мемоизация вычисления подсветки и тепловой карты
  const keyStyles = useMemo(() => {
    if (!layoutData) return {}

    const styles: Record<string, { className: string; style: React.CSSProperties; title: string }> = {}

    layoutData.rows.forEach(row => {
      row.forEach(key => {
        const finger = layoutData.keyToFinger[key]
        const zoneColor = finger ? skinColors.zoneColors[finger] : skinColors.keyBorder
        const isHighlighted = highlightKey === key.toLowerCase()

        const keyData = heatmap[key.toLowerCase()]
        const heatmapColor = showHeatmap && keyData && keyData.total >= 3
          ? getHeatmapColor(keyData.accuracy)
          : null

        styles[key] = {
          className: `
            relative flex items-center justify-center
            w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11
            rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold
            transition-all duration-200 touch-manipulation
            ${isHighlighted
              ? 'text-white scale-110 shadow-xl animate-pulse'
              : heatmapColor
                ? 'text-white shadow-lg'
                : 'hover:bg-dark-800 border active:bg-dark-700 active:scale-95'}
          `,
          style: {
            backgroundColor: heatmapColor || (isHighlighted ? skinColors.highlight : skinColors.keyBg),
            borderColor: isHighlighted ? zoneColor : skinColors.keyBorder,
            borderWidth: isHighlighted ? '2px' : '1px',
            color: isHighlighted ? skinColors.keyActiveText : (heatmapColor ? '#ffffff' : skinColors.keyText),
            boxShadow: isHighlighted ? `0 0 20px ${skinColors.highlightGlow}` : undefined,
          },
          title: finger
            ? `${fingerZones[finger]}${keyData ? `\n${t('common.accuracy')}: ${keyData.accuracy}%\n${t('common.errors')}: ${keyData.errors}/${keyData.total}` : ''}`
            : ''
        }
      })
    })

    return styles
  }, [layoutData, highlightKey, heatmap, showHeatmap, skinColors, t])

  if (!layoutData) return null

  return (
    <div className="card" role="region" aria-label={t('misc.keyboard')}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-200">{t('misc.keyboard')}</h3>
            <p className="text-xs text-dark-500">{layoutData.name}</p>
          </div>
        </div>
        {Object.keys(heatmap).length > 0 && (
          <label className="flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-800 transition-colors">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => onToggleHeatmap?.(e.target.checked)}
              className="rounded bg-dark-800 border-dark-700 text-primary-600 focus:ring-primary-500"
              aria-label="Переключить тепловую карту"
            />
            <span className={`text-sm font-medium ${showHeatmap ? 'text-white' : 'text-dark-400'}`}>
              🔥 {t('misc.theme')}
            </span>
          </label>
        )}
      </div>
      
      <div className="space-y-1.5 sm:space-y-2 select-none" role="group" aria-label="Раскладка клавиатуры">
        {/* Ряды клавиш */}
        {layoutData.rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-1 sm:gap-1.5"
            style={{ paddingLeft: `${rowIndex * 8}px` }}
            role="row"
            aria-label={`Ряд ${rowIndex + 1}`}
          >
            {row.map((key) => {
              const keyStyle = keyStyles[key]
              if (!keyStyle) return null
              const { className, style, title } = keyStyle

              const heatmapData = heatmap[key.toLowerCase()]
              return (
                <div
                  key={key}
                  className={className}
                  style={style}
                  title={title}
                  role="button"
                  tabIndex={0}
                  aria-label={`Клавиша ${key.toUpperCase()}`}
                  aria-pressed={highlightKey === key.toLowerCase()}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    handleKeyTouch(key.toLowerCase())
                  }}
                  onMouseDown={() => handleKeyTouch(key.toLowerCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleKeyTouch(key.toLowerCase())
                    }
                  }}
                >
                  {key.toUpperCase()}
                  {showHeatmap && heatmapData?.total && heatmapData.total >= 3 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-dark-900 rounded-full text-[10px] flex items-center justify-center font-bold border border-dark-700">
                      {heatmapData.accuracy ?? 0}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Пробел */}
        <div className="flex justify-center mt-3">
          <button
            type="button"
            className="w-48 sm:w-64 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-xs text-dark-500 touch-manipulation select-none active:bg-dark-700 transition-colors"
            aria-label="Клавиша пробел"
            onTouchStart={(e) => {
              e.preventDefault()
              vibrate([10])
            }}
            onMouseDown={() => vibrate([10])}
            onClick={() => vibrate([10])}
          >
            {t('common.chars').charAt(0)}
          </button>
        </div>
      </div>
      
      {/* Легенда пальцев */}
      <div className="mt-4 pt-4 border-t border-dark-700" role="region" aria-label="Легенда пальцев">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(fingerZones).slice(0, 4).map(([finger, label]) => (
            <div key={finger} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: skinColors.zoneColors[finger] }}
                aria-hidden="true"
              />
              <span className="text-dark-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
