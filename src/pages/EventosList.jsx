import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { useRequest } from '../hooks/useRequest'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { diasHasta, fmtFecha, fmtRelativo } from '../utils/date'
import { TIPOS } from '../data/tipos'
import Icon from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import StateMessage from '../components/StateMessage'
import { SkeletonCard } from '../components/Skeleton'
import Toast from '../components/Toast'
import { TipoBadge } from '../components/Badges'
import shared from '../styles/shared.module.css'
import styles from './EventosList.module.css'

const VISTAS = [
  { key: 'proximos', label: 'Próximos' },
  { key: 'pasados', label: 'Pasados' },
  { key: 'todos', label: 'Todos' },
]

function ProgCard({ evento, onOpen }) {
  const dias = diasHasta(evento.fecha)
  const pasado = dias < 0
  const pronto = dias >= 0 && dias <= 7
  return (
    <button type="button" className={`${styles.progCard} ${pasado ? styles.pasado : ''}`} onClick={onOpen}>
      <div className={styles.metaRow}>
        <span className={styles.fecha}>
          <Icon name="calendar" size={14} />
          {fmtFecha(evento.fecha)}
          <span className={`${styles.relativo} ${pronto ? styles.pronto : ''}`}>· {fmtRelativo(evento.fecha)}</span>
        </span>
        <TipoBadge tipo={evento.tipo} />
      </div>
      <h3>{evento.nombre}</h3>
      {evento.total > 0 ? (
        <>
          <div className={styles.progRow}>
            <ProgressBar value={evento.progreso} label={`Progreso de ${evento.nombre}`} />
            <span className={`${styles.pct} num`}>{evento.progreso}%</span>
          </div>
          <p className={styles.meta}>
            {evento.hechas} de {evento.total} {evento.total === 1 ? 'gestión' : 'gestiones'}
          </p>
        </>
      ) : (
        <p className={styles.meta}>Sin gestiones todavía</p>
      )}
      {evento.clienteNombre && <p className={styles.meta}>Cliente: {evento.clienteNombre}</p>}
    </button>
  )
}

export default function EventosList() {
  useDocumentTitle('Eventos')
  const navigate = useNavigate()
  const location = useLocation()
  const { status, data: eventos, reload } = useRequest(() => eventosApi.list())
  const [q, setQ] = useState('')
  const [vista, setVista] = useState('proximos')
  const [tipo, setTipo] = useState('')
  const [toast, setToast] = useState(location.state?.toast ?? null)
  const cerrarToast = useCallback(() => setToast(null), [])

  const filtrados = useMemo(() => {
    if (!eventos) return []
    const term = q.trim().toLowerCase()
    const lista = eventos.filter((e) => {
      const futuro = diasHasta(e.fecha) >= 0
      if (vista === 'proximos' && !futuro) return false
      if (vista === 'pasados' && futuro) return false
      if (tipo && e.tipo !== tipo) return false
      return !term || e.nombre.toLowerCase().includes(term)
    })
    // Próximos del más cercano al más lejano; pasados del más reciente al más antiguo.
    return lista.sort((a, b) => {
      const fa = diasHasta(a.fecha) >= 0
      const fb = diasHasta(b.fecha) >= 0
      if (fa !== fb) return fa ? -1 : 1
      return fa ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha)
    })
  }, [eventos, q, vista, tipo])

  const hayFiltros = q.trim() || tipo
  const limpiar = () => {
    setQ('')
    setTipo('')
  }

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
        title="No se pudieron cargar los eventos"
        text="Ha ocurrido un error cargando la información. Inténtalo de nuevo."
        actionLabel="Reintentar"
        onAction={reload}
      />
    )
  } else if (eventos.length === 0) {
    contenido = (
      <StateMessage
        title="Aún no tienes eventos"
        text="Crea tu primer evento y organiza sus gestiones en un solo lugar."
        actionLabel="Crear tu primer evento"
        onAction={() => navigate('/crear')}
      />
    )
  } else if (filtrados.length === 0) {
    contenido = hayFiltros ? (
      <StateMessage
        title="Ningún evento coincide con tu búsqueda"
        actionLabel="Limpiar filtros"
        onAction={limpiar}
      />
    ) : (
      <StateMessage
        title={vista === 'proximos' ? 'No tienes eventos próximos' : 'No tienes eventos pasados'}
        actionLabel={vista === 'proximos' ? 'Crear evento' : 'Ver todos'}
        onAction={vista === 'proximos' ? () => navigate('/crear') : () => setVista('todos')}
      />
    )
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
          <Icon name="plus" size={18} /> Crear evento
        </button>
      </div>
      {status === 'success' && eventos.length > 0 && (
        <div className={`${styles.filtros} ${shared.fixed}`}>
          <div className={styles.segmented} role="group" aria-label="Mostrar eventos">
            {VISTAS.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={vista === v.key}
                className={vista === v.key ? styles.segActivo : ''}
                onClick={() => setVista(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className={styles.search}>
            <Icon name="search" size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Buscar por nombre"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar evento por nombre"
            />
          </div>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className={shared.scroll}>{contenido}</div>
      {toast && <Toast message={toast} onDone={cerrarToast} />}
    </section>
  )
}
