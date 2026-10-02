import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { fmtFecha, fmtFechaLarga, fmtRelativo, hoyISO } from '../utils/date'
import Icon from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import { EstadoBadge } from '../components/Badges'
import shared from '../styles/shared.module.css'
import styles from './Hoy.module.css'

// Datos de muestra para la revisión visual: el próximo commit los reemplaza por datos reales.
const GRUPOS = [
  {
    key: 'vencidas',
    titulo: 'Vencidas',
    icon: 'x',
    cls: styles.vencidas,
    estado: 'VENCIDA',
    tareas: [
      { id: 1, nombre: 'Confirmar catering', evento: 'Boda Camila & Andrés', plazo: '2026-09-28', horas: 3 },
      { id: 2, nombre: 'Pedido de licor especial', evento: 'Fiesta de Halloween', plazo: '2026-09-30', horaInicio: '10:00', horaFin: '12:00', horas: 2 },
    ],
  },
  {
    key: 'hoy',
    titulo: 'Para hoy',
    icon: 'clock',
    cls: styles.hoy,
    tareas: [
      { id: 3, nombre: 'Buscar proveedor de audio', evento: 'Lanzamiento Corporativo Nexa', plazo: hoyISO(), horaInicio: '13:00', horaFin: '15:30', horas: 2.5 },
      { id: 4, nombre: 'Revisar lista de invitados', evento: 'Boda Camila & Andrés', plazo: hoyISO(), horas: 1 },
    ],
  },
  {
    key: 'proximas',
    titulo: 'Próximas',
    icon: 'calendar',
    cls: styles.proximas,
    tareas: [
      { id: 5, nombre: 'Enviar invitaciones', evento: 'Boda Camila & Andrés', plazo: '2026-10-02', horaInicio: '14:00', horaFin: '16:00', horas: 2 },
      { id: 6, nombre: 'Diseñar backdrop', evento: 'Lanzamiento Corporativo Nexa', plazo: '2026-10-09', horas: 1, estado: 'POSPUESTA' },
      { id: 7, nombre: 'Reservar decoración', evento: 'Cumpleaños 15 años Sofía', plazo: '2026-10-06', horas: 2 },
    ],
  },
]

function TaskRow({ tarea, grupo }) {
  const estado = tarea.estado ?? grupo.estado
  return (
    <li className={styles.tarea}>
      <input type="checkbox" className={styles.check} disabled aria-label={`Marcar "${tarea.nombre}" como hecha`} />
      <div className={styles.tMain}>
        <span className={styles.tNombre}>{tarea.nombre}</span>
        <span className={styles.tEvento}>{tarea.evento}</span>
        <div className={styles.tMeta}>
          <span className={grupo.key === 'vencidas' ? styles.tVenc : undefined}>
            <Icon name="calendar" size={14} /> {fmtFecha(tarea.plazo)} · {fmtRelativo(tarea.plazo)}
          </span>
          {tarea.horaInicio && tarea.horaFin && (
            <span>
              <Icon name="clock" size={14} /> {tarea.horaInicio}–{tarea.horaFin}
            </span>
          )}
          <span className={`${styles.horas} num`}>{tarea.horas} h</span>
        </div>
      </div>
      {estado && <EstadoBadge estado={estado} />}
    </li>
  )
}

function Grupo({ grupo }) {
  return (
    <section className={`${styles.grupo} ${grupo.cls}`} aria-labelledby={`grupo-${grupo.key}`}>
      <div className={styles.grupoHead}>
        <Icon name={grupo.icon} size={16} />
        <h3 id={`grupo-${grupo.key}`}>{grupo.titulo}</h3>
        <span className={`${styles.count} num`}>{grupo.tareas.length}</span>
      </div>
      <ul className={styles.lista}>
        {grupo.tareas.map((t) => (
          <TaskRow key={t.id} tarea={t} grupo={grupo} />
        ))}
      </ul>
    </section>
  )
}

// Vista estática del Sprint: los filtros y las acciones por gestión aún no tienen lógica (llega en el próximo PR).
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
        {GRUPOS.map((g) => (
          <Grupo key={g.key} grupo={g} />
        ))}
      </div>
    </section>
  )
}
