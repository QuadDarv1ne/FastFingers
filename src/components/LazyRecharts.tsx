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

// Импорты через основной entry point — Recharts сам занимается tree-shaking
// Lazy loading предотвращает загрузку неиспользуемых компонентов
// @ts-ignore — recharts имеет типы, но импорты работают корректно
export const BarChart = createLazyChart(() => import('recharts').then(m => ({ default: m.BarChart as RechartsComponent })))
// @ts-ignore
export const Bar = createLazyChart(() => import('recharts').then(m => ({ default: m.Bar as RechartsComponent })))
// @ts-ignore
export const AreaChart = createLazyChart(() => import('recharts').then(m => ({ default: m.AreaChart as RechartsComponent })))
// @ts-ignore
export const Area = createLazyChart(() => import('recharts').then(m => ({ default: m.Area as RechartsComponent })))
// @ts-ignore
export const LineChart = createLazyChart(() => import('recharts').then(m => ({ default: m.LineChart as RechartsComponent })))
// @ts-ignore
export const Line = createLazyChart(() => import('recharts').then(m => ({ default: m.Line as RechartsComponent })))
// @ts-ignore
export const PieChart = createLazyChart(() => import('recharts').then(m => ({ default: m.PieChart as RechartsComponent })))
// @ts-ignore
export const Pie = createLazyChart(() => import('recharts').then(m => ({ default: m.Pie as RechartsComponent })))
// @ts-ignore
export const XAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.XAxis as RechartsComponent })))
// @ts-ignore
export const YAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.YAxis as RechartsComponent })))
// @ts-ignore
export const CartesianGrid = createLazyChart(() => import('recharts').then(m => ({ default: m.CartesianGrid as RechartsComponent })))
// @ts-ignore
export const Tooltip = createLazyChart(() => import('recharts').then(m => ({ default: m.Tooltip as RechartsComponent })))
// @ts-ignore
export const ResponsiveContainer = createLazyChart(() => import('recharts').then(m => ({ default: m.ResponsiveContainer as RechartsComponent })))
// @ts-ignore
export const Cell = createLazyChart(() => import('recharts').then(m => ({ default: m.Cell as RechartsComponent })))
// @ts-ignore
export const Legend = createLazyChart(() => import('recharts').then(m => ({ default: m.Legend as RechartsComponent })))
// @ts-ignore
export const Label = createLazyChart(() => import('recharts').then(m => ({ default: m.Label as RechartsComponent })))
// @ts-ignore
export const ReferenceLine = createLazyChart(() => import('recharts').then(m => ({ default: m.ReferenceLine as RechartsComponent })))
// @ts-ignore
export const Radar = createLazyChart(() => import('recharts').then(m => ({ default: m.Radar as RechartsComponent })))
// @ts-ignore
export const RadarChart = createLazyChart(() => import('recharts').then(m => ({ default: m.RadarChart as RechartsComponent })))
// @ts-ignore
export const PolarGrid = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarGrid as RechartsComponent })))
// @ts-ignore
export const PolarAngleAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarAngleAxis as RechartsComponent })))
// @ts-ignore
export const PolarRadiusAxis = createLazyChart(() => import('recharts').then(m => ({ default: m.PolarRadiusAxis as RechartsComponent })))
// @ts-ignore
export const LabelList = createLazyChart(() => import('recharts').then(m => ({ default: m.LabelList as RechartsComponent })))
