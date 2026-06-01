import { createContext } from 'react'
import type { UseThemeReturn } from '../hooks/useTheme'

export const ThemeContext = createContext<UseThemeReturn | undefined>(undefined)
