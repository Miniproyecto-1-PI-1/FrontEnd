import { describe, expect, it } from 'vitest'
import { maticeEvento } from './colorEvento'

describe('maticeEvento', () => {
  it('un evento siempre tiene el mismo color', () => {
    expect(maticeEvento(7)).toBe(maticeEvento(7))
    expect(maticeEvento('7')).toBe(maticeEvento(7))
  })

  it('eventos consecutivos tienen colores distintos', () => {
    const colores = [1, 2, 3, 4, 5, 6, 7, 8].map(maticeEvento)
    expect(new Set(colores).size).toBe(8)
  })

  it('con un identificador raro no falla', () => {
    expect(Number.isFinite(maticeEvento(undefined))).toBe(true)
    expect(Number.isFinite(maticeEvento('abc'))).toBe(true)
  })
})
