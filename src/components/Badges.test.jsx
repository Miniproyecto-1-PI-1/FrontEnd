import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TIPOS, normalizarTipo } from '../data/tipos'
import { TipoBadge } from './Badges'

describe('tipo de evento «Laboral»', () => {
  it('ofrece «Laboral» y ya no «Corporativo»', () => {
    expect(TIPOS).toContain('Laboral')
    expect(TIPOS).not.toContain('Corporativo')
  })

  it('los eventos antiguos guardados como «Corporativo» se muestran como «Laboral»', () => {
    expect(normalizarTipo('Corporativo')).toBe('Laboral')
    expect(normalizarTipo('Boda')).toBe('Boda')
    render(<TipoBadge tipo="Corporativo" />)
    expect(screen.getByText('Laboral')).toBeTruthy()
    expect(screen.queryByText('Corporativo')).toBeNull()
  })
})
