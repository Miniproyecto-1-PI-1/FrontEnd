import Icon from './Icon'
import shared from '../styles/shared.module.css'
import styles from './AccionesTarea.module.css'

/**
 * Las tres acciones de una tarjeta, siempre a la vista: editar, posponer y eliminar.
 * Cada botón es un icono; su nombre aparece en un tooltip al pasar el mouse, al enfocarlo con el teclado o al tocarlo.
 */
export default function AccionesTarea({ nombre, hecha = false, busy = false, onEdit, onPostpone, onDelete }) {
  const acciones = [
    { key: 'editar', label: 'Editar', icon: 'edit', onClick: onEdit, disabled: busy },
    { key: 'posponer', label: 'Posponer', icon: 'postpone', onClick: onPostpone, disabled: busy || hecha },
    { key: 'eliminar', label: 'Eliminar', icon: 'trash', onClick: onDelete, disabled: busy, danger: true },
  ]
  return (
    <div className={styles.acciones} role="group" aria-label={`Acciones de ${nombre}`}>
      {acciones.map((a) => (
        <span key={a.key} className={styles.tip} data-tip={a.label}>
          <button
            type="button"
            className={`${shared.iconbtn} ${shared.iconOnly} ${a.danger ? styles.danger : ''}`}
            aria-label={`${a.label} ${nombre}`}
            disabled={a.disabled}
            onClick={a.onClick}
          >
            <Icon name={a.icon} size={16} />
          </button>
        </span>
      ))}
    </div>
  )
}
