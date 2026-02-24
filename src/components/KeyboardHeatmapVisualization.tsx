import { useMemo } from 'react'
import { KeyHeatmapData } from '@types/index'
import { getKeyInfo } from '@utils/keyboardLayouts'

interface KeyboardHeatmapVisualizationProps {
  heatmap: KeyHeatmapData
  layout: 'qwerty' | 'jcuken' | 'dvorak'
  mode: 'accuracy' | 'frequency'
}

export function KeyboardHeatmapVisualization({
  heatmap,
  layout,
  mode,
}: KeyboardHeatmapVisualizationProps) {
  const stats = useMemo(() => {
    const keys = Object.entries(heatmap).filter(([_, data]) => data.total > 0)

    if (keys.length === 0) {
      return {
        mostPressed: [],
        leastAccurate: [],
        totalPresses: 0,
        totalErrors: 0,
      }
    }

    const sorted = keys.sort((a, b) => b[1].total - a[1].total)
    const byAccuracy = keys.sort((a, b) => a[1].accuracy - b[1].accuracy)

    return {
      mostPressed: sorted.slice(0, 5),
      leastAccurate: byAccuracy.slice(0, 5),
      totalPresses: keys.reduce((sum, [_, data]) => sum + data.total, 0),
      totalErrors: keys.reduce((sum, [_, data]) => sum + data.errors, 0),
    }
  }, [heatmap])

  const getKeyOpacity = (key: string): number => {
    const data = heatmap[key]
    if (!data || data.total === 0) return 0.1

    if (mode === 'frequency') {
      const maxPresses = Math.max(
        ...Object.values(heatmap).map(d => d.total),
        1
      )
      return 0.2 + (data.total / maxPresses) * 0.8
    } else {
      // accuracy mode - более красный = хуже точность
      return 0.2 + ((100 - data.accuracy) / 100) * 0.8
    }
  }

  const getKeyBackgroundColor = (key: string): string => {
    const data = heatmap[key]
    if (!data || data.total === 0) {
      return 'rgba(55, 65, 81, 0.3)' // dark-700
    }

    if (mode === 'frequency') {
      return `rgba(124, 58, 237, ${getKeyOpacity(key)})` // primary
    } else {
      // accuracy mode
      if (data.accuracy >= 95) {
        return `rgba(16, 185, 129, ${getKeyOpacity(key)})` // green
      } else if (data.accuracy >= 85) {
        return `rgba(251, 191, 36, ${getKeyOpacity(key)})` // yellow
      } else {
        return `rgba(239, 68, 68, ${getKeyOpacity(key)})` // red
      }
    }
  }

  const rows =
    layout === 'jcuken'
      ? [
          ['ё', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
          ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
          ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
          ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.'],
        ]
      : [
          ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
          ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
          ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
          ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        ]

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🔥</span>
          Тепловая карта клавиатуры
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-dark-400">Режим:</span>
          <span className="px-2 py-1 bg-dark-800 rounded-lg font-medium">
            {mode === 'frequency' ? 'Частота' : 'Точность'}
          </span>
        </div>
      </div>

      {/* Клавиатура */}
      <div className="space-y-2 mb-6">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-1 justify-center"
            style={{
              paddingLeft: `${rowIndex * 12}px`,
            }}
          >
            {row.map(key => {
              const data = heatmap[key]
              const keyInfo = getKeyInfo(key, layout)

              return (
                <div
                  key={key}
                  className="relative group"
                  style={{
                    width: '40px',
                    height: '40px',
                  }}
                >
                  <div
                    className="w-full h-full rounded-lg flex items-center justify-center font-mono text-sm font-semibold transition-all cursor-pointer hover:scale-110"
                    style={{
                      backgroundColor: getKeyBackgroundColor(key),
                      border: data?.total
                        ? '2px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid rgba(55, 65, 81, 0.5)',
                    }}
                  >
                    {key}
                  </div>

                  {/* Tooltip */}
                  {data && data.total > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 shadow-xl whitespace-nowrap">
                        <p className="text-sm font-semibold mb-2">
                          Клавиша: {key}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-dark-400">Нажатий:</span>
                            <span className="font-semibold">{data.total}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-dark-400">Ошибок:</span>
                            <span className="font-semibold text-red-400">
                              {data.errors}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-dark-400">Точность:</span>
                            <span
                              className={`font-semibold ${
                                data.accuracy >= 95
                                  ? 'text-green-400'
                                  : data.accuracy >= 85
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
                              }`}
                            >
                              {data.accuracy}%
                            </span>
                          </div>
                          {keyInfo && (
                            <div className="flex justify-between gap-4 pt-2 border-t border-dark-700">
                              <span className="text-dark-400">Палец:</span>
                              <span className="font-semibold">
                                {getFingerName(keyInfo.finger)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Пробел */}
        <div className="flex justify-center mt-2">
          <div className="relative group">
            <div
              className="rounded-lg flex items-center justify-center font-mono text-sm font-semibold transition-all cursor-pointer hover:scale-105"
              style={{
                width: '300px',
                height: '40px',
                backgroundColor: getKeyBackgroundColor(' '),
                border: heatmap[' ']?.total
                  ? '2px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(55, 65, 81, 0.5)',
              }}
            >
              SPACE
            </div>

            {heatmap[' '] && heatmap[' '].total > 0 && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 shadow-xl whitespace-nowrap">
                  <p className="text-sm font-semibold mb-2">Пробел</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-dark-400">Нажатий:</span>
                      <span className="font-semibold">
                        {heatmap[' '].total}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-dark-400">Ошибок:</span>
                      <span className="font-semibold text-red-400">
                        {heatmap[' '].errors}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-dark-400">Точность:</span>
                      <span
                        className={`font-semibold ${
                          heatmap[' '].accuracy >= 95
                            ? 'text-green-400'
                            : heatmap[' '].accuracy >= 85
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {heatmap[' '].accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-dark-800/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-xs text-dark-400">Отлично (95%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-xs text-dark-400">Хорошо (85-94%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-xs text-dark-400">Требует практики (&lt;85%)</span>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-dark-800/30 rounded-lg">
          <p className="text-xs text-dark-400 mb-1">Всего нажатий</p>
          <p className="text-2xl font-bold text-primary-400">
            {stats.totalPresses.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-dark-800/30 rounded-lg">
          <p className="text-xs text-dark-400 mb-1">Всего ошибок</p>
          <p className="text-2xl font-bold text-red-400">
            {stats.totalErrors.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-dark-800/30 rounded-lg">
          <p className="text-xs text-dark-400 mb-1">Общая точность</p>
          <p className="text-2xl font-bold text-green-400">
            {stats.totalPresses > 0
              ? (
                  ((stats.totalPresses - stats.totalErrors) /
                    stats.totalPresses) *
                  100
                ).toFixed(1)
              : 0}
            %
          </p>
        </div>
        <div className="p-4 bg-dark-800/30 rounded-lg">
          <p className="text-xs text-dark-400 mb-1">Активных клавиш</p>
          <p className="text-2xl font-bold text-blue-400">
            {Object.keys(heatmap).filter(k => heatmap[k].total > 0).length}
          </p>
        </div>
      </div>

      {/* Топ проблемных клавиш */}
      {stats.leastAccurate.length > 0 && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span>⚠️</span>
            Требуют больше практики
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.leastAccurate.map(([key, data]) => (
              <div
                key={key}
                className="px-3 py-2 bg-dark-800 rounded-lg border border-red-500/50"
              >
                <span className="font-mono font-semibold">{key}</span>
                <span className="text-xs text-red-400 ml-2">
                  {data.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getFingerName(finger: string): string {
  const names: Record<string, string> = {
    'left-pinky': 'Левый мизинец',
    'left-ring': 'Левый безымянный',
    'left-middle': 'Левый средний',
    'left-index': 'Левый указательный',
    'right-index': 'Правый указательный',
    'right-middle': 'Правый средний',
    'right-ring': 'Правый безымянный',
    'right-pinky': 'Правый мизинец',
    thumb: 'Большой палец',
  }
  return names[finger] || finger
}
