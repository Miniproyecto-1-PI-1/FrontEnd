export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const BASE = import.meta.env.VITE_API_URL ?? ''

export async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
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
    throw new ApiError(data?.detail ?? data?.title ?? 'Error del servidor.', {
      status: res.status,
      fieldErrors: data?.errors ?? {},
    })
  }
  return data
}
