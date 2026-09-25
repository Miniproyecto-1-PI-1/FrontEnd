import { useEffect } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, onDone, duration = 2600 }) {
  useEffect(() => {
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [onDone, duration])

  return <div className={styles.toast} role="status">{message}</div>
}
