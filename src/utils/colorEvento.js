// Matices (HSL) para distinguir un evento de otro de un vistazo. Se evita el rojo puro, que ya significa «vencida».
const MATICES = [210, 280, 160, 30, 330, 190, 90, 250]

/** El color de un evento sale de su identificador: siempre es el mismo, sin guardarlo en ninguna parte. */
export function maticeEvento(id) {
  const n = Math.abs(Number(id))
  return MATICES[(Number.isFinite(n) ? n : 0) % MATICES.length]
}
