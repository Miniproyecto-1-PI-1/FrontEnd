import { useState } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import { fmtFecha, hoyISO } from '../utils/date'
import shared from '../styles/shared.module.css'
import styles from './ConflictoModals.module.css'

const btn = `${shared.btn} ${shared.btnSm}`
const ghost = `${btn} ${shared.ghost}`

const fmtH = (n) => String(Math.round(Number(n) * 100) / 100)

/** Aviso cuando guardar dejaría un día por encima del límite diario; ofrece las dos salidas. */
export function ConflictoSobrecargaModal({ mensaje, onMover, onReducir, onClose }) {
  return (
    <Modal
      title="Conflicto de sobrecarga"
      onClose={onClose}
      footer={
        <button type="button" className={ghost} onClick={onClose}>
          Cancelar y volver
        </button>
      }
    >
      <p role="alert" className={styles.alerta}>{mensaje}</p>
      <p>¿Cómo deseas resolverlo?</p>
      <div className={styles.opciones}>
        <button type="button" className={btn} onClick={onMover}>
          Mover a otro día
        </button>
        <button type="button" className={btn} onClick={onReducir}>
          Reducir horas estimadas
        </button>
      </div>
    </Modal>
  )
}

/** `onSave(plazo)`: elige un día que sí cabe (sugerido) o cualquier otro. */
export function MoverDiaModal({ gestion, conflicto, fechaEvento, busy, onSave, onClose }) {
  const sugeridas = conflicto.suggestedDates ?? []
  const [plazo, setPlazo] = useState(sugeridas[0]?.date ?? conflicto.date)
  const [err, setErr] = useState('')

  const guardar = (e) => {
    e.preventDefault()
    if (!plazo) return setErr('La fecha límite es obligatoria.')
    if (plazo < hoyISO()) return setErr('La fecha límite no puede ser anterior al día de hoy.')
    if (fechaEvento && plazo > fechaEvento) return setErr('La fecha límite no puede ser posterior al evento.')
    onSave(plazo)
  }

  return (
    <Modal
      title="Mover a otro día"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar y volver
          </button>
          <button type="submit" form="form-mover-dia" className={btn} disabled={busy}>
            {busy ? 'Guardando…' : 'Mover gestión'}
          </button>
        </>
      }
    >
      <p>Elige el día para «{gestion.nombre}» ({fmtH(conflicto.taskHours)} h).</p>
      {sugeridas.length > 0 ? (
        <div className={styles.sugeridas} role="group" aria-label="Días con espacio">
          {sugeridas.map((s) => (
            <button
              key={s.date}
              type="button"
              className={`${styles.chip} ${plazo === s.date ? styles.chipOn : ''}`}
              aria-pressed={plazo === s.date}
              onClick={() => {
                setPlazo(s.date)
                setErr('')
              }}
            >
              {fmtFecha(s.date)}
              <span className={styles.libres}>{fmtH(s.availableHours)} h libres</span>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.nota}>No encontramos un día con espacio suficiente antes del evento. Prueba con menos horas.</p>
      )}
      <form id="form-mover-dia" noValidate onSubmit={guardar}>
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

/** `onSave(horas)`: baja las horas hasta lo que cabe ese día. Si la gestión tenía horario, se quita. */
export function ReducirHorasModal({ gestion, cambios, conflicto, busy, onSave, onClose }) {
  const disponibles = Number(conflicto.availableHours)
  const actuales = Number(cambios.horas ?? gestion.horas)
  const tieneHorario = Boolean((cambios.horaInicio ?? gestion.horaInicio) && (cambios.horaFin ?? gestion.horaFin))
  const sinEspacio = disponibles < 0.25
  const [horas, setHoras] = useState(sinEspacio ? '' : String(Math.min(actuales, disponibles)))
  const [err, setErr] = useState('')

  const guardar = (e) => {
    e.preventDefault()
    const n = Number(horas)
    if (!(n > 0)) return setErr('Indica unas horas mayores que 0.')
    if (n > disponibles) {
      return setErr(`Ese día solo caben ${fmtH(disponibles)} h sin pasar tu límite de ${conflicto.limitHours} h.`)
    }
    onSave(n)
  }

  return (
    <Modal
      title="Reducir horas estimadas"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onClose} disabled={busy}>
            Cancelar y volver
          </button>
          <button type="submit" form="form-reducir-horas" className={btn} disabled={busy || sinEspacio}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <p>«{gestion.nombre}»</p>
      <dl className={styles.cifras}>
        <div><dt>Horas actuales</dt><dd className="num">{fmtH(actuales)} h</dd></div>
        <div><dt>Horas planificadas ese día</dt><dd className="num">{fmtH(conflicto.plannedHours)} h</dd></div>
        <div><dt>Horas que caben</dt><dd className="num">{fmtH(disponibles)} h</dd></div>
      </dl>
      {sinEspacio ? (
        <p className={styles.nota}>Ese día ya está completo. Vuelve y elige «Mover a otro día».</p>
      ) : (
        <form id="form-reducir-horas" noValidate onSubmit={guardar}>
          <FormField label="Nuevas horas estimadas" error={err}>
            <input
              type="number"
              inputMode="decimal"
              min="0.25"
              max={disponibles}
              step="0.25"
              className="num"
              value={horas}
              onChange={(e) => {
                setHoras(e.target.value)
                setErr('')
              }}
            />
          </FormField>
          {tieneHorario && (
            <p className={styles.nota}>Esta gestión tiene horario. Al reducir las horas se quitará el horario y quedará solo con las horas.</p>
          )}
        </form>
      )}
    </Modal>
  )
}
