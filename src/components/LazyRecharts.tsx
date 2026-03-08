import { lazy, Suspense, type ComponentType } from 'react'
import { memo } from 'react'

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center p-8 text-dark-400">
    <div className="animate-pulse">Загрузка графика...</div>
  </div>
))

function createLazyChart<T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>): T {
  const LazyComponent = lazy(importFn)
  
  return ((props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )) as T
}

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
