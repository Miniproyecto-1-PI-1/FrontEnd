import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AccionesTarea from './AccionesTarea'

const montar = (props = {}) => {
  const fns = { onEdit: vi.fn(), onPostpone: vi.fn(), onDelete: vi.fn() }
  render(<AccionesTarea nombre="Reservar salón" {...fns} {...props} />)
  return fns
}

describe('AccionesTarea', () => {
  it('muestra las tres acciones a la vez, cada una con su tooltip', () => {
    montar()
    for (const label of ['Editar', 'Posponer', 'Eliminar']) {
      const boton = screen.getByRole('button', { name: `${label} Reservar salón` })
      expect(boton.parentElement.getAttribute('data-tip')).toBe(label)
    }
    expect(screen.queryByText('Más acciones')).toBeNull()
  })

  it('llama a la acción que se cliquea', () => {
    const fns = montar()
    fireEvent.click(screen.getByRole('button', { name: 'Editar Reservar salón' }))
    fireEvent.click(screen.getByRole('button', { name: 'Posponer Reservar salón' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Reservar salón' }))
    expect(fns.onEdit).toHaveBeenCalledTimes(1)
    expect(fns.onPostpone).toHaveBeenCalledTimes(1)
    expect(fns.onDelete).toHaveBeenCalledTimes(1)
  })

  it('no deja posponer una tarea que ya está hecha', () => {
    const fns = montar({ hecha: true })
    const posponer = screen.getByRole('button', { name: 'Posponer Reservar salón' })
    expect(posponer.disabled).toBe(true)
    fireEvent.click(posponer)
    expect(fns.onPostpone).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Editar Reservar salón' }).disabled).toBe(false)
  })

  it('bloquea todo mientras se guarda', () => {
    montar({ busy: true })
    for (const b of screen.getAllByRole('button')) expect(b.disabled).toBe(true)
  })
})
