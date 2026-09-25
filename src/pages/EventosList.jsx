import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventsContext'
import { fmtFecha } from '../utils/date'
import shared from '../styles/shared.module.css'
import styles from './EventosList.module.css'

function ProgCard({ evento, cliente, onOpen }) {
  const total = evento.subtareas.length
  const hechas = evento.subtareas.filter((s) => s.estado === 'EJECUTADA').length
  const pct = total ? Math.round((hechas / total) * 100) : 0

  return (
    <button type="button" className={styles.progCard} onClick={onOpen}>
      <div className={styles.meta}>
        {evento.tipo} · {fmtFecha(evento.fecha)}
      </div>
      <h3>{evento.nombre}</h3>
      <div className={styles.pct}>{pct}%</div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.meta}>
        {hechas} de {total} gestiones · {cliente}
      </div>
    </button>
  )
}

export default function EventosList() {
  const navigate = useNavigate()
  const { eventos, getClienteNombre } = useEvents()
  const [q, setQ] = useState('')

  const term = q.trim().toLowerCase()
  const filtrados = term
    ? eventos.filter((e) => e.nombre.toLowerCase().includes(term))
    : eventos

  let contenido
  if (eventos.length === 0) {
    contenido = (
      <div className={shared.empty}>
        Aún no tienes eventos.
        <br />
        <button type="button" className={`${shared.btn} ${styles.emptyBtn}`} onClick={() => navigate('/crear')}>
          Crear tu primer evento
        </button>
      </div>
    )
  } else if (filtrados.length === 0) {
    contenido = <div className={shared.empty}>Ningún evento coincide con "{q}".</div>
  } else {
    contenido = (
      <div className={styles.grid}>
        {filtrados.map((ev) => (
          <ProgCard
            key={ev.id}
            evento={ev}
            cliente={getClienteNombre(ev.clienteId)}
            onOpen={() => navigate(`/eventos/${ev.id}`)}
          />
        ))}
      </div>
    )
  }

  return (
    <section>
      <div className={shared.viewHead}>
        <h2>Eventos</h2>
        <button type="button" className={shared.btn} onClick={() => navigate('/crear')}>
          ＋ Crear evento
        </button>
      </div>
      <div className={shared.ruleNote}>
        Progreso de cada evento. Haz clic en una tarjeta para ver el evento completo con sus gestiones, editables ahí mismo.
      </div>
      <div className={styles.filtros}>
        <input
          type="search"
          placeholder="Buscar evento por nombre"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {contenido}
    </section>
  )
}
