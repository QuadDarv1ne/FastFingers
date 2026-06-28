import { lazy, type ComponentType } from 'react'

export function lazyDefault<T extends Record<string, ComponentType<any>>, K extends keyof T>(
  importFn: () => Promise<T>,
  exportName: K
) {
  return lazy(() => importFn().then(m => ({ default: m[exportName] })))
}
