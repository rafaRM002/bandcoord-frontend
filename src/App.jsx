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
import FormularioEntidad from "./pages/Entidades.jsx/FormularioEntidad"
import Instrumentos from "./pages/Instrumentos/Instrumentos"
import FormularioInstrumento from "./pages/Instrumentos/FormularioInstrumento"
import TiposInstrumento from "./pages/TiposInstrumento/TiposInstrumento"
import Eventos from "./pages/Eventos/Eventos"
import FormularioEvento from "./pages/Eventos/FormularioEvento"
import MinimosEvento from "./pages/MinimosEvento/MinimosEvento"
import Composiciones from "./pages/Composiciones/Composiciones"
import FormularioComposicion from "./pages/Composiciones/FormularioComposicion"
import Prestamos from "./pages/Prestamos/Prestamos"
import Mensajes from "./pages/Mensajes/Mensajes"
import FormularioMensaje from "./pages/Mensajes/FormularioMensaje"

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

          {/* Admin routes - Instrumentos */}
          <Route
            path="/admin/instrumentos"
            element={user && user.role === "admin" ? <Instrumentos /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/instrumentos/nuevo"
            element={user && user.role === "admin" ? <FormularioInstrumento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/instrumentos/editar/:id"
            element={user && user.role === "admin" ? <FormularioInstrumento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/tipos-instrumentos"
            element={user && user.role === "admin" ? <TiposInstrumento /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Eventos */}
          <Route
            path="/admin/eventos"
            element={user && user.role === "admin" ? <Eventos /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/eventos/nuevo"
            element={user && user.role === "admin" ? <FormularioEvento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/eventos/editar/:id"
            element={user && user.role === "admin" ? <FormularioEvento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/minimos-eventos"
            element={user && user.role === "admin" ? <MinimosEvento /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Préstamos */}
          <Route
            path="/admin/prestamos"
            element={user && user.role === "admin" ? <Prestamos /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Entidades */}
          <Route
            path="/admin/entidades"
            element={user && user.role === "admin" ? <Entidades /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/entidades/nueva"
            element={user && user.role === "admin" ? <FormularioEntidad /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/entidades/editar/:id"
            element={user && user.role === "admin" ? <FormularioEntidad /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Composiciones */}
          <Route
            path="/admin/composiciones"
            element={user && user.role === "admin" ? <Composiciones /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/composiciones/nueva"
            element={user && user.role === "admin" ? <FormularioComposicion /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/composiciones/editar/:id"
            element={user && user.role === "admin" ? <FormularioComposicion /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Mensajes */}
          <Route
            path="/admin/mensajes"
            element={user && user.role === "admin" ? <Mensajes /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/mensajes/nuevo"
            element={user && user.role === "admin" ? <FormularioMensaje /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Calendario */}
          <Route
            path="/admin/calendario"
            element={user && user.role === "admin" ? <Calendario /> : <Navigate to="/login" replace />}
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
