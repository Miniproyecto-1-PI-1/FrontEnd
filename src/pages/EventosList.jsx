import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { useRequest } from '../hooks/useRequest'
import { fmtFecha } from '../utils/date'
import ProgressBar from '../components/ProgressBar'
import StateMessage from '../components/StateMessage'
import { SkeletonCard } from '../components/Skeleton'
import Toast from '../components/Toast'
import { TipoBadge } from '../components/Badges'
import shared from '../styles/shared.module.css'
import styles from './EventosList.module.css'

function ProgCard({ evento, onOpen }) {
  return (
    <button type="button" className={styles.progCard} onClick={onOpen}>
      <div className={styles.metaRow}>
        <span className={styles.meta}>{fmtFecha(evento.fecha)}</span>
        <TipoBadge tipo={evento.tipo} />
      </div>
      <h3>{evento.nombre}</h3>
      <div className={styles.pct}>{evento.progreso}%</div>
      <ProgressBar value={evento.progreso} />
      <div className={styles.meta}>
        {evento.hechas} de {evento.total} gestiones{evento.clienteNombre ? ` · ${evento.clienteNombre}` : ''}
      </div>
    </button>
  )
}

export default function EventosList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { status, data: eventos, reload } = useRequest(() => eventosApi.list())
  const [q, setQ] = useState('')
  const [toast, setToast] = useState(location.state?.toast ?? null)
  const cerrarToast = useCallback(() => setToast(null), [])

  const term = q.trim().toLowerCase()
  const filtrados = eventos && term ? eventos.filter((e) => e.nombre.toLowerCase().includes(term)) : eventos

  let contenido
  if (status === 'loading') {
    contenido = (
      <div className={styles.grid} aria-busy="true" aria-label="Cargando eventos">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  } else if (status === 'error') {
    contenido = (
      <StateMessage
        kind="error"
        title="Error cargando los eventos"
        text="Ha ocurrido un error cargando la información, inténtalo de nuevo."
        actionLabel="Reintentar"
        onAction={reload}
      />
    )
  } else if (eventos.length === 0) {
    contenido = (
      <StateMessage
        title="Aún no tienes eventos."
        actionLabel="Crear tu primer evento"
        onAction={() => navigate('/crear')}
      />
    )
  } else if (filtrados.length === 0) {
    contenido = <div className={shared.empty}>Ningún evento coincide con "{q}".</div>
  } else {
    contenido = (
      <div className={styles.grid}>
        {filtrados.map((ev) => (
          <ProgCard key={ev.id} evento={ev} onOpen={() => navigate(`/eventos/${ev.id}`)} />
        ))}
      </div>
    )
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>Eventos</h2>
        <button type="button" className={shared.btn} onClick={() => navigate('/crear')}>
          ＋ Crear evento
        </button>
      </div>
      <div className={`${shared.ruleNote} ${shared.fixed}`}>
        Progreso de cada evento. Haz clic en una tarjeta para ver el evento completo con sus gestiones.
      </div>
      <div className={`${styles.filtros} ${shared.fixed}`}>
        <input
          type="search"
          placeholder="Buscar evento por nombre"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar evento por nombre"
        />
      </div>
      <div className={shared.scroll}>{contenido}</div>
      {toast && <Toast message={toast} onDone={cerrarToast} />}
    </section>
  )
}
