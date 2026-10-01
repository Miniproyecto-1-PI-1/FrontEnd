import { calcHoras } from '../utils/date'
import FormField, { FormGroup } from './FormField'
import styles from './GestionFields.module.css'

export default function GestionFields({ value, onChange, errors = {}, fechaEvento }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })

  // Al cambiar el horario se proponen las horas; el usuario puede ajustarlas después.
  const setHora = (k) => (e) => {
    const next = { ...value, [k]: e.target.value }
    const horas = calcHoras(next.horaInicio, next.horaFin)
    onChange(horas > 0 ? { ...next, horas: String(horas) } : next)
  }

  return (
    <div className={styles.box}>
      <div className={styles.grid}>
        <FormField className={styles.name} label="Gestión" required error={errors.nombre}>
          <input value={value.nombre} onChange={set('nombre')} placeholder="Ej. Reservar salón" />
        </FormField>
        <FormField className={styles.date} label="Fecha límite" error={errors.plazo}>
          <input type="date" value={value.plazo} max={fechaEvento || undefined} onChange={set('plazo')} />
        </FormField>
        <FormGroup className={styles.time} legend="Horario" error={errors.horario}>
          <div className={styles.timeRange}>
            <input type="time" aria-label="Hora de inicio" value={value.horaInicio} onChange={setHora('horaInicio')} />
            <span className={styles.sep} aria-hidden="true">a</span>
            <input type="time" aria-label="Hora de fin" value={value.horaFin} onChange={setHora('horaFin')} />
          </div>
        </FormGroup>
        <FormField className={styles.hours} label="Horas" error={errors.horas}>
          <input
            type="number"
            inputMode="decimal"
            min="0.25"
            step="0.25"
            className="num"
            value={value.horas}
            onChange={set('horas')}
          />
        </FormField>
        <FormField className={styles.desc} label="Descripción" optional>
          <input value={value.descripcion} onChange={set('descripcion')} placeholder="Detalles, proveedor, notas…" />
        </FormField>
      </div>
    </div>
  )
}
