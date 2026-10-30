import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TIPOS, normalizarTipo } from '../data/tipos'
import { TipoBadge } from './Badges'

describe('tipos de evento', () => {
  it('ofrece Familiar, Social, Laboral, Viaje y Otro', () => {
    expect(TIPOS).toEqual(['Familiar', 'Social', 'Laboral', 'Viaje', 'Otro'])
    expect(TIPOS).not.toContain('Boda')
    expect(TIPOS).not.toContain('Cumpleaños')
    expect(TIPOS).not.toContain('Corporativo')
  })

  it('los tipos antiguos se pasan a los nuevos', () => {
    expect(normalizarTipo('Boda')).toBe('Familiar')
    expect(normalizarTipo('Cumpleaños')).toBe('Familiar')
    expect(normalizarTipo('Corporativo')).toBe('Laboral')
    for (const t of TIPOS) expect(normalizarTipo(t)).toBe(t)
  })

  it('un evento antiguo se muestra con el tipo nuevo', () => {
    render(<TipoBadge tipo="Boda" />)
    expect(screen.getByText('Familiar')).toBeTruthy()
    expect(screen.queryByText('Boda')).toBeNull()
  })

  it('«Viaje» tiene su propia etiqueta', () => {
    render(<TipoBadge tipo="Viaje" />)
    expect(screen.getByText('Viaje')).toBeTruthy()
  })
})
