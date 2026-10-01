import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import shared from '../styles/shared.module.css'
import styles from './NotFound.module.css'

/** Calendario con una hoja suelta y un signo de pregunta: "esto no está en la agenda". */
function Ilustracion() {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" aria-hidden="true" className={styles.ilustracion}>
      <ellipse cx="80" cy="128" rx="54" ry="7" className={styles.sombra} />
      <g className={styles.flota}>
        <rect x="30" y="26" width="100" height="90" rx="14" className={styles.hoja} />
        <path d="M30 52h100" className={styles.trazo} />
        <path d="M58 16v18M102 16v18" className={styles.argolla} />
        <path
          d="M68 72c0-7 5.5-12 12-12s12 5 12 11c0 8-12 9-12 17"
          className={styles.pregunta}
        />
        <circle cx="80" cy="100" r="3.6" className={styles.punto} />
      </g>
    </svg>
  )
}

/**
 * Página "no encontrado". Sirve para rutas desconocidas y para recursos que no existen
 * (p. ej. un evento borrado): `titulo` y `texto` cambian el mensaje.
 */
export default function NotFound({
  titulo = 'Esta página no está en la agenda',
  texto = 'Puede que el enlace esté mal escrito o que la página ya no exista.',
  docTitle = 'Página no encontrada',
}) {
  useDocumentTitle(docTitle)
  const { user } = useAuth()
  const navigate = useNavigate()
  // Sin historial previo (enlace abierto en una pestaña nueva) "Volver" no tiene a dónde ir.
  const puedeVolver = window.history.state?.idx > 0

  return (
    <div className={styles.wrap}>
      <Ilustracion />
      <p className={styles.codigo}>Error 404</p>
      <h1 className={styles.titulo}>{titulo}</h1>
      <p className={styles.texto}>{texto}</p>
      <div className={styles.acciones}>
        <Link to={user ? '/eventos' : '/login'} className={shared.btn}>
          {user ? (
            <>
              <Icon name="calendar" size={18} /> Ir a mis eventos
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Link>
        {puedeVolver && (
          <button type="button" className={`${shared.btn} ${shared.ghost}`} onClick={() => navigate(-1)}>
            <Icon name="arrowLeft" size={18} /> Volver atrás
          </button>
        )}
      </div>
    </div>
  )
}

/** Envoltorio para visitantes sin sesión: logo y switch de tema, sin el sidebar. */
export function PublicShell({ children }) {
  return (
    <div className={styles.public}>
      <header className={styles.publicHead}>
        <Link to="/login" className={styles.logoLink} aria-label="Agendo, ir al inicio">
          <Logo size={30} />
        </Link>
        <ThemeToggle />
      </header>
      <main className={styles.publicMain}>{children}</main>
    </div>
  )
}
