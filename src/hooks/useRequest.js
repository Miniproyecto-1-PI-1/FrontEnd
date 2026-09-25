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

  return { ...state, reload }
}
