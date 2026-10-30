import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import EtiquetaEvento from './EtiquetaEvento'

describe('EtiquetaEvento', () => {
  it('muestra el nombre del evento y su matiz', () => {
    render(<EtiquetaEvento id={3} nombre="Boda de Camila" />)
    const etiqueta = screen.getByText('Boda de Camila')
    expect(etiqueta.getAttribute('data-matiz')).toBe('30')
    expect(etiqueta.tagName).toBe('SPAN')
  })

  it('con «to» es un enlace al evento', () => {
    render(
      <MemoryRouter>
        <EtiquetaEvento id={3} nombre="Boda de Camila" to="/eventos/3" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Boda de Camila' }).getAttribute('href')).toBe('/eventos/3')
  })

  it('dos eventos distintos tienen matices distintos', () => {
    render(
      <>
        <EtiquetaEvento id={1} nombre="Uno" />
        <EtiquetaEvento id={2} nombre="Dos" />
      </>,
    )
    expect(screen.getByText('Uno').getAttribute('data-matiz')).not.toBe(screen.getByText('Dos').getAttribute('data-matiz'))
  })
})
