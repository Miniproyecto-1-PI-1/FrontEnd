import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EditarGestionModal, EliminarModal, ErrorModal } from './GestionModals'

describe('textos con «tarea»', () => {
  it('el aviso de error habla de la tarea', () => {
    render(<ErrorModal verbo="actualizar" mensaje="No se pudo conectar con el servidor." onClose={() => {}} />)
    expect(screen.getByText('No se pudo actualizar la tarea')).toBeTruthy()
  })
})

describe('modal «Editar tarea»', () => {
  const gestion = { nombre: 'Reservar salón', descripcion: '', plazo: '2026-11-10', horaInicio: '', horaFin: '', horas: 2 }

  it('tiene el mismo ancho que el de eliminar y los botones centrados', () => {
    render(<EditarGestionModal gestion={gestion} fechaEvento="2026-12-01" busy={false} onSave={() => {}} onClose={() => {}} />)
    const dialogo = screen.getByRole('dialog', { name: 'Editar tarea' })
    expect(dialogo.getAttribute('data-ancho')).toBe('normal')
    const pie = screen.getByRole('button', { name: 'Guardar cambios' }).parentElement
    expect(pie.getAttribute('data-centrado')).toBe('true')
  })

  it('el modal de eliminar conserva su pie con botones a la derecha', () => {
    render(<EliminarModal gestion={gestion} busy={false} onConfirm={() => {}} onClose={() => {}} />)
    const pie = screen.getByRole('button', { name: 'Eliminar' }).parentElement
    expect(pie.getAttribute('data-centrado')).toBeNull()
  })
})
