"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";

export default function Navbar() {
  const [loading, setLoading] = useState(true);
  const [,setUser] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const buttonClass =
    "inline-flex items-center text-[#C0C0C0] hover:text-white border border-gray-800 rounded-md px-3 py-1 transition-colors hover:bg-gray-900/50 whitespace-nowrap";

  const handleMenuHover = (menuName) => {
    setHoveredMenu(menuName);
  };

  const handleMenuLeave = () => {
    setHoveredMenu(null);
  };

  useEffect(() => {
    setHoveredMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-[#C0C0C0] font-bold text-xl">BandCoord</div>
          <div className="text-[#C0C0C0]">Cargando...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50 overflow-visible">
      <div className="w-full px-4">
        <div className="flex items-center h-16 flex-wrap overflow-visible w-full">
          <Link
            to="/"
            className="flex items-center space-x-2 min-w-[150px] mr-4 whitespace-nowrap"
          >
            <img
              src="/1-removebg-preview.png"
              alt="BandCoord logo"
              className="h-8 w-auto"
            />
            <span className="text-[#C0C0C0] font-bold text-xl whitespace-nowrap">
              BandCoord
            </span>
          </Link>

          <nav className="flex items-center space-x-4 flex-wrap">
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
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("eventos")}
              onMouseLeave={handleMenuLeave}
            >
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
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("mensajes")}
              onMouseLeave={handleMenuLeave}
            >
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
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 hover:border-[#C0C0C0] transition-colors flex items-center justify-center">
                <img
                  src="/flags/es.png"
                  alt="Español"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 hover:border-[#C0C0C0] transition-colors flex items-center justify-center">
                <img
                  src="/flags/gb.png"
                  alt="English"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Usuario */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("usuario")}
              onMouseLeave={handleMenuLeave}
            >
              <Link to="/admin/usuarios" className={buttonClass}>
                Usuario
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "usuario" && (
                <div className="absolute left-0 mt-1 w-60 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/perfil"
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                  >
                    <User size={18} className="mr-2" /> Mi Perfil
                  </Link>
                  <Link
                    to="/gestion-usuarios"
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                  >
                    <Settings size={18} className="mr-2" /> Gestión de usuarios
                  </Link>
                  <Link
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"                  >
                    <LogOut size={18} className="mr-2" /> Cerrar Sesión
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
