import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PuntoEvento from './PuntoEvento'

describe('PuntoEvento', () => {
  it('es decorativo y lleva el matiz del evento', () => {
    const { container } = render(<PuntoEvento id={3} />)
    const punto = container.firstChild
    expect(punto.getAttribute('aria-hidden')).toBe('true')
    expect(punto.getAttribute('data-matiz')).toBe('30')
  })

  it('dos eventos distintos tienen matices distintos', () => {
    const a = render(<PuntoEvento id={1} />).container.firstChild.getAttribute('data-matiz')
    const b = render(<PuntoEvento id={2} />).container.firstChild.getAttribute('data-matiz')
    expect(a).not.toBe(b)
  })
})
