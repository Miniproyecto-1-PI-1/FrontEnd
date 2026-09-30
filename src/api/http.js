export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const BASE = import.meta.env.VITE_API_URL ?? ''

let authToken = null
let onUnauthorized = null

export function setAuthToken(token) {
  authToken = token
}

/** Se llama cuando una ruta protegida responde 401 (token vencido o inválido). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.')
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    if (res.status === 401 && authToken && !path.startsWith('/api/auth/')) {
      onUnauthorized?.()
    }
    throw new ApiError(data?.detail ?? data?.title ?? 'Error del servidor.', {
      status: res.status,
      fieldErrors: data?.errors ?? {},
    })
  }
  return data
}
