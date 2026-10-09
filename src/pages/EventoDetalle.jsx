import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { ApiError } from '../api/http'
import { useRequest } from '../hooks/useRequest'
import { fmtFecha, fmtFechaLarga, fmtRelativo } from '../utils/date'
import { erroresGestionDeApi, esConflicto, estadoEfectivo, validarGestion } from '../utils/gestion'
import { ConflictoSobrecargaModal, MoverDiaModal, ReducirHorasModal } from '../components/ConflictoModals'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import GestionFields from '../components/GestionFields'
import DropdownMenu from '../components/DropdownMenu'
import Icon from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import StateMessage from '../components/StateMessage'
import Toast from '../components/Toast'
import { Skeleton } from '../components/Skeleton'
import { EstadoBadge, TipoBadge } from '../components/Badges'
import { EditarGestionModal, EliminarModal, ErrorModal, ReprogramarModal } from '../components/GestionModals'
import { EditarEventoModal, EliminarEventoModal } from '../components/EventoModals'
import NotFound from './NotFound'
import shared from '../styles/shared.module.css'
import styles from './EventoDetalle.module.css'

function Contenido({ id }) {
  const navigate = useNavigate()
  const { status, data: ev, error, reload, refresh } = useRequest(() => eventosApi.get(id))
  useDocumentTitle(
    status === 'success' ? ev.nombre
      : status === 'loading' ? 'Cargando…'
        : error?.status === 404 ? 'Evento no encontrado' : 'Error',
  )
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [nueva, setNueva] = useState(null)
  const [nuevaErr, setNuevaErr] = useState({})
  const nuevaRef = useRef(null)
  const cerrarToast = useCallback(() => setToast(null), [])
  const cerrarModal = () => !busy && setModal(null)

  const ejecutar = async (accion, okMsg, verbo, ctx) => {
    setBusy(true)
    try {
      await accion()
      setModal(null)
      setToast(okMsg)
      refresh()
      return true
    } catch (err) {
      if (ctx && esConflicto(err)) {
        setModal({ kind: 'conflicto', ...ctx, verbo, mensaje: err.message, overload: err.overload })
      } else {
        setModal({ kind: 'error', verbo, mensaje: err instanceof ApiError && err.status !== 500 ? err.message : null })
      }
      return false
    } finally {
      setBusy(false)
    }
  }

  const abrirNueva = () => {
    setNuevaErr({})
    setNueva({ nombre: '', descripcion: '', plazo: '', horaInicio: '09:00', horaFin: '10:00', horas: '1' })
  }

  const cancelarNueva = () => {
    setNueva(null)
    setNuevaErr({})
  }

  const agregarNueva = async (e) => {
    e.preventDefault()
    const errs = validarGestion(nueva, { fechaEvento: ev.fecha })
    setNuevaErr(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await eventosApi.addGestion(id, { ...nueva, nombre: nueva.nombre.trim(), descripcion: nueva.descripcion.trim() })
      setNueva(null)
      setToast('Gestión añadida.')
      refresh()
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || esConflicto(err))) setNuevaErr(erroresGestionDeApi(err.fieldErrors))
      else setModal({ kind: 'error', verbo: 'crear', mensaje: err.message })
    } finally {
      setBusy(false)
    }
  }

  // Igual que guardarEvento: un 400 vuelve al modal como errores por campo.
  const editarGestion = async (g, cambios) => {
    setBusy(true)
    try {
      await eventosApi.updateGestion(id, { ...g, ...cambios })
      setModal(null)
      setToast('Gestión editada correctamente.')
      refresh()
      return null
    } catch (err) {
      if (esConflicto(err)) {
        setModal({ kind: 'conflicto', gestion: g, cambios, verbo: 'editar', mensaje: err.message, overload: err.overload })
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
  const reprogramar = async (g, plazo) => {
    const cambios = { plazo, estado: 'POSPUESTA' }
    setBusy(true)
    try {
      await eventosApi.updateGestion(id, { ...g, ...cambios })
      setModal(null)
      setToast('Gestión reprogramada.')
      refresh()
      return null
    } catch (err) {
      if (esConflicto(err)) {
        setModal({ kind: 'conflicto', gestion: g, cambios, verbo: 'reprogramar', mensaje: err.message, overload: err.overload })
        return null
      }
      if (err instanceof ApiError && err.status === 400 && err.fieldErrors?.dueDate) return err.fieldErrors.dueDate
      setModal({ kind: 'error', verbo: 'reprogramar', mensaje: err instanceof ApiError && err.status !== 500 ? err.message : null })
      return null
    } finally {
      setBusy(false)
    }
  }

  const abierta = nueva !== null
  useEffect(() => {
    if (abierta) nuevaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [abierta])

  // Devuelve los errores por campo de un 400 para que el modal los pinte junto a cada campo.
  const guardarEvento = async (form) => {
    setBusy(true)
    try {
      await eventosApi.update(id, form)
      setModal(null)
      setToast('Evento actualizado.')
      refresh()
      return null
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) return err.fieldErrors
      setModal({ kind: 'error', verbo: 'editar', objeto: 'el evento', mensaje: err.message })
      return null
    } finally {
      setBusy(false)
    }
  }

  const eliminarEvento = async () => {
    setBusy(true)
    try {
      await eventosApi.remove(id)
      navigate('/eventos', { state: { toast: 'Evento eliminado.' } })
    } catch (err) {
      setBusy(false)
      setModal({ kind: 'error', verbo: 'eliminar', objeto: 'el evento', mensaje: err.message })
    }
  }

  const guardar = (g, cambios, okMsg, verbo) =>
    ejecutar(() => eventosApi.updateGestion(id, { ...g, ...cambios }), okMsg, verbo, { gestion: g, cambios })

  const volver = (
    <div className={`${shared.breadcrumb} ${shared.fixed}`}>
      <Link to="/eventos">
        <Icon name="arrowLeft" size={16} /> Volver a eventos
      </Link>
    </div>
  )

  if (status === 'loading') {
    return (
      <section className={`${shared.page} ${shared.contain}`}>
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

  if (status === 'error' && (error?.status === 404 || error?.status === 400)) {
    return (
      <NotFound {...NO_ENCONTRADO} />
    )
  }

  if (status === 'error') {
    return (
      <section className={`${shared.page} ${shared.contain}`}>
        {volver}
        <div className={`${shared.viewHead} ${shared.fixed}`}>
          <h2>Detalle del evento</h2>
        </div>
        <div className={shared.scroll}>
          <StateMessage
            kind="error"
            title="No se ha podido cargar el evento"
            text="Ha ocurrido un error cargando la información. Inténtalo de nuevo."
            actionLabel="Reintentar"
            onAction={reload}
          />
        </div>
      </section>
    )
  }

  const toggleHecha = (g) => {
    const hecha = g.estado === 'EJECUTADA'
    guardar(
      g,
      { estado: hecha ? 'PENDIENTE' : 'EJECUTADA' },
      hecha ? 'Gestión reabierta.' : 'Gestión marcada como hecha.',
      'actualizar',
    )
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.contain} ${shared.fixed}`}>
        {volver}
        <div className={shared.viewHead}>
          <div className={styles.titulo}>
            <h2>{ev.nombre}</h2>
            <TipoBadge tipo={ev.tipo} />
          </div>
          <div className={styles.headActions}>
            <button type="button" className={shared.iconbtn} onClick={() => setModal({ kind: 'editEvento' })}>
              <Icon name="edit" size={16} /> Editar evento
            </button>
            <button
              type="button"
              className={`${shared.iconbtn} ${shared.iconbtnDanger}`}
              onClick={() => setModal({ kind: 'deleteEvento' })}
            >
              <Icon name="trash" size={16} /> Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className={shared.scroll}>
        <div className={shared.contain}>
          <div className={styles.card}>
            <dl className={styles.info}>
              <div>
                <dt>Fecha</dt>
                <dd className={styles.cap}>
                  {fmtFechaLarga(ev.fecha)}
                  <span className={styles.sub}>{fmtRelativo(ev.fecha)}</span>
                </dd>
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
              <span className={`${styles.pct} num`}>{ev.total > 0 ? `${ev.progreso}%` : '—'}</span>
            </div>
            <ProgressBar value={ev.progreso} />
            <span className={styles.sub}>
              {ev.total > 0
                ? `${ev.hechas} de ${ev.total} ${ev.total === 1 ? 'gestión ejecutada' : 'gestiones ejecutadas'}`
                : 'Añade gestiones para medir el avance del evento.'}
            </span>
          </div>

          <div className={styles.sectionHead}>
            <h3>Plan logístico</h3>
            {ev.subtareas.length > 0 && (
              <button
                type="button"
                className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
                onClick={abrirNueva}
                disabled={abierta}
              >
                <Icon name="plus" size={16} /> Añadir gestión
              </button>
            )}
          </div>
          {ev.subtareas.length === 0 && !abierta ? (
            <StateMessage
              title="Este evento aún no tiene gestiones"
              text="Las gestiones son las tareas logísticas del evento: reservas, proveedores, pagos…"
              actionLabel="Añadir gestión"
              onAction={abrirNueva}
            />
          ) : (
            <ul className={styles.list}>
              {ev.subtareas.map((g) => {
                const hecha = g.estado === 'EJECUTADA'
                return (
                  <li key={g.id} className={`${styles.gestion} ${hecha ? styles.hecha : ''}`}>
                    <input
                      type="checkbox"
                      id={`g-${g.id}`}
                      className={styles.check}
                      checked={hecha}
                      disabled={busy}
                      onChange={() => toggleHecha(g)}
                    />
                    <div className={styles.gMain}>
                      <label htmlFor={`g-${g.id}`} className={styles.gNombre}>
                        {g.nombre}
                      </label>
                      {g.descripcion && <p className={styles.gDesc}>{g.descripcion}</p>}
                      <div className={styles.gMeta}>
                        <span className={styles.gPlazo}>
                          <Icon name="calendar" size={14} /> {fmtFecha(g.plazo)}
                        </span>
                        {g.horaInicio && g.horaFin && (
                          <span className={styles.gPlazo}>
                            <Icon name="clock" size={14} /> {g.horaInicio}–{g.horaFin}
                          </span>
                        )}
                        <span className={`${styles.hours} num`}>{g.horas} h</span>
                      </div>
                    </div>
                    <div className={styles.gSide}>
                      <EstadoBadge estado={estadoEfectivo(g)} />
                      <button
                        type="button"
                        className={`${shared.iconbtn} ${shared.iconOnly}`}
                        aria-label={`Editar ${g.nombre}`}
                        title="Editar"
                        onClick={() => setModal({ kind: 'edit', g })}
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <DropdownMenu
                        trigger={({ props }) => (
                          <button
                            {...props}
                            className={`${shared.iconbtn} ${shared.iconOnly}`}
                            aria-label={`Más acciones para ${g.nombre}`}
                            title="Más acciones"
                          >
                            <Icon name="more" size={16} />
                          </button>
                        )}
                        items={[
                          ...(hecha
                            ? []
                            : [{ label: 'Reprogramar', icon: <Icon name="calendar" size={16} />, onSelect: () => setModal({ kind: 'postpone', g }) }]),
                          { label: 'Eliminar', icon: <Icon name="trash" size={16} />, danger: true, onSelect: () => setModal({ kind: 'delete', g }) },
                        ]}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {abierta && (
            <form ref={nuevaRef} className={styles.nuevaCard} noValidate onSubmit={agregarNueva}>
              <span className={styles.nuevaTitulo}>Nueva gestión</span>
              <GestionFields value={nueva} onChange={setNueva} errors={nuevaErr} fechaEvento={ev.fecha} />
              <div className={styles.nuevaActions}>
                <button
                  type="button"
                  className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
                  onClick={cancelarNueva}
                  disabled={busy}
                >
                  Cancelar
                </button>
                <button type="submit" className={`${shared.btn} ${shared.btnSm}`} disabled={busy} aria-busy={busy}>
                  {busy ? 'Guardando…' : 'Añadir gestión'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {modal?.kind === 'edit' && (
        <EditarGestionModal
          gestion={modal.g}
          fechaEvento={ev.fecha}
          busy={busy}
          onClose={cerrarModal}
          onSave={(cambios) => editarGestion(modal.g, cambios)}
        />
      )}
      {modal?.kind === 'postpone' && (
        <ReprogramarModal
          gestion={modal.g}
          fechaEvento={ev.fecha}
          busy={busy}
          onClose={cerrarModal}
          onSave={(plazo) => reprogramar(modal.g, plazo)}
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
          fechaEvento={ev.fecha}
          busy={busy}
          onClose={cerrarModal}
          onVolver={() => setModal({ ...modal, kind: 'conflicto' })}
          onSave={(plazo) =>
            guardar(
              modal.gestion,
              { ...modal.cambios, plazo, estado: 'POSPUESTA' },
              'Gestión reprogramada.',
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
          gestion={modal.g}
          busy={busy}
          onClose={cerrarModal}
          onConfirm={() => ejecutar(() => eventosApi.deleteGestion(id, modal.g.id), 'Gestión eliminada.', 'eliminar')}
        />
      )}
      {modal?.kind === 'editEvento' && (
        <EditarEventoModal evento={ev} busy={busy} onClose={cerrarModal} onSave={guardarEvento} />
      )}
      {modal?.kind === 'deleteEvento' && (
        <EliminarEventoModal evento={ev} busy={busy} onClose={cerrarModal} onConfirm={eliminarEvento} />
      )}
      {modal?.kind === 'error' && (
        <ErrorModal verbo={modal.verbo} objeto={modal.objeto} mensaje={modal.mensaje} onClose={() => setModal(null)} />
      )}
      {toast && <Toast message={toast} onDone={cerrarToast} />}
    </section>
  )
}

const NO_ENCONTRADO = {
  titulo: 'Este evento no está en la agenda',
  texto: 'Puede que se haya eliminado o que el enlace no sea correcto.',
  docTitle: 'Evento no encontrado',
}

export default function EventoDetalle() {
  const { id } = useParams()
  // Un id que no es numérico nunca existe: no hace falta preguntarle al backend.
  if (!/^\d+$/.test(id)) return <NotFound {...NO_ENCONTRADO} />
  return <Contenido key={id} id={id} />
}
