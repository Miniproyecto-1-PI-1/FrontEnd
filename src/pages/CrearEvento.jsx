import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { ApiError } from '../api/http'
import { validarGestion } from '../utils/gestion'
import GestionFields from '../components/GestionFields'
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

const tieneContenido = (g) => g.nombre.trim() || g.descripcion.trim() || g.plazo

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
  const [clientes, setClientes] = useState([])

  const [form, setForm] = useState({
    nombre: '', fecha: '', hora: '', lugar: '', descripcion: '',
    clienteNombre: '', clienteTelefono: '', clienteCorreo: '',
  })
  const [gestiones, setGestiones] = useState(() => [nuevaGestion()])
  const [errors, setErrors] = useState({})
  const [gErrors, setGErrors] = useState({})
  const [clienteAuto, setClienteAuto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    let alive = true
    eventosApi
      .listClientes()
      .then((c) => alive && setClientes(c))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

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

  const updateG = (rid, v) => setGestiones((gs) => gs.map((g) => (g.rid === rid ? { ...g, ...v } : g)))
  const quitarG = (rid) => setGestiones((gs) => gs.filter((g) => g.rid !== rid))

  const guardar = async (e) => {
    e.preventDefault()
    if (saving) return

    const activas = gestiones.filter(tieneContenido)
    const gErr = {}
    activas.forEach((g) => {
      const err = validarGestion(g, { plazoObligatorio: false })
      if (Object.keys(err).length) gErr[g.rid] = err
    })
    const next = {
      nombre: form.nombre.trim() === '',
      fecha: form.fecha === '',
      lugar: form.lugar.trim() === '',
    }
    setErrors(next)
    setGErrors(gErr)
    if (Object.values(next).some(Boolean) || Object.keys(gErr).length) {
      setSubmitError('Revisa los campos marcados en rojo.')
      return
    }

    setSubmitError(null)
    setSaving(true)
    try {
      await eventosApi.create({
        nombre: form.nombre.trim(),
        fecha: form.fecha,
        hora: form.hora,
        lugar: form.lugar.trim(),
        descripcion: form.descripcion.trim(),
        cliente: {
          nombre: form.clienteNombre.trim(),
          telefono: form.clienteTelefono.trim(),
          correo: form.clienteCorreo.trim(),
        },
        subtareas: activas.map((g) => ({
          nombre: g.nombre.trim(),
          descripcion: g.descripcion.trim(),
          plazo: g.plazo,
          horaInicio: g.horaInicio,
          horaFin: g.horaFin,
        })),
      })
      navigate('/eventos', { state: { toast: 'Evento creado exitosamente' } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const fe = err.fieldErrors
        setErrors({ nombre: 'name' in fe, fecha: 'date' in fe, lugar: 'place' in fe })
        const g = {}
        Object.keys(fe).forEach((key) => {
          const m = /^tasks\[(\d+)\]\.(\w+)/.exec(key)
          const fila = m && activas[Number(m[1])]
          if (fila) {
            const campo = m[2] === 'name' ? 'nombre' : 'horario'
            g[fila.rid] = { ...g[fila.rid], [campo]: campo === 'nombre' ? 'El nombre de la gestión es obligatorio.' : 'Revisa el horario de esta gestión.' }
          }
        })
        setGErrors(g)
        setSubmitError('Revisa los campos marcados en rojo.')
      } else {
        setSubmitError('No se pudo guardar el evento. Inténtalo de nuevo.')
      }
      setSaving(false)
    }
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.breadcrumb} ${shared.fixed}`}>
        <Link to="/eventos">← Volver a eventos</Link>
      </div>
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>Crear evento</h2>
      </div>

      {submitError && (
        <div className={`${styles.banner} ${shared.fixed}`} role="alert">
          {submitError}
        </div>
      )}

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
              {gestiones.map((g, i) => {
                const ge = gErrors[g.rid] ?? {}
                return (
                  <div key={g.rid} className={styles.subCard}>
                    <div className={styles.subHead}>
                      <span className={styles.subNum}>Gestión {i + 1}</span>
                      <button type="button" className={styles.remove} onClick={() => quitarG(g.rid)}>
                        ✕ Quitar
                      </button>
                    </div>
                    <GestionFields value={g} onChange={(v) => updateG(g.rid, v)} errors={ge} />
                  </div>
                )
              })}
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
          <button
            className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
            type="button"
            onClick={() => navigate('/eventos')}
            disabled={saving}
          >
            Cancelar
          </button>
          <button className={`${shared.btn} ${shared.btnSm}`} type="submit" disabled={saving} aria-busy={saving}>
            {saving ? 'Guardando…' : 'Guardar evento'}
          </button>
        </div>
      </form>
    </section>
  )
}
