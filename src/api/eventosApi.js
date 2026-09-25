import { request } from './http'
import { toCreatePayload, toDetail, toSummary } from './mappers'
import { mockApi } from './mockStore'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
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
  async listClientes() {
    return []
  },
}

export const eventosApi = USE_MOCK ? mockApi : realApi
