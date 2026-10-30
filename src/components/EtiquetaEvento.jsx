import { Link } from 'react-router-dom'
import { maticeEvento } from '../utils/colorEvento'
import styles from './EtiquetaEvento.module.css'

/**
 * Nombre del evento en una etiqueta de color pastel (cada evento tiene el suyo) con la letra en un tono más oscuro.
 * Con `to` es un enlace al evento; con `grande` sirve para títulos.
 */
export default function EtiquetaEvento({ id, nombre, to, grande = false }) {
  const props = {
    className: `${styles.etiqueta} ${grande ? styles.grande : ''}`,
    style: { '--h': maticeEvento(id) },
    'data-matiz': maticeEvento(id),
    title: nombre,
  }
  return to ? (
    <Link to={to} {...props}>
      {nombre}
    </Link>
  ) : (
    <span {...props}>{nombre}</span>
  )
}
