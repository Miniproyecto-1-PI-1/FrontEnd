import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eventosApi } from '../api/eventosApi'
import { ApiError } from '../api/http'
import { TIPOS } from '../data/tipos'
import { fmtFecha, hoyISO } from '../utils/date'
import { CAMPO_GESTION, validarGestion } from '../utils/gestion'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import FormField from '../components/FormField'
import GestionFields from '../components/GestionFields'
import Icon from '../components/Icon'
import UnsavedChangesModal from '../components/UnsavedChangesModal'
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
  horas: '1',
})

const FORM_VACIO = {
  nombre: '', tipo: 'Otro', fecha: '', hora: '', lugar: '', descripcion: '',
  clienteNombre: '', clienteTelefono: '', clienteCorreo: '',
}

const tieneContenido = (g) => g.nombre.trim() || g.descripcion.trim() || g.plazo

export default function CrearEvento() {
  const navigate = useNavigate()
  const formRef = useRef(null)

  const [form, setForm] = useState(FORM_VACIO)
  const [gestiones, setGestiones] = useState(() => [nuevaGestion()])
  const [errors, setErrors] = useState({})
  const [gErrors, setGErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const dirty = Object.keys(FORM_VACIO).some((k) => form[k] !== FORM_VACIO[k]) || gestiones.some(tieneContenido)
  const { blocker, allowNavigation } = useUnsavedChanges(dirty && !saving)
  // El punto avisa en la pestaña que hay cambios sin guardar, como en los editores.
  useDocumentTitle(dirty ? '● Crear evento' : 'Crear evento')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const updateG = (rid, v) => setGestiones((gs) => gs.map((g) => (g.rid === rid ? { ...g, ...v } : g)))
  const quitarG = (rid) => setGestiones((gs) => gs.filter((g) => g.rid !== rid))

  // Lleva al usuario al primer campo con error (puede estar fuera de la vista).
  const enfocarPrimerError = () => {
    requestAnimationFrame(() => {
      const campo = formRef.current?.querySelector('[aria-invalid="true"]')
      campo?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      campo?.focus({ preventScroll: true })
    })
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (saving) return

    const activas = gestiones.filter(tieneContenido)
    const gErr = {}
    activas.forEach((g) => {
      const err = validarGestion(g, { plazoObligatorio: false, fechaEvento: form.fecha || undefined })
      if (Object.keys(err).length) gErr[g.rid] = err
    })
    const next = {
      nombre: form.nombre.trim() === '' && 'El nombre es obligatorio.',
      fecha: form.fecha === ''
        ? 'La fecha es obligatoria.'
        : form.fecha < hoyISO() && 'La fecha del evento no puede ser anterior a hoy.',
      lugar: form.lugar.trim() === '' && 'El lugar es obligatorio.',
    }
    setErrors(next)
    setGErrors(gErr)
    if (Object.values(next).some(Boolean) || Object.keys(gErr).length) {
      setSubmitError('Revisa los campos marcados en rojo.')
      enfocarPrimerError()
      return
    }

    setSubmitError(null)
    setSaving(true)
    try {
      await eventosApi.create({
        nombre: form.nombre.trim(),
        tipo: form.tipo,
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
          horas: g.horas,
        })),
      })
      allowNavigation()
      navigate('/eventos', { state: { toast: 'Evento creado exitosamente.' } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const fe = err.fieldErrors
        setErrors({ nombre: fe.name, tipo: fe.type, fecha: fe.date, lugar: fe.place })
        const g = {}
        Object.entries(fe).forEach(([key, msg]) => {
          const m = /^tasks\[(\d+)\]\.(\w+)/.exec(key)
          const fila = m && activas[Number(m[1])]
          if (fila) {
            const campo = CAMPO_GESTION[m[2]] ?? 'horario'
            g[fila.rid] = { ...g[fila.rid], [campo]: msg }
          }
        })
        setGErrors(g)
        setSubmitError('Revisa los campos marcados en rojo.')
        enfocarPrimerError()
      } else {
        setSubmitError(
          err.overload
            ? `${fmtFecha(err.overload.date)}: ${err.message} Cambia las fechas u horas de tus gestiones.`
            : err.message || 'No se pudo guardar el evento. Inténtalo de nuevo.',
        )
      }
      setSaving(false)
    }
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.contain} ${shared.fixed}`}>
        <div className={shared.breadcrumb}>
          <Link to="/eventos">
            <Icon name="arrowLeft" size={16} /> Volver a eventos
          </Link>
        </div>
        <div className={shared.viewHead}>
          <h2>Crear evento</h2>
        </div>
        {submitError && (
          <div className={shared.banner} role="alert">
            {submitError}
          </div>
        )}
      </div>

      <form ref={formRef} className={shared.page} noValidate onSubmit={guardar}>
        <div className={shared.scroll}>
          <div className={shared.contain}>
            <fieldset className={styles.fieldset}>
              <legend>Evento</legend>
              <div className={styles.rowNombre}>
                <FormField label="Nombre del evento" required error={errors.nombre}>
                  <input value={form.nombre} onChange={set('nombre')} placeholder="Ej. Fiesta de Halloween" />
                </FormField>
                <FormField label="Tipo de evento" error={errors.tipo}>
                  <select value={form.tipo} onChange={set('tipo')}>
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className={styles.rowEvt}>
                <FormField label="Fecha" required error={errors.fecha}>
                  <input type="date" min={hoyISO()} value={form.fecha} onChange={set('fecha')} />
                </FormField>
                <FormField label="Hora" optional>
                  <input type="time" value={form.hora} onChange={set('hora')} />
                </FormField>
                <FormField label="Lugar" required error={errors.lugar}>
                  <input value={form.lugar} onChange={set('lugar')} placeholder="Salón, dirección o venue" />
                </FormField>
              </div>
              <FormField label="Descripción breve" optional>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={set('descripcion')}
                  placeholder="Ej. Cumpleaños de 15 años, 80 invitados, tema tropical"
                />
              </FormField>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Cliente</legend>
              <p className={styles.legendHint}>Opcional.</p>
              <div className={styles.row3}>
                <FormField label="Nombre">
                  <input value={form.clienteNombre} onChange={set('clienteNombre')} placeholder="Nombre del cliente" />
                </FormField>
                <FormField label="Teléfono">
                  <input type="tel" value={form.clienteTelefono} onChange={set('clienteTelefono')} placeholder="Ej. 300 987 6543" />
                </FormField>
                <FormField label="Correo">
                  <input type="email" value={form.clienteCorreo} onChange={set('clienteCorreo')} placeholder="cliente@correo.com" />
                </FormField>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Gestiones</legend>
              <p className={styles.legendHint}>
                Las filas vacías se ignoran.
              </p>
              {gestiones.map((g, i) => (
                <div key={g.rid} className={styles.subCard}>
                  <div className={styles.subHead}>
                    <span className={styles.subNum}>Gestión {i + 1}</span>
                    <button
                      type="button"
                      className={`${shared.iconbtn} ${shared.iconbtnDanger}`}
                      onClick={() => quitarG(g.rid)}
                    >
                      <Icon name="x" size={14} /> Quitar
                    </button>
                  </div>
                  <GestionFields
                    value={g}
                    onChange={(v) => updateG(g.rid, v)}
                    errors={gErrors[g.rid] ?? {}}
                    fechaEvento={form.fecha || undefined}
                  />
                </div>
              ))}
              <button
                type="button"
                className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
                onClick={() => setGestiones((gs) => [...gs, nuevaGestion()])}
              >
                <Icon name="plus" size={16} /> Añadir gestión
              </button>
            </fieldset>
          </div>
        </div>
        <div className={shared.footerBar}>
          <div className={`${shared.contain} ${styles.footerInner}`}>
            <span className={styles.reqNote}>
              <span className={styles.req}>*</span> Campo obligatorio
            </span>
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
        </div>
      </form>
      <UnsavedChangesModal blocker={blocker} />
    </section>
  )
}
