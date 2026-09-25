import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

export default function Layout({ user, onLogout }) {
  return (
    <div className={styles.app}>
      <Sidebar user={user} onLogout={onLogout} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
