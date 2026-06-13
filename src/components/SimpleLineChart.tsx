function EmptyChart() {
  return <div className="h-full flex items-center justify-center text-dark-500">No data</div>
}

export function SimpleLineChart({ data, dataKey, xAxisKey, stroke }: {
  data: unknown[]
  dataKey: string
  xAxisKey: string
  stroke: string
}) {
  if (data.length === 0) return <EmptyChart />

  const values = data.map(d => Number((d as Record<string, unknown>)[dataKey]) || 0)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const w = 500
  const h = 220
  const padding = 30

  const points = data.map((d, i) => {
    const item = d as Record<string, unknown>
    const x = padding + (i / Math.max(data.length - 1, 1)) * (w - padding * 2)
    const y = padding + (1 - ((Number(item[dataKey]) || 0) - min) / range) * (h - padding * 2)
    return { x, y, label: item[xAxisKey] as string, value: Number(item[dataKey]) || 0 }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  const areaD = pathD + (lastPoint && firstPoint ? ` L${lastPoint.x},${h - padding} L${firstPoint.x},${h - padding} Z` : '')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={padding} y1={padding + f * (h - padding * 2)} x2={w - padding} y2={padding + f * (h - padding * 2)} stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" />
      ))}
      <path d={areaD} fill={`url(#grad-${dataKey})`} />
      <path d={pathD} fill="none" stroke={stroke} strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={stroke} />
      ))}
      {points.filter((_, i) => data.length <= 7 || i % Math.ceil(data.length / 7) === 0).map((p, i) => (
        <text key={i} x={p.x} y={h - 5} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="10">{p.label}</text>
      ))}
    </svg>
  )
}
