import { Link, useNavigate } from 'react-router-dom'
import { progresoApi } from '../api/progresoApi'
import { useRequest } from '../hooks/useRequest'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { fmtFecha } from '../utils/date'
import ProgressBar from '../components/ProgressBar'
import StateMessage from '../components/StateMessage'
import { SkeletonCard } from '../components/Skeleton'
import shared from '../styles/shared.module.css'
import styles from './Progreso.module.css'

const tareas = (n) => (n === 1 ? 'tarea' : 'tareas')

const ESTADOS = [
  { key: 'hechas', label: 'Hechas', cls: styles.hechas },
  { key: 'pendientes', label: 'Pendientes', cls: styles.pendientes },
  { key: 'pospuestas', label: 'Pospuestas', cls: styles.pospuestas },
  { key: 'vencidas', label: 'Vencidas', cls: styles.vencidas },
]

function EventoProgreso({ evento }) {
  return (
    <li>
      <Link to={`/eventos/${evento.id}`} className={styles.evento}>
        <div className={styles.eventoHead}>
          <h3>{evento.nombre}</h3>
          <span className={styles.fecha}>{fmtFecha(evento.fecha)}</span>
        </div>
        {evento.total > 0 ? (
          <>
            <div className={styles.barra}>
              <ProgressBar value={evento.porcentaje} label={`Progreso de ${evento.nombre}`} />
              <span className={`${styles.pct} num`}>{evento.porcentaje}%</span>
            </div>
            <p className={styles.conteo}>
              {evento.hechas} de {evento.total} {tareas(evento.total)}
            </p>
            <ul className={styles.estados}>
              {ESTADOS.map((e) => (
                <li key={e.key} className={`${styles.estado} ${e.cls}`}>
                  <span className={styles.punto} aria-hidden="true" />
                  {e.label}
                  <strong className="num">{evento[e.key]}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.conteo}>Sin tareas todavía</p>
        )}
      </Link>
    </li>
  )
}

export default function Progreso() {
  useDocumentTitle('Progreso')
  const navigate = useNavigate()
  const { status, data, reload } = useRequest(() => progresoApi.get())

  let contenido
  if (status === 'loading') {
    contenido = (
      <div className={styles.skeletons} aria-busy="true" aria-label="Cargando progreso">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  } else if (status === 'error') {
    contenido = (
      <StateMessage
        kind="error"
        title="No se pudo cargar tu progreso"
        text="Ha ocurrido un error cargando la información. Inténtalo de nuevo."
        actionLabel="Reintentar"
        onAction={reload}
      />
    )
  } else if (data.eventos.length === 0) {
    contenido = (
      <StateMessage
        title="Aún no tienes eventos"
        text="Crea tu primer evento para ver aquí el avance de su preparación."
        actionLabel="Crear evento"
        onAction={() => navigate('/crear')}
      />
    )
  } else {
    contenido = (
      <>
        <section className={`${shared.cardPanel} ${styles.general}`} aria-label="Avance general">
          <p className={styles.etiqueta}>Avance general</p>
          {data.total > 0 ? (
            <>
              <div className={styles.barra}>
                <ProgressBar value={data.porcentaje} label="Avance general" />
                <span className={`${styles.pct} ${styles.pctGrande} num`}>{data.porcentaje}%</span>
              </div>
              <p className={styles.resumen}>
                <strong className="num">{data.hechas}</strong> de <strong className="num">{data.total}</strong>{' '}
                {tareas(data.total)} hechas
              </p>
            </>
          ) : (
            <p className={styles.resumen}>Todavía no hay tareas en tus eventos.</p>
          )}
        </section>
        <h3 className={styles.subtitulo}>Por evento</h3>
        <ul className={styles.lista}>
          {data.eventos.map((e) => (
            <EventoProgreso key={e.id} evento={e} />
          ))}
        </ul>
      </>
    )
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.contain} ${shared.fixed}`}>
        <div className={shared.viewHead}>
          <h2>Progreso</h2>
        </div>
      </div>
      <div className={shared.scroll}>
        <div className={shared.contain}>{contenido}</div>
      </div>
    </section>
  )
}
