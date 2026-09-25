import { useState } from 'react'
import { PERFILES_LOGIN } from '../data/perfiles'
import styles from './Login.module.css'
import shared from '../styles/shared.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ id, label, error, errorMsg, ...inputProps }) {
  return (
    <div className={`${styles.field} ${error ? styles.error : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
      <span className={styles.errorMsg}>{errorMsg}</span>
    </div>
  )
}

export default function Login({ onSubmit }) {
  const [modo, setModo] = useState('login')
  const [perfil, setPerfil] = useState('organizador')
  const [email, setEmail] = useState(PERFILES_LOGIN.organizador.email)
  const [pass, setPass] = useState('••••••••')
  const [errors, setErrors] = useState({})
  const [reg, setReg] = useState({ nombre: '', email: '', pass: '', pass2: '' })

  const cambiarPerfil = (key) => {
    setPerfil(key)
    setEmail(PERFILES_LOGIN[key].email)
  }

  const cambiarModo = (m) => {
    setModo(m)
    setErrors({})
  }

  const enviarLogin = (e) => {
    e.preventDefault()
    const next = { email: !EMAIL_RE.test(email.trim()), pass: pass === '' }
    setErrors(next)
    if (!next.email && !next.pass) onSubmit?.(perfil)
  }

  const enviarRegistro = (e) => {
    e.preventDefault()
    const next = {
      nombre: reg.nombre.trim() === '',
      email: !EMAIL_RE.test(reg.email.trim()),
      pass: reg.pass === '',
      pass2: reg.pass2 === '' || reg.pass2 !== reg.pass,
    }
    setErrors(next)
    if (!Object.values(next).some(Boolean)) onSubmit?.(perfil)
  }

  const setR = (k) => (e) => setReg({ ...reg, [k]: e.target.value })

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1>Organizador de Eventos</h1>
        <p className={styles.sub}>
          Tareas, eventos, proveedores y bookings en un solo lugar.
        </p>

        {modo === 'login' ? (
          <form noValidate onSubmit={enviarLogin}>
            <Field id="email" label="Correo" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email} errorMsg="Ingresa un correo válido." />
            <Field id="pass" label="Contraseña" type="password" value={pass}
              onChange={(e) => setPass(e.target.value)}
              error={errors.pass} errorMsg="La contraseña es obligatoria." />
            <button className={`${shared.btn} ${styles.submit}`} type="submit">
              Iniciar sesión
            </button>
            <p className={styles.switch}>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => cambiarModo('registro')}>Crear cuenta</button>
            </p>
          </form>
        ) : (
          <form noValidate onSubmit={enviarRegistro}>
            <Field id="regNombre" label="Nombre" type="text" placeholder="Tu nombre"
              value={reg.nombre} onChange={setR('nombre')}
              error={errors.nombre} errorMsg="El nombre es obligatorio." />
            <Field id="regEmail" label="Correo" type="email" placeholder="tucorreo@correo.com"
              value={reg.email} onChange={setR('email')}
              error={errors.email} errorMsg="Ingresa un correo válido." />
            <Field id="regPass" label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
              value={reg.pass} onChange={setR('pass')}
              error={errors.pass} errorMsg="La contraseña es obligatoria." />
            <Field id="regPass2" label="Confirmar contraseña" type="password" placeholder="Repite la contraseña"
              value={reg.pass2} onChange={setR('pass2')}
              error={errors.pass2} errorMsg="Las contraseñas no coinciden." />
            <button className={`${shared.btn} ${styles.submit}`} type="submit">
              Crear cuenta
            </button>
            <p className={styles.switch}>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => cambiarModo('login')}>Inicia sesión</button>
            </p>
          </form>
        )}

        <div className={styles.perfil}>
          <div className={styles.perfilTitle}>Tipo de cuenta (demo)</div>
          <div className={styles.perfilOpts}>
            <label>
              <input type="radio" name="perfilLogin" checked={perfil === 'organizador'}
                onChange={() => cambiarPerfil('organizador')} />
              Organizador de eventos
            </label>
            <label>
              <input type="radio" name="perfilLogin" checked={perfil === 'bar'}
                onChange={() => cambiarPerfil('bar')} />
              Bar
            </label>
          </div>
        </div>

        <div className={styles.demo}>
          Demo: cualquier correo/contraseña entra. Un campo vacío muestra el error correspondiente.
        </div>
      </div>
    </div>
  )
}
