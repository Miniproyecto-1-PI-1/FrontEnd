/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { getMockData } from '../data/mockEventos'

const EventsContext = createContext(null)

export function EventsProvider({ perfil = 'organizador', children }) {
  const [data, setData] = useState(() => getMockData(perfil))
  const { eventos, clientes } = data

  const getClienteNombre = (id) => clientes.find((c) => c.id === id)?.nombre ?? 'Sin cliente'

  // Reutiliza el cliente si ya existe (por nombre); si no, lo crea.
  const addEvento = (evento, cliente) => {
    setData((prev) => {
      let clienteId = null
      let clientesNext = prev.clientes
      const nombre = cliente?.nombre?.trim()
      if (nombre) {
        const existente = prev.clientes.find((c) => c.nombre.toLowerCase() === nombre.toLowerCase())
        if (existente) {
          clienteId = existente.id
          clientesNext = prev.clientes.map((c) =>
            c.id === existente.id
              ? { ...c, telefono: cliente.telefono || c.telefono, correo: cliente.correo || c.correo }
              : c,
          )
        } else {
          clienteId = Date.now()
          clientesNext = [...prev.clientes, { id: clienteId, nombre, telefono: cliente.telefono, correo: cliente.correo }]
        }
      }
      return {
        clientes: clientesNext,
        eventos: [{ ...evento, id: Date.now(), clienteId }, ...prev.eventos],
      }
    })
  }

  return (
    <EventsContext.Provider value={{ eventos, clientes, getClienteNombre, addEvento }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents debe usarse dentro de EventsProvider')
  return ctx
}
