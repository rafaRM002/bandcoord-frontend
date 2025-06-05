"use client"

import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { LanguageProvider } from "./context/LanguageContext"
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
import MemberRoute from "./components/MemberRoute"
import HelpButton from "./components/HelpButton/HelpButton"

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  const publicRoutes = ["/login", "/register", "/registro-pendiente"]

  // Determinar si la ruta actual es pública
  const isPublicRoute = () => {
    const path = window.location.hash.replace(/^#/, "")
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
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          {/* Rutas para restablecer contraseña */}
          <Route path="/restablecer-password" element={<RestablecerPassword />} />
          <Route path="/nueva-password" element={<NuevaPassword />} />

          {/* Admin routes - Instrumentos - Ahora accesible para miembros */}
          <Route
            path="/instrumentos"
            element={
              <MemberRoute>
                <Instrumentos />
              </MemberRoute>
            }
          />
          <Route
            path="/tipos-instrumentos"
            element={
              <MemberRoute>
                <TiposInstrumento />
              </MemberRoute>
            }
          />

          {/* Admin routes - Eventos - Ahora accesible para miembros */}
          <Route
            path="/eventos"
            element={
              <MemberRoute>
                <Eventos />
              </MemberRoute>
            }
          />
          <Route
            path="/minimos-eventos"
            element={
              <MemberRoute>
                <MinimosEvento />
              </MemberRoute>
            }
          />

          {/* Admin routes - Préstamos - Ahora accesible para miembros */}
          <Route
            path="/prestamos"
            element={
              <MemberRoute>
                <Prestamos />
              </MemberRoute>
            }
          />

          {/* Admin routes - Entidades - Ahora accesible para miembros */}
          <Route
            path="/entidades"
            element={
              <MemberRoute>
                <Entidades />
              </MemberRoute>
            }
          />

          {/* Admin routes - Composiciones - Ahora accesible para miembros */}
          <Route
            path="/composiciones"
            element={
              <MemberRoute>
                <Composiciones />
              </MemberRoute>
            }
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

          {/* Admin routes - Calendario - Ahora accesible para miembros */}
          <Route
            path="/calendario"
            element={
              <MemberRoute>
                <Calendario />
              </MemberRoute>
            }
          />

          {/* Admin routes - Gestión de Usuarios - Solo admin */}
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

      {/* Help Button - Always visible when user is authenticated */}
      <HelpButton />
    </div>
  )
}

export default App
