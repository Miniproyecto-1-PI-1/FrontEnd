import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import styles from './Sidebar.module.css'

const LINKS = [
  { to: '/tareas', icon: '▤', label: 'Tareas' },
  { to: '/eventos', icon: '🗂', label: 'Eventos' },
  { to: '/crear', icon: '＋', label: 'Crear evento' },
]

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector('button')?.focus()
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
    <div className={styles.userMenu} ref={ref}>
      <button
        type="button"
        className={`${styles.userchip} ${open ? styles.userchipOpen : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar user={user} />
        <span className={styles.userName}>{user?.nombre}</span>
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <button type="button" role="menuitem" className={styles.menuItem}
            onClick={() => {
              setOpen(false)
              navigate('/configuracion')
            }}>
            <span className={styles.icon}>⚙</span> Configuración
          </button>
          <button type="button" role="menuitem" className={`${styles.menuItem} ${styles.menuDanger}`}
            onClick={onLogout}>
            <span className={styles.icon}>⎋</span> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ user, onLogout }) {
  return (
    <nav className={styles.side}>
      <div className={styles.brand}>
        Organizador<span> de Eventos</span>
      </div>

      {LINKS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `${styles.navlink} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.icon}>{icon}</span> {label}
        </NavLink>
      ))}

      <div className={styles.spacer} />
      <div className={styles.foot}>
        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </nav>
  )
}
