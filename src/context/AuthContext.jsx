import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import { setAuthToken, setUnauthorizedHandler } from '../api/http'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'auth'

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Sin almacenamiento la sesión dura solo mientras la pestaña esté abierta.
  }
}

function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0] ?? '?').slice(0, 2)
  return letras.toUpperCase()
}

const initialSession = readSession()
setAuthToken(initialSession?.token ?? null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(initialSession)
  const [status, setStatus] = useState(initialSession ? 'checking' : 'anon')

  const save = useCallback((next) => {
    setAuthToken(next?.token ?? null)
    writeSession(next)
    setSession(next)
    setStatus(next ? 'authed' : 'anon')
  }, [])

  const logout = useCallback(() => save(null), [save])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  // Valida el token guardado al abrir la app.
  useEffect(() => {
    if (!initialSession) return
    let alive = true
    authApi
      .me()
      .then((user) => alive && save({ token: initialSession.token, user }))
      .catch((err) => {
        if (!alive) return
        // Sin conexión se conserva la sesión; con 401 se descarta.
        if (err.status === 401) save(null)
        else setStatus('authed')
      })
    return () => {
      alive = false
    }
  }, [save])

  const value = useMemo(() => ({
    status,
    user: session ? { ...session.user, iniciales: iniciales(session.user.nombre) } : null,
    login: async (email, pass) => save(await authApi.login(email, pass)),
    register: async (datos) => save(await authApi.register(datos)),
    updateUser: (user) => save({ token: session.token, user }),
    logout,
  }), [session, status, save, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
