import { memo, useMemo } from 'react'

function EmptyChart() {
  return <div className="h-full flex items-center justify-center text-dark-500">No data</div>
}

const W = 500
const H = 220
const PADDING = 30

export const SimpleLineChart = memo(function SimpleLineChart({ data, dataKey, xAxisKey, stroke }: {
  data: unknown[]
  dataKey: string
  xAxisKey: string
  stroke: string
}) {
  const computed = useMemo(() => {
    if (data.length === 0) return null

    const values = data.map(d => Number((d as Record<string, unknown>)[dataKey]) || 0)
    const max = values.reduce((m, v) => Math.max(m, v), 1)
    const min = values.reduce((m, v) => Math.min(m, v), 0)
    const range = max - min || 1

    const points = data.map((d, i) => {
      const item = d as Record<string, unknown>
      const x = PADDING + (i / Math.max(data.length - 1, 1)) * (W - PADDING * 2)
      const y = PADDING + (1 - ((Number(item[dataKey]) || 0) - min) / range) * (H - PADDING * 2)
      return { x, y, label: item[xAxisKey] as string, value: Number(item[dataKey]) || 0 }
    })

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const lastPoint = points[points.length - 1]
    const firstPoint = points[0]
    const areaD = pathD + (lastPoint && firstPoint ? ` L${lastPoint.x},${H - PADDING} L${firstPoint.x},${H - PADDING} Z` : '')

    return { points, pathD, areaD }
  }, [data, dataKey, xAxisKey])

  if (!computed) return <EmptyChart />

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={PADDING} y1={PADDING + f * (H - PADDING * 2)} x2={W - PADDING} y2={PADDING + f * (H - PADDING * 2)} stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" />
      ))}
      <path d={computed.areaD} fill={`url(#grad-${dataKey})`} />
      <path d={computed.pathD} fill="none" stroke={stroke} strokeWidth="2" />
      {computed.points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={stroke} />
      ))}
      {computed.points.filter((_, i) => data.length <= 7 || i % Math.ceil(data.length / 7) === 0).map((p, i) => (
        <text key={i} x={p.x} y={H - 5} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="10">{p.label}</text>
      ))}
    </svg>
  )
})
