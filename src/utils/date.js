const pad = (n) => String(n).padStart(2, '0')

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const hoyISO = () => toISO(new Date())

export function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** "05 oct"; incluye el año si no es el actual. */
export function fmtFecha(iso) {
  const d = new Date(`${iso}T00:00:00`)
  const otroAnio = d.getFullYear() !== new Date().getFullYear()
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', ...(otroAnio && { year: 'numeric' }) })
}

export function calcHoras(ini, fin) {
  if (!ini || !fin) return 0
  const [h1, m1] = ini.split(':').map(Number)
  const [h2, m2] = fin.split(':').map(Number)
  const mins = h2 * 60 + m2 - (h1 * 60 + m1)
  return mins > 0 ? Math.round((mins / 60) * 100) / 100 : 0
}

export function fmtFechaLarga(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const DIA_MS = 24 * 60 * 60 * 1000

/** Días entre hoy y la fecha ISO (negativo si ya pasó). */
export function diasHasta(iso) {
  const hoy = new Date(`${hoyISO()}T00:00:00`)
  const d = new Date(`${iso}T00:00:00`)
  return Math.round((d - hoy) / DIA_MS)
}

/** "Hoy", "Mañana", "En 5 días", "Ayer", "Hace 3 días"… */
export function fmtRelativo(iso) {
  const n = diasHasta(iso)
  if (n === 0) return 'Hoy'
  if (n === 1) return 'Mañana'
  if (n === -1) return 'Ayer'
  if (n > 1) return n < 60 ? `En ${n} días` : `En ${Math.round(n / 30)} meses`
  return -n < 60 ? `Hace ${-n} días` : `Hace ${Math.round(-n / 30)} meses`
}
