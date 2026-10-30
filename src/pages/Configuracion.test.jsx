import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/http'
import { usersApi } from '../api/usersApi'
import { Planificacion } from './Configuracion'

vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({}) }))
vi.mock('../api/usersApi', () => ({
  usersApi: { getDailyLimit: vi.fn(), updateDailyLimit: vi.fn() },
}))

function Hoy() {
  const { state } = useLocation()
  return (
    <div>
      <p>PANTALLA HOY</p>
      <p>{state?.aviso}</p>
    </div>
  )
}

const montar = (entrada, onGuardado = vi.fn()) => {
  render(
    <MemoryRouter initialEntries={[entrada]}>
      <Routes>
        <Route path="/configuracion" element={<Planificacion onGuardado={onGuardado} />} />
        <Route path="/hoy" element={<Hoy />} />
      </Routes>
    </MemoryRouter>,
  )
  return onGuardado
}

const cambiarYGuardar = async (valor) => {
  const campo = await screen.findByLabelText('Límite diario de horas de trabajo')
  await waitFor(() => expect(campo.disabled).toBe(false))
  fireEvent.change(campo, { target: { value: valor } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
}

describe('guardar el límite diario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollIntoView = vi.fn()
    usersApi.getDailyLimit.mockResolvedValue({ limiteDiario: 8 })
  })

  it('si se llegó desde Hoy, al guardar se vuelve a Hoy con un aviso', async () => {
    usersApi.updateDailyLimit.mockResolvedValue({ limiteDiario: 6 })
    const onGuardado = montar({ pathname: '/configuracion', hash: '#limite-diario', state: { volverA: '/hoy' } })
    await cambiarYGuardar('6')
    expect(await screen.findByText('PANTALLA HOY')).toBeTruthy()
    expect(screen.getByText('Límite diario actualizado a 6 h.')).toBeTruthy()
    expect(onGuardado).not.toHaveBeenCalled()
  })

  it('si se entró directo a Configuración, se queda ahí y avisa', async () => {
    usersApi.updateDailyLimit.mockResolvedValue({ limiteDiario: 6 })
    const onGuardado = montar('/configuracion')
    await cambiarYGuardar('6')
    await waitFor(() => expect(onGuardado).toHaveBeenCalledWith(null, 'Parámetros de planificación actualizados'))
    expect(screen.queryByText('PANTALLA HOY')).toBeNull()
  })

  it('si el límite no se puede bajar (409), no vuelve a Hoy y explica por qué', async () => {
    usersApi.updateDailyLimit.mockRejectedValue(new ApiError('No puedes bajar el límite a 4h porque hay 1 día con más de 4h planificadas.', { status: 409 }))
    montar({ pathname: '/configuracion', state: { volverA: '/hoy' } })
    await cambiarYGuardar('4')
    expect(await screen.findByText(/No puedes bajar el límite a 4h/)).toBeTruthy()
    expect(screen.queryByText('PANTALLA HOY')).toBeNull()
  })
})
