import { memo } from 'react'
import { KeyboardLayout, KeyHeatmapData } from '../types'
import { layouts, fingerColors, fingerZones } from '../utils/layouts'
import { getHeatmapColor } from '../utils/stats'

interface KeyboardProps {
  layout: KeyboardLayout
  highlightKey?: string | null
  heatmap?: KeyHeatmapData
  showHeatmap?: boolean
  onToggleHeatmap?: (show: boolean) => void
}

export const Keyboard = memo<KeyboardProps>(function Keyboard({
  layout,
  highlightKey = null,
  heatmap = {},
  showHeatmap = false,
  onToggleHeatmap
}: KeyboardProps) {
  const layoutData = layouts[layout]

  if (!layoutData) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-200">Виртуальная клавиатура</h3>
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
            />
            <span className={`text-sm font-medium ${showHeatmap ? 'text-white' : 'text-dark-400'}`}>
              🔥 Тепловая карта
            </span>
          </label>
        )}
      </div>
      
      <div className="space-y-2 select-none">
        {/* Ряды клавиш */}
        {layoutData.rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex justify-center gap-1.5"
            style={{ paddingLeft: `${rowIndex * 12}px` }}
          >
            {row.map((key) => {
              const finger = layoutData.keyToFinger[key]
              const color = finger ? fingerColors[finger] : '#475569'
              const isHighlighted = highlightKey === key.toLowerCase()
              
              // Цвет тепловой карты для проблемных клавиш
              const keyData = heatmap[key.toLowerCase()]
              const heatmapColor = showHeatmap && keyData && keyData.total >= 3 
                ? getHeatmapColor(keyData.accuracy)
                : null
              
              return (
                <div
                  key={key}
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 md:w-11 md:h-11
                    rounded-xl text-sm font-semibold
                    transition-all duration-200
                    ${isHighlighted 
                      ? 'bg-primary-600 text-white scale-110 shadow-xl shadow-primary-500/50 animate-pulse' 
                      : heatmapColor 
                        ? 'text-white shadow-lg'
                        : 'bg-dark-800/70 text-dark-300 hover:bg-dark-800 border border-dark-700/50'}
                  `}
                  style={{
                    backgroundColor: heatmapColor || (isHighlighted ? undefined : undefined),
                    borderColor: isHighlighted ? color : undefined,
                    borderWidth: isHighlighted ? '2px' : undefined,
                  }}
                  title={finger 
                    ? `${fingerZones[finger]}${keyData ? `\nТочность: ${keyData.accuracy}%\nОшибок: ${keyData.errors}/${keyData.total}` : ''}` 
                    : ''}
                >
                  {key.toUpperCase()}
                  {showHeatmap && keyData && keyData.total >= 3 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-dark-900 rounded-full text-[10px] flex items-center justify-center font-bold border border-dark-700">
                      {keyData.accuracy}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        
        {/* Пробел */}
        <div className="flex justify-center mt-3">
          <div
            className="w-64 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-xs text-dark-500"
          >
            ПРОБЕЛ
          </div>
        </div>
      </div>
      
      {/* Легенда пальцев */}
      <div className="mt-4 pt-4 border-t border-dark-700">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(fingerZones).slice(0, 4).map(([finger, label]) => (
            <div key={finger} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: fingerColors[finger] }}
              />
              <span className="text-dark-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Кастомное сравнение для оптимизации
  return (
    prevProps.layout === nextProps.layout &&
    prevProps.highlightKey === nextProps.highlightKey &&
    prevProps.showHeatmap === nextProps.showHeatmap &&
    JSON.stringify(prevProps.heatmap) === JSON.stringify(nextProps.heatmap)
  )
})
