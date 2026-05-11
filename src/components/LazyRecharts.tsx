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

// Ленивая загрузка с группировкой импортов для уменьшения количества чанков
// Основной импорт - загружает всю библиотеку recharts одним чанком
const loadRecharts = () => import('recharts')

const createLazyChart = <T extends keyof Awaited<ReturnType<typeof loadRecharts>>>(
  componentName: T
) => {
  const LazyComponent = lazy(() =>
    loadRecharts().then(m => ({ default: m[componentName] as unknown as RechartsComponent }))
  )

  const LazyWrapper = (props: Record<string, unknown>) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
  LazyWrapper.displayName = `Lazy${String(componentName)}`
  return LazyWrapper
}

export { LoadingFallback }

// Компоненты recharts с ленивой загрузкой
// Только компоненты, используемые в StatisticsPage
export const BarChart = createLazyChart('BarChart')
export const Bar = createLazyChart('Bar')
export const AreaChart = createLazyChart('AreaChart')
export const Area = createLazyChart('Area')
export const PieChart = createLazyChart('PieChart')
export const Pie = createLazyChart('Pie')
export const XAxis = createLazyChart('XAxis')
export const YAxis = createLazyChart('YAxis')
export const CartesianGrid = createLazyChart('CartesianGrid')
export const Tooltip = createLazyChart('Tooltip')
export const ResponsiveContainer = createLazyChart('ResponsiveContainer')
export const Cell = createLazyChart('Cell')
