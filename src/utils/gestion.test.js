import { describe, expect, it } from 'vitest'
import { validarGestion } from './gestion'

const base = { nombre: 'Reservar salón', plazo: '2026-11-10', horas: '2', horaInicio: '', horaFin: '' }

describe('validarGestion', () => {
  it('acepta una tarea completa', () => {
    expect(validarGestion(base)).toEqual({})
  })

  it('pide un nombre', () => {
    expect(validarGestion({ ...base, nombre: '  ' }).nombre).toBeTruthy()
  })

  it('rechaza una hora de fin anterior a la de inicio', () => {
    const e = validarGestion({ ...base, horaInicio: '11:00', horaFin: '09:00' })
    expect(e.horario).toMatch(/posterior/)
  })

  it('no deja el plazo después del evento', () => {
    const e = validarGestion(base, { fechaEvento: '2026-11-05' })
    expect(e.plazo).toBeTruthy()
  })
})
