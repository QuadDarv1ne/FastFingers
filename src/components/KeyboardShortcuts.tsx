export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
  category: 'navigation' | 'typing' | 'settings' | 'general'
}
