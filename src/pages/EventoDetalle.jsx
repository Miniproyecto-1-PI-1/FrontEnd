import { Link, useNavigate, useParams } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { useRequest } from '../hooks/useRequest'
import { fmtFecha, fmtFechaLarga, hoyISO } from '../utils/date'
import ProgressBar from '../components/ProgressBar'
import StateMessage from '../components/StateMessage'
import { Skeleton } from '../components/Skeleton'
import { EstadoBadge, TipoBadge } from '../components/Badges'
import shared from '../styles/shared.module.css'
import styles from './EventoDetalle.module.css'

const estadoDe = (g) => (g.estado === 'PENDIENTE' && g.plazo < hoyISO() ? 'VENCIDA' : g.estado)

function Contenido({ id }) {
  const navigate = useNavigate()
  const { status, data: ev, error, reload } = useRequest(() => eventosApi.get(id))

  const volver = (
    <div className={`${shared.breadcrumb} ${shared.fixed}`}>
      <Link to="/eventos">← Volver a eventos</Link>
    </div>
  )

  if (status === 'loading') {
    return (
      <section className={shared.page}>
        {volver}
        <div className={`${shared.viewHead} ${shared.fixed}`}>
          <Skeleton width={260} height={28} />
        </div>
        <div className={shared.scroll} aria-busy="true" aria-label="Cargando evento">
          <div className={styles.card}>
            <Skeleton height={14} />
            <Skeleton width="70%" height={14} />
            <Skeleton width="40%" height={14} />
          </div>
        </div>
      </section>
    )
  }

  if (status === 'error') {
    const noExiste = error?.status === 404
    return (
      <section className={shared.page}>
        {volver}
        <div className={`${shared.viewHead} ${shared.fixed}`}>
          <h2>Detalle del evento</h2>
        </div>
        <div className={shared.scroll}>
          {noExiste ? (
            <StateMessage
              kind="error"
              title="No se ha podido cargar el evento"
              text="El evento no existe o ya no está disponible."
              actionLabel="Volver a eventos"
              onAction={() => navigate('/eventos')}
            />
          ) : (
            <StateMessage
              kind="error"
              title="No se ha podido cargar el evento"
              text="Ha ocurrido un error cargando la información, inténtalo de nuevo."
              actionLabel="Reintentar"
              onAction={reload}
            />
          )}
        </div>
      </section>
    )
  }

  return (
    <section className={shared.page}>
      {volver}
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>{ev.nombre}</h2>
        <TipoBadge tipo={ev.tipo} />
      </div>

      <div className={shared.scroll}>
        <div className={styles.card}>
          <dl className={styles.info}>
            <div>
              <dt>Fecha</dt>
              <dd className={styles.cap}>{fmtFechaLarga(ev.fecha)}</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd>{ev.hora || 'Sin definir'}</dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>{ev.lugar}</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>
                {ev.cliente ? ev.cliente.nombre : 'Sin cliente'}
                {ev.cliente && (ev.cliente.telefono || ev.cliente.correo) && (
                  <span className={styles.sub}>
                    {[ev.cliente.telefono, ev.cliente.correo].filter(Boolean).join(' · ')}
                  </span>
                )}
              </dd>
            </div>
          </dl>
          {ev.descripcion && <p className={styles.desc}>{ev.descripcion}</p>}
        </div>

        <div className={styles.card}>
          <div className={styles.progHead}>
            <h3>Progreso</h3>
            <span className={styles.pct}>{ev.progreso}%</span>
          </div>
          <ProgressBar value={ev.progreso} />
          <span className={styles.sub}>
            {ev.hechas} de {ev.total} gestiones ejecutadas
          </span>
        </div>

        <h3 className={styles.sectionTitle}>Plan logístico</h3>
        {ev.subtareas.length === 0 ? (
          <StateMessage title="Este evento aún no tiene gestiones." />
        ) : (
          <ul className={styles.list}>
            {ev.subtareas.map((g) => (
              <li key={g.id} className={styles.gestion}>
                <div className={styles.gHead}>
                  <strong>{g.nombre}</strong>
                  <EstadoBadge estado={estadoDe(g)} />
                </div>
                {g.descripcion && <p className={styles.gDesc}>{g.descripcion}</p>}
                <div className={styles.gMeta}>
                  <span>Plazo: {fmtFecha(g.plazo)}</span>
                  {g.horaInicio && g.horaFin && (
                    <span>
                      {g.horaInicio} – {g.horaFin}
                    </span>
                  )}
                  <span className="num">{g.horas}h estimadas</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default function EventoDetalle() {
  const { id } = useParams()
  return <Contenido key={id} id={id} />
}
