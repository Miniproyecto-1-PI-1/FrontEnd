import styles from './Avatar.module.css'

export default function Avatar({ user, size = 26 }) {
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, flexBasis: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {user?.foto ? <img src={user.foto} alt="" /> : user?.iniciales}
    </div>
  )
}
