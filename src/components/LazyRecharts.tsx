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

<<<<<<< HEAD
// Компоненты recharts с ленивой загрузкой
// Все компоненты загружаются одним чанком при первом использовании любого из них
export const BarChart = createLazyChart('BarChart')
export const Bar = createLazyChart('Bar')
export const AreaChart = createLazyChart('AreaChart')
export const Area = createLazyChart('Area')
export const LineChart = createLazyChart('LineChart')
export const Line = createLazyChart('Line')
export const PieChart = createLazyChart('PieChart')
export const Pie = createLazyChart('Pie')
export const XAxis = createLazyChart('XAxis')
export const YAxis = createLazyChart('YAxis')
export const CartesianGrid = createLazyChart('CartesianGrid')
export const Tooltip = createLazyChart('Tooltip')
export const ResponsiveContainer = createLazyChart('ResponsiveContainer')
export const Cell = createLazyChart('Cell')
export const Legend = createLazyChart('Legend')
export const Label = createLazyChart('Label')
export const ReferenceLine = createLazyChart('ReferenceLine')
export const Radar = createLazyChart('Radar')
export const RadarChart = createLazyChart('RadarChart')
export const PolarGrid = createLazyChart('PolarGrid')
export const PolarAngleAxis = createLazyChart('PolarAngleAxis')
export const PolarRadiusAxis = createLazyChart('PolarRadiusAxis')
export const LabelList = createLazyChart('LabelList')
