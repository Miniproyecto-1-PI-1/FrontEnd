import { request } from './http'
import { toProgreso, toProgresoEvento } from './mappers'

export const progresoApi = {
  /** Avance general (hechas / total) y el detalle de cada evento. */
  async get() {
    return toProgreso(await request('/api/progress'))
  },
  async evento(id) {
    return toProgresoEvento(await request(`/api/events/${id}/progress`))
  },
}
