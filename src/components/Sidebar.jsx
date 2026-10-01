import { NavLink, useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import DropdownMenu from './DropdownMenu'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'
import styles from './Sidebar.module.css'

const LINKS = [{ to: '/eventos', icon: 'calendar', label: 'Eventos' }]

function UserMenu({ user, onLogout }) {
  const navigate = useNavigate()
  return (
    <DropdownMenu
      placement="top-start"
      className={styles.userMenu}
      trigger={({ open, props }) => (
        <button {...props} className={`${styles.userchip} ${open ? styles.userchipOpen : ''}`}>
          <Avatar user={user} size={30} />
          <span className={styles.userName}>{user?.nombre}</span>
          <Icon name="chevronDown" size={16} className={styles.caret} />
        </button>
      )}
      items={[
        { label: 'Configuración', icon: <Icon name="settings" size={16} />, onSelect: () => navigate('/configuracion') },
        { label: 'Cerrar sesión', icon: <Icon name="logout" size={16} />, onSelect: onLogout, danger: true },
      ]}
    />
  )
}

export default function Sidebar({ user, onLogout }) {
  return (
    <nav className={styles.side} aria-label="Principal">
      <div className={styles.brand}>
        Organizador <span>de Eventos</span>
      </div>

      {LINKS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `${styles.navlink} ${isActive ? styles.active : ''}`}
        >
          <Icon name={icon} size={18} /> {label}
        </NavLink>
      ))}

      <div className={styles.spacer} />
      <div className={styles.foot}>
        <div className={styles.themeRow}>
          <span className={styles.themeLabel}>Modo oscuro</span>
          <ThemeToggle />
        </div>
        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </nav>
  )
}
