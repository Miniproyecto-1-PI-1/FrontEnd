import { calcHoras } from './date'

export function validarGestion(g, { plazoObligatorio = true } = {}) {
  const e = {}
  if (!g.nombre.trim()) e.nombre = 'El nombre de la gestión es obligatorio.'
  if (plazoObligatorio && !g.plazo) e.plazo = 'La fecha límite es obligatoria.'
  if (!(Number(g.horas) > 0)) e.horas = 'Las horas estimadas deben ser mayores que 0.'
  if (Boolean(g.horaInicio) !== Boolean(g.horaFin)) {
    e.horario = 'Indica la hora de inicio y la de fin, o deja ambas vacías.'
  } else if (g.horaInicio && g.horaFin && calcHoras(g.horaInicio, g.horaFin) <= 0) {
    e.horario = 'La hora de fin debe ser posterior a la de inicio.'
  }
  return e
}
