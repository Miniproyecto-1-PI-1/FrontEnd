import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { useRequest } from '../hooks/useRequest'
import { fmtFecha, fmtFechaLarga, hoyISO } from '../utils/date'
import { validarGestion } from '../utils/gestion'
import GestionFields from '../components/GestionFields'
import ProgressBar from '../components/ProgressBar'
import StateMessage from '../components/StateMessage'
import Toast from '../components/Toast'
import { Skeleton } from '../components/Skeleton'
import { EstadoBadge } from '../components/Badges'
import { EditarGestionModal, EliminarModal, ErrorModal, ReprogramarModal } from '../components/GestionModals'
import shared from '../styles/shared.module.css'
import styles from './EventoDetalle.module.css'

const estadoDe = (g) => (g.estado === 'PENDIENTE' && g.plazo < hoyISO() ? 'VENCIDA' : g.estado)

function Contenido({ id }) {
  const navigate = useNavigate()
  const { status, data: ev, error, reload, refresh } = useRequest(() => eventosApi.get(id))
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [nueva, setNueva] = useState(null)
  const [nuevaErr, setNuevaErr] = useState({})
  const nuevaRef = useRef(null)
  const cerrarToast = useCallback(() => setToast(null), [])
  const cerrarModal = () => !busy && setModal(null)

  const ejecutar = async (accion, okMsg, verbo) => {
    setBusy(true)
    try {
      await accion()
      setModal(null)
      setToast(okMsg)
      refresh()
      return true
    } catch {
      setModal({ kind: 'error', verbo })
      return false
    } finally {
      setBusy(false)
    }
  }

  const abrirNueva = () => {
    setNuevaErr({})
    setNueva({ nombre: '', descripcion: '', plazo: '', horaInicio: '09:00', horaFin: '10:00' })
  }

  const cancelarNueva = () => {
    setNueva(null)
    setNuevaErr({})
  }

  const agregarNueva = async (e) => {
    e.preventDefault()
    const errs = validarGestion(nueva)
    setNuevaErr(errs)
    if (Object.keys(errs).length) return
    const ok = await ejecutar(
      () => eventosApi.addGestion(id, { ...nueva, nombre: nueva.nombre.trim(), descripcion: nueva.descripcion.trim() }),
      'Gestión añadida.',
      'crear',
    )
    if (ok) setNueva(null)
  }

  const abierta = nueva !== null
  useEffect(() => {
    if (abierta) nuevaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [abierta])

  const guardar = (g, cambios, okMsg, verbo) =>
    ejecutar(() => eventosApi.updateGestion(id, { ...g, ...cambios }), okMsg, verbo)

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
          <StateMessage
            kind="error"
            title="No se ha podido cargar el evento"
            text={noExiste ? 'El evento no existe o ya no está disponible.' : 'Ha ocurrido un error cargando la información, inténtalo de nuevo.'}
            actionLabel={noExiste ? 'Volver a eventos' : 'Reintentar'}
            onAction={noExiste ? () => navigate('/eventos') : reload}
          />
        </div>
      </section>
    )
  }

  const acciones = (g) => {
    const estado = estadoDe(g)
    const hecha = g.estado === 'EJECUTADA'
    return (
      <div className={styles.actions}>
        <button type="button" className={shared.iconbtn} onClick={() => setModal({ kind: 'edit', g })}>
          Editar
        </button>
        {!hecha && (
          <button
            type="button"
            className={shared.iconbtn}
            onClick={() => setModal({ kind: 'postpone', g, modo: estado === 'PENDIENTE' ? 'posponer' : 'reprogramar' })}
          >
            {estado === 'PENDIENTE' ? 'Posponer' : 'Reprogramar'}
          </button>
        )}
        <button
          type="button"
          className={shared.iconbtn}
          disabled={busy}
          onClick={() =>
            guardar(
              g,
              { estado: hecha ? 'PENDIENTE' : 'EJECUTADA' },
              hecha ? 'Gestión reabierta.' : 'Gestión marcada como hecha.',
              'actualizar',
            )
          }
        >
          {hecha ? 'Reabrir' : 'Marcar hecha'}
        </button>
        <button
          type="button"
          className={`${shared.iconbtn} ${shared.iconbtnDanger}`}
          onClick={() => setModal({ kind: 'delete', g })}
        >
          Eliminar
        </button>
      </div>
    )
  }

  return (
    <section className={shared.page}>
      {volver}
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>{ev.nombre}</h2>
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

        <div className={styles.sectionHead}>
          <h3>Plan logístico</h3>
          <button
            type="button"
            className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
            onClick={abrirNueva}
            disabled={abierta}
          >
            ＋ Añadir gestión
          </button>
        </div>
        {ev.subtareas.length === 0 && !abierta ? (
          <StateMessage
            title="Este evento aún no tiene gestiones."
            actionLabel="Añadir gestión"
            onAction={abrirNueva}
          />
        ) : (
          <ul className={styles.list}>
            {ev.subtareas.map((g) => (
              <li key={g.id} className={styles.gestion}>
                <div className={styles.gMain}>
                  <strong>{g.nombre}</strong>
                  {g.descripcion && <p className={styles.gDesc}>{g.descripcion}</p>}
                  <div className={styles.gMeta}>
                    <span>
                      Plazo {fmtFecha(g.plazo)}
                      {g.horaInicio && g.horaFin ? ` · ${g.horaInicio}–${g.horaFin}` : ''}
                    </span>
                    <span className={`${styles.hours} num`}>{g.horas}h</span>
                  </div>
                </div>
                <div className={styles.gSide}>
                  <EstadoBadge estado={estadoDe(g)} />
                  {acciones(g)}
                </div>
              </li>
            ))}
          </ul>
        )}

        {abierta && (
          <form ref={nuevaRef} className={styles.nuevaCard} noValidate onSubmit={agregarNueva}>
            <span className={styles.nuevaTitulo}>Nueva gestión</span>
            <GestionFields value={nueva} onChange={setNueva} errors={nuevaErr} />
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

      {modal?.kind === 'edit' && (
        <EditarGestionModal
          gestion={modal.g}
          busy={busy}
          onClose={cerrarModal}
          onSave={(cambios) => guardar(modal.g, cambios, 'Gestión editada correctamente.', 'editar')}
        />
      )}
      {modal?.kind === 'postpone' && (
        <ReprogramarModal
          gestion={modal.g}
          modo={modal.modo}
          busy={busy}
          onClose={cerrarModal}
          onSave={(plazo) =>
            guardar(
              modal.g,
              { plazo, estado: modal.modo === 'posponer' ? 'POSPUESTA' : 'PENDIENTE' },
              modal.modo === 'posponer' ? 'Gestión pospuesta.' : 'Gestión reprogramada.',
              modal.modo,
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
      {modal?.kind === 'error' && <ErrorModal verbo={modal.verbo} onClose={() => setModal(null)} />}
      {toast && <Toast message={toast} onDone={cerrarToast} />}
    </section>
  )
}

export default function EventoDetalle() {
  const { id } = useParams()
  return <Contenido key={id} id={id} />
}
