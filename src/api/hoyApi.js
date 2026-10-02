import { request, ApiError } from './http'
import { eventosApi } from './eventosApi'
import { hoyISO } from '../utils/date'
import { toTareaHoy } from './mappers'

const PATH = '/api/today'

// days=60 (el máximo del backend) para no ocultar gestiones próximas lejanas, ya que la vista no tiene
// su propio selector de ventana. incluirHechas trae también las ejecutadas: el filtro Pendientes/Pospuestas/
// Todas se resuelve en el cliente sobre esta única lista (ver Hoy.jsx). Si el backend aún no reconoce
// alguno de los dos parámetros, los ignora sin error (Spring descarta los query params no declarados).
async function listViaEndpoint() {
  const qs = new URLSearchParams({ days: '60', incluirHechas: 'true' })
  const data = await request(`${PATH}?${qs}`)
  return data.tasks.map(toTareaHoy)
}

// Respaldo mientras /api/today no esté desplegado (ver README del backend): arma la misma lista
// pidiendo el detalle de cada evento con gestiones, igual que antes de existir el endpoint.
async function listViaEventos() {
  const eventos = await eventosApi.list()
  const detalles = await Promise.all(
    eventos.filter((e) => e.total > 0).map((e) => eventosApi.get(e.id)),
  )
  const hoy = hoyISO()
  return detalles.flatMap((ev) =>
    ev.subtareas.map((t) => ({
      ...t,
      categoria: t.plazo < hoy ? 'VENCIDA' : t.plazo === hoy ? 'HOY' : 'PROXIMA',
      eventoId: ev.id,
      eventoNombre: ev.nombre,
      clienteNombre: ev.cliente?.nombre ?? null,
      fechaEvento: ev.fecha,
    })),
  )
}

export const hoyApi = {
  async list() {
    try {
      return await listViaEndpoint()
    } catch (err) {
      // 404 = esta build del backend todavía no tiene /api/today (no una gestión inexistente: aquí no hay id).
      if (err instanceof ApiError && err.status === 404) return listViaEventos()
      throw err
    }
  },
}
