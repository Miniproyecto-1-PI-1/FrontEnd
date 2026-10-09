import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { hoyApi } from '../api/hoyApi'
import { ApiError } from '../api/http'
import { useRequest } from '../hooks/useRequest'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { fmtFecha, fmtFechaLarga, fmtRelativo, hoyISO } from '../utils/date'
import { erroresGestionDeApi, esConflicto } from '../utils/gestion'
import { ConflictoSobrecargaModal, MoverDiaModal, ReducirHorasModal } from '../components/ConflictoModals'
import Icon from '../components/Icon'
import DropdownMenu from '../components/DropdownMenu'
import StateMessage from '../components/StateMessage'
import { SkeletonCard } from '../components/Skeleton'
import Toast from '../components/Toast'
import { EstadoBadge } from '../components/Badges'
import { EditarGestionModal, EliminarModal, ErrorModal, ReprogramarModal } from '../components/GestionModals'
import shared from '../styles/shared.module.css'
import styles from './Hoy.module.css'

const GRUPOS = [
  { key: 'vencidas', titulo: 'Vencidas', icon: 'x', cls: styles.vencidas, vacio: 'Sin gestiones vencidas.' },
  { key: 'hoy', titulo: 'Para hoy', icon: 'clock', cls: styles.hoy, vacio: 'Sin gestiones para hoy.' },
  { key: 'proximas', titulo: 'Próximas', icon: 'calendar', cls: styles.proximas, vacio: 'Sin gestiones próximas.' },
]

// El backend ya entrega vencidas/próximas ordenadas por plazo (y horas, como empate). Dentro de "Hoy",
// mientras no incluya hora de inicio en el orden, se reordena aquí por la más próxima en el reloj.
const porUrgencia = (a, b) => (a.horaInicio || '99:99').localeCompare(b.horaInicio || '99:99') || a.horas - b.horas

// "Vencida" se muestra solo si el backend la clasificó como tal (categoria) y sigue sin ejecutar.
const estadoVista = (t) => (t.categoria === 'VENCIDA' && t.estado !== 'EJECUTADA' ? 'VENCIDA' : t.estado)

function TaskRow({ tarea, busy, onToggle, onEdit, onPostpone, onDelete }) {
  const estado = estadoVista(tarea)
  const hecha = tarea.estado === 'EJECUTADA'
  return (
    <li className={`${styles.tarea} ${hecha ? styles.hecha : ''}`}>
      <input
        type="checkbox"
        id={`t-${tarea.id}`}
        className={styles.check}
        checked={hecha}
        disabled={busy}
        onChange={onToggle}
      />
      <div className={styles.tMain}>
        <label htmlFor={`t-${tarea.id}`} className={styles.tNombre}>
          {tarea.nombre}
        </label>
        <Link to={`/eventos/${tarea.eventoId}`} className={styles.tEvento}>
          {tarea.eventoNombre}
        </Link>
        <div className={styles.tMeta}>
          <span className={estado === 'VENCIDA' ? styles.tVenc : undefined}>
            <Icon name="calendar" size={14} /> {fmtFecha(tarea.plazo)} · {fmtRelativo(tarea.plazo)}
          </span>
          {tarea.horaInicio && tarea.horaFin && (
            <span>
              <Icon name="clock" size={14} /> {tarea.horaInicio}–{tarea.horaFin}
            </span>
          )}
          <span className={`${styles.horas} num`}>{tarea.horas} h</span>
        </div>
      </div>
      <div className={styles.tSide}>
        <EstadoBadge estado={estado} />
        <button
          type="button"
          className={`${shared.iconbtn} ${shared.iconOnly}`}
          aria-label={`Editar ${tarea.nombre}`}
          title="Editar"
          disabled={busy}
          onClick={onEdit}
        >
          <Icon name="edit" size={16} />
        </button>
        <DropdownMenu
          trigger={({ props }) => (
            <button
              {...props}
              className={`${shared.iconbtn} ${shared.iconOnly}`}
              aria-label={`Más acciones para ${tarea.nombre}`}
              title="Más acciones"
              disabled={busy}
            >
              <Icon name="more" size={16} />
            </button>
          )}
          items={[
            ...(hecha ? [] : [{ label: 'Reprogramar', icon: <Icon name="calendar" size={16} />, onSelect: onPostpone }]),
            { label: 'Eliminar', icon: <Icon name="trash" size={16} />, danger: true, onSelect: onDelete },
          ]}
        />
      </div>
    </li>
  )
}

