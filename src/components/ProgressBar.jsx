import styles from './ProgressBar.module.css'

export default function ProgressBar({ value }) {
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${value}%` }} />
    </div>
  )
}
