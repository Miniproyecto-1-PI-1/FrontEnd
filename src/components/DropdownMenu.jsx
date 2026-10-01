import { useEffect, useRef, useState } from 'react'
import styles from './DropdownMenu.module.css'

/**
 * Botón que abre un menú. `trigger` recibe { open, props } para pintar el botón;
 * `items` son { label, icon, onSelect, danger }.
 */
export default function DropdownMenu({ trigger, items, placement = 'bottom-end', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    ref.current?.querySelector('[role="menuitem"]')?.focus()
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector('[aria-haspopup]')?.focus()
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const opts = [...ref.current.querySelectorAll('[role="menuitem"]')]
        const i = opts.indexOf(document.activeElement)
        const next = e.key === 'ArrowDown' ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length
        opts[next]?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`${styles.wrap} ${className}`} ref={ref}>
      {trigger({
        open,
        props: {
          type: 'button',
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          onClick: () => setOpen((o) => !o),
        },
      })}
      {open && (
        <div className={`${styles.menu} ${styles[placement]}`} role="menu">
          {items.map(({ label, icon, onSelect, danger }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              className={`${styles.item} ${danger ? styles.danger : ''}`}
              onClick={() => {
                setOpen(false)
                onSelect()
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
