import { useTheme } from '../hooks/useTheme'
import Icon from './Icon'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const oscuro = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={oscuro}
      aria-label="Modo oscuro"
      title={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`${styles.toggle} ${className}`}
      onClick={toggle}
    >
      <span className={styles.track}>
        <Icon name="sun" size={14} className={styles.sun} />
        <Icon name="moon" size={14} className={styles.moon} />
        <span className={styles.thumb} />
      </span>
    </button>
  )
}
