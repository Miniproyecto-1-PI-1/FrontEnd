import styles from './Splash.module.css'

export default function Splash() {
  return (
    <div className={styles.wrap} role="status" aria-label="Cargando">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.brand}>
        Organizador<span> de Eventos</span>
      </p>
    </div>
  )
}
