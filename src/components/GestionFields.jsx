import { useState } from 'react'
import { calcHoras, sumarHoras } from '../utils/date'
import FormField, { FormGroup } from './FormField'
import styles from './GestionFields.module.css'

const MODOS = [
  { key: 'horas', label: 'Horas estimadas' },
  { key: 'horario', label: 'Horario' },
]

export default function GestionFields({ value, onChange, errors = {}, fechaEvento }) {
  // La duración se define de una sola forma: o se escriben las horas, o se elige el horario y se calculan solas.
  const [modo, setModo] = useState(() => (value.horaInicio && value.horaFin ? 'horario' : 'horas'))
  // Si la persona escribe la hora de fin, no se la vuelve a cambiar sola mientras siga siendo válida.
  const [finManual, setFinManual] = useState(false)
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })

  const cambiarModo = (nuevo) => {
    if (nuevo === modo) return
    setModo(nuevo)
    if (nuevo === 'horas') onChange({ ...value, horaInicio: '', horaFin: '' })
  }

  const setHora = (k) => (e) => {
    const next = { ...value, [k]: e.target.value }
    if (k === 'horaFin') setFinManual(true)
    // Al elegir la hora de inicio, la de fin se propone sola (una hora después) si está vacía,
    // si no la escribió la persona o si quedó antes del inicio.
    if (k === 'horaInicio' && next.horaInicio && (!next.horaFin || !finManual || calcHoras(next.horaInicio, next.horaFin) <= 0)) {
      next.horaFin = sumarHoras(next.horaInicio, 1)
    }
    const horas = calcHoras(next.horaInicio, next.horaFin)
    onChange(horas > 0 ? { ...next, horas: String(horas) } : next)
  }

  const horasCalculadas = calcHoras(value.horaInicio, value.horaFin)
  // El error se marca en cuanto el fin queda antes del inicio, sin esperar a guardar.
  const finInvalido = Boolean(value.horaInicio && value.horaFin && horasCalculadas <= 0)
  const errorHorario =
    errors.horario ||
    (finInvalido ? 'La hora de fin debe ser posterior a la de inicio. Revisa a. m. y p. m.: las 12:00 a. m. son medianoche.' : '')

  return (
    <div className={styles.box}>
      <div className={styles.grid}>
        <FormField className={styles.name} label="Tarea" required error={errors.nombre}>
          <input value={value.nombre} onChange={set('nombre')} placeholder="Ej. Reservar salón" />
        </FormField>
        <FormField className={styles.date} label="Fecha límite" error={errors.plazo}>
          <input type="date" value={value.plazo} max={fechaEvento || undefined} onChange={set('plazo')} />
        </FormField>
        <FormGroup className={styles.duration} legend="Duración" error={errorHorario || errors.horas}>
          <div className={styles.modes} role="radiogroup" aria-label="Cómo indicar la duración">
            {MODOS.map((m) => (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={modo === m.key}
                className={modo === m.key ? styles.modeOn : undefined}
                onClick={() => cambiarModo(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
          {modo === 'horas' ? (
            <div className={styles.hoursRow}>
              <input
                type="number"
                inputMode="decimal"
                min="0.25"
                step="0.25"
                className="num"
                aria-label="Horas estimadas"
                value={value.horas}
                onChange={set('horas')}
              />
              <span className={styles.sep}>h</span>
            </div>
          ) : (
            <>
              <div className={styles.timeRange}>
                <input type="time" aria-label="Hora de inicio" value={value.horaInicio} onChange={setHora('horaInicio')} />
                <span className={styles.sep} aria-hidden="true">a</span>
                <input
                  type="time"
                  aria-label="Hora de fin"
                  aria-invalid={finInvalido || undefined}
                  value={value.horaFin}
                  onChange={setHora('horaFin')}
                />
              </div>
              <output className={styles.calc}>
                {horasCalculadas > 0 ? `Duración: ${horasCalculadas} h` : 'Indica la hora de inicio y la de fin.'}
              </output>
            </>
          )}
        </FormGroup>
        <FormField className={styles.desc} label="Descripción" optional>
          <input value={value.descripcion} onChange={set('descripcion')} placeholder="Detalles, proveedor, notas…" />
        </FormField>
      </div>
    </div>
  )
}
