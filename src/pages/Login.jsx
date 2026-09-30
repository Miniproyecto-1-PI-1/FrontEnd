import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from './Login.module.css'
import shared from '../styles/shared.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASS = 6

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className={`${styles.field} ${error ? styles.error : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
      <span className={styles.errorMsg}>{error}</span>
    </div>
  )
}

/** Solo deja los campos con mensaje; un objeto vacío significa formulario válido. */
const soloErrores = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v))

export default function Login() {
  const { login, register } = useAuth()
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [reg, setReg] = useState({ nombre: '', email: '', pass: '', pass2: '' })

  const cambiarModo = (m) => {
    setModo(m)
    setErrors({})
    setServerError(null)
  }

  const enviar = async (validacion, accion) => {
    setServerError(null)
    const next = soloErrores(validacion)
    setErrors(next)
    if (Object.keys(next).length > 0 || enviando) return

    setEnviando(true)
    try {
      await accion()
    } catch (err) {
      if (err.status === 409) {
        setErrors({ email: err.message })
      } else if (Object.keys(err.fieldErrors ?? {}).length > 0) {
        const { name, password, ...resto } = err.fieldErrors
        setErrors(soloErrores({ ...resto, nombre: name, pass: password }))
      } else {
        setServerError(err.message)
      }
      setEnviando(false)
    }
  }

  const enviarLogin = (e) => {
    e.preventDefault()
    enviar(
      {
        email: !EMAIL_RE.test(email.trim()) && 'Ingresa un correo válido.',
        pass: pass === '' && 'La contraseña es obligatoria.',
      },
      () => login(email, pass),
    )
  }

  const enviarRegistro = (e) => {
    e.preventDefault()
    enviar(
      {
        nombre: reg.nombre.trim() === '' && 'El nombre es obligatorio.',
        email: !EMAIL_RE.test(reg.email.trim()) && 'Ingresa un correo válido.',
        pass: reg.pass.length < MIN_PASS && `La contraseña debe tener al menos ${MIN_PASS} caracteres.`,
        pass2: (reg.pass2 === '' || reg.pass2 !== reg.pass) && 'Las contraseñas no coinciden.',
      },
      () => register(reg),
    )
  }

  const setR = (k) => (e) => setReg({ ...reg, [k]: e.target.value })

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1>Organizador de Eventos</h1>
        <p className={styles.sub}>
          Tareas, eventos, proveedores y bookings en un solo lugar.
        </p>

        {serverError && (
          <div className={styles.banner} role="alert">{serverError}</div>
        )}

        {modo === 'login' ? (
          <form noValidate onSubmit={enviarLogin}>
            <Field id="email" label="Correo" type="email" autoComplete="email"
              placeholder="tucorreo@correo.com" value={email}
              onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Field id="pass" label="Contraseña" type="password" autoComplete="current-password"
              value={pass} onChange={(e) => setPass(e.target.value)} error={errors.pass} />
            <button className={`${shared.btn} ${styles.submit}`} type="submit" disabled={enviando}>
              {enviando ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
            <p className={styles.switch}>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => cambiarModo('registro')}>Crear cuenta</button>
            </p>
          </form>
        ) : (
          <form noValidate onSubmit={enviarRegistro}>
            <Field id="regNombre" label="Nombre" type="text" autoComplete="name" placeholder="Tu nombre"
              value={reg.nombre} onChange={setR('nombre')} error={errors.nombre} />
            <Field id="regEmail" label="Correo" type="email" autoComplete="email" placeholder="tucorreo@correo.com"
              value={reg.email} onChange={setR('email')} error={errors.email} />
            <Field id="regPass" label="Contraseña" type="password" autoComplete="new-password"
              placeholder={`Mínimo ${MIN_PASS} caracteres`}
              value={reg.pass} onChange={setR('pass')} error={errors.pass} />
            <Field id="regPass2" label="Confirmar contraseña" type="password" autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={reg.pass2} onChange={setR('pass2')} error={errors.pass2} />
            <button className={`${shared.btn} ${styles.submit}`} type="submit" disabled={enviando}>
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
            <p className={styles.switch}>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => cambiarModo('login')}>Inicia sesión</button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
