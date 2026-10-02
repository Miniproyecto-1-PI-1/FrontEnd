import { useState } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import { TIPOS } from '../data/tipos'
import shared from '../styles/shared.module.css'
import styles from './Modal.module.css'

const btn = `${shared.btn} ${shared.btnSm}`
const ghost = `${btn} ${shared.ghost}`

function validarEvento(f, ultimoPlazo) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
  if (!f.fecha) e.fecha = 'La fecha es obligatoria.'
  else if (ultimoPlazo && f.fecha < ultimoPlazo) {
    e.fecha = 'Hay gestiones con fecha límite posterior a esta fecha.'
  }
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
  const ultimoPlazo = evento.subtareas.reduce((max, g) => (g.plazo > max ? g.plazo : max), '')

  const guardar = async (e) => {
    e.preventDefault()
    const next = validarEvento(f, ultimoPlazo)
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
      wide
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
        <FormField label="Nombre del evento" required error={err.nombre}>
          <input value={f.nombre} onChange={set('nombre')} />
        </FormField>
        <div className={styles.row2}>
          <FormField label="Tipo de evento" error={err.tipo}>
            <select value={f.tipo} onChange={set('tipo')}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Lugar" required error={err.lugar}>
            <input value={f.lugar} onChange={set('lugar')} />
          </FormField>
        </div>
        <div className={styles.row2}>
          <FormField label="Fecha" required error={err.fecha}>
            <input type="date" value={f.fecha} onChange={set('fecha')} />
          </FormField>
          <FormField label="Hora" optional>
            <input type="time" value={f.hora} onChange={set('hora')} />
          </FormField>
        </div>
        <FormField label="Descripción breve" optional>
          <textarea rows={2} value={f.descripcion} onChange={set('descripcion')} />
        </FormField>
        <FormField label="Cliente" optional hint="Déjalo vacío si el evento no tiene cliente.">
          <input value={f.clienteNombre} onChange={set('clienteNombre')} placeholder="Nombre del cliente" />
        </FormField>
        <div className={styles.row2}>
          <FormField label="Teléfono" optional>
            <input type="tel" value={f.clienteTelefono} onChange={set('clienteTelefono')} />
          </FormField>
          <FormField label="Correo" optional>
            <input type="email" value={f.clienteCorreo} onChange={set('clienteCorreo')} />
          </FormField>
        </div>
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
      Esta acción eliminará el evento «{evento.nombre}»
      {n > 0 ? ` y sus ${n} ${n === 1 ? 'gestión' : 'gestiones'}` : ''}. No se puede deshacer.
    </Modal>
  )
}
