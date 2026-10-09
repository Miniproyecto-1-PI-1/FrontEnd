import { useId, useState } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import fieldStyles from './FormField.module.css'
import Icon from './Icon'
import { fmtFecha, hoyISO } from '../utils/date'
import shared from '../styles/shared.module.css'
import styles from './ConflictoModals.module.css'

const btn = `${shared.btn} ${shared.btnSm}`
const ghost = `${btn} ${shared.ghost}`

const num = (n) => Math.round(Number(n) * 100) / 100
const fmtH = (n) => `${num(n)} h`
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const diaSemana = (iso) => DIAS[new Date(`${iso}T12:00:00`).getDay()]

/**
 * Barra de carga de un día: lo ya planificado, la gestión y la marca del límite.
 * `restante` es lo que cabe sin pasarse; si la gestión no cabe, se pinta en rojo.
 */
function CargaDia({ planificadas, gestion, limite, fecha }) {
  const total = planificadas + gestion
  const pasa = total > limite
  const escala = Math.max(total, limite) * 1.08
  const pct = (h) => `${Math.min((h / escala) * 100, 100)}%`
  return (
    <div className={styles.carga}>
      <div className={styles.cargaHead}>
        <span>{fecha ? `Ese día · ${fmtFecha(fecha)}` : 'Ese día'}</span>
        <strong className={pasa ? styles.pasa : styles.cabe}>
          {fmtH(total)} de {fmtH(limite)}
        </strong>
      </div>
      <div
        className={styles.barra}
        role="img"
        aria-label={`${fmtH(planificadas)} ya planificadas más ${fmtH(gestion)} de esta gestión, con un límite de ${fmtH(limite)}`}
      >
        <span className={styles.segPlan} style={{ width: pct(planificadas) }} />
        <span
          className={`${styles.segGestion} ${pasa ? styles.segPasa : ''}`}
          style={{ left: pct(planificadas), width: pct(gestion) }}
        />
        <span className={styles.limite} style={{ left: pct(limite) }} />
      </div>
      <div className={styles.leyenda}>
        <span><i className={styles.dotPlan} /> Ya planificadas {fmtH(planificadas)}</span>
        <span><i className={`${styles.dotGestion} ${pasa ? styles.segPasa : ''}`} /> Esta gestión {fmtH(gestion)}</span>
      </div>
    </div>
  )
}

/** Aviso cuando guardar dejaría un día por encima del límite diario; ofrece las dos salidas. */
export function ConflictoSobrecargaModal({ mensaje, conflicto, onMover, onReducir, onClose }) {
  const sinEspacio = Number(conflicto.availableHours) < 0.25
  return (
    <Modal
      title="Conflicto de sobrecarga"
      onClose={onClose}
      footer={
        <button type="button" className={ghost} onClick={onClose}>
          Cancelar
        </button>
      }
    >
      <div className={styles.aviso} role="alert">
        <span className={styles.avisoIcono}><Icon name="alert" size={20} /></span>
        <p>{mensaje}</p>
      </div>
      <CargaDia
        planificadas={Number(conflicto.plannedHours)}
        gestion={Number(conflicto.taskHours)}
        limite={Number(conflicto.limitHours)}
        fecha={conflicto.date}
      />
      <p className={styles.pregunta}>¿Cómo deseas resolverlo?</p>
      <div className={styles.opciones}>
        <button type="button" className={styles.opcion} onClick={onMover}>
          <span className={styles.opcionIcono}><Icon name="calendar" size={20} /></span>
          <span className={styles.opcionTexto}>
            <strong>Mover a otro día</strong>
          </span>
          <Icon name="chevronRight" size={18} />
        </button>
        <button type="button" className={styles.opcion} onClick={onReducir}>
          <span className={styles.opcionIcono}><Icon name="clock" size={20} /></span>
          <span className={styles.opcionTexto}>
            <strong>Reducir horas estimadas</strong>
            {sinEspacio && <small>Ese día ya está completo.</small>}
          </span>
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </Modal>
  )
}

