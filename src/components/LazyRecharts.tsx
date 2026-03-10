/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, memo, type ComponentType } from 'react'

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center p-8 text-dark-400">
    <div className="animate-pulse">Загрузка графика...</div>
  </div>
))
LoadingFallback.displayName = 'LoadingFallback'

interface RechartsModule {
  BarChart: ComponentType<unknown>
  Bar: ComponentType<unknown>
  AreaChart: ComponentType<unknown>
  Area: ComponentType<unknown>
  LineChart: ComponentType<unknown>
  Line: ComponentType<unknown>
  PieChart: ComponentType<unknown>
  Pie: ComponentType<unknown>
  XAxis: ComponentType<unknown>
  YAxis: ComponentType<unknown>
  CartesianGrid: ComponentType<unknown>
  Tooltip: ComponentType<unknown>
  ResponsiveContainer: ComponentType<unknown>
  Cell: ComponentType<unknown>
  Legend: ComponentType<unknown>
  Label: ComponentType<unknown>
  ReferenceLine: ComponentType<unknown>
  Radar: ComponentType<unknown>
  RadarChart: ComponentType<unknown>
  PolarGrid: ComponentType<unknown>
  PolarAngleAxis: ComponentType<unknown>
  PolarRadiusAxis: ComponentType<unknown>
  LabelList: ComponentType<unknown>
}

let rechartsModule: RechartsModule | null = null

const RechartsLoader = lazy(async () => {
  if (!rechartsModule) {
    const module = await import('recharts')
    rechartsModule = module as RechartsModule
  }
  return { default: rechartsModule }
})

const createLazyChart = <T extends keyof RechartsModule>(componentName: T) => {
  const LazyWrapper = (props: React.ComponentProps<RechartsModule[T]>) => (
    <Suspense fallback={<LoadingFallback />}>
      <RechartsLoader>
        {(module: RechartsModule) => {
          const Component = module[componentName]
          return <Component {...(props as never)} />
        }}
      </RechartsLoader>
    </Suspense>
  )
  LazyWrapper.displayName = `Lazy${componentName}`
  return LazyWrapper
}

export { LoadingFallback }

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
