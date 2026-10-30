import { test as base, expect } from '@playwright/test'
import { API_URL } from './playwright.config.js'

export { expect }

/** Fecha ISO (AAAA-MM-DD) en hora de Colombia, desplazada `dias` desde hoy. */
export function diaBogota(dias = 0) {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
  const d = new Date(`${hoy}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/** Igual que fmtFecha de la app: "02 nov." (año solo si no es el actual). */
export function fmtFecha(iso) {
  const d = new Date(`${iso}T00:00:00`)
  const otroAnio = d.getFullYear() !== new Date().getFullYear()
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', ...(otroAnio && { year: 'numeric' }) })
}

export async function api(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  return data
}

/** Render gratis se duerme: reintenta /api/health hasta ~90 s. */
export async function despertarApi(maxMs = 90_000) {
  const fin = Date.now() + maxMs
  let ultimo
  while (Date.now() < fin) {
    try {
      const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(30_000) })
      if (res.ok) return
      ultimo = `HTTP ${res.status}`
    } catch (err) {
      ultimo = err.message
    }
    await new Promise((r) => setTimeout(r, 3_000))
  }
  throw new Error(`La API no respondió en ${maxMs / 1000} s (${ultimo})`)
}

/** Usuario desechable con límite diario de 6 h; se borra con borrarUsuario (eventos y tareas incluidos). */
export async function crearUsuario(etiqueta) {
  await despertarApi()
  const sello = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  const usuario = {
    name: `E2E ${etiqueta}`,
    email: `e2e-${etiqueta}-${sello}@agendo.test`,
    password: `E2e.${sello}`,
  }
  const { token } = await api('/api/auth/register', { method: 'POST', body: usuario })
  await api('/api/users/me/planning-preferences', { method: 'PUT', token, body: { dailyLimitHours: 6 } })
  return { ...usuario, token }
}

export async function borrarUsuario(usuario) {
  if (!usuario) return
  await api('/api/users/me', { method: 'DELETE', token: usuario.token, body: { password: usuario.password } })
}

/** Crea un evento con tareas por API. `tareas`: [{ name, dueDate, estimatedHours }]. */
export async function crearEvento(usuario, { name, date, tareas = [] }) {
  return api('/api/events', {
    method: 'POST',
    token: usuario.token,
    body: {
      name,
      type: 'Otro',
      date,
      place: 'Sala E2E',
      tasks: tareas.map((t) => ({ description: null, startTime: null, endTime: null, ...t })),
    },
  })
}

export const borrarEvento = (usuario, id) => api(`/api/events/${id}`, { method: 'DELETE', token: usuario.token })
export const verEvento = (usuario, id) => api(`/api/events/${id}`, { token: usuario.token })

/** Horas no ejecutadas por día de todos los eventos del usuario. */
export async function horasPorDia(usuario) {
  const eventos = await api('/api/events', { token: usuario.token })
  const dias = {}
  for (const e of eventos) {
    const det = await verEvento(usuario, e.id)
    for (const t of det.tasks) {
      if (t.status !== 'DONE') dias[t.dueDate] = (dias[t.dueDate] ?? 0) + Number(t.estimatedHours)
    }
  }
  return dias
}

export async function iniciarSesion(page, usuario) {
  await page.goto('/login')
  await page.locator('#email').fill(usuario.email)
  await page.locator('#pass').fill(usuario.password)
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
  await expect(page).toHaveURL(/\/hoy$/)
}

/**
 * `test` con una verificación automática: la prueba falla si la página registra errores en consola
 * o excepciones sin capturar. `erroresPermitidos` admite los esperados (p. ej. el 409 del conflicto).
 */
export const test = base.extend({
  erroresPermitidos: [[], { option: true }],
  consola: [
    async ({ page, erroresPermitidos }, use) => {
      const errores = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errores.push(msg.text())
      })
      page.on('pageerror', (err) => errores.push(`pageerror: ${err.message}`))
      await use(errores)
      const inesperados = errores.filter((e) => !erroresPermitidos.some((re) => re.test(e)))
      expect(inesperados, 'errores en la consola del navegador').toEqual([])
    },
    { auto: true },
  ],
})