/** `onSave(plazo)`: elige un día que sí cabe (sugerido) o cualquier otro. */
export function MoverDiaModal({ gestion, conflicto, fechaEvento, busy, onSave, onClose, onVolver }) {
  const sugeridas = conflicto.suggestedDates ?? []
  const [plazo, setPlazo] = useState(sugeridas[0]?.date ?? conflicto.date)
  const [err, setErr] = useState('')
  const limite = Number(conflicto.limitHours)

  const elegir = (fecha) => {
    setPlazo(fecha)
    setErr('')
  }

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
          <button type="button" className={ghost} onClick={onVolver} disabled={busy}>
            Cancelar y volver
          </button>
          <button type="submit" form="form-mover-dia" className={btn} disabled={busy}>
            {busy ? 'Guardando…' : 'Mover gestión'}
          </button>
        </>
      }
    >
      <div className={styles.resumen}>
        <strong>{gestion.nombre}</strong>
        <span>{fmtH(conflicto.taskHours)}</span>
      </div>
      {sugeridas.length > 0 ? (
        <>
          <p className={styles.seccion}>Días con espacio</p>
          <div className={styles.dias} role="radiogroup" aria-label="Días con espacio">
            {sugeridas.map((s) => {
              const activo = plazo === s.date
              const usado = limite - Number(s.availableHours)
              return (
                <button
                  key={s.date}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  className={`${styles.dia} ${activo ? styles.diaOn : ''}`}
                  onClick={() => elegir(s.date)}
                >
                  <span className={styles.diaSem}>{diaSemana(s.date)}</span>
                  <span className={styles.diaFecha}>{fmtFecha(s.date)}</span>
                  <span className={styles.diaBarra} aria-hidden="true">
                    <span style={{ width: `${Math.min((usado / limite) * 100, 100)}%` }} />
                  </span>
                  <span className={styles.diaLibre}>{fmtH(s.availableHours)} libres</span>
                  {activo && <span className={styles.diaCheck}><Icon name="check" size={14} /></span>}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <p className={styles.nota}>No hay un día con espacio antes del evento. Prueba con menos horas.</p>
      )}
      <form id="form-mover-dia" noValidate onSubmit={guardar}>
        <FormField label={sugeridas.length > 0 ? 'O elige otra fecha' : 'Nueva fecha límite'} error={err}>
          <input
            type="date"
            value={plazo}
            min={hoyISO()}
            max={fechaEvento || undefined}
            onChange={(e) => elegir(e.target.value)}
          />
        </FormField>
      </form>
    </Modal>
  )
}

/** `onSave(horas)`: baja las horas hasta lo que cabe ese día. Si la gestión tenía horario, se quita. */
export function ReducirHorasModal({ gestion, cambios, conflicto, busy, onSave, onClose, onVolver }) {
  const disponibles = Number(conflicto.availableHours)
  const actuales = Number(cambios.horas ?? gestion.horas)
  const planificadas = Number(conflicto.plannedHours)
  const limite = Number(conflicto.limitHours)
  const tieneHorario = Boolean((cambios.horaInicio ?? gestion.horaInicio) && (cambios.horaFin ?? gestion.horaFin))
  const sinEspacio = disponibles < 0.25
  const [horas, setHoras] = useState(sinEspacio ? '' : String(num(Math.min(actuales, disponibles))))
  const [err, setErr] = useState('')
  const idHoras = useId()

  const valor = Number(horas)
  const paso = (delta) => {
    const siguiente = Math.min(Math.max(num((valor || 0) + delta), 0.25), disponibles)
    setHoras(String(siguiente))
    setErr('')
  }

  const guardar = (e) => {
    e.preventDefault()
    if (!(valor > 0)) return setErr('Indica unas horas mayores que 0.')
    if (valor > disponibles) {
      return setErr(`Ese día solo caben ${fmtH(disponibles)} sin pasar tu límite de ${fmtH(limite)}.`)
    }
    onSave(valor)
  }

  return (
    <Modal
      title="Reducir horas estimadas"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ghost} onClick={onVolver} disabled={busy}>
            Cancelar y volver
          </button>
          <button type="submit" form="form-reducir-horas" className={btn} disabled={busy || sinEspacio}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <div className={styles.resumen}>
        <strong>{gestion.nombre}</strong>
        <span>ahora {fmtH(actuales)}</span>
      </div>
      {sinEspacio ? (
        <>
          <CargaDia planificadas={planificadas} gestion={0} limite={limite} fecha={conflicto.date} />
          <p className={styles.nota}>Ese día ya está completo. Elige «Mover a otro día».</p>
        </>
      ) : (
        <form id="form-reducir-horas" noValidate onSubmit={guardar}>
          <CargaDia planificadas={planificadas} gestion={valor > 0 ? valor : 0} limite={limite} fecha={conflicto.date} />
          <div className={`${fieldStyles.field} ${err ? fieldStyles.error : ''}`}>
            <label htmlFor={idHoras}>Nuevas horas estimadas</label>
            <div className={styles.stepper}>
              <button type="button" className={styles.stepBtn} aria-label="Restar 15 minutos" onClick={() => paso(-0.25)}>
                <Icon name="minus" size={16} />
              </button>
              <input
                id={idHoras}
                type="number"
                inputMode="decimal"
                min="0.25"
                max={disponibles}
                step="0.25"
                className="num"
                aria-invalid={err ? true : undefined}
                value={horas}
                onChange={(e) => {
                  setHoras(e.target.value)
                  setErr('')
                }}
              />
              <button type="button" className={styles.stepBtn} aria-label="Sumar 15 minutos" onClick={() => paso(0.25)}>
                <Icon name="plus" size={16} />
              </button>
            </div>
            {err ? (
              <span className={fieldStyles.errorMsg}>{err}</span>
            ) : (
              <span className={fieldStyles.hint}>Caben hasta {fmtH(disponibles)}.</span>
            )}
          </div>
          {tieneHorario && (
            <p className={styles.nota}>Se quitará el horario de esta gestión.</p>
          )}
        </form>
      )}
    </Modal>
  )
}
