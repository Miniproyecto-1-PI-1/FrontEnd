import { useState } from 'react'
import Modal from './Modal'
import { TIPOS } from '../data/tipos'
import shared from '../styles/shared.module.css'
import styles from './Modal.module.css'

const btn = `${shared.btn} ${shared.btnSm}`
const ghost = `${btn} ${shared.ghost}`

function Field({ label, required, error, children }) {
  return (
    <div className={`${styles.field} ${error ? styles.error : ''}`}>
      <label>
        {label}
        {required && <span className={styles.req}>*</span>}
      </label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}

function validarEvento(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
  if (!f.fecha) e.fecha = 'La fecha es obligatoria.'
  if (!f.lugar.trim()) e.lugar = 'El lugar es obligatorio.'
  return e
}

export function EditarEventoModal({ evento, busy, onSave, onClose }) {
  const [f, setF] = useState({
    nombre: evento.nombre,
    tipo: evento.tipo,
    fecha: evento.fecha,
    hora: evento.hora,
    lugar: evento.lugar,
    descripcion: evento.descripcion,
    clienteNombre: evento.cliente?.nombre ?? '',
    clienteTelefono: evento.cliente?.telefono ?? '',
    clienteCorreo: evento.cliente?.correo ?? '',
  })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    const next = validarEvento(f)
    setErr(next)
    if (Object.keys(next).length) return
    const fe = await onSave({
      nombre: f.nombre.trim(),
      tipo: f.tipo,
      fecha: f.fecha,
      hora: f.hora,
      lugar: f.lugar.trim(),
      descripcion: f.descripcion.trim(),
      cliente: { nombre: f.clienteNombre.trim(), telefono: f.clienteTelefono.trim(), correo: f.clienteCorreo.trim() },
    })
    if (fe) setErr({ nombre: fe.name, tipo: fe.type, fecha: fe.date, lugar: fe.place })
  }

  return (
    <Modal
      title="Editar evento"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" form="form-evento" className={btn} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id="form-evento" noValidate onSubmit={guardar}>
        <Field label="Nombre del evento" required error={err.nombre}>
          <input value={f.nombre} onChange={set('nombre')} />
        </Field>
        <div className={styles.row2}>
          <Field label="Tipo de evento" error={err.tipo}>
            <select value={f.tipo} onChange={set('tipo')}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lugar" required error={err.lugar}>
            <input value={f.lugar} onChange={set('lugar')} />
          </Field>
        </div>
        <div className={styles.row2}>
          <Field label="Fecha" required error={err.fecha}>
            <input type="date" value={f.fecha} onChange={set('fecha')} />
          </Field>
          <Field label="Hora">
            <input type="time" value={f.hora} onChange={set('hora')} />
          </Field>
        </div>
        <Field label="Descripción breve">
          <textarea rows={2} value={f.descripcion} onChange={set('descripcion')} />
        </Field>
        <Field label="Cliente">
          <input value={f.clienteNombre} onChange={set('clienteNombre')} placeholder="Nombre (vacío = sin cliente)" />
        </Field>
        <div className={styles.row2}>
          <Field label="Teléfono">
            <input type="tel" value={f.clienteTelefono} onChange={set('clienteTelefono')} />
          </Field>
          <Field label="Correo">
            <input type="email" value={f.clienteCorreo} onChange={set('clienteCorreo')} />
          </Field>
        </div>
        <p className={styles.hint}>
          <span className={styles.req}>*</span> Campo obligatorio
        </p>
      </form>
    </Modal>
  )
}

export function EliminarEventoModal({ evento, busy, onConfirm, onClose }) {
  const n = evento.subtareas.length
  return (
    <Modal
      title="¿Eliminar evento?"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={`${btn} ${shared.danger}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Eliminando…' : 'Eliminar evento'}
          </button>
        </>
      }
    >
      Esta acción eliminará el evento "{evento.nombre}"
      {n > 0 ? ` y sus ${n} ${n === 1 ? 'gestión' : 'gestiones'}` : ''}. No se puede deshacer.
    </Modal>
  )
}
