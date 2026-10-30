import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useIrAlCampo } from './useIrAlCampo'

function Pantalla({ listo }) {
  useIrAlCampo('limite-diario', 'cfgLimiteDiario', listo)
  return <input id="cfgLimiteDiario" defaultValue="8" />
}

const montar = (ruta, listo = true) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Pantalla listo={listo} />
    </MemoryRouter>,
  )

describe('useIrAlCampo', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('con #limite-diario lleva el campo a la vista y lo enfoca', () => {
    montar('/configuracion#limite-diario')
    const campo = document.getElementById('cfgLimiteDiario')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    expect(document.activeElement).toBe(campo)
  })

  it('sin la ancla no mueve nada', () => {
    montar('/configuracion')
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
    expect(document.activeElement).not.toBe(document.getElementById('cfgLimiteDiario'))
  })

  it('espera a que la sección esté lista', () => {
    montar('/configuracion#limite-diario', false)
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})
