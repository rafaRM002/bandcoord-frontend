"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navigation/Navbar"
import Footer from "./components/Navigation/Footer"
import Register from "./pages/Register/Register"
import Login from "./pages/Login/Login"
import RegistroPendiente from "./pages/RegistroPendiente/RegistroPendiente"
import Home from "./pages/Home/Home"
import NotFound from "./pages/NotFound/NotFound"
import Calendario from "./pages/Calendario/Calendario"
import Entidades from "./pages/Entidades.jsx/Entidades"
import Instrumentos from "./pages/Instrumentos/Instrumentos"
import TiposInstrumento from "./pages/TiposInstrumento/TiposInstrumento"
import Eventos from "./pages/Eventos/Eventos"
import FormularioEvento from "./pages/Eventos/FormularioEvento"
import MinimosEvento from "./pages/MinimosEvento/MinimosEvento"
import Composiciones from "./pages/Composiciones/Composiciones"

import Prestamos from "./pages/Prestamos/Prestamos"
import Mensajes from "./pages/Mensajes/Mensajes"
import FormularioMensaje from "./pages/Mensajes/FormularioMensaje"
import DetalleMensaje from "./pages/Mensajes/DetalleMensaje"
import GestionUsuarios from "./pages/Admin/GestionUsuarios"
import Perfil from "./pages/Perfil/Perfil"
import RestablecerPassword from "./pages/RestablecerPassword/RestablecerPassword"
import NuevaPassword from "./pages/RestablecerPassword/NuevaPassword"
import EventoUsuario from "./pages/EventoUsuario/EventoUsuario"
import ConfirmacionEventos from "./pages/ConfirmacionEventos/ConfirmacionEventos"
import ComposicionesInterpretadas from "./pages/ComposicionesInterpretadas/ComposicionesInterpretadas"
import MensajesUsuario from "./pages/MensajesUsuario/MensajesUsuario"

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  const publicRoutes = ["/login", "/register", "/registro-pendiente"]

  // Determinar si la ruta actual es pública
  const isPublicRoute = () => {
    const path = window.location.pathname
    return publicRoutes.includes(path)
  }

  // Solo mostrar layout (navbar/footer) si el usuario está autenticado y no está en rutas públicas
  const shouldShowLayout = user && !isPublicRoute()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[#C0C0C0]">Cargando...</div>
      </div>
    )
  }

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-black">
      {shouldShowLayout && <Navbar />}

      <main className="flex-grow w-full bg-black text-[#C0C0C0] overflow-fix">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/registro-pendiente" element={<RegistroPendiente />} />

          {/* Protected routes */}
          <Route path="/" element={<Home user={user} loading={loading} />} />

          {/* Perfil de usuario */}
          <Route path="/perfil" element={user ? <Perfil /> : <Navigate to="/login" replace />} />

          {/* Rutas para restablecer contraseña */}
          <Route path="/restablecer-password" element={<RestablecerPassword />} />
          <Route path="/nueva-password" element={<NuevaPassword />} />

          {/* Admin routes - Instrumentos */}
          <Route
            path="/instrumentos"
            element={user && user.role === "admin" ? <Instrumentos /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tipos-instrumentos"
            element={user && user.role === "admin" ? <TiposInstrumento /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Eventos */}
          <Route
            path="/eventos"
            element={user && user.role === "admin" ? <Eventos /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/eventos/nuevo"
            element={user && user.role === "admin" ? <FormularioEvento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/eventos/editar/:id"
            element={user && user.role === "admin" ? <FormularioEvento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/minimos-eventos"
            element={user && user.role === "admin" ? <MinimosEvento /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Préstamos */}
          <Route
            path="/prestamos"
            element={user && user.role === "admin" ? <Prestamos /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Entidades */}
          <Route
            path="/entidades"
            element={user && user.role === "admin" ? <Entidades /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Composiciones */}
          <Route
            path="/composiciones"
            element={user && user.role === "admin" ? <Composiciones /> : <Navigate to="/login" replace />}
          />
          {/* Mensajes routes */}
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute>
                <Mensajes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes/nuevo"
            element={
              <ProtectedRoute>
                <FormularioMensaje />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes/:id"
            element={
              <ProtectedRoute>
                <DetalleMensaje />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes-usuarios"
            element={
              <ProtectedRoute>
                <MensajesUsuario />
              </ProtectedRoute>
            }
          />

          {/* Admin routes - Calendario */}
          <Route
            path="/calendario"
            element={user && user.role === "admin" ? <Calendario /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Gestión de Usuarios */}
          <Route
            path="/usuarios"
            element={user && user.role === "admin" ? <GestionUsuarios /> : <Navigate to="/" replace />}
          />

          <Route
            path="/usuarios-eventos"
            element={
              <ProtectedRoute>
                <EventoUsuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmacion-eventos"
            element={
              <ProtectedRoute>
                <ConfirmacionEventos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/composiciones-interpretadas"
            element={
              <ProtectedRoute>
                <ComposicionesInterpretadas />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {shouldShowLayout && <Footer />}
    </div>
  )
}

export default App
