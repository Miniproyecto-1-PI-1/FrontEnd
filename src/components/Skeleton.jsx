import styles from './Skeleton.module.css'

export function Skeleton({ width = '100%', height = 14 }) {
  return <div className={styles.bone} style={{ width, height }} aria-hidden="true" />
}

export function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <Skeleton width="45%" height={11} />
      <Skeleton width="80%" height={16} />
      <Skeleton width="30%" height={26} />
      <Skeleton height={8} />
      <Skeleton width="60%" height={11} />
    </div>
  )
}
