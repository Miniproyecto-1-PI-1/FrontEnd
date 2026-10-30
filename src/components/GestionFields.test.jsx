import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import GestionFields from './GestionFields'

const VACIA = { nombre: '', plazo: '', horas: '', horaInicio: '', horaFin: '', descripcion: '' }

function Formulario() {
  const [v, setV] = useState(VACIA)
  return <GestionFields value={v} onChange={setV} />
}

const montar = () => {
  render(<Formulario />)
  fireEvent.click(screen.getByRole('radio', { name: 'Horario' }))
  return {
    inicio: screen.getByLabelText('Hora de inicio'),
    fin: screen.getByLabelText('Hora de fin'),
  }
}
const poner = (campo, valor) => fireEvent.change(campo, { target: { value: valor } })

describe('hora de fin automática', () => {
  it('al elegir la hora de inicio, propone el fin una hora después', () => {
    const { inicio, fin } = montar()
    poner(inicio, '09:00')
    expect(fin.value).toBe('10:00')
    expect(screen.getByText('Duración: 1 h')).toBeTruthy()
  })

  it('respeta la hora de fin escrita por la persona mientras siga siendo válida', () => {
    const { inicio, fin } = montar()
    poner(inicio, '09:00')
    poner(fin, '12:00')
    poner(inicio, '10:00')
    expect(fin.value).toBe('12:00')
    expect(screen.getByText('Duración: 2 h')).toBeTruthy()
  })

  it('si el inicio pasa al fin, vuelve a proponer una hora después', () => {
    const { inicio, fin } = montar()
    poner(inicio, '09:00')
    poner(fin, '10:00')
    poner(inicio, '13:00')
    expect(fin.value).toBe('14:00')
  })
})

describe('marca el campo cuando está mal', () => {
  it('señala la hora de fin anterior a la de inicio al instante, sin esperar a guardar', () => {
    const { inicio, fin } = montar()
    poner(inicio, '11:00')
    expect(fin.getAttribute('aria-invalid')).toBeNull()
    poner(fin, '09:00')
    expect(fin.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText(/debe ser posterior a la de inicio/).textContent).toMatch(/12:00 a\. m\. son medianoche/)
    expect(screen.getByRole('alert').textContent).toMatch(/debe ser posterior a la de inicio/)
  })

  it('quita la marca cuando se corrige', () => {
    const { inicio, fin } = montar()
    poner(inicio, '11:00')
    poner(fin, '09:00')
    poner(fin, '12:30')
    expect(fin.getAttribute('aria-invalid')).toBeNull()
    expect(screen.queryByText(/debe ser posterior/)).toBeNull()
  })
})
