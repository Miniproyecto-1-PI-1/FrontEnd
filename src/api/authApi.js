import { request } from './http'

const PATH = '/api/auth'

export const toUser = (u) => ({ id: u.id, nombre: u.name, email: u.email, foto: u.avatar ?? null, limiteDiario: u.dailyLimitHours ?? 6 })
const toSession = (data) => ({ token: data.token, user: toUser(data.user) })

export const authApi = {
  async login(email, pass) {
    return toSession(await request(`${PATH}/login`, {
      method: 'POST',
      body: { email: email.trim(), password: pass },
    }))
  },
  async register({ nombre, email, pass }) {
    return toSession(await request(`${PATH}/register`, {
      method: 'POST',
      body: { name: nombre.trim(), email: email.trim(), password: pass },
    }))
  },
  async me() {
    return toUser(await request(`${PATH}/me`))
  },
}
