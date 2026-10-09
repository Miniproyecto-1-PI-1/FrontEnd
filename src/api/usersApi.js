import { request } from './http'
import { toUser } from './authApi'

const PATH = '/api/users/me'

export const usersApi = {
  async updateProfile({ nombre, email, passActual }) {
    return toUser(await request(PATH, {
      method: 'PUT',
      body: { name: nombre.trim(), email: email.trim(), currentPassword: passActual || null },
    }))
  },
  async changePassword({ actual, nueva }) {
    await request(`${PATH}/password`, {
      method: 'PUT',
      body: { currentPassword: actual, newPassword: nueva },
    })
  },
  async uploadAvatar(dataUrl) {
    return toUser(await request(`${PATH}/avatar`, { method: 'PUT', body: { image: dataUrl } }))
  },
  async deleteAccount(pass) {
    await request(PATH, { method: 'DELETE', body: { password: pass } })
  },
  async getDailyLimit() {
    const data = await request(`${PATH}/planning-preferences`)
    return { limiteDiario: data.dailyLimitHours }
  },
  async updateDailyLimit({ limiteDiario }) {
    const data = await request(`${PATH}/planning-preferences`, { method: 'PUT', body: { dailyLimitHours: limiteDiario } })
    return { limiteDiario: data.dailyLimitHours }
  },
}
