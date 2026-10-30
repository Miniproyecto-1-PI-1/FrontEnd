import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { hoyApi } from '../api/hoyApi'
import { usersApi } from '../api/usersApi'
import { ApiError } from '../api/http'
import { useRequest } from '../hooks/useRequest'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { fmtFecha, fmtFechaLarga, fmtRelativo, hoyISO } from '../utils/date'
import { erroresGestionDeApi, esConflicto } from '../utils/gestion'
import { ConflictoSobrecargaModal, MoverDiaModal, ReducirHorasModal } from '../components/ConflictoModals'
import Icon from '../components/Icon'
import AccionesTarea from '../components/AccionesTarea'
import CargaDelDia from '../components/CargaDelDia'
import EtiquetaEvento from '../components/EtiquetaEvento'
import { maticeEvento } from '../utils/colorEvento'
import StateMessage from '../components/StateMessage'
import { SkeletonCard } from '../components/Skeleton'
import Toast from '../components/Toast'
import { EstadoBadge } from '../components/Badges'
import { EditarGestionModal, EliminarModal, ErrorModal, PosponerModal } from '../components/GestionModals'
import shared from '../styles/shared.module.css'
import styles from './Hoy.module.css'

const GRUPOS = [
  { key: 'vencidas', titulo: 'Vencidas', icon: 'x', cls: styles.vencidas, vacio: 'Sin tareas vencidas.' },
  { key: 'hoy', titulo: 'Para hoy', icon: 'clock', cls: styles.hoy, vacio: 'Sin tareas para hoy.' },
  { key: 'proximas', titulo: 'Próximas', icon: 'calendar', cls: styles.proximas, vacio: 'Sin tareas próximas.' },
]

// Dentro de cada grupo: primero la de menor esfuerzo estimado; a igualdad de horas, la de fecha límite más cercana.
const porEsfuerzo = (a, b) =>
  a.horas - b.horas || a.plazo.localeCompare(b.plazo) || (a.horaInicio || '99:99').localeCompare(b.horaInicio || '99:99')

const sumaHoras = (lista) =>
  Math.round(lista.filter((t) => t.estado !== 'EJECUTADA').reduce((s, t) => s + t.horas, 0) * 100) / 100

// "Vencida" se muestra solo si el backend la clasificó como tal (categoria) y sigue sin ejecutar.
const estadoVista = (t) => (t.categoria === 'VENCIDA' && t.estado !== 'EJECUTADA' ? 'VENCIDA' : t.estado)

function TaskRow({ tarea, busy, onToggle, onEdit, onPostpone, onDelete }) {
  const estado = estadoVista(tarea)
  const hecha = tarea.estado === 'EJECUTADA'
  return (
    <li className={`${styles.tarea} ${hecha ? styles.hecha : ''}`} style={{ '--h': maticeEvento(tarea.eventoId) }}>
      <span className={styles.checkWrap} data-tip={hecha ? 'Reabrir' : 'Completar'}>
        <input
          type="checkbox"
          id={`t-${tarea.id}`}
          className={styles.check}
          checked={hecha}
          disabled={busy}
          onChange={onToggle}
        />
      </span>
      <div className={styles.tMain}>
        <label htmlFor={`t-${tarea.id}`} className={styles.tNombre}>
          {tarea.nombre}
        </label>
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
        {tarea.nota && <p className={styles.nota}>{tarea.nota}</p>}
      </div>
      <div className={styles.tSide}>
        <div className={styles.tEventoCol}>
          <EtiquetaEvento id={tarea.eventoId} nombre={tarea.eventoNombre} to={`/eventos/${tarea.eventoId}`} />
          {/* Pendiente y ejecutada se ven en la casilla; solo se rotulan, bajo el evento, las que necesitan aviso. */}
          {(estado === 'VENCIDA' || estado === 'POSPUESTA') && <EstadoBadge estado={estado} />}
        </div>
        <AccionesTarea
          nombre={tarea.nombre}
          hecha={hecha}
          busy={busy}
          onEdit={onEdit}
          onPostpone={onPostpone}
          onDelete={onDelete}
        />
      </div>
    </li>
  )
}

// «Próximas» puede traer los próximos 60 días: se muestran las primeras y el resto se despliega con «Ver todas».
const LIMITE_PROXIMAS = 5

