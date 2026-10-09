import { useEffect } from 'react'
import Icon from './Icon'
import styles from './Toast.module.css'

export default function Toast({ message, onDone, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [onDone, duration])

  return (
    <div className={styles.toast} role="status">
      <span className={styles.icono}><Icon name="check" size={14} /></span>
      {message}
    </div>
  )
}
