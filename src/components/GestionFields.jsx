import { calcHoras } from '../utils/date'
import styles from './GestionFields.module.css'

function Field({ area, label, error, children }) {
  return (
    <div className={`${styles.field} ${styles[area]} ${error ? styles.error : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}

export default function GestionFields({ value, onChange, errors = {} }) {
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
        <Field area="name" label="Gestión" error={errors.nombre}>
          <input value={value.nombre} onChange={set('nombre')} placeholder="Ej. Reservar salón" />
        </Field>
        <Field area="date" label="Fecha límite" error={errors.plazo}>
          <input type="date" value={value.plazo} onChange={set('plazo')} />
        </Field>
        <Field area="time" label="Horario" error={errors.horario}>
          <div className={styles.timeRange}>
            <input type="time" aria-label="Hora de inicio" value={value.horaInicio} onChange={setHora('horaInicio')} />
            <span className={styles.sep}>a</span>
            <input type="time" aria-label="Hora de fin" value={value.horaFin} onChange={setHora('horaFin')} />
          </div>
        </Field>
        <Field area="hours" label="Horas estimadas" error={errors.horas}>
          <input
            type="number"
            inputMode="decimal"
            min="0.25"
            step="0.25"
            className="num"
            value={value.horas}
            onChange={set('horas')}
          />
        </Field>
        <Field
          area="desc"
          label={
            <>
              Descripción <span className={styles.optional}>(opcional)</span>
            </>
          }
        >
          <input value={value.descripcion} onChange={set('descripcion')} placeholder="Detalles, proveedor, notas…" />
        </Field>
      </div>
    </div>
  )
}
