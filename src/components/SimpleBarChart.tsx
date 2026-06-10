/**
 * SimpleBarChart — лёгкая SVG альтернатива Recharts BarChart
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useMemo, useCallback } from 'react'
import { getChartColors } from '../utils/getThemeColors'

interface BarChartData {
  [key: string]: string | number
}

interface SimpleBarChartProps {
  data: BarChartData[]
  dataKey: string
  xAxisKey: string
  fill: string
  height?: number
  radius?: [number, number, number, number]
}

interface TooltipData {
  x: number
  y: number
  label: string
  value: number
}

export function SimpleBarChart({
  data,
  dataKey,
  xAxisKey,
  fill,
  height = 256,
  radius = [0, 0, 0, 0],
}: SimpleBarChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const padding = useMemo(() => ({ top: 16, right: 16, bottom: 32, left: 40 }), [])
  const chartWidth = 500
  const chartHeight = height
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => Number(d[dataKey]) || 0), 1)
    return Math.ceil(max / 5) * 5 || 5
  }, [data, dataKey])

  const barWidth = useMemo(() => {
    const gap = 8
    const totalGaps = (data.length - 1) * gap
    return Math.max((innerWidth - totalGaps) / data.length, 4)
  }, [data.length, innerWidth])

  const yTicks = useMemo(() => {
    const step = maxValue / 5
    return Array.from({ length: 6 }, (_, i) => Math.round(step * i))
  }, [maxValue])

  const handleMouseEnter = useCallback((index: number, barX: number, barY: number) => {
    const item = data[index]
    if (!item) return
    setTooltip({
      x: barX,
      y: barY,
      label: String(item[xAxisKey] ?? ''),
      value: Number(item[dataKey]) || 0,
    })
  }, [data, xAxisKey, dataKey])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const [rTopLeft, rTopRight] = radius

  const colors = getChartColors()

  return (
    <div className="relative w-full" style={{ height: chartHeight }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        role="img"
        aria-label="Bar chart"
      >
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

        {/* Bars */}
        {data.map((item, index) => {
          const value = Number(item[dataKey]) || 0
          const barHeight = (value / maxValue) * innerHeight
          const x = padding.left + index * (barWidth + 8)
          const y = padding.top + innerHeight - barHeight

          return (
            <g
              key={index}
              onMouseEnter={() => handleMouseEnter(index, x, y)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={`
                  M ${x} ${y + (rTopLeft > 0 ? rTopLeft : 0)}
                  Q ${x} ${y} ${x + (rTopLeft > 0 ? rTopLeft : 0)} ${y}
                  L ${x + barWidth - (rTopRight > 0 ? rTopRight : 0)} ${y}
                  Q ${x + barWidth} ${y} ${x + barWidth} ${y + (rTopRight > 0 ? rTopRight : 0)}
                  L ${x + barWidth} ${padding.top + innerHeight}
                  L ${x} ${padding.top + innerHeight}
                  Z
                `}
                fill={fill}
              />
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                fill={colors.textMuted}
                fontSize={11}
              >
                {String(item[xAxisKey] ?? '')}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: colors.surface,
            left: `${(tooltip.x / chartWidth) * 100}%`,
            top: `${(tooltip.y / chartHeight) * 100}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-dark-400">{tooltip.label}</div>
          <div className="font-medium text-white">{tooltip.value}</div>
        </div>
      )}
    </div>
  )
}
