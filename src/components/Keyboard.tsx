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

export function Keyboard({ 
  layout, 
  highlightKey = null, 
  heatmap = {}, 
  showHeatmap = false,
  onToggleHeatmap 
}: KeyboardProps) {
  const layoutData = layouts[layout]
  
  if (!layoutData) return null

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-dark-400">Виртуальная клавиатура</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-dark-500">{layoutData.name}</span>
          {Object.keys(heatmap).length > 0 && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => onToggleHeatmap?.(e.target.checked)}
                className="rounded bg-dark-800 border-dark-700 text-primary-600 focus:ring-primary-500"
              />
              <span className={showHeatmap ? 'text-white' : 'text-dark-500'}>Ошибки</span>
            </label>
          )}
        </div>
      </div>
      
      <div className="space-y-1.5 select-none">
        {/* Ряды клавиш */}
        {layoutData.rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex justify-center gap-1"
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
                    w-9 h-9 md:w-10 md:h-10
                    rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${isHighlighted 
                      ? 'bg-primary-600 text-white scale-110 shadow-lg shadow-primary-500/50' 
                      : heatmapColor 
                        ? 'text-white'
                        : 'bg-dark-800 text-dark-300'}
                  `}
                  style={{
                    backgroundColor: heatmapColor || (isHighlighted ? undefined : undefined),
                    borderColor: isHighlighted ? color : 'transparent',
                    borderWidth: isHighlighted ? '2px' : '0',
                  }}
                  title={finger 
                    ? `${fingerZones[finger]}${keyData ? `\nТочность: ${keyData.accuracy}%` : ''}` 
                    : ''}
                >
                  {key.toUpperCase()}
                  {showHeatmap && keyData && keyData.total >= 3 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-dark-900 rounded-full text-[8px] flex items-center justify-center">
                      {keyData.accuracy}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        
        {/* Пробел */}
        <div className="flex justify-center mt-2">
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
}
