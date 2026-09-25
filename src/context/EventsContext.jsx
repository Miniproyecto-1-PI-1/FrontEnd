/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { getMockData } from '../data/mockEventos'

const EventsContext = createContext(null)

export function EventsProvider({ perfil = 'organizador', children }) {
  const [data] = useState(() => getMockData(perfil))
  const [eventos] = useState(data.eventos)
  const [clientes] = useState(data.clientes)

  const getClienteNombre = (id) => clientes.find((c) => c.id === id)?.nombre ?? 'Sin cliente'

  return (
    <EventsContext.Provider value={{ eventos, clientes, getClienteNombre }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents debe usarse dentro de EventsProvider')
  return ctx
}
