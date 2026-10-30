import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgCard } from './EventosList'

const evento = (extra = {}) => ({
  id: 1, nombre: 'Fiesta de 15 años', tipo: 'Familiar', fecha: '2026-12-20', total: 9, hechas: 2, progreso: 22, ...extra,
})
const montar = (e) => render(<ProgCard evento={e} onOpen={() => {}} />)

describe('tarjeta de evento', () => {
  it('muestra una etiqueta con el número de tareas y no la barra de progreso', () => {
    montar(evento())
    expect(screen.getByText('9 tareas')).toBeTruthy()
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.queryByText('22%')).toBeNull()
  })

  it('usa el singular y el caso sin tareas', () => {
    const { unmount } = montar(evento({ total: 1 }))
    expect(screen.getByText('1 tarea')).toBeTruthy()
    unmount()
    montar(evento({ total: 0 }))
    expect(screen.getByText('Sin tareas')).toBeTruthy()
  })

  it('dice «Participante» y no «Cliente»', () => {
    montar(evento({ clienteNombre: 'Ana' }))
    expect(screen.getByText('Participante: Ana')).toBeTruthy()
    expect(screen.queryByText(/Cliente/)).toBeNull()
  })
})
