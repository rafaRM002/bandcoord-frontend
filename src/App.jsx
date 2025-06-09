/**
 * @file App.jsx
 * @module App
 * @description Componente raíz de la aplicación BandCoord. Gestiona el enrutamiento, el contexto de autenticación, el contexto de idioma y el layout principal (Navbar, Footer). Define rutas públicas, protegidas y de miembro, así como la lógica de acceso y renderizado condicional de la interfaz.
 * @author Rafael Rodriguez Mengual
 */

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

/**
 * Componente principal de la aplicación.
 * Provee los contextos de idioma y autenticación, y renderiza el contenido principal.
 * @returns {JSX.Element} Estructura principal de la app con proveedores y rutas.
 */
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

/**
 * Componente que gestiona el contenido y las rutas de la aplicación.
 * Controla el acceso a rutas públicas, protegidas y de miembro, así como el layout.
 * @returns {JSX.Element} Contenido y rutas de la aplicación.
 */
function AppContent() {
  const { user, loading } = useAuth()
  /** Rutas públicas accesibles sin autenticación */
  const publicRoutes = ["/login", "/register", "/registro-pendiente"]

  /**
   * Determina si la ruta actual es pública.
   * @returns {boolean} True si la ruta es pública.
   */
  const isPublicRoute = () => {
    const path = window.location.hash.replace(/^#/, "")
    return publicRoutes.includes(path)
  }

  /**
   * Determina si se debe mostrar el layout (Navbar/Footer).
   * Solo se muestra si el usuario está autenticado y no está en una ruta pública.
   * @type {boolean}
   */
  const shouldShowLayout = user && !isPublicRoute()

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[#C0C0C0]">Cargando...</div>
      </div>
    )
  }

  /**
   * Componente para proteger rutas privadas.
   * Redirige a login si el usuario no está autenticado.
   * @param {Object} props
   * @param {JSX.Element} props.children - Elementos hijos a renderizar si está autenticado.
   * @returns {JSX.Element}
   */
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  // Render principal con layout, rutas y botón de ayuda
  return (
    <div className="flex flex-col min-h-screen w-full bg-black">
      {shouldShowLayout && <Navbar />}

      <main className="flex-grow w-full bg-black text-[#C0C0C0] overflow-fix">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/registro-pendiente" element={<RegistroPendiente />} />

          {/* Rutas protegidas */}
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

          {/* Rutas de instrumentos, tipos, eventos, mínimos, préstamos, entidades, composiciones (miembros) */}
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
          <Route
            path="/prestamos"
            element={
              <MemberRoute>
                <Prestamos />
              </MemberRoute>
            }
          />
          <Route
            path="/entidades"
            element={
              <MemberRoute>
                <Entidades />
              </MemberRoute>
            }
          />
          <Route
            path="/composiciones"
            element={
              <MemberRoute>
                <Composiciones />
              </MemberRoute>
            }
          />

          {/* Rutas de mensajes */}
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

          {/* Calendario */}
          <Route
            path="/calendario"
            element={
              <MemberRoute>
                <Calendario />
              </MemberRoute>
            }
          />

          {/* Gestión de usuarios (solo admin) */}
          <Route
            path="/usuarios"
            element={user && user.role === "admin" ? <GestionUsuarios /> : <Navigate to="/" replace />}
          />

          {/* Asignación y confirmación de eventos */}
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

          {/* Ruta para página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {shouldShowLayout && <Footer />}

      {/* Botón de ayuda, siempre visible si el usuario está autenticado */}
      <HelpButton />
    </div>
  )
}

export default App
