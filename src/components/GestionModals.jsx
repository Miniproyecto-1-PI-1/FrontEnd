import { useState } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import { fmtFecha, hoyISO } from '../utils/date'
import { validarGestion } from '../utils/gestion'
import GestionFields from './GestionFields'
import shared from '../styles/shared.module.css'

const btn = `${shared.btn} ${shared.btnSm}`
const ghost = `${btn} ${shared.ghost}`

/** `onSave` puede devolver errores por campo del servidor para pintarlos en el formulario. */
export function EditarGestionModal({ gestion, fechaEvento, busy, onSave, onClose }) {
  const [f, setF] = useState({
    nombre: gestion.nombre,
    descripcion: gestion.descripcion ?? '',
    plazo: gestion.plazo,
    horaInicio: gestion.horaInicio,
    horaFin: gestion.horaFin,
    horas: String(gestion.horas),
  })
  const [err, setErr] = useState({})

  const guardar = async (e) => {
    e.preventDefault()
    const next = validarGestion(f, { fechaEvento })
    setErr(next)
    if (Object.keys(next).length) return
    const errServidor = await onSave({ ...f, nombre: f.nombre.trim(), descripcion: f.descripcion.trim() })
    if (errServidor) {
      setErr(errServidor)
      requestAnimationFrame(() => document.querySelector('#form-gestion [aria-invalid="true"]')?.focus())
    }
  }

  return (
    <Modal
      title="Editar gestión"
      wide
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
        <GestionFields value={f} onChange={setF} errors={err} fechaEvento={fechaEvento} />
      </form>
    </Modal>
  )
}

export function ReprogramarModal({ gestion, fechaEvento, busy, onSave, onClose }) {
  const [plazo, setPlazo] = useState(gestion.plazo >= hoyISO() ? gestion.plazo : hoyISO())
  const [err, setErr] = useState('')

  const guardar = async (e) => {
    e.preventDefault()
    if (!plazo) return setErr('La fecha límite es obligatoria.')
    if (plazo < hoyISO()) return setErr('La fecha límite no puede ser anterior al día de hoy.')
    if (fechaEvento && plazo > fechaEvento) return setErr('La fecha límite no puede ser posterior al evento.')
    const errServidor = await onSave(plazo)
    if (errServidor) setErr(errServidor)
  }

  return (
    <Modal
      title="Reprogramar gestión"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" form="form-reprogramar" className={btn} disabled={busy}>
            {busy ? 'Guardando…' : 'Reprogramar'}
          </button>
        </>
      }
    >
      <p>
        «{gestion.nombre}» · ahora {fmtFecha(gestion.plazo)}
      </p>
      <form id="form-reprogramar" noValidate onSubmit={guardar}>
        <FormField label="Nueva fecha límite" error={err}>
          <input
            type="date"
            value={plazo}
            min={hoyISO()}
            max={fechaEvento || undefined}
            onChange={(e) => {
              setPlazo(e.target.value)
              setErr('')
            }}
          />
        </FormField>
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
      Esta acción eliminará la gestión «{gestion.nombre}» y toda su información. No se puede deshacer.
    </Modal>
  )
}

/** `mensaje` es el detalle que devolvió el servidor; si no hay, se usa uno genérico. */
export function ErrorModal({ verbo, objeto = 'la gestión', mensaje, onClose }) {
  return (
    <Modal
      title={`No se pudo ${verbo} ${objeto}`}
      onClose={onClose}
      footer={
        <button type="button" className={btn} onClick={onClose}>
          Entendido
        </button>
      }
    >
      <span role="alert">{mensaje || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'}</span>
    </Modal>
  )
}
