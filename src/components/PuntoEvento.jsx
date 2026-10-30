import { maticeEvento } from '../utils/colorEvento'
import styles from './PuntoEvento.module.css'

/** Puntito de color que identifica a un evento. Es decorativo: el nombre del evento siempre va al lado. */
export default function PuntoEvento({ id }) {
  return <span className={styles.punto} style={{ '--h': maticeEvento(id) }} data-matiz={maticeEvento(id)} aria-hidden="true" />
}
