import { useState } from 'react'
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'

interface PerformanceMonitorProps {
  enabled?: boolean
}

/**
 * Компонент для отображения метрик производительности
 * Показывает FPS, использование памяти и время рендера
 */
export function PerformanceMonitor({ enabled = false }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
  })

  usePerformanceMonitor({
    enabled,
    onMetricsUpdate: (newMetrics) => {
      setMetrics({
        fps: newMetrics.fps,
        memory: newMetrics.memory ?? 0,
        renderTime: newMetrics.renderTime,
      })
    },
  })

  if (!enabled) return null

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500'
    if (fps >= 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="fixed bottom-4 right-4 bg-dark-800/90 backdrop-blur-sm border border-dark-700 rounded-lg p-3 text-xs font-mono z-50 shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-dark-400">FPS:</span>
          <span className={`font-bold ${getFpsColor(metrics.fps)}`}>
            {metrics.fps}
          </span>
        </div>
        {metrics.memory !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-dark-400">Memory:</span>
            <span className="text-white">{metrics.memory} MB</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-dark-400">Render:</span>
          <span className="text-white">{metrics.renderTime.toFixed(2)} ms</span>
        </div>
      </div>
    </div>
  )
}
