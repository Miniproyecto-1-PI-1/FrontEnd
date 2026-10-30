import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorModal } from './GestionModals'

describe('textos con «tarea»', () => {
  it('el aviso de error habla de la tarea', () => {
    render(<ErrorModal verbo="actualizar" mensaje="No se pudo conectar con el servidor." onClose={() => {}} />)
    expect(screen.getByText('No se pudo actualizar la tarea')).toBeTruthy()
  })
})
