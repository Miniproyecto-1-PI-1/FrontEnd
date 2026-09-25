import shared from '../styles/shared.module.css'

export default function EventosList() {
  return (
    <section>
      <div className={shared.viewHead}>
        <h2>Eventos</h2>
        <button type="button" className={shared.btn}>＋ Crear evento</button>
      </div>
      <div className={shared.ruleNote}>
        Progreso de cada evento. Haz clic en una tarjeta para ver el evento completo con sus gestiones, editables ahí mismo.
      </div>
      <div className={shared.empty}>Listado pendiente (Paso 4).</div>
    </section>
  )
}
