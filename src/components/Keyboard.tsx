/**
 * Keyboard — Компонент виртуальной клавиатуры
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { memo, useMemo } from 'react'
import type { KeyboardLayout, KeyHeatmapData, KeyboardSkin } from '../types'
import { layouts, fingerZones } from '../utils/layouts'
import { getHeatmapColor } from '../utils/stats'
import { getKeyboardSkin } from '../utils/keyboardSkins'
import { useAppTranslation } from '../i18n/config'

const EMPTY_HEATMAP: KeyHeatmapData = {}

interface KeyboardProps {
  layout: KeyboardLayout
  highlightKey?: string | null
  heatmap?: KeyHeatmapData
  showHeatmap?: boolean
  onToggleHeatmap?: (show: boolean) => void
  skin?: KeyboardSkin
}

export const Keyboard = memo<KeyboardProps>(function Keyboard({
  layout,
  highlightKey = null,
  heatmap = {},
  showHeatmap = false,
  onToggleHeatmap,
  skin = 'classic',
}: KeyboardProps) {
  const { t } = useAppTranslation()
  const layoutData = layouts[layout]
  const skinColors = getKeyboardSkin(skin)

  // Мемоизация вычисления подсветки и тепловой карты
  // heatmap стабилизирован — пересчитываем только когда реально изменились ключи
  // Когда heatmap скрыт, используем пустой объект чтобы не вызывать пересчёт
  const effectiveHeatmap = showHeatmap ? heatmap : EMPTY_HEATMAP
  const keyStyles = useMemo(() => {
    if (!layoutData) return {}

    const styles: Record<string, { className: string; style: React.CSSProperties; title: string }> = {}

    layoutData.rows.forEach(row => {
      row.forEach(key => {
        const finger = layoutData.keyToFinger[key]
        const zoneColor = finger ? skinColors.zoneColors[finger] : skinColors.keyBorder
        const isHighlighted = highlightKey === key.toLowerCase()

        const keyData = effectiveHeatmap[key.toLowerCase()]
        const heatmapColor = showHeatmap && keyData && keyData.total >= 3
          ? getHeatmapColor(keyData.accuracy)
          : null

        styles[key] = {
          className: `
            relative flex items-center justify-center
            w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
            rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold
            touch-manipulation transition-transform duration-150 ease-out
            ${isHighlighted
              ? 'text-white scale-105 shadow-xl'
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
          title: finger && fingerZones[finger]
            ? `${t(fingerZones[finger])}${keyData ? `\n${t('common.accuracy')}: ${keyData.accuracy}%\n${t('common.errors')}: ${keyData.errors}/${keyData.total}` : ''}`
            : ''
        }
      })
    })

    return styles
  }, [layoutData, highlightKey, effectiveHeatmap, showHeatmap, skinColors, t])

  if (!layoutData) return null

  return (
    <div id="keyboard" className="card" role="region" aria-label={t('misc.keyboard')}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary-500/15 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-200">{t('misc.keyboard')}</h3>
            <p className="text-[10px] text-dark-500 font-medium">{layoutData.name}</p>
          </div>
        </div>
        {Object.keys(heatmap).length > 0 && (
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-800/40 rounded-lg cursor-pointer hover:bg-dark-800 transition-colors">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => onToggleHeatmap?.(e.target.checked)}
              className="rounded bg-dark-800 border-dark-700 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
              aria-label={t('tooltip.heatmap', 'Toggle heatmap')}
            />
            <span className={`text-xs font-medium ${showHeatmap ? 'text-white' : 'text-dark-400'}`}>
              🔥 {t('misc.heatmap', 'Heatmap')}
            </span>
          </label>
        )}
      </div>
      
      <div className="space-y-1 sm:space-y-1.5 select-none" role="group" aria-label={t('keyboard.layout', 'Keyboard layout')}>
        {/* Ряды клавиш */}
        {layoutData.rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-0.5 sm:gap-1"
            style={{ paddingLeft: `${rowIndex * 6}px` }}
            role="row"
            aria-label={`${t('keyboard.row', 'Row')} ${rowIndex + 1}`}
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
                  tabIndex={-1}
                  aria-label={`${t('keyboard.key', 'Key')} ${key.toUpperCase()}`}
                  aria-pressed={highlightKey === key.toLowerCase()}
                >
                  <span className="relative z-10">{key.toUpperCase()}</span>
                  {showHeatmap && heatmapData?.total && heatmapData.total >= 3 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-dark-900 rounded-full text-[8px] flex items-center justify-center font-bold border border-dark-700 z-20">
                      {heatmapData.accuracy ?? 0}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Пробел */}
        <div className="flex justify-center mt-2.5">
          <button
            type="button"
            className="w-44 sm:w-56 h-8 bg-dark-800/50 rounded-lg flex items-center justify-center text-xs text-dark-500 select-none hover:bg-dark-700/50 transition-colors"
            aria-label={t('keyboard.space', 'Space')}
          >
            {t('common.chars').charAt(0)}
          </button>
        </div>
      </div>
      
      {/* Легенда пальцев */}
      <div className="mt-3.5 pt-3.5 border-t border-dark-700/50" role="region" aria-label={t('keyboard.fingerLegend', 'Finger legend')}>
        <div className="grid grid-cols-4 gap-2 text-[10px]">
          {Object.entries(fingerZones).slice(0, 4).map(([finger, label]) => (
            <div key={finger} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded"
                style={{ backgroundColor: skinColors.zoneColors[finger] }}
                aria-hidden="true"
              />
              <span className="text-dark-500 font-medium">{t(label)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
