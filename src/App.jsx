import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import Splash from './components/Splash'
import Login from './pages/Login'
import EventosList from './pages/EventosList'
import EventoDetalle from './pages/EventoDetalle'
import CrearEvento from './pages/CrearEvento'
import Configuracion from './pages/Configuracion'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'

function AuthGate() {
  const { status } = useAuth()
  // Mientras se valida el token guardado no se redirige a ningún lado.
  return status === 'checking' ? <Splash /> : <Outlet />
}

function SoloAnonimo() {
  const { user } = useAuth()
  return user ? <Navigate to="/eventos" replace /> : <Login />
}

function Protegido() {
  const { user, logout } = useAuth()
  return user ? <Layout user={user} onLogout={logout} /> : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  {
    element: <AuthGate />,
    children: [
      { path: '/login', element: <SoloAnonimo /> },
      {
        element: <Protegido />,
        children: [
          { path: '/eventos', element: <EventosList /> },
          { path: '/eventos/:id', element: <EventoDetalle /> },
          { path: '/crear', element: <CrearEvento /> },
          { path: '/configuracion', element: <Configuracion /> },
        ],
      },
      { path: '*', element: <Navigate to="/eventos" replace /> },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
