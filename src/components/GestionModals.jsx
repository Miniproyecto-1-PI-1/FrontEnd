import { useState } from 'react'
import Modal from './Modal'
import { hoyISO } from '../utils/date'
import { validarGestion } from '../utils/gestion'
import GestionFields from './GestionFields'
import shared from '../styles/shared.module.css'
import styles from './Modal.module.css'

const btn = `${shared.btn} ${shared.btnSm}`
const ghost = `${btn} ${shared.ghost}`

function Field({ label, error, children }) {
  return (
    <div className={`${styles.field} ${error ? styles.error : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}

export function EditarGestionModal({ gestion, busy, onSave, onClose }) {
  const [f, setF] = useState({
    nombre: gestion.nombre,
    descripcion: gestion.descripcion ?? '',
    plazo: gestion.plazo,
    horaInicio: gestion.horaInicio,
    horaFin: gestion.horaFin,
    horas: String(gestion.horas),
  })
  const [err, setErr] = useState({})

  const guardar = (e) => {
    e.preventDefault()
    const next = validarGestion(f)
    setErr(next)
    if (Object.keys(next).length) return
    onSave({ ...f, nombre: f.nombre.trim(), descripcion: f.descripcion.trim() })
  }

  return (
    <Modal
      title="Editar gestión"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" form="form-gestion" className={btn} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id="form-gestion" noValidate onSubmit={guardar}>
        <GestionFields value={f} onChange={setF} errors={err} />
      </form>
    </Modal>
  )
}

export function ReprogramarModal({ gestion, modo, busy, onSave, onClose }) {
  const [plazo, setPlazo] = useState(gestion.plazo)
  const [err, setErr] = useState('')
  const titulo = modo === 'posponer' ? 'Posponer gestión' : 'Reprogramar gestión'

  const guardar = (e) => {
    e.preventDefault()
    if (!plazo) return setErr('La fecha límite es obligatoria.')
    if (plazo < hoyISO()) return setErr('La fecha límite no puede ser anterior al día de hoy.')
    onSave(plazo)
  }

  return (
    <Modal
      title={titulo}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" form="form-reprogramar" className={btn} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <p>
        {modo === 'posponer'
          ? `Elige la nueva fecha límite para "${gestion.nombre}". Quedará como pospuesta.`
          : `Elige la nueva fecha límite para "${gestion.nombre}". Volverá a estar pendiente.`}
      </p>
      <form id="form-reprogramar" noValidate onSubmit={guardar}>
        <Field label="Nueva fecha límite" error={err}>
          <input
            type="date"
            value={plazo}
            onChange={(e) => {
              setPlazo(e.target.value)
              setErr('')
            }}
          />
        </Field>
      </form>
    </Modal>
  )
}

export function EliminarModal({ gestion, busy, onConfirm, onClose }) {
  return (
    <Modal
      title="¿Eliminar gestión?"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={`${btn} ${shared.danger}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Eliminando…' : 'Eliminar'}
          </button>
        </>
      }
    >
      Esta acción eliminará la gestión "{gestion.nombre}" y toda su información. No se puede deshacer.
    </Modal>
  )
}

export function ErrorModal({ verbo, onClose }) {
  return (
    <Modal
      title="Error"
      onClose={onClose}
      footer={
        <button type="button" className={`${btn} ${shared.danger}`} onClick={onClose}>
          Cerrar
        </button>
      }
    >
      <span role="alert">Ha ocurrido un error intentando {verbo} la gestión, inténtalo de nuevo.</span>
    </Modal>
  )
}
