import { useCallback, useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Mientras `dirty` sea true, avisa antes de cerrar la pestaña y bloquea la navegación interna.
 * Devuelve el blocker (para pintar la confirmación) y `allowNavigation` para saltarse el aviso tras guardar.
 */
export function useUnsavedChanges(dirty) {
  const skip = useRef(false)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !skip.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const allowNavigation = useCallback(() => {
    skip.current = true
  }, [])

  return { blocker, allowNavigation }
}
