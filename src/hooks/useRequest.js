import { useEffect, useRef, useState } from 'react'

const LOADING = { status: 'loading', data: null, error: null }

export function useRequest(fn) {
  const [state, setState] = useState(LOADING)
  const [tick, setTick] = useState(0)
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  })

  useEffect(() => {
    let alive = true
    fnRef
      .current()
      .then((data) => alive && setState({ status: 'success', data, error: null }))
      .catch((error) => alive && setState({ status: 'error', data: null, error }))
    return () => {
      alive = false
    }
  }, [tick])

  const reload = () => {
    setState(LOADING)
    setTick((t) => t + 1)
  }

  const refresh = () => setTick((t) => t + 1)

  // Aplica un cambio local ya confirmado por el servidor, sin esperar a recargar la lista.
  const mutate = (fn) => setState((s) => (s.status === 'success' ? { ...s, data: fn(s.data) } : s))

  return { ...state, reload, refresh, mutate }
}
