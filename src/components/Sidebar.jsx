import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const LINKS = [
  { to: '/tareas', icon: '▤', label: 'Tareas' },
  { to: '/eventos', icon: '🗂', label: 'Eventos', end: true },
  { to: '/crear', icon: '＋', label: 'Crear evento' },
  { to: '/configuracion', icon: '⚙', label: 'Configuración' },
]

export default function Sidebar({ user, onLogout }) {
  return (
    <nav className={styles.side}>
      <div className={styles.brand}>
        Organizador<span> de Eventos</span>
      </div>

      {LINKS.map(({ to, icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `${styles.navlink} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.icon}>{icon}</span> {label}
        </NavLink>
      ))}

      <div className={styles.spacer} />
      <div className={styles.foot}>
        <div className={styles.userchip}>
          <div className={styles.avatar}>{user?.avatar ?? 'VA'}</div>
          <span>{user?.nombre ?? 'Valentina'}</span> ·
          <button type="button" className={styles.logout} onClick={onLogout}>
            salir
          </button>
        </div>
      </div>
    </nav>
  )
}
