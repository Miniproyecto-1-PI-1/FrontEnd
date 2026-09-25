import shared from '../styles/shared.module.css'

export default function PlaceholderPage({ title }) {
  return (
    <section className={shared.page}>
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>{title}</h2>
      </div>
      <div className={shared.scroll}>
        <div className={shared.empty}>Sección disponible en el próximo Sprint.</div>
      </div>
    </section>
  )
}
