/**
 * SimpleAreaChart — лёгкая SVG альтернатива Recharts AreaChart
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useMemo, useCallback } from 'react'
import { getChartColors } from '../utils/getThemeColors'

interface AreaChartData {
  [key: string]: string | number
}

interface SimpleAreaChartProps {
  data: AreaChartData[]
  dataKey: string
  xAxisKey: string
  stroke: string
  fillGradientId: string
  height?: number
}

interface TooltipData {
  label: string
  value: number
}

export function SimpleAreaChart({
  data,
  dataKey,
  xAxisKey,
  stroke,
  fillGradientId,
  height = 256,
}: SimpleAreaChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const padding = useMemo(() => ({ top: 16, right: 16, bottom: 32, left: 40 }), [])
  const chartWidth = 500
  const chartHeight = height
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => (d[dataKey] as number) || 0), 1)
    return Math.ceil(max / 10) * 10 || 10
  }, [data, dataKey])

  const yTicks = useMemo(() => {
    const step = maxValue / 5
    return Array.from({ length: 6 }, (_, i) => Math.round(step * i))
  }, [maxValue])

  const points = useMemo(() => {
    return data.map((item, index) => {
      const value = (item[dataKey] as number) || 0
      const x = padding.left + (data.length > 1 ? (index / (data.length - 1)) * innerWidth : innerWidth / 2)
      const y = padding.top + innerHeight - (value / maxValue) * innerHeight
      return { x, y, value, label: String(item[xAxisKey] ?? '') }
    })
  }, [data, dataKey, xAxisKey, padding.left, padding.top, innerWidth, innerHeight, maxValue])

  // Build smooth curve path using bezier interpolation
  const linePath = useMemo(() => {
    if (points.length === 0) return ''
    if (points.length === 1) {
      const p = points[0]
      if (!p) return ''
      return `M ${p.x} ${p.y}`
    }

    const first = points[0]
    if (!first) return ''
    let path = `M ${first.x} ${first.y}`

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(i + 2, points.length - 1)]
      if (!p0 || !p1 || !p2 || !p3) continue

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }

    return path
  }, [points])

  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return ''
    const last = points[points.length - 1]
    const first = points[0]
    if (!last || !first) return ''
    return `${linePath} L ${last.x} ${padding.top + innerHeight} L ${first.x} ${padding.top + innerHeight} Z`
  }, [linePath, points, padding.top, innerHeight])

  const handleMouseEnter = useCallback((point: TooltipData) => {
    setTooltip(point)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const colors = getChartColors()

  return (
    <div className="relative w-full" style={{ height: chartHeight }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        role="img"
        aria-label="Area chart"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.8} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = padding.top + innerHeight - (tick / maxValue) * innerHeight
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke={colors.surface}
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fill={colors.textMuted}
                fontSize={11}
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill={`url(#${fillGradientId})`} />}

        {/* Line */}
        {linePath && (
          <path d={linePath} fill="none" stroke={stroke} strokeWidth={2.5} />
        )}

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={stroke}
            stroke={colors.surface}
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => handleMouseEnter({ label: point.label, value: point.value })}
            onMouseLeave={handleMouseLeave}
          />
        ))}

        {/* X-axis labels */}
        {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 6)) === 0).map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={chartHeight - 8}
            textAnchor="middle"
            fill={colors.textMuted}
            fontSize={11}
          >
            {point.label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: colors.surface,
            right: 16,
            top: 16,
          }}
        >
          <div className="text-dark-400">{tooltip.label}</div>
          <div className="font-medium text-white">{tooltip.value} WPM</div>
        </div>
      )}
    </div>
  )
}
