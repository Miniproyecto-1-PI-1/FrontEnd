import { Link } from 'react-router-dom'
import styles from '../pages/Hoy.module.css'

/** Horas pendientes de hoy frente al límite diario, con enlace a Configuración para cambiarlo. */
export default function CargaDelDia({ horas, limite }) {
  return (
    <>
      <span className={`${styles.capValue} num`}>
        {horas} h
        {limite != null && <span className={styles.capLimite}> de {limite} h</span>}
      </span>
      <span className={styles.capLabel}>
        pendientes hoy
        {limite != null && (
          <>
            {' · '}
            <Link to="/configuracion" className={styles.capEnlace} title="Máximo de horas que planificas por día. Cámbialo en Configuración.">
              límite diario
            </Link>
          </>
        )}
      </span>
    </>
  )
}
