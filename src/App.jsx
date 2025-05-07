"use client"

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
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
      <AppContent />
    </Router>
  )
}

function AppContent() {
  const location = useLocation()
  const publicRoutes = ["/login", "/register", "/registro-pendiente"]
  const isPublicRoute = publicRoutes.includes(location.pathname)

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (token) {
      // In a real app, you would verify the token with your backend
      // For now, we'll simulate a successful authentication
      setUser({ nombre: "Usuario", role: "admin" }) // Set role to "admin" for testing
      setIsAdmin(true)
      setLoading(false)
    } else {
      setUser(null)
      setIsAdmin(false)
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    setIsAdmin(userData.role === "admin")
    localStorage.setItem("token", "token-simulado")
  }

  const logout = () => {
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem("token")
  }

  // Only show layout (navbar/footer) if user is authenticated and not on public routes
  const shouldShowLayout = user && !isPublicRoute

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[#C0C0C0]">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-black">
      {shouldShowLayout && <Navbar user={user} loading={loading} logout={logout} />}

      <main className="flex-grow w-full bg-black text-[#C0C0C0] overflow-fix">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!user ? <Login login={login} /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/registro-pendiente" element={<RegistroPendiente />} />

          {/* Protected routes */}
          <Route path="/" element={user ? <Home user={user} loading={loading} /> : <Navigate to="/login" replace />} />

          {/* Admin routes - Instrumentos */}
          <Route
            path="/admin/instrumentos"
            element={user && isAdmin ? <Instrumentos /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/instrumentos/nuevo"
            element={user && isAdmin ? <FormularioInstrumento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/instrumentos/editar/:id"
            element={user && isAdmin ? <FormularioInstrumento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/tipos-instrumentos"
            element={user && isAdmin ? <TiposInstrumento /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Eventos */}
          <Route path="/admin/eventos" element={user && isAdmin ? <Eventos /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin/eventos/nuevo"
            element={user && isAdmin ? <FormularioEvento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/eventos/editar/:id"
            element={user && isAdmin ? <FormularioEvento /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/minimos-eventos"
            element={user && isAdmin ? <MinimosEvento /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Préstamos */}
          <Route path="/admin/prestamos" element={user && isAdmin ? <Prestamos /> : <Navigate to="/login" replace />} />

          {/* Admin routes - Entidades */}
          <Route path="/admin/entidades" element={user && isAdmin ? <Entidades /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin/entidades/nueva"
            element={user && isAdmin ? <FormularioEntidad /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/entidades/editar/:id"
            element={user && isAdmin ? <FormularioEntidad /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Composiciones */}
          <Route
            path="/admin/composiciones"
            element={user && isAdmin ? <Composiciones /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/composiciones/nueva"
            element={user && isAdmin ? <FormularioComposicion /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/composiciones/editar/:id"
            element={user && isAdmin ? <FormularioComposicion /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Mensajes */}
          <Route path="/admin/mensajes" element={user && isAdmin ? <Mensajes /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin/mensajes/nuevo"
            element={user && isAdmin ? <FormularioMensaje /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes - Calendario */}
          <Route
            path="/admin/calendario"
            element={user && isAdmin ? <Calendario /> : <Navigate to="/login" replace />}
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
