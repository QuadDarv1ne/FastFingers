import { lazy, ComponentType } from 'react'

/**
 * Утилита для ленивой загрузки компонентов с именованным экспортом
 * @param importFn - функция импорта модуля
 * @param name - имя экспортируемого компонента
 */
export function lazyNamed<T, K extends keyof T>(
  importFn: () => Promise<T>,
  name: K
): ComponentType<unknown> {
  return lazy(() =>
    importFn().then((module) => {
      const component = module[name]
      if (typeof component === 'function' || typeof component === 'object') {
        return { default: component as unknown as ComponentType<unknown> }
      }
      throw new Error(`Export "${String(name)}" is not a valid component`)
    })
  )
}
