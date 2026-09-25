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

  return (
    <div className={styles.box}>
      <div className={styles.grid}>
        <Field area="name" label="Gestión" error={errors.nombre}>
          <input value={value.nombre} onChange={set('nombre')} placeholder="Ej. Reservar salón" />
        </Field>
        <Field area="date" label="Fecha límite" error={errors.plazo}>
          <input type="date" value={value.plazo} onChange={set('plazo')} />
        </Field>
        <Field
          area="time"
          label={
            <>
              Horario estimado
              <span className={`${styles.duration} num`}>{calcHoras(value.horaInicio, value.horaFin)}h</span>
            </>
          }
          error={errors.horario}
        >
          <div className={styles.timeRange}>
            <input type="time" aria-label="Hora de inicio" value={value.horaInicio} onChange={set('horaInicio')} />
            <span className={styles.sep}>a</span>
            <input type="time" aria-label="Hora de fin" value={value.horaFin} onChange={set('horaFin')} />
          </div>
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
