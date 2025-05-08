"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, User, LogOut, Menu, X, Shield } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export default function Navbar() {
  const [loading, setLoading] = useState(true)
  const [hoveredMenu, setHoveredMenu] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()

  const buttonClass =
    "inline-flex items-center text-[#C0C0C0] hover:text-white border border-gray-800 rounded-md px-3 py-1 transition-colors hover:bg-gray-900/50 whitespace-nowrap"

  const mobileButtonClass =
    "flex items-center w-full text-left text-[#C0C0C0] hover:text-white border border-gray-800 rounded-md px-3 py-2 transition-colors hover:bg-gray-900/50"

  const handleMenuHover = (menuName) => {
    setHoveredMenu(menuName)
  }

  const handleMenuLeave = () => {
    setHoveredMenu(null)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  useEffect(() => {
    setHoveredMenu(null)
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    // Simplemente establecer loading a false ya que ahora usamos el contexto de autenticación
    setLoading(false)

    // Log para depuración
    console.log("Navbar - isAdmin:", isAdmin)
    console.log("Navbar - user:", user)
  }, [isAdmin, user])

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-[#C0C0C0] font-bold text-xl">BandCoord</div>
          <div className="text-[#C0C0C0]">Cargando...</div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50 overflow-visible">
      <div className="w-full px-4">
        <div className="flex items-center h-16 justify-between overflow-visible w-full">
          <Link to="/" className="flex items-center space-x-2 min-w-[150px] whitespace-nowrap">
            <img src="/1-removebg-preview.png" alt="BandCoord logo" className="h-8 w-auto" />
            <span className="text-[#C0C0C0] font-bold text-xl whitespace-nowrap">BandCoord</span>
            {isAdmin && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full ml-2">ADMIN</span>
            )}
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 rounded-md"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 flex-wrap">
            {/* Instrumentos */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("instrumentos")}
              onMouseLeave={handleMenuLeave}
            >
              <Link to="/admin/instrumentos" className={buttonClass}>
                Instrumentos
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "instrumentos" && (
                <div className="absolute left-0 mt-1 w-60 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/admin/tipos-instrumentos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    Tipos de Instrumentos
                  </Link>
                </div>
              )}
            </div>

            {/* Eventos */}
            <div className="relative" onMouseEnter={() => handleMenuHover("eventos")} onMouseLeave={handleMenuLeave}>
              <Link to="/admin/eventos" className={buttonClass}>
                Eventos
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "eventos" && (
                <div className="absolute left-0 mt-1 w-72 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/admin/minimos-eventos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    Mínimos en Eventos
                  </Link>
                  <Link
                    to="/admin/usuarios-eventos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    Eventos de Usuarios
                  </Link>
                  <Link
                    to="/admin/confirmacion-eventos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    Confirmación de Eventos
                  </Link>
                </div>
              )}
            </div>

            {/* Préstamos */}
            <Link to="/admin/prestamos" className={buttonClass}>
              Préstamos
            </Link>

            {/* Entidades */}
            <Link to="/admin/entidades" className={buttonClass}>
              Entidades
            </Link>

            {/* Composiciones */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("composiciones")}
              onMouseLeave={handleMenuLeave}
            >
              <Link to="/admin/composiciones" className={buttonClass}>
                Composiciones
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "composiciones" && (
                <div className="absolute left-0 mt-1 w-72 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/admin/composiciones-interpretadas"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    Composiciones Interpretadas
                  </Link>
                </div>
              )}
            </div>

            {/* Mensajes */}
            <div className="relative" onMouseEnter={() => handleMenuHover("mensajes")} onMouseLeave={handleMenuLeave}>
              <Link to="/admin/mensajes" className={buttonClass}>
                Mensajes
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "mensajes" && (
                <div className="absolute left-0 mt-1 w-72 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/admin/mensajes-usuarios"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    Mensajes de Usuarios
                  </Link>
                </div>
              )}
            </div>

            {/* Calendario */}
            <Link to="/admin/calendario" className={buttonClass}>
              Calendario
            </Link>

            {/* Banderas idioma */}
            <div className="flex items-center space-x-2 ml-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700 hover:border-[#C0C0C0] transition-colors flex items-center justify-center">
                <img src="/flags/es.png" alt="Español" className="w-full h-full object-contain" />
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700 hover:border-[#C0C0C0] transition-colors flex items-center justify-center">
                <img src="/flags/gb.png" alt="English" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Usuario */}
            <div className="relative" onMouseEnter={() => handleMenuHover("usuario")} onMouseLeave={handleMenuLeave}>
              <button className={buttonClass}>
                Usuario
                <ChevronDown size={16} className="ml-1" />
              </button>
              {hoveredMenu === "usuario" && (
                <div className="absolute right-0 mt-1 w-60 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/perfil"
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                  >
                    <User size={18} className="mr-2" /> Mi Perfil
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin/usuarios"
                      className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                    >
                      <Shield size={18} className="mr-2" /> Gestión de usuarios
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap w-full text-left"
                  >
                    <LogOut size={18} className="mr-2" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-gray-800 py-4 px-2 space-y-3">
            <Link to="/admin/instrumentos" className={mobileButtonClass}>
              Instrumentos
            </Link>
            <Link to="/admin/tipos-instrumentos" className={`${mobileButtonClass} ml-4 text-sm`}>
              Tipos de Instrumentos
            </Link>

            <Link to="/admin/eventos" className={mobileButtonClass}>
              Eventos
            </Link>
            <Link to="/admin/minimos-eventos" className={`${mobileButtonClass} ml-4 text-sm`}>
              Mínimos en Eventos
            </Link>
            <Link to="/admin/usuarios-eventos" className={`${mobileButtonClass} ml-4 text-sm`}>
              Eventos de Usuarios
            </Link>
            <Link to="/admin/confirmacion-eventos" className={`${mobileButtonClass} ml-4 text-sm`}>
              Confirmación de Eventos
            </Link>

            <Link to="/admin/prestamos" className={mobileButtonClass}>
              Préstamos
            </Link>

            <Link to="/admin/entidades" className={mobileButtonClass}>
              Entidades
            </Link>

            <Link to="/admin/composiciones" className={mobileButtonClass}>
              Composiciones
            </Link>
            <Link to="/admin/composiciones-interpretadas" className={`${mobileButtonClass} ml-4 text-sm`}>
              Composiciones Interpretadas
            </Link>

            <Link to="/admin/mensajes" className={mobileButtonClass}>
              Mensajes
            </Link>
            <Link to="/admin/mensajes-usuarios" className={`${mobileButtonClass} ml-4 text-sm`}>
              Mensajes de Usuarios
            </Link>

            <Link to="/admin/calendario" className={mobileButtonClass}>
              Calendario
            </Link>

            <div className="flex items-center space-x-4 px-3 py-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700 hover:border-[#C0C0C0] transition-colors flex items-center justify-center">
                <img src="/flags/es.png" alt="Español" className="w-full h-full object-contain" />
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700 hover:border-[#C0C0C0] transition-colors flex items-center justify-center">
                <img src="/flags/gb.png" alt="English" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-3">
              <Link to="/perfil" className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white">
                <User size={18} className="mr-2" /> Mi Perfil
              </Link>

              {isAdmin && (
                <Link to="/admin/usuarios" className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white">
                  <Shield size={18} className="mr-2" /> Gestión de usuarios
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-3 py-2 text-[#C0C0C0] hover:text-white"
              >
                <LogOut size={18} className="mr-2" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
