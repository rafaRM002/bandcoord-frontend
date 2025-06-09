/**
 * @file AdminRoute.jsx
 * @module components/AdminRoute
 * @description Componente de ruta protegida solo para administradores. Redirige al login si no hay usuario autenticado y a la página principal si no es admin.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
 * Componente de ruta protegida solo para administradores.
 * Si el usuario no está autenticado, redirige al login.
 * Si el usuario no es admin, redirige a la página principal.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos que requieren permisos de administrador.
 * @returns {JSX.Element} Contenido protegido o redirección.
 */
export default function AdminRoute({ children }) {
  // Obtiene el usuario, el estado de carga y si es admin desde el contexto de autenticación
  const { user, loading, isAdmin } = useAuth()

  // Mientras se verifica la autenticación, muestra pantalla de carga
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si el usuario no es admin, redirige a la página principal
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  // Si todo es correcto, renderiza los hijos (contenido protegido)
  return children
}
