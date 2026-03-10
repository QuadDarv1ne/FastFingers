/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, memo } from 'react'

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center p-8 text-dark-400">
    <div className="animate-pulse">Загрузка графика...</div>
  </div>
))
LoadingFallback.displayName = 'LoadingFallback'


const createLazyChart = (importFn: () => Promise<{ default: unknown }>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LazyComponent = lazy(importFn as any)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LazyWrapper = (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
  LazyWrapper.displayName = 'LazyWrapper'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return LazyWrapper as any
}

export { LoadingFallback }
export const BarChart = createLazyChart(() => import('recharts').then(m => ({ default: m.BarChart })))
export const Bar = createLazyChart(() => import('recharts').then(m => ({ default: m.Bar })))
export const AreaChart = createLazyChart(() => import('recharts').then(m => ({ default: m.AreaChart })))
export const Area = createLazyChart(() => import('recharts').then(m => ({ default: m.Area })))
export const LineChart = createLazyChart(() => import('recharts').then(m => ({ default: m.LineChart })))
export const Line = createLazyChart(() => import('recharts').then(m => ({ default: m.Line })))
export const PieChart = createLazyChart(() => import('recharts').then(m => ({ default: m.PieChart })))
export const Pie = createLazyChart(() => import('recharts').then(m => ({ default: m.Pie })))
export const XAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.XAxis })))
export const YAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.YAxis })))
export const CartesianGrid = createLazyChart(() => import('recharts').then(m => ({ default: m.CartesianGrid })))
export const Tooltip = createLazyChart(() => import('recharts').then(m => ({ default: m.Tooltip })))
export const ResponsiveContainer = createLazyChart(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })))
export const Cell = createLazyChart(() => import('recharts').then(m => ({ default: m.Cell })))
export const Legend = createLazyChart(() => import('recharts').then(m => ({ default: m.Legend })))
export const Label = createLazyChart(() => import('recharts').then(m => ({ default: m.Label })))
export const ReferenceLine = createLazyChart(() => import('recharts').then(m => ({ default: m.ReferenceLine })))
export const Radar = createLazyChart(() => import('recharts').then(m => ({ default: m.Radar })))
export const RadarChart = createLazyChart(() => import('recharts').then(m => ({ default: m.RadarChart })))
export const PolarGrid = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarGrid })))
export const PolarAngleAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarAngleAxis })))
export const PolarRadiusAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarRadiusAxis })))
