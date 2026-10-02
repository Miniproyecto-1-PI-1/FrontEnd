import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { fmtFechaLarga, hoyISO } from '../utils/date'
import Icon from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import shared from '../styles/shared.module.css'
import styles from './Hoy.module.css'

// Vista estática del Sprint: aún sin datos reales ni filtros funcionales (llega en el próximo commit/PR).
export default function Hoy() {
  useDocumentTitle('Hoy')
  const hoyLargo = fmtFechaLarga(hoyISO())
  const [diaSemana, resto] = hoyLargo.split(', ')

  return (
    <section className={shared.page}>
      <div className={`${shared.viewHead} ${shared.fixed}`}>
        <h2>Hoy</h2>
        <div className={styles.widgets}>
          <div className={styles.capWidget}>
            <div className={styles.capLabel}>
              <span>Horas de hoy</span>
              <span className="num">4.5 / 6 h</span>
            </div>
            <ProgressBar value={75} label="Horas programadas hoy" />
          </div>
          <div className={styles.dateWidget}>
            <span className={styles.dateCaption}>{diaSemana}</span>
            <span className={styles.dateMain}>{resto}</span>
          </div>
        </div>
      </div>

      <div className={`${styles.filtros} ${shared.fixed}`}>
        <div className={styles.search}>
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input type="search" placeholder="Buscar por nombre de gestión o evento" aria-label="Buscar gestión" />
        </div>
        <select defaultValue="" aria-label="Filtrar por evento">
          <option value="">Todos los eventos</option>
        </select>
        <select defaultValue="pendientes" aria-label="Filtrar por estado">
          <option value="pendientes">Estado: Pendientes</option>
          <option value="pospuestas">Estado: Pospuestas</option>
          <option value="todas">Estado: Todas</option>
        </select>
        <button type="button" className={`${shared.iconbtn} ${shared.iconOnly}`} aria-label="Limpiar filtros" title="Limpiar filtros">
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className={`${styles.note} ${shared.fixed}`}>
        Ordenado por: Vencidas (antigüedad), Para hoy (urgencia), Próximas (fecha). Empates por menor esfuerzo estimado.
      </div>

      <div className={shared.scroll}>
        <p className={shared.empty}>El listado de gestiones llega en el siguiente commit.</p>
      </div>
    </section>
  )
}
