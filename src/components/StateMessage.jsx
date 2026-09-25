import shared from '../styles/shared.module.css'
import styles from './StateMessage.module.css'

function Icon({ kind }) {
  if (kind === 'error') {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" role="img" aria-label="Error al cargar datos">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.6" r="1.1" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V18c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z M12 6v12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StateMessage({ kind = 'empty', title, text, actionLabel, onAction }) {
  return (
    <div className={styles.box} role={kind === 'error' ? 'alert' : 'status'}>
      <div className={`${styles.icon} ${kind === 'error' ? styles.iconError : ''}`}>
        <Icon kind={kind} />
      </div>
      <p className={styles.title}>{title}</p>
      {text && <p className={styles.text}>{text}</p>}
      {actionLabel && (
        <button type="button" className={`${shared.btn} ${shared.btnSm} ${styles.action}`} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
