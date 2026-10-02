import styles from './Logo.module.css'

/** Marca de Agendo: mismo dibujo que public/favicon.svg, pero con los colores del tema. */
export function LogoMark({ size = 32 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className={styles.mark}>
      <rect width="32" height="32" rx="7.5" className={styles.bg} />
      <g fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={styles.fg}>
        <rect x="6.5" y="8.5" width="19" height="17" rx="3.2" />
        <path d="M6.5 13.6h19M11.6 5.9v4.6M20.4 5.9v4.6" />
        <path d="M11.8 19.3l2.9 2.9 5.6-5.6" />
      </g>
    </svg>
  )
}

export default function Logo({ size = 32, tagline = false, className = '' }) {
  return (
    <span className={`${styles.logo} ${className}`}>
      <LogoMark size={size} />
      <span className={styles.text}>
        <span className={styles.name} style={{ fontSize: size * 0.62 }}>Agendo</span>
        {tagline && <span className={styles.tagline}>organizador de eventos</span>}
      </span>
    </span>
  )
}