export function Grupo({ grupo, tareas, sinLimite = false, ...acciones }) {
  const [verTodas, setVerTodas] = useState(false)
  if (tareas.length === 0) return null
  const limitada = grupo.key === 'proximas' && !sinLimite && tareas.length > LIMITE_PROXIMAS
  const visibles = limitada && !verTodas ? tareas.slice(0, LIMITE_PROXIMAS) : tareas
  return (
    <section className={`${styles.grupo} ${grupo.cls}`} aria-labelledby={`grupo-${grupo.key}`}>
      <div className={styles.grupoHead}>
        <Icon name={grupo.icon} size={16} />
        <h3 id={`grupo-${grupo.key}`}>{grupo.titulo}</h3>
        <span className={`${styles.horasGrupo} num`} title="Horas estimadas pendientes en este grupo">
          {sumaHoras(tareas)} h
        </span>
        <span className={`${styles.count} num`}>
          {tareas.length} {tareas.length === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>
      <ul className={styles.lista}>
        {visibles.map((t) => (
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
      {limitada && (
        <button type="button" className={styles.verTodas} aria-expanded={verTodas} onClick={() => setVerTodas((v) => !v)}>
          {verTodas ? 'Ver menos' : `Ver todas (${tareas.length})`}
        </button>
      )}
    </section>
  )
}

export default function Hoy() {
  useDocumentTitle('Hoy')
  const navigate = useNavigate()
  const { status, data: tareas, reload, refresh, mutate } = useRequest(() => hoyApi.list())
  const { data: limiteDiario } = useRequest(() => usersApi.getDailyLimit())
  const [q, setQ] = useState('')
  const [eventoId, setEventoId] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todas')
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  // Al volver de Configuración se muestra el aviso que trae la navegación (y se borra para que no reaparezca al recargar).
  const avisoInicial = useLocation().state?.aviso ?? null
  const [toast, setToast] = useState(avisoInicial)
  useEffect(() => {
    if (avisoInicial) window.history.replaceState({}, '')
  }, [avisoInicial])
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
      // Una vencida que se completa deja de mostrarse; las de hoy y próximas se quedan como completadas.
      vencidas: filtradas.filter((t) => t.categoria === 'VENCIDA' && t.estado !== 'EJECUTADA').sort(porEsfuerzo),
      hoy: filtradas.filter((t) => t.categoria === 'HOY').sort(porEsfuerzo),
      proximas: filtradas.filter((t) => t.categoria === 'PROXIMA').sort(porEsfuerzo),
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
      setToast('Tarea editada correctamente.')
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

  // Posponer con nota; sin fecha, el servidor elige la próxima fecha libre. Devuelve el error de fecha (si lo hay).
  const posponer = async (t, { plazo, nota }) => {
    setBusy(true)
    try {
      const det = await eventosApi.cambiarEstado(t.eventoId, t.id, { estado: 'POSPUESTA', nota, plazo })
      const nueva = det.subtareas.find((x) => x.id === t.id)
      aplicarLocal(t, { plazo: nueva.plazo, estado: 'POSPUESTA', nota: nueva.nota })
      setModal(null)
      setToast(`Tarea pospuesta para el ${fmtFecha(nueva.plazo)}.`)
      refresh()
      return null
    } catch (err) {
      if (esConflicto(err)) {
        const cambios = { plazo, estado: 'POSPUESTA', nota }
        setModal({ kind: 'conflicto', gestion: t, cambios, verbo: 'posponer', mensaje: err.message, overload: err.overload })
        return null
      }
      if (err instanceof ApiError && err.status === 400 && err.fieldErrors?.dueDate) return err.fieldErrors.dueDate
      setModal({ kind: 'error', verbo: 'posponer', mensaje: err instanceof ApiError && err.status !== 500 ? err.message : null })
      return null
    } finally {
      setBusy(false)
    }
  }

  const toggleHecha = (t) => {
    const hecha = t.estado === 'EJECUTADA'
    const estado = hecha ? 'PENDIENTE' : 'EJECUTADA'
    ejecutar(
      () => eventosApi.cambiarEstado(t.eventoId, t.id, { estado }),
      hecha ? 'Tarea reabierta.' : 'Tarea marcada como hecha.',
      'actualizar',
      { gestion: t, cambios: { estado } },
    )
  }

  const hoyLargo = fmtFechaLarga(hoyISOv)
  const [diaSemana, resto] = hoyLargo.split(', ')

  let contenido
  if (status === 'loading') {
    contenido = (
      <div className={styles.skeletons} aria-busy="true" aria-label="Cargando tareas">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  } else if (status === 'error') {
    contenido = (
      <StateMessage
        kind="error"
        title="No se pudieron cargar tus tareas"
        text="Ha ocurrido un error cargando la información. Inténtalo de nuevo."
        actionLabel="Reintentar"
        onAction={reload}
      />
    )
  } else if (tareas.length === 0) {
    contenido = (
      <StateMessage
        title="No tienes tareas todavía"
        text="Las tareas aparecen aquí apenas las añadas a un evento."
        actionLabel="Ir a eventos"
        onAction={() => navigate('/eventos')}
      />
    )
  } else if (grupos.vencidas.length === 0 && grupos.hoy.length === 0 && grupos.proximas.length === 0) {
    contenido = (
      <StateMessage
        title="Ninguna tarea coincide con los filtros"
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
        sinLimite={Boolean(hayFiltros)}
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
        <div className={styles.hoyCard}>
          <div className={styles.hoyFecha}>
            <Icon name="calendar" size={20} />
            <div className={styles.hoyFechaTexto}>
              <span className={styles.dateCaption}>{diaSemana}</span>
              <span className={styles.dateMain}>{resto}</span>
            </div>
          </div>
          <div className={styles.hoyHoras}>
            <CargaDelDia horas={horasHoy} limite={limiteDiario?.limiteDiario ?? null} />
          </div>
        </div>
      </div>

      {status === 'success' && tareas.length > 0 && (
        <div className={`${styles.filtros} ${shared.fixed}`}>
          <div className={styles.search}>
            <Icon name="search" size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Buscar por nombre de tarea o evento"
              aria-label="Buscar tarea"
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
          Orden: menor esfuerzo estimado primero.
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
        <PosponerModal
          gestion={modal.t}
          fechaEvento={modal.t.fechaEvento}
          busy={busy}
          onClose={cerrarModal}
          onSave={(datos) => posponer(modal.t, datos)}
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
              'Tarea reprogramada.',
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
              'Horas reducidas.',
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
          onConfirm={() => ejecutar(() => eventosApi.deleteGestion(modal.t.eventoId, modal.t.id), 'Tarea eliminada.', 'eliminar')}
        />
      )}
      {modal?.kind === 'error' && (
        <ErrorModal verbo={modal.verbo} mensaje={modal.mensaje} onClose={() => setModal(null)} />
      )}
      {toast && <Toast message={toast} onDone={cerrarToast} />}
    </section>
  )
}
