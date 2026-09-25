import { getMockData } from '../data/mockEventos'
import { hoyISO, calcHoras } from '../utils/date'
import { ApiError } from './http'

let store = null

export function initMock(perfil) {
  const data = getMockData(perfil)
  store = { clientes: data.clientes, eventos: data.eventos }
}

const ensure = () => {
  if (!store) initMock('organizador')
  return store
}

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

function forceError(kind) {
  try {
    if (localStorage.getItem('mockError') === kind) {
      throw new ApiError('Error simulado.', { status: 500 })
    }
  } catch (err) {
    if (err instanceof ApiError) throw err
  }
}

function detail(ev, s) {
  const cliente = s.clientes.find((c) => c.id === ev.clienteId) ?? null
  const hechas = ev.subtareas.filter((t) => t.estado === 'EJECUTADA').length
  const total = ev.subtareas.length
  return {
    id: ev.id,
    nombre: ev.nombre,
    tipo: ev.tipo,
    descripcion: ev.descripcion ?? '',
    fecha: ev.fecha,
    hora: ev.hora ?? '',
    lugar: ev.lugar,
    cliente,
    subtareas: ev.subtareas.map((t) => ({ descripcion: '', ...t })),
    total,
    hechas,
    progreso: total ? Math.round((hechas / total) * 100) : 0,
  }
}

export const mockApi = {
  async list() {
    await wait()
    forceError('list')
    const s = ensure()
    return s.eventos.map((ev) => {
      const d = detail(ev, s)
      return {
        id: d.id,
        nombre: d.nombre,
        tipo: d.tipo,
        fecha: d.fecha,
        clienteNombre: d.cliente?.nombre ?? null,
        total: d.total,
        hechas: d.hechas,
        progreso: d.progreso,
      }
    })
  },

  async get(id) {
    await wait()
    forceError('detail')
    const s = ensure()
    const ev = s.eventos.find((e) => String(e.id) === String(id))
    if (!ev) throw new ApiError('Recurso no encontrado.', { status: 404 })
    return detail(ev, s)
  },

  async create(form) {
    await wait(700)
    forceError('create')
    const s = ensure()

    let clienteId = null
    const nombre = form.cliente.nombre.trim()
    if (nombre) {
      const existente = s.clientes.find((c) => c.nombre.toLowerCase() === nombre.toLowerCase())
      if (existente) {
        clienteId = existente.id
        existente.telefono = form.cliente.telefono || existente.telefono
        existente.correo = form.cliente.correo || existente.correo
      } else {
        clienteId = Date.now()
        s.clientes.push({ id: clienteId, nombre, telefono: form.cliente.telefono, correo: form.cliente.correo })
      }
    }

    const evento = {
      id: Date.now(),
      nombre: form.nombre,
      tipo: form.tipo,
      clienteId,
      fecha: form.fecha,
      hora: form.hora,
      lugar: form.lugar,
      descripcion: form.descripcion,
      subtareas: form.subtareas.map((t, i) => ({
        id: Date.now() + i + 1,
        nombre: t.nombre,
        descripcion: t.descripcion,
        plazo: t.plazo || hoyISO(),
        horas: calcHoras(t.horaInicio, t.horaFin) || 1,
        horaInicio: t.horaInicio,
        horaFin: t.horaFin,
        estado: 'PENDIENTE',
      })),
    }
    s.eventos.unshift(evento)
    return detail(evento, s)
  },

  async listClientes() {
    return ensure().clientes.map((c) => ({ ...c }))
  },
}
