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

export function fmtFecha(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}
