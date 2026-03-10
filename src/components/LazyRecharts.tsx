/* eslint-disable react-refresh/only-export-components */
import { Suspense, memo, lazy, type ComponentType } from 'react'

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center p-8 text-dark-400">
    <div className="animate-pulse">Загрузка графика...</div>
  </div>
))
LoadingFallback.displayName = 'LoadingFallback'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RechartsComponent = ComponentType<any>

 
const createLazyChart = (importFn: () => Promise<{ default: RechartsComponent }>) => {
  const LazyComponent = lazy(importFn)

  const LazyWrapper = (props: Record<string, unknown>) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
  LazyWrapper.displayName = `LazyChart`
  return LazyWrapper
}

export { LoadingFallback }

// Каждый компонент импортируется отдельно — будет загружен только используемый
export const BarChart = createLazyChart(() => import('recharts').then(m => ({ default: m.BarChart as RechartsComponent })))
export const Bar = createLazyChart(() => import('recharts').then(m => ({ default: m.Bar as RechartsComponent })))
export const AreaChart = createLazyChart(() => import('recharts').then(m => ({ default: m.AreaChart as RechartsComponent })))
export const Area = createLazyChart(() => import('recharts').then(m => ({ default: m.Area as RechartsComponent })))
export const LineChart = createLazyChart(() => import('recharts').then(m => ({ default: m.LineChart as RechartsComponent })))
export const Line = createLazyChart(() => import('recharts').then(m => ({ default: m.Line as RechartsComponent })))
export const PieChart = createLazyChart(() => import('recharts').then(m => ({ default: m.PieChart as RechartsComponent })))
export const Pie = createLazyChart(() => import('recharts').then(m => ({ default: m.Pie as RechartsComponent })))
export const XAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.XAxis as RechartsComponent })))
export const YAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.YAxis as RechartsComponent })))
export const CartesianGrid = createLazyChart(() => import('recharts').then(m => ({ default: m.CartesianGrid as RechartsComponent })))
export const Tooltip = createLazyChart(() => import('recharts').then(m => ({ default: m.Tooltip as RechartsComponent })))
export const ResponsiveContainer = createLazyChart(() => import('recharts').then(m => ({ default: m.ResponsiveContainer as RechartsComponent })))
export const Cell = createLazyChart(() => import('recharts').then(m => ({ default: m.Cell as RechartsComponent })))
export const Legend = createLazyChart(() => import('recharts').then(m => ({ default: m.Legend as RechartsComponent })))
export const Label = createLazyChart(() => import('recharts').then(m => ({ default: m.Label as RechartsComponent })))
export const ReferenceLine = createLazyChart(() => import('recharts').then(m => ({ default: m.ReferenceLine as RechartsComponent })))
export const Radar = createLazyChart(() => import('recharts').then(m => ({ default: m.Radar as RechartsComponent })))
export const RadarChart = createLazyChart(() => import('recharts').then(m => ({ default: m.RadarChart as RechartsComponent })))
export const PolarGrid = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarGrid as RechartsComponent })))
export const PolarAngleAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarAngleAxis as RechartsComponent })))
export const PolarRadiusAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarRadiusAxis as RechartsComponent })))
export const LabelList = createLazyChart(() => import('recharts').then(m => ({ default: m.LabelList as RechartsComponent })))
