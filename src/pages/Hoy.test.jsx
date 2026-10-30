import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Grupo } from './Hoy'

// Hoy importa llamadas al servidor y la sesión; aquí solo se prueba el grupo, así que se cortan.
vi.mock('../api/eventosApi', () => ({ eventosApi: {} }))
vi.mock('../api/hoyApi', () => ({ hoyApi: {} }))
vi.mock('../api/usersApi', () => ({ usersApi: {} }))

const tarea = (n, extra = {}) => ({
  id: n, nombre: `Tarea ${n}`, eventoId: 1, eventoNombre: 'Boda de Camila', plazo: '2026-12-01', horas: 1,
  estado: 'PENDIENTE', categoria: 'PROXIMA', nota: '', horaInicio: '', horaFin: '', ...extra,
})
const PROXIMAS = { key: 'proximas', titulo: 'Próximas', icon: 'calendar', cls: '' }
const VENCIDAS = { key: 'vencidas', titulo: 'Vencidas', icon: 'x', cls: '' }
const acciones = { busy: false, onToggle: vi.fn(), onEdit: vi.fn(), onPostpone: vi.fn(), onDelete: vi.fn() }
const montar = (grupo, n, extra = {}) =>
  render(
    <MemoryRouter>
      <Grupo grupo={grupo} tareas={Array.from({ length: n }, (_, i) => tarea(i + 1))} {...acciones} {...extra} />
    </MemoryRouter>,
  )
const visibles = () => screen.getAllByRole('listitem').length

describe('grupo Próximas', () => {
  it('muestra 5 tareas y un botón «Ver todas (N)»', () => {
    montar(PROXIMAS, 12)
    expect(visibles()).toBe(5)
    expect(screen.getByRole('button', { name: 'Ver todas (12)' })).toBeTruthy()
  })

  it('«Ver todas» despliega el resto y «Ver menos» lo vuelve a recoger', () => {
    montar(PROXIMAS, 12)
    fireEvent.click(screen.getByRole('button', { name: 'Ver todas (12)' }))
    expect(visibles()).toBe(12)
    fireEvent.click(screen.getByRole('button', { name: 'Ver menos' }))
    expect(visibles()).toBe(5)
  })

  it('con 5 tareas o menos no hay botón', () => {
    montar(PROXIMAS, 5)
    expect(visibles()).toBe(5)
    expect(screen.queryByRole('button', { name: /Ver todas/ })).toBeNull()
  })

  it('con filtros activos se muestran todas', () => {
    montar(PROXIMAS, 12, { sinLimite: true })
    expect(visibles()).toBe(12)
    expect(screen.queryByRole('button', { name: /Ver todas/ })).toBeNull()
  })

  it('los otros grupos no se recortan', () => {
    montar(VENCIDAS, 8)
    expect(visibles()).toBe(8)
  })

  it('la etiqueta del evento va a la derecha, junto a los botones de la tarjeta', () => {
    montar(PROXIMAS, 1)
    const etiqueta = screen.getByRole('link', { name: 'Boda de Camila' })
    // la etiqueta está en la misma zona derecha que los botones de la tarjeta
    expect(etiqueta.parentElement).toBe(screen.getByRole('group', { name: 'Acciones de Tarea 1' }).parentElement)
    expect(etiqueta.getAttribute('data-matiz')).toBeTruthy()
    expect(etiqueta.getAttribute('href')).toBe('/eventos/1')
  })

  it('el contorno de cada tarjeta lleva el color de su evento', () => {
    montar(PROXIMAS, 1)
    const item = screen.getAllByRole('listitem')[0]
    expect(item.style.getPropertyValue('--h')).toBe(screen.getByRole('link', { name: 'Boda de Camila' }).getAttribute('data-matiz'))
  })
})

describe('etiquetas de estado en Hoy', () => {
  const con = (estado, categoria) =>
    render(
      <MemoryRouter>
        <Grupo grupo={PROXIMAS} tareas={[tarea(1, { estado, categoria })]} {...acciones} />
      </MemoryRouter>,
    )

  it('«Pospuesta» y «Vencida» se rotulan junto a las horas', () => {
    for (const [estado, categoria, etiqueta] of [['POSPUESTA', 'PROXIMA', 'Pospuesta'], ['PENDIENTE', 'VENCIDA', 'Vencida']]) {
      const { unmount } = con(estado, categoria)
      const marca = screen.getByText(etiqueta)
      expect(marca.parentElement.textContent).toContain('1 h')
      unmount()
    }
  })

  it('pendiente y ejecutada no se rotulan: ya se ven en la casilla', () => {
    for (const [estado, etiqueta] of [['PENDIENTE', 'Pendiente'], ['EJECUTADA', 'Ejecutada']]) {
      const { unmount } = con(estado, 'PROXIMA')
      expect(screen.queryByText(etiqueta)).toBeNull()
      unmount()
    }
  })
})
