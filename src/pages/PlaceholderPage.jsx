import shared from '../styles/shared.module.css'

export default function PlaceholderPage({ title }) {
  return (
    <section>
      <div className={shared.viewHead}>
        <h2>{title}</h2>
      </div>
      <div className={shared.empty}>Sección disponible en el próximo Sprint.</div>
    </section>
  )
}
