/**
 * SimplePieChart — лёгкая SVG альтернатива Recharts PieChart
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useMemo, useCallback } from 'react'
import { getChartColors } from '../utils/getThemeColors'

interface PieChartData {
  name: string
  value: number
  color: string
}

interface SimplePieChartProps {
  data: PieChartData[]
  height?: number
  outerRadius?: number
}

interface TooltipData {
  name: string
  value: number
  percent: number
  color: string
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'L', cx, cy,
    'Z',
  ].join(' ')
}

export function SimplePieChart({
  data,
  height = 256,
  outerRadius = 80,
}: SimplePieChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const chartWidth = 500
  const chartHeight = height
  const cx = chartWidth / 2
  const cy = chartHeight / 2

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])

  const slices = useMemo(() => {
    let currentAngle = 0
    return data.map(item => {
      const percent = total > 0 ? item.value / total : 0
      const sliceAngle = percent * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + sliceAngle
      currentAngle = endAngle

      return {
        ...item,
        percent,
        startAngle,
        endAngle,
        path: describeArc(cx, cy, outerRadius, startAngle, endAngle),
      }
    })
  }, [data, total, cx, cy, outerRadius])

  const handleMouseEnter = useCallback((item: PieChartData, percent: number) => {
    setTooltip({ name: item.name, value: item.value, percent, color: item.color })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const colors = useMemo(() => getChartColors(), [])

  return (
    <div className="relative w-full" style={{ height: chartHeight }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        role="img"
        aria-label="Pie chart"
      >
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.path}
            fill={slice.color}
            stroke={colors.surface}
            strokeWidth={2}
            style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={() => handleMouseEnter(slice, slice.percent)}
            onMouseLeave={handleMouseLeave}
            opacity={tooltip && tooltip.name !== slice.name ? 0.6 : 1}
          />
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
          <div className="font-medium" style={{ color: tooltip.color }}>{tooltip.name}</div>
          <div className="text-dark-400">{tooltip.value} ({(tooltip.percent * 100).toFixed(0)}%)</div>
        </div>
      )}
    </div>
  )
}
