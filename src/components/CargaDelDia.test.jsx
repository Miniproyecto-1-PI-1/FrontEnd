import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import CargaDelDia from './CargaDelDia'

const montar = (props) =>
  render(
    <MemoryRouter>
      <CargaDelDia {...props} />
    </MemoryRouter>,
  )

describe('CargaDelDia', () => {
  it('muestra las horas de hoy frente al límite diario y enlaza a Configuración', () => {
    montar({ horas: 7, limite: 8 })
    expect(screen.getByText(/7 h/).textContent).toBe('7 h de 8 h')
    const enlace = screen.getByRole('link', { name: 'límite diario' })
    expect(enlace.getAttribute('href')).toBe('/configuracion')
  })

  it('si no se pudo cargar el límite, muestra solo las horas', () => {
    montar({ horas: 3.5, limite: null })
    expect(screen.getByText(/3.5 h/).textContent).toBe('3.5 h')
    expect(screen.queryByRole('link')).toBeNull()
  })
})
