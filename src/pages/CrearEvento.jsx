import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventsContext'
import { calcHoras, hoyISO } from '../utils/date'
import shared from '../styles/shared.module.css'
import styles from './CrearEvento.module.css'

let nextRowId = 1
const nuevaGestion = () => ({
  rid: nextRowId++,
  nombre: '',
  descripcion: '',
  plazo: '',
  horaInicio: '09:00',
  horaFin: '10:00',
})

function Field({ label, required, error, errorMsg, hint, children }) {
  return (
    <div className={`${styles.field} ${error ? styles.error : ''}`}>
      <label>
        {label}
        {required && <span className={styles.req}>*</span>}
      </label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
      {errorMsg && <span className={styles.errorMsg}>{errorMsg}</span>}
    </div>
  )
}

export default function CrearEvento() {
  const navigate = useNavigate()
  const { clientes, addEvento } = useEvents()

  const [form, setForm] = useState({
    nombre: '', fecha: '', hora: '', lugar: '', descripcion: '',
    clienteNombre: '', clienteTelefono: '', clienteCorreo: '',
  })
  const [gestiones, setGestiones] = useState(() => [nuevaGestion()])
  const [errors, setErrors] = useState({})
  const [clienteAuto, setClienteAuto] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onClienteNombre = (e) => {
    const valor = e.target.value
    const existente = clientes.find((c) => c.nombre.toLowerCase() === valor.trim().toLowerCase())
    setForm((f) => ({
      ...f,
      clienteNombre: valor,
      ...(existente && { clienteTelefono: existente.telefono ?? '', clienteCorreo: existente.correo ?? '' }),
    }))
    setClienteAuto(Boolean(existente))
  }

  const setG = (rid, k) => (e) =>
    setGestiones((gs) => gs.map((g) => (g.rid === rid ? { ...g, [k]: e.target.value } : g)))
  const quitarG = (rid) => setGestiones((gs) => gs.filter((g) => g.rid !== rid))

  const guardar = (e) => {
    e.preventDefault()
    const next = {
      nombre: form.nombre.trim() === '',
      fecha: form.fecha === '',
      lugar: form.lugar.trim() === '',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return

    const subtareas = gestiones.map((g, i) => ({
      id: Date.now() + i,
      nombre: g.nombre.trim() || 'Gestión sin nombre',
      descripcion: g.descripcion.trim(),
      plazo: g.plazo || hoyISO(),
      horas: calcHoras(g.horaInicio, g.horaFin) || 1,
      horaInicio: g.horaInicio,
      horaFin: g.horaFin,
      estado: 'PENDIENTE',
    }))

    addEvento(
      {
        nombre: form.nombre.trim(),
        tipo: 'Otro',
        fecha: form.fecha,
        hora: form.hora,
        lugar: form.lugar.trim(),
        descripcion: form.descripcion.trim(),
        subtareas,
      },
      {
        nombre: form.clienteNombre,
        telefono: form.clienteTelefono.trim(),
        correo: form.clienteCorreo.trim(),
      },
    )
    navigate('/eventos', { state: { toast: 'Evento creado exitosamente' } })
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.breadcrumb} ${shared.fixed}`}>
        <Link to="/eventos">← Volver a eventos</Link>
      </div>
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>Crear evento</h2>
      </div>

      <form className={shared.page} noValidate onSubmit={guardar}>
        <div className={shared.scroll}>
        <div className={shared.cardPanel}>
          <fieldset className={styles.fieldset}>
            <legend>Evento</legend>
            <Field label="Nombre del evento" required error={errors.nombre} errorMsg="El nombre es obligatorio.">
              <input value={form.nombre} onChange={set('nombre')} placeholder="Ej. Fiesta de Halloween" />
            </Field>
            <div className={styles.rowEvt}>
              <Field label="Fecha" required error={errors.fecha} errorMsg="La fecha es obligatoria.">
                <input type="date" value={form.fecha} onChange={set('fecha')} />
              </Field>
              <Field label="Hora">
                <input type="time" value={form.hora} onChange={set('hora')} />
              </Field>
              <Field label="Lugar" required error={errors.lugar} errorMsg="El lugar es obligatorio.">
                <input value={form.lugar} onChange={set('lugar')} placeholder="Salón, dirección o venue" />
              </Field>
            </div>
            <Field label="Descripción breve">
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={set('descripcion')}
                placeholder="Ej. Cumpleaños de 15 años, 80 invitados, tema tropical"
              />
            </Field>
            <p className={styles.hint}>
              <span className={styles.req}>*</span> Campo obligatorio
            </p>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>Cliente</legend>
            <div className={styles.row3}>
              <Field label="Nombre" hint={clienteAuto ? 'Datos cargados de un cliente ya guardado.' : undefined}>
                <input
                  list="clientesList"
                  value={form.clienteNombre}
                  onChange={onClienteNombre}
                  placeholder="Busca o crea un cliente"
                />
                <datalist id="clientesList">
                  {clientes.map((c) => (
                    <option key={c.id} value={c.nombre} />
                  ))}
                </datalist>
              </Field>
              <Field label="Teléfono">
                <input type="tel" value={form.clienteTelefono} onChange={set('clienteTelefono')} placeholder="Ej. 300 987 6543" />
              </Field>
              <Field label="Correo">
                <input type="email" value={form.clienteCorreo} onChange={set('clienteCorreo')} placeholder="cliente@correo.com" />
              </Field>
            </div>
            <p className={styles.hint}>
              Se guarda como cliente reutilizable — lo podrás buscar y reasignar en próximos eventos.
            </p>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>Gestiones</legend>
            <p className={`${styles.hint} ${styles.gestionesHint}`}>
              Subtareas logísticas con plazo y horas estimadas.
            </p>
            {gestiones.map((g, i) => (
              <div key={g.rid} className={styles.subCard}>
                <div className={styles.subHead}>
                  <span className={styles.subNum}>Gestión {i + 1}</span>
                  <button type="button" className={styles.remove} onClick={() => quitarG(g.rid)}>
                    ✕ Quitar
                  </button>
                </div>
                <div className={styles.subGrid}>
                  <div className={`${styles.field} ${styles.colName}`}>
                    <label>Gestión</label>
                    <input value={g.nombre} onChange={setG(g.rid, 'nombre')} placeholder="Ej. Reservar salón" />
                  </div>
                  <div className={`${styles.field} ${styles.colDate}`}>
                    <label>Fecha límite</label>
                    <input type="date" value={g.plazo} onChange={setG(g.rid, 'plazo')} />
                  </div>
                  <div className={`${styles.field} ${styles.colTime}`}>
                    <label>
                      Horario estimado
                      <span className={`${styles.duration} num`}>{calcHoras(g.horaInicio, g.horaFin)}h</span>
                    </label>
                    <div className={styles.timeRange}>
                      <input type="time" aria-label="Hora de inicio" value={g.horaInicio} onChange={setG(g.rid, 'horaInicio')} />
                      <span className={styles.sep}>a</span>
                      <input type="time" aria-label="Hora de fin" value={g.horaFin} onChange={setG(g.rid, 'horaFin')} />
                    </div>
                  </div>
                  <div className={`${styles.field} ${styles.colDesc}`}>
                    <label>Descripción <span className={styles.optional}>(opcional)</span></label>
                    <input value={g.descripcion} onChange={setG(g.rid, 'descripcion')} placeholder="Detalles, proveedor, notas…" />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
              onClick={() => setGestiones((gs) => [...gs, nuevaGestion()])}
            >
              ＋ Añadir gestión
            </button>
          </fieldset>

        </div>
        </div>
        <div className={shared.footerBar}>
          <button className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`} type="button" onClick={() => navigate('/eventos')}>
            Cancelar
          </button>
          <button className={`${shared.btn} ${shared.btnSm}`} type="submit">Guardar evento</button>
        </div>
      </form>
    </section>
  )
}
