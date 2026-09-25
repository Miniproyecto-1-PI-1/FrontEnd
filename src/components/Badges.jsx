import styles from './Badges.module.css'

const TIPO_CLASS = {
  Boda: styles.boda,
  Social: styles.social,
  Corporativo: styles.corp,
  Cumpleaños: styles.cumple,
  Otro: styles.otro,
}

export function TipoBadge({ tipo }) {
  return <span className={`${styles.badge} ${TIPO_CLASS[tipo] ?? styles.otro}`}>{tipo}</span>
}

const ESTADO = {
  PENDIENTE: { label: 'Pendiente', cls: styles.pendiente },
  EJECUTADA: { label: '✔ Ejecutada', cls: styles.ejecutada },
  POSPUESTA: { label: 'Pospuesta', cls: styles.pospuesta },
  VENCIDA: { label: 'Vencida', cls: styles.vencida },
}

export function EstadoBadge({ estado }) {
  const e = ESTADO[estado] ?? ESTADO.PENDIENTE
  return <span className={`${styles.badge} ${e.cls}`}>{e.label}</span>
}
