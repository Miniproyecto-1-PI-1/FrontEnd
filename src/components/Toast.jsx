import { useEffect } from 'react'
import Icon from './Icon'
import styles from './Toast.module.css'

/** `message` es un texto, o `{ titulo, detalle }` para decir además qué cambió. */
export default function Toast({ message, onDone, duration }) {
  const { titulo, detalle } = typeof message === 'string' ? { titulo: message } : message
  const ms = duration ?? (detalle ? 4500 : 2800)

  useEffect(() => {
    const t = setTimeout(onDone, ms)
    return () => clearTimeout(t)
  }, [onDone, ms])

  return (
    <div className={styles.toast} role="status">
      <span className={styles.icono}><Icon name="check" size={14} /></span>
      <span className={styles.texto}>
        <strong>{titulo}</strong>
        {detalle && <small>{detalle}</small>}
      </span>
    </div>
  )
}
