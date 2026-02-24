import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  fps: number
  memory?: number
  renderTime: number
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
  sampleInterval?: number
}

/**
 * Хук для мониторинга производительности приложения
 * Отслеживает FPS, использование памяти и время рендера
 */
export function usePerformanceMonitor({
  enabled = true,
  onMetricsUpdate,
  sampleInterval = 1000,
}: UsePerformanceMonitorOptions = {}) {
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const rafIdRef = useRef<number>()

  useEffect(() => {
    if (!enabled) return

    const measureFrame = () => {
      frameCountRef.current++
      rafIdRef.current = requestAnimationFrame(measureFrame)
    }

    const calculateMetrics = () => {
      const now = performance.now()
      const elapsed = now - lastTimeRef.current
      const fps = Math.round((frameCountRef.current * 1000) / elapsed)

      const metrics: PerformanceMetrics = {
        fps,
        renderTime: elapsed / frameCountRef.current,
      }

      // Добавляем информацию о памяти если доступна
      if ('memory' in performance) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
        if (memory) {
          metrics.memory = Math.round(memory.usedJSHeapSize / 1048576) // MB
        }
      }

      onMetricsUpdate?.(metrics)

      // Сброс счётчиков
      frameCountRef.current = 0
      lastTimeRef.current = now
    }

    rafIdRef.current = requestAnimationFrame(measureFrame)
    const intervalId = setInterval(calculateMetrics, sampleInterval)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      clearInterval(intervalId)
    }
  }, [enabled, onMetricsUpdate, sampleInterval])
}
