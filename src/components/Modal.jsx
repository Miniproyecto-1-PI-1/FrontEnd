import { useEffect, useRef } from 'react'
import styles from './Modal.module.css'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select, textarea, [href]'

export default function Modal({ title, children, footer, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const previo = document.activeElement
    const first = ref.current.querySelector(FOCUSABLE)
    ;(first ?? ref.current).focus()
    return () => previo?.focus?.()
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
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
        className={styles.modal}
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
