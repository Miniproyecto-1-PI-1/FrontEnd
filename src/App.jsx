import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import EventosList from './pages/EventosList'
import CrearEvento from './pages/CrearEvento'
import PlaceholderPage from './pages/PlaceholderPage'
import { PERFILES_LOGIN } from './data/perfiles'

function AppRoutes() {
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const user = perfil ? PERFILES_LOGIN[perfil] : null

  const login = (key) => {
    setPerfil(key)
    navigate('/eventos')
  }
  const logout = () => {
    setPerfil(null)
    navigate('/login')
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/eventos" replace /> : <Login onSubmit={login} />}
      />
      <Route
        element={user ? <Layout user={user} onLogout={logout} /> : <Navigate to="/login" replace />}
      >
        <Route path="/eventos" element={<EventosList />} />
        <Route path="/crear" element={<CrearEvento />} />
        <Route path="/tareas" element={<PlaceholderPage title="Tareas" />} />
        <Route path="/configuracion" element={<PlaceholderPage title="Configuración" />} />
        <Route path="/eventos/:id" element={<PlaceholderPage title="Detalle del evento" />} />
      </Route>
      <Route path="*" element={<Navigate to="/eventos" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
