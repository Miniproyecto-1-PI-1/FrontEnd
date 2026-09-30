import { useCallback, useRef, useState } from 'react'
import { usersApi } from '../api/usersApi'
import { useAuth } from '../hooks/useAuth'
import { aAvatarDataUrl } from '../utils/imagen'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import shared from '../styles/shared.module.css'
import styles from './Configuracion.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASS = 6

function Field({ id, label, error, hint, ...inputProps }) {
  return (
    <div className={`${styles.field} ${error ? styles.error : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
      {error ? <span className={styles.errorMsg}>{error}</span> : hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

const soloErrores = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v))

/** Traduce los errores del backend a los campos del formulario; lo que no encaje va a `general`. */
function erroresDeApi(err, mapa) {
  const campos = {}
  for (const [k, v] of Object.entries(err.fieldErrors ?? {})) {
    if (mapa[k]) campos[mapa[k]] = v
  }
  return Object.keys(campos).length > 0 ? campos : { general: err.message }
}

function FotoPerfil({ user, onGuardado }) {
  const inputRef = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)

  const elegir = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setSubiendo(true)
    try {
      const dataUrl = await aAvatarDataUrl(file)
      onGuardado(await usersApi.uploadAvatar(dataUrl), 'Foto de perfil actualizada.')
    } catch (err) {
      setError(err.fieldErrors?.image ?? err.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <section className={`${shared.cardPanel} ${styles.card}`}>
      <h3>Foto de perfil</h3>
      <div className={styles.fotoRow}>
        <Avatar user={user} size={84} />
        <div>
          <button type="button" className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
            disabled={subiendo} onClick={() => inputRef.current?.click()}>
            {subiendo ? 'Subiendo…' : user.foto ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <p className={styles.hint}>JPG, PNG o WebP de hasta 5 MB. Se recorta en cuadrado.</p>
          {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={elegir} />
      </div>
    </section>
  )
}

function DatosPersonales({ user, onGuardado }) {
  const [form, setForm] = useState({ nombre: user.nombre, email: user.email, passActual: '' })
  const [errors, setErrors] = useState({})
  const [guardando, setGuardando] = useState(false)

  const cambiaCorreo = form.email.trim().toLowerCase() !== user.email
  const hayCambios = cambiaCorreo || form.nombre.trim() !== user.nombre
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    const next = soloErrores({
      nombre: form.nombre.trim() === '' && 'El nombre es obligatorio.',
      email: !EMAIL_RE.test(form.email.trim()) && 'Ingresa un correo válido.',
      passActual: cambiaCorreo && form.passActual === '' && 'Ingresa tu contraseña para cambiar el correo.',
    })
    setErrors(next)
    if (Object.keys(next).length > 0 || guardando) return

    setGuardando(true)
    try {
      const actualizado = await usersApi.updateProfile({ ...form, passActual: cambiaCorreo ? form.passActual : '' })
      setForm({ nombre: actualizado.nombre, email: actualizado.email, passActual: '' })
      onGuardado(actualizado, 'Datos actualizados.')
    } catch (err) {
      setErrors(err.status === 409
        ? { email: err.message }
        : erroresDeApi(err, { name: 'nombre', email: 'email', currentPassword: 'passActual' }))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className={`${shared.cardPanel} ${styles.card}`} noValidate onSubmit={guardar}>
      <h3>Datos personales</h3>
      {errors.general && <div className={styles.banner} role="alert">{errors.general}</div>}
      <div className={styles.row2}>
        <Field id="cfgNombre" label="Nombre" autoComplete="name" value={form.nombre}
          onChange={set('nombre')} error={errors.nombre} />
        <Field id="cfgEmail" label="Correo" type="email" autoComplete="email" value={form.email}
          onChange={set('email')} error={errors.email} />
      </div>
      {cambiaCorreo && (
        <Field id="cfgPassEmail" label="Contraseña actual" type="password" autoComplete="current-password"
          value={form.passActual} onChange={set('passActual')} error={errors.passActual}
          hint="Por seguridad, confirma tu contraseña para cambiar el correo." />
      )}
      <div className={styles.actions}>
        <button type="submit" className={`${shared.btn} ${shared.btnSm}`} disabled={!hayCambios || guardando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

const PASS_VACIA = { actual: '', nueva: '', confirmar: '' }

function CambiarPassword({ onGuardado }) {
  const [form, setForm] = useState(PASS_VACIA)
  const [errors, setErrors] = useState({})
  const [guardando, setGuardando] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    const next = soloErrores({
      actual: form.actual === '' && 'Ingresa tu contraseña actual.',
      nueva: form.nueva.length < MIN_PASS && `La nueva contraseña debe tener al menos ${MIN_PASS} caracteres.`,
      confirmar: form.confirmar !== form.nueva && 'Las contraseñas no coinciden.',
    })
    setErrors(next)
    if (Object.keys(next).length > 0 || guardando) return

    setGuardando(true)
    try {
      await usersApi.changePassword(form)
      setForm(PASS_VACIA)
      onGuardado(null, 'Contraseña actualizada.')
    } catch (err) {
      setErrors(erroresDeApi(err, { currentPassword: 'actual', newPassword: 'nueva' }))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className={`${shared.cardPanel} ${styles.card}`} noValidate onSubmit={guardar}>
      <h3>Cambiar contraseña</h3>
      {errors.general && <div className={styles.banner} role="alert">{errors.general}</div>}
      <Field id="cfgPassActual" label="Contraseña actual" type="password" autoComplete="current-password"
        value={form.actual} onChange={set('actual')} error={errors.actual} />
      <div className={styles.row2}>
        <Field id="cfgPassNueva" label="Nueva contraseña" type="password" autoComplete="new-password"
          placeholder={`Mínimo ${MIN_PASS} caracteres`}
          value={form.nueva} onChange={set('nueva')} error={errors.nueva} />
        <Field id="cfgPassConfirmar" label="Confirmar nueva contraseña" type="password" autoComplete="new-password"
          value={form.confirmar} onChange={set('confirmar')} error={errors.confirmar} />
      </div>
      <div className={styles.actions}>
        <button type="submit" className={`${shared.btn} ${shared.btnSm}`} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  )
}

function EliminarCuenta({ onEliminada }) {
  const [abierto, setAbierto] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const cerrar = () => {
    if (eliminando) return
    setAbierto(false)
    setPass('')
    setError(null)
  }

  const confirmar = async (e) => {
    e.preventDefault()
    if (pass === '') {
      setError('Ingresa tu contraseña para confirmar.')
      return
    }
    setEliminando(true)
    try {
      await usersApi.deleteAccount(pass)
      onEliminada()
    } catch (err) {
      setError(err.fieldErrors?.password ?? err.message)
      setEliminando(false)
    }
  }

  return (
    <section className={`${shared.cardPanel} ${styles.card} ${styles.dangerZone}`}>
      <h3>Zona de peligro</h3>
      <div className={styles.dangerRow}>
        <p className={styles.hint}>
          Eliminar tu cuenta borra de forma permanente todos tus eventos, gestiones y clientes.
        </p>
        <button type="button" className={`${shared.btn} ${shared.danger} ${shared.btnSm}`}
          onClick={() => setAbierto(true)}>
          Eliminar cuenta
        </button>
      </div>

      {abierto && (
        <Modal
          title="¿Eliminar tu cuenta?"
          onClose={cerrar}
          footer={(
            <>
              <button type="button" className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`}
                onClick={cerrar} disabled={eliminando}>
                Cancelar
              </button>
              <button type="submit" form="formEliminarCuenta"
                className={`${shared.btn} ${shared.danger} ${shared.btnSm}`} disabled={eliminando}>
                {eliminando ? 'Eliminando…' : 'Eliminar definitivamente'}
              </button>
            </>
          )}
        >
          <p>Se borrarán todos tus eventos, gestiones y clientes. Esta acción no se puede deshacer.</p>
          <form id="formEliminarCuenta" noValidate onSubmit={confirmar}>
            <Field id="cfgPassEliminar" label="Contraseña" type="password" autoComplete="current-password"
              value={pass} onChange={(e) => setPass(e.target.value)} error={error} />
          </form>
        </Modal>
      )}
    </section>
  )
}

export default function Configuracion() {
  const { user, updateUser, logout } = useAuth()
  const [toast, setToast] = useState(null)
  const cerrarToast = useCallback(() => setToast(null), [])

  const onGuardado = (actualizado, mensaje) => {
    if (actualizado) updateUser(actualizado)
    setToast(mensaje)
  }

  return (
    <section className={shared.page}>
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>Configuración</h2>
      </div>
      <div className={shared.scroll}>
        <div className={styles.stack}>
          <FotoPerfil user={user} onGuardado={onGuardado} />
          <DatosPersonales key={`${user.nombre}|${user.email}`} user={user} onGuardado={onGuardado} />
          <CambiarPassword onGuardado={onGuardado} />
          <EliminarCuenta onEliminada={logout} />
        </div>
      </div>
      {toast && <Toast message={toast} onDone={cerrarToast} />}
    </section>
  )
}
