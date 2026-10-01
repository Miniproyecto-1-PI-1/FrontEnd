import { Children, cloneElement, isValidElement, useId } from 'react'
import styles from './FormField.module.css'

/**
 * Etiqueta + control + ayuda/error, enlazados para lectores de pantalla.
 * Inyecta id, aria-invalid y aria-describedby en el único control hijo.
 */
export default function FormField({ label, required, optional, hint, error, className = '', children }) {
  const id = useId()
  const descId = `${id}-desc`
  const describe = error || hint
  const child = Children.only(children)
  const control = isValidElement(child)
    ? cloneElement(child, {
        id: child.props.id ?? id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describe ? descId : undefined,
        'aria-required': required || undefined,
      })
    : child

  return (
    <div className={`${styles.field} ${error ? styles.error : ''} ${className}`}>
      <label htmlFor={child.props?.id ?? id}>
        {label}
        {required && <span className={styles.req} aria-hidden="true">*</span>}
        {optional && <span className={styles.optional}> (opcional)</span>}
      </label>
      {control}
      {error ? (
        <span id={descId} className={styles.errorMsg}>{error}</span>
      ) : (
        hint && <span id={descId} className={styles.hint}>{hint}</span>
      )}
    </div>
  )
}

/** Grupo de varios controles bajo una sola etiqueta (p. ej. hora de inicio y fin). */
export function FormGroup({ legend, error, className = '', children }) {
  const id = useId()
  return (
    <fieldset
      className={`${styles.field} ${styles.group} ${error ? styles.error : ''} ${className}`}
      aria-describedby={error ? `${id}-err` : undefined}
    >
      <legend>{legend}</legend>
      {children}
      {error && <span id={`${id}-err`} className={styles.errorMsg}>{error}</span>}
    </fieldset>
  )
}
