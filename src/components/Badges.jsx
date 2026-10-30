import Icon from './Icon'
import { normalizarTipo } from '../data/tipos'
import styles from './Badges.module.css'

const TIPO_CLASS = {
  Familiar: styles.boda,
  Social: styles.social,
  Laboral: styles.corp,
  Viaje: styles.cumple,
  Otro: styles.otro,
}

export function TipoBadge({ tipo, chico = false }) {
  const t = normalizarTipo(tipo)
  return <span className={`${styles.badge} ${TIPO_CLASS[t] ?? styles.otro} ${chico ? styles.chico : ''}`}>{t}</span>
}

const ESTADO = {
  PENDIENTE: { label: 'Pendiente', cls: styles.pendiente },
  EJECUTADA: { label: 'Ejecutada', cls: styles.ejecutada, icon: 'check' },
  POSPUESTA: { label: 'Pospuesta', cls: styles.pospuesta },
  VENCIDA: { label: 'Vencida', cls: styles.vencida },
}

export function EstadoBadge({ estado, chico = false }) {
  const e = ESTADO[estado] ?? ESTADO.PENDIENTE
  return (
    <span className={`${styles.badge} ${e.cls} ${chico ? styles.chico : ''}`}>
      {e.icon && <Icon name={e.icon} size={12} />}
      {e.label}
    </span>
  )
}
