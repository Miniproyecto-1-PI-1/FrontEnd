import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import EventosList from './pages/EventosList'
import EventoDetalle from './pages/EventoDetalle'
import CrearEvento from './pages/CrearEvento'
import PlaceholderPage from './pages/PlaceholderPage'
import Configuracion from './pages/Configuracion'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'

function AppRoutes() {
  const { status, user, logout } = useAuth()

  // Mientras se valida el token guardado no se redirige a ningún lado.
  if (status === 'checking') return null

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/eventos" replace /> : <Login />}
      />
      <Route
        element={user ? <Layout user={user} onLogout={logout} /> : <Navigate to="/login" replace />}
      >
        <Route path="/eventos" element={<EventosList />} />
        <Route path="/crear" element={<CrearEvento />} />
        <Route path="/tareas" element={<PlaceholderPage title="Tareas" />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/eventos/:id" element={<EventoDetalle />} />
      </Route>
      <Route path="*" element={<Navigate to="/eventos" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
