import { request } from './http'
import { toCreatePayload, toDetail, toEventPayload, toSummary, toTaskPayload } from './mappers'

const PATH = '/api/events'

export const eventosApi = {
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
  async update(id, form) {
    return toDetail(await request(`${PATH}/${id}`, { method: 'PUT', body: toEventPayload(form) }))
  },
  async remove(id) {
    await request(`${PATH}/${id}`, { method: 'DELETE' })
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
