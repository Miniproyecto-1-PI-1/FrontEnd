import { calcHoras } from './date'

export function validarGestion(g, { plazoObligatorio = true } = {}) {
  const e = {}
  if (!g.nombre.trim()) e.nombre = 'El nombre de la gestión es obligatorio.'
  if (plazoObligatorio && !g.plazo) e.plazo = 'La fecha límite es obligatoria.'
  if (g.horaInicio && g.horaFin && calcHoras(g.horaInicio, g.horaFin) <= 0) {
    e.horario = 'La hora de fin debe ser posterior a la de inicio.'
  }
  return e
}
