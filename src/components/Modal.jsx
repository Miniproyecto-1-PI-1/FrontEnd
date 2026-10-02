import { useEffect, useRef } from 'react'
import styles from './Modal.module.css'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select, textarea, [href]'

export default function Modal({ title, children, footer, onClose, wide = false }) {
  const ref = useRef(null)

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previo = document.activeElement
    const first = ref.current.querySelector(FOCUSABLE)
    ;(first ?? ref.current).focus()
    // Escape se escucha en todo el documento: si el foco se pierde (p. ej. un botón que se
    // deshabilita mientras guarda), el modal debe seguir cerrándose con el teclado.
    const onEscape = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('keydown', onEscape)
      previo?.focus?.()
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return
    const items = [...ref.current.querySelectorAll(FOCUSABLE)]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        className={`${styles.modal} ${wide ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
