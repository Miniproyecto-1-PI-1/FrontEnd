import { LogoMark } from './Logo'
import styles from './Splash.module.css'

export default function Splash() {
  return (
    <div className={styles.wrap} role="status" aria-label="Cargando Agendo">
      <div className={styles.pulse}>
        <LogoMark size={56} />
      </div>
      <div className={styles.spinner} aria-hidden="true" />
    </div>
  )
}
