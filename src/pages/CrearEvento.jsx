import { Link } from 'react-router-dom'
import shared from '../styles/shared.module.css'

export default function CrearEvento() {
  return (
    <section>
      <div className={shared.breadcrumb}>
        <Link to="/eventos">← Volver a eventos</Link>
      </div>
      <div className={shared.viewHead}>
        <h2>Crear evento</h2>
      </div>
      <div className={shared.cardPanel} />
    </section>
  )
}
