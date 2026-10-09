import { useState } from 'react'
import { calcHoras } from '../utils/date'
import FormField, { FormGroup } from './FormField'
import styles from './GestionFields.module.css'

const MODOS = [
  { key: 'horas', label: 'Horas estimadas' },
  { key: 'horario', label: 'Horario' },
]

export default function GestionFields({ value, onChange, errors = {}, fechaEvento }) {
  // La duración se define de una sola forma: o se escriben las horas, o se elige el horario y se calculan solas.
  const [modo, setModo] = useState(() => (value.horaInicio && value.horaFin ? 'horario' : 'horas'))
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })

  const cambiarModo = (nuevo) => {
    if (nuevo === modo) return
    setModo(nuevo)
    if (nuevo === 'horas') onChange({ ...value, horaInicio: '', horaFin: '' })
  }

  const setHora = (k) => (e) => {
    const next = { ...value, [k]: e.target.value }
    const horas = calcHoras(next.horaInicio, next.horaFin)
    onChange(horas > 0 ? { ...next, horas: String(horas) } : next)
  }

  const horasCalculadas = calcHoras(value.horaInicio, value.horaFin)

  return (
    <div className={styles.box}>
      <div className={styles.grid}>
        <FormField className={styles.name} label="Gestión" required error={errors.nombre}>
          <input value={value.nombre} onChange={set('nombre')} placeholder="Ej. Reservar salón" />
        </FormField>
        <FormField className={styles.date} label="Fecha límite" error={errors.plazo}>
          <input type="date" value={value.plazo} max={fechaEvento || undefined} onChange={set('plazo')} />
        </FormField>
        <FormGroup className={styles.duration} legend="Duración" error={errors.horario || errors.horas}>
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
                <input type="time" aria-label="Hora de fin" value={value.horaFin} onChange={setHora('horaFin')} />
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
