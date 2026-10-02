import { calcHoras } from './date'

/** `fechaEvento` (ISO, opcional): el plazo de una gestión no puede ser posterior al evento. */
export function validarGestion(g, { plazoObligatorio = true, fechaEvento } = {}) {
  const e = {}
  if (!g.nombre.trim()) e.nombre = 'El nombre de la gestión es obligatorio.'
  if (plazoObligatorio && !g.plazo) e.plazo = 'La fecha límite es obligatoria.'
  else if (g.plazo && fechaEvento && g.plazo > fechaEvento) {
    e.plazo = 'La fecha límite no puede ser posterior al evento.'
  }
  if (!(Number(g.horas) > 0)) e.horas = 'Las horas estimadas deben ser mayores que 0.'
  if (Boolean(g.horaInicio) !== Boolean(g.horaFin)) {
    e.horario = 'Indica la hora de inicio y la de fin, o deja ambas vacías.'
  } else if (g.horaInicio && g.horaFin && calcHoras(g.horaInicio, g.horaFin) <= 0) {
    e.horario = 'La hora de fin debe ser posterior a la de inicio.'
  }
  return e
}

// Claves de error del backend (campo de TaskRequest) -> campos de GestionFields
export const CAMPO_GESTION = { name: 'nombre', dueDate: 'plazo', estimatedHours: 'horas', timeRangeValid: 'horario' }

export function erroresGestionDeApi(fieldErrors = {}) {
  const e = {}
  for (const [k, msg] of Object.entries(fieldErrors)) {
    e[CAMPO_GESTION[k] ?? 'horario'] = msg
  }
  return e
}
