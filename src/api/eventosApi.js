import { request } from './http'
import { toCreatePayload, toDetail, toSummary, toTaskPayload } from './mappers'
import { mockApi } from './mockStore'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const PATH = '/api/events'

const realApi = {
  async list() {
    const data = await request(PATH)
    return data.map(toSummary)
  },
  async get(id) {
    return toDetail(await request(`${PATH}/${id}`))
  },
  async create(form) {
    return toDetail(await request(PATH, { method: 'POST', body: toCreatePayload(form) }))
  },
  async addGestion(eventoId, gestion) {
    await request(`${PATH}/${eventoId}/tasks`, { method: 'POST', body: toTaskPayload(gestion) })
  },
  async updateGestion(eventoId, gestion) {
    await request(`${PATH}/${eventoId}/tasks/${gestion.id}`, { method: 'PUT', body: toTaskPayload(gestion) })
  },
  async deleteGestion(eventoId, gestionId) {
    await request(`${PATH}/${eventoId}/tasks/${gestionId}`, { method: 'DELETE' })
  },
  async listClientes() {
    return []
  },
}

export const eventosApi = USE_MOCK ? mockApi : realApi
