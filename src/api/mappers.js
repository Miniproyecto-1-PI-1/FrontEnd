const ESTADO = { PENDING: 'PENDIENTE', DONE: 'EJECUTADA', POSTPONED: 'POSPUESTA' }

export function toSummary(api) {
  return {
    id: api.id,
    nombre: api.name,
    tipo: api.type ?? 'Otro',
    fecha: api.date,
    clienteNombre: api.clientName ?? null,
    total: api.totalTasks,
    hechas: api.doneTasks,
    progreso: api.progress,
  }
}

export function toDetail(api) {
  return {
    id: api.id,
    nombre: api.name,
    tipo: api.type ?? 'Otro',
    descripcion: api.description ?? '',
    fecha: api.date,
    hora: api.time ?? '',
    lugar: api.place,
    cliente: api.client
      ? { id: api.client.id, nombre: api.client.name, telefono: api.client.phone ?? '', correo: api.client.email ?? '' }
      : null,
    subtareas: (api.tasks ?? []).map((t) => ({
      id: t.id,
      nombre: t.name,
      descripcion: t.description ?? '',
      plazo: t.dueDate,
      horas: Number(t.estimatedHours),
      horaInicio: t.startTime ?? '',
      horaFin: t.endTime ?? '',
      estado: ESTADO[t.status] ?? 'PENDIENTE',
    })),
    total: api.totalTasks,
    hechas: api.doneTasks,
    progreso: api.progress,
  }
}

const orNull = (v) => (v === '' || v === undefined ? null : v)

export function toCreatePayload(form) {
  return {
    name: form.nombre,
    type: form.tipo,
    date: form.fecha,
    time: orNull(form.hora),
    place: form.lugar,
    description: orNull(form.descripcion),
    client: form.cliente.nombre
      ? { name: form.cliente.nombre, phone: orNull(form.cliente.telefono), email: orNull(form.cliente.correo) }
      : null,
    tasks: form.subtareas.map((s) => ({
      name: s.nombre,
      description: orNull(s.descripcion),
      dueDate: orNull(s.plazo),
      startTime: orNull(s.horaInicio),
      endTime: orNull(s.horaFin),
    })),
  }
}
