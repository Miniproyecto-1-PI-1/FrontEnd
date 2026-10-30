import { describe, expect, it } from 'vitest'
import { calcHoras, sumarHoras } from './date'

describe('sumarHoras', () => {
  it('suma una hora por defecto', () => {
    expect(sumarHoras('09:00')).toBe('10:00')
    expect(sumarHoras('09:45')).toBe('10:45')
  })
  it('no pasa de las 23:59', () => {
    expect(sumarHoras('23:30')).toBe('23:59')
  })
  it('sin hora devuelve vacío', () => {
    expect(sumarHoras('')).toBe('')
  })
  it('combina con calcHoras', () => {
    expect(calcHoras('09:00', sumarHoras('09:00'))).toBe(1)
  })
})
