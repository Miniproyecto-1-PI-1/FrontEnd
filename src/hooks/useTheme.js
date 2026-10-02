import { useSyncExternalStore } from 'react'
import { getTheme, setTheme, subscribe } from '../utils/theme'

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme)
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}
