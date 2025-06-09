/**
 * @file MemberRoute.jsx
 * @module components/MemberRoute
 * @description Componente de ruta protegida para usuarios autenticados (miembros). Redirige al login si no hay usuario autenticado.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
 * Componente de ruta protegida para cualquier usuario autenticado (miembro).
 * Si el usuario no está autenticado, redirige al login.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos que requieren autenticación.
 * @returns {JSX.Element} Contenido protegido o redirección.
 */
export default function MemberRoute({ children }) {
  // Obtiene el usuario y el estado de carga desde el contexto de autenticación
  const { user, loading } = useAuth()

  // Mientras se verifica la autenticación, muestra pantalla de carga
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si todo es correcto, renderiza los hijos (contenido protegido)
  return children
}
