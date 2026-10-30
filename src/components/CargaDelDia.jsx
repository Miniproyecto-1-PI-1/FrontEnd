import { Link } from 'react-router-dom'
import styles from '../pages/Hoy.module.css'

/** Horas pendientes de hoy frente al límite diario, con un botón que lleva directo al campo del límite. */
export default function CargaDelDia({ horas, limite }) {
  return (
    <>
      <span className={`${styles.capValue} num`}>
        {horas} h
        {limite != null && <span className={styles.capLimite}> de {limite} h</span>}
      </span>
      <span className={styles.capLabel}>pendientes hoy</span>
      {limite != null && (
        <Link to="/configuracion#limite-diario" state={{ volverA: '/hoy' }} className={styles.capBoton}>
          Cambiar límite diario
        </Link>
      )}
    </>
  )
}