function Grupo({ grupo, tareas, ...acciones }) {
  if (tareas.length === 0) return null
  return (
    <section className={`${styles.grupo} ${grupo.cls}`} aria-labelledby={`grupo-${grupo.key}`}>
      <div className={styles.grupoHead}>
        <Icon name={grupo.icon} size={16} />
        <h3 id={`grupo-${grupo.key}`}>{grupo.titulo}</h3>
        <span className={`${styles.count} num`}>{tareas.length}</span>
      </div>
      <ul className={styles.lista}>
        {tareas.map((t) => (
          <TaskRow
            key={t.id}
            tarea={t}
            busy={acciones.busy}
            onToggle={() => acciones.onToggle(t)}
            onEdit={() => acciones.onEdit(t)}
            onPostpone={() => acciones.onPostpone(t)}
            onDelete={() => acciones.onDelete(t)}
          />
        ))}
      </ul>
    </section>
  )
}

export default function Hoy() {
  useDocumentTitle('Hoy')
  const navigate = useNavigate()
  const { status, data: tareas, reload, refresh, mutate } = useRequest(() => hoyApi.list())
  const [q, setQ] = useState('')
  const [eventoId, setEventoId] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('pendientes')
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const cerrarToast = useCallback(() => setToast(null), [])
  const cerrarModal = () => !busy && setModal(null)

  const eventos = useMemo(() => {
    const vistos = new Map()
    for (const t of tareas ?? []) vistos.set(t.eventoId, t.eventoNombre)
    return [...vistos.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [tareas])

  const hoyISOv = hoyISO()
  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (tareas ?? []).filter((t) => {
      if (eventoId && String(t.eventoId) !== eventoId) return false
      if (estadoFiltro === 'pendientes' && t.estado === 'EJECUTADA') return false
      if (estadoFiltro === 'pospuestas' && t.estado !== 'POSPUESTA') return false
      if (!term) return true
      return t.nombre.toLowerCase().includes(term) || t.eventoNombre.toLowerCase().includes(term)
    })
  }, [tareas, q, eventoId, estadoFiltro])

  const grupos = useMemo(
    () => ({
      vencidas: filtradas.filter((t) => t.categoria === 'VENCIDA'),
      hoy: filtradas.filter((t) => t.categoria === 'HOY').sort(porUrgencia),
      proximas: filtradas.filter((t) => t.categoria === 'PROXIMA'),
    }),
    [filtradas],
  )

  const horasHoy = useMemo(
    () =>
      Math.round(
        (tareas ?? [])
          .filter((t) => t.categoria === 'HOY' && t.estado !== 'EJECUTADA')
          .reduce((s, t) => s + t.horas, 0) * 100,
      ) / 100,
    [tareas],
  )

  // "Pendientes" es la vista inicial (a modo de to-do list); limpiar filtros muestra todo, sin estado por defecto.
  const hayFiltros = q.trim() || eventoId || estadoFiltro !== 'todas'
  const limpiarFiltros = () => {
    setQ('')
    setEventoId('')
    setEstadoFiltro('todas')
  }

  // Refleja el cambio de una gestión de inmediato (también su grupo) y luego confirma con el servidor.
  const aplicarLocal = (t, cambios) => {
    const plazo = cambios.plazo ?? t.plazo
    const hoy = hoyISO()
    mutate((lista) =>
      lista.map((x) =>
        x.id === t.id
          ? {
              ...x,
              ...cambios,
              plazo,
              horas: Number(cambios.horas ?? x.horas),
              categoria: plazo < hoy ? 'VENCIDA' : plazo === hoy ? 'HOY' : 'PROXIMA',
            }
          : x,
      ),
    )
  }

  const ejecutar = async (accion, okMsg, verbo, ctx) => {
    setBusy(true)
    try {
      await accion()
      if (ctx) aplicarLocal(ctx.gestion, ctx.cambios)
      setModal(null)
      setToast(okMsg)
      refresh()
    } catch (err) {
      if (ctx && esConflicto(err)) {
        setModal({ kind: 'conflicto', ...ctx, verbo, mensaje: err.message, overload: err.overload })
      } else {
        setModal({ kind: 'error', verbo, mensaje: err instanceof ApiError && err.status !== 500 ? err.message : null })
      }
    } finally {
      setBusy(false)
    }
  }

  const guardar = (t, cambios, okMsg, verbo) =>
    ejecutar(() => eventosApi.updateGestion(t.eventoId, { ...t, ...cambios }), okMsg, verbo, { gestion: t, cambios })

  const editarGestion = async (t, cambios) => {
    setBusy(true)
    try {
      await eventosApi.updateGestion(t.eventoId, { ...t, ...cambios })
      aplicarLocal(t, cambios)
      setModal(null)
      setToast('Gestión editada correctamente.')
      refresh()
      return null
    } catch (err) {
      if (esConflicto(err)) {
        setModal({ kind: 'conflicto', gestion: t, cambios, verbo: 'editar', mensaje: err.message, overload: err.overload })
        return null
      }
      if (err instanceof ApiError && err.status === 400) return erroresGestionDeApi(err.fieldErrors)
      setModal({ kind: 'error', verbo: 'editar', mensaje: err.message })
      return null
    } finally {
      setBusy(false)
    }
  }

  // Devuelve el error de fecha del servidor (si lo hay) para mostrarlo junto al campo del modal.
  const reprogramar = async (t, plazo) => {
    const cambios = { plazo, estado: 'POSPUESTA' }
    setBusy(true)
    try {
      await eventosApi.updateGestion(t.eventoId, { ...t, ...cambios })
      aplicarLocal(t, cambios)
      setModal(null)
      setToast({ titulo: 'Gestión reprogramada', detalle: `«${t.nombre}» quedó para el ${fmtFecha(plazo)}.` })
      refresh()
      return null
    } catch (err) {
      if (esConflicto(err)) {
        setModal({ kind: 'conflicto', gestion: t, cambios, verbo: 'reprogramar', mensaje: err.message, overload: err.overload })
        return null
      }
      if (err instanceof ApiError && err.status === 400 && err.fieldErrors?.dueDate) return err.fieldErrors.dueDate
      setModal({ kind: 'error', verbo: 'reprogramar', mensaje: err instanceof ApiError && err.status !== 500 ? err.message : null })
      return null
    } finally {
      setBusy(false)
    }
  }

  const toggleHecha = (t) => {
    const hecha = t.estado === 'EJECUTADA'
    guardar(t, { estado: hecha ? 'PENDIENTE' : 'EJECUTADA' }, hecha ? 'Gestión reabierta.' : 'Gestión marcada como hecha.', 'actualizar')
  }

  const hoyLargo = fmtFechaLarga(hoyISOv)
  const [diaSemana, resto] = hoyLargo.split(', ')

  let contenido
  if (status === 'loading') {
    contenido = (
      <div className={styles.skeletons} aria-busy="true" aria-label="Cargando gestiones">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  } else if (status === 'error') {
    contenido = (
      <StateMessage
        kind="error"
        title="No se pudieron cargar tus gestiones"
        text="Ha ocurrido un error cargando la información. Inténtalo de nuevo."
        actionLabel="Reintentar"
        onAction={reload}
      />
    )
  } else if (tareas.length === 0) {
    contenido = (
      <StateMessage
        title="No tienes gestiones todavía"
        text="Las gestiones aparecen aquí apenas las añadas a un evento."
        actionLabel="Ir a eventos"
        onAction={() => navigate('/eventos')}
      />
    )
  } else if (grupos.vencidas.length === 0 && grupos.hoy.length === 0 && grupos.proximas.length === 0) {
    contenido = (
      <StateMessage
        title="Ninguna gestión coincide con los filtros"
        actionLabel="Limpiar filtros"
        onAction={limpiarFiltros}
      />
    )
  } else {
    contenido = GRUPOS.map((g) => (
      <Grupo
        key={g.key}
        grupo={g}
        tareas={grupos[g.key]}
        busy={busy}
        onToggle={toggleHecha}
        onEdit={(t) => setModal({ kind: 'edit', t })}
        onPostpone={(t) => setModal({ kind: 'postpone', t })}
        onDelete={(t) => setModal({ kind: 'delete', t })}
      />
    ))
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>Hoy</h2>
        <div className={styles.widgets}>
          <div className={styles.capWidget}>
            <span className={styles.capLabel}>Horas pendientes hoy</span>
            <span className={`${styles.capValue} num`}>{horasHoy} h</span>
          </div>
          <div className={styles.dateWidget}>
            <span className={styles.dateCaption}>{diaSemana}</span>
            <span className={styles.dateMain}>{resto}</span>
          </div>
        </div>
      </div>

      {status === 'success' && tareas.length > 0 && (
        <div className={`${styles.filtros} ${shared.fixed}`}>
          <div className={styles.search}>
            <Icon name="search" size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Buscar por nombre de gestión o evento"
              aria-label="Buscar gestión"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select value={eventoId} onChange={(e) => setEventoId(e.target.value)} aria-label="Filtrar por evento">
            <option value="">Todos los eventos</option>
            {eventos.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} aria-label="Filtrar por estado">
            <option value="pendientes">Estado: Pendientes</option>
            <option value="pospuestas">Estado: Pospuestas</option>
            <option value="todas">Estado: Todas</option>
          </select>
          <button
            type="button"
            className={`${shared.iconbtn} ${shared.iconOnly}`}
            aria-label="Limpiar filtros"
            title="Limpiar filtros"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {status === 'success' && tareas.length > 0 && (
        <div className={`${styles.note} ${shared.fixed}`}>
          Ordenado por: Vencidas (antigüedad), Para hoy (urgencia), Próximas (fecha). Empates por menor esfuerzo estimado.
        </div>
      )}

      <div className={shared.scroll}>{contenido}</div>

      {modal?.kind === 'edit' && (
        <EditarGestionModal
          gestion={modal.t}
          fechaEvento={modal.t.fechaEvento}
          busy={busy}
          onClose={cerrarModal}
          onSave={(cambios) => editarGestion(modal.t, cambios)}
        />
      )}
      {modal?.kind === 'postpone' && (
        <ReprogramarModal
          gestion={modal.t}
          fechaEvento={modal.t.fechaEvento}
          busy={busy}
          onClose={cerrarModal}
          onSave={(plazo) => reprogramar(modal.t, plazo)}
        />
      )}
      {modal?.kind === 'conflicto' && (
        <ConflictoSobrecargaModal
          mensaje={modal.mensaje}
          conflicto={modal.overload}
          onMover={() => setModal({ ...modal, kind: 'mover' })}
          onReducir={() => setModal({ ...modal, kind: 'reducir' })}
          onClose={cerrarModal}
        />
      )}
      {modal?.kind === 'mover' && (
        <MoverDiaModal
          gestion={modal.gestion}
          conflicto={modal.overload}
          fechaEvento={modal.gestion.fechaEvento}
          busy={busy}
          onClose={cerrarModal}
          onVolver={() => setModal({ ...modal, kind: 'conflicto' })}
          onSave={(plazo) =>
            guardar(
              modal.gestion,
              { ...modal.cambios, plazo, estado: 'POSPUESTA' },
              { titulo: 'Gestión reprogramada', detalle: `«${modal.gestion.nombre}» quedó para el ${fmtFecha(plazo)}.` },
              'reprogramar',
            )
          }
        />
      )}
      {modal?.kind === 'reducir' && (
        <ReducirHorasModal
          gestion={modal.gestion}
          cambios={modal.cambios}
          conflicto={modal.overload}
          busy={busy}
          onClose={cerrarModal}
          onVolver={() => setModal({ ...modal, kind: 'conflicto' })}
          onSave={(horas) =>
            guardar(
              modal.gestion,
              { ...modal.cambios, horas: String(horas), horaInicio: '', horaFin: '' },
              { titulo: 'Horas reducidas', detalle: `«${modal.gestion.nombre}» ahora dura ${horas} h.` },
              'reducir',
            )
          }
        />
      )}
      {modal?.kind === 'delete' && (
        <EliminarModal
          gestion={modal.t}
          busy={busy}
          onClose={cerrarModal}
          onConfirm={() => ejecutar(() => eventosApi.deleteGestion(modal.t.eventoId, modal.t.id), 'Gestión eliminada.', 'eliminar')}
        />
      )}
      {modal?.kind === 'error' && (
        <ErrorModal verbo={modal.verbo} mensaje={modal.mensaje} onClose={() => setModal(null)} />
      )}
      {toast && <Toast message={toast} onDone={cerrarToast} />}
    </section>
  )
}
