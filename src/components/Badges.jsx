import styles from './Badges.module.css'

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
