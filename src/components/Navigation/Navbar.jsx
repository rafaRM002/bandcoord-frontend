"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, User, LogOut, Menu, X, Shield } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useLanguage } from "../../context/LanguageContext"
import { useTranslation } from "../../hooks/useTranslation"

export default function Navbar() {
  const [loading, setLoading] = useState(true)
  const [hoveredMenu, setHoveredMenu] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation()

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

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage)
  }

  useEffect(() => {
    setHoveredMenu(null)
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    setLoading(false)
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
          <div className="text-[#C0C0C0]">{t("common.loading")}</div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50 overflow-visible">
      <div className="w-full px-4">
        <div className="flex items-center h-16 justify-between overflow-visible w-full">
          <Link to="/" className="flex items-center space-x-2 min-w-[150px] whitespace-nowrap">
            <img
              src={`${import.meta.env.BASE_URL}1-removebg-preview.png`}
              alt="BandCoord logo"
              className="h-8 w-auto"
            />
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
              <Link to="/instrumentos" className={buttonClass}>
                {t("navbar.instruments")}
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "instrumentos" && (
                <div className="absolute left-0 mt-1 w-60 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/tipos-instrumentos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    {t("navbar.instrumentTypes")}
                  </Link>
                </div>
              )}
            </div>

            {/* Eventos */}
            <div className="relative" onMouseEnter={() => handleMenuHover("eventos")} onMouseLeave={handleMenuLeave}>
              <Link to="/eventos" className={buttonClass}>
                {t("navbar.events")}
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "eventos" && (
                <div className="absolute left-0 mt-1 w-72 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/minimos-eventos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    {t("navbar.eventMinimums")}
                  </Link>
                  <Link
                    to="/usuarios-eventos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    {t("navbar.eventAssignment")}
                  </Link>
                  <Link
                    to="/confirmacion-eventos"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    {t("navbar.eventConfirmation")}
                  </Link>
                </div>
              )}
            </div>

            {/* Préstamos */}
            <Link to="/prestamos" className={buttonClass}>
              {t("navbar.loans")}
            </Link>

            {/* Entidades */}
            <Link to="/entidades" className={buttonClass}>
              {t("navbar.entities")}
            </Link>

            {/* Composiciones */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("composiciones")}
              onMouseLeave={handleMenuLeave}
            >
              <Link to="/composiciones" className={buttonClass}>
                {t("navbar.compositions")}
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "composiciones" && (
                <div className="absolute left-0 mt-1 w-72 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/composiciones-interpretadas"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    {t("navbar.compositionsPlayed")}
                  </Link>
                </div>
              )}
            </div>

            {/* Mensajes */}
            <div className="relative" onMouseEnter={() => handleMenuHover("mensajes")} onMouseLeave={handleMenuLeave}>
              <Link to="/mensajes" className={buttonClass}>
                {t("navbar.messages")}
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "mensajes" && (
                <div className="absolute left-0 mt-1 w-72 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/mensajes-usuarios"
                    className="block px-4 py-2 hover:bg-gray-900/50 text-[#C0C0C0] whitespace-nowrap"
                  >
                    {t("navbar.receivedMessages")}
                  </Link>
                </div>
              )}
            </div>

            {/* Calendario */}
            <Link to="/calendario" className={buttonClass}>
              {t("navbar.calendar")}
            </Link>

            {/* Banderas idioma */}
            <div className="flex items-center space-x-2 ml-2">
              <div
                onClick={() => handleLanguageChange("es")}
                className={`w-8 h-8 rounded-full overflow-hidden border transition-colors cursor-pointer flex items-center justify-center ${
                  language === "es"
                    ? "border-yellow-500 ring-2 ring-yellow-500"
                    : "border-gray-700 hover:border-[#C0C0C0]"
                }`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}flags/es.png`}
                  alt="Español"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                onClick={() => handleLanguageChange("en")}
                className={`w-8 h-8 rounded-full overflow-hidden border transition-colors cursor-pointer flex items-center justify-center ${
                  language === "en"
                    ? "border-yellow-500 ring-2 ring-yellow-500"
                    : "border-gray-700 hover:border-[#C0C0C0]"
                }`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}flags/gb.png`}
                  alt="English"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Usuario */}
            <div className="relative" onMouseEnter={() => handleMenuHover("usuario")} onMouseLeave={handleMenuLeave}>
              <Link to="/perfil" className={buttonClass}>
                {t("navbar.user")}
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "usuario" && (
                <div className="absolute right-0 mt-1 w-60 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/perfil"
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                  >
                    <User size={18} className="mr-2" /> {t("navbar.profile")}
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/usuarios"
                      className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                    >
                      <Shield size={18} className="mr-2" /> {t("navbar.userManagement")}
                    </Link>
                  )}

                  <Link
                    to="/logout"
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap w-full text-left"
                  >
                    <LogOut size={18} className="mr-2" /> {t("navbar.logout")}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-gray-800 py-4 px-2 space-y-3">
            <Link to="/instrumentos" className={mobileButtonClass}>
              {t("navbar.instruments")}
            </Link>
            <Link to="/tipos-instrumentos" className={`${mobileButtonClass} ml-4 text-sm`}>
              {t("navbar.instrumentTypes")}
            </Link>

            <Link to="/eventos" className={mobileButtonClass}>
              {t("navbar.events")}
            </Link>
            <Link to="/minimos-eventos" className={`${mobileButtonClass} ml-4 text-sm`}>
              {t("navbar.eventMinimums")}
            </Link>
            <Link to="/usuarios-eventos" className={`${mobileButtonClass} ml-4 text-sm`}>
              {t("navbar.eventAssignment")}
            </Link>
            <Link to="/confirmacion-eventos" className={`${mobileButtonClass} ml-4 text-sm`}>
              {t("navbar.eventConfirmation")}
            </Link>

            <Link to="/prestamos" className={mobileButtonClass}>
              {t("navbar.loans")}
            </Link>

            <Link to="/entidades" className={mobileButtonClass}>
              {t("navbar.entities")}
            </Link>

            <Link to="/composiciones" className={mobileButtonClass}>
              {t("navbar.compositions")}
            </Link>
            <Link to="/composiciones-interpretadas" className={`${mobileButtonClass} ml-4 text-sm`}>
              {t("navbar.compositionsPlayed")}
            </Link>

            <Link to="/mensajes" className={mobileButtonClass}>
              {t("navbar.messages")}
            </Link>
            <Link to="/mensajes-usuarios" className={`${mobileButtonClass} ml-4 text-sm`}>
              {t("navbar.receivedMessages")}
            </Link>

            <Link to="/calendario" className={mobileButtonClass}>
              {t("navbar.calendar")}
            </Link>

            <div className="flex items-center space-x-4 px-3 py-2">
              <div
                onClick={() => handleLanguageChange("es")}
                className={`w-8 h-8 rounded-full overflow-hidden border transition-colors cursor-pointer flex items-center justify-center ${
                  language === "es"
                    ? "border-yellow-500 ring-2 ring-yellow-500"
                    : "border-gray-700 hover:border-[#C0C0C0]"
                }`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}flags/es.png`}
                  alt="Español"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                onClick={() => handleLanguageChange("en")}
                className={`w-8 h-8 rounded-full overflow-hidden border transition-colors cursor-pointer flex items-center justify-center ${
                  language === "en"
                    ? "border-yellow-500 ring-2 ring-yellow-500"
                    : "border-gray-700 hover:border-[#C0C0C0]"
                }`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}flags/gb.png`}
                  alt="English"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-3">
              <Link to="/perfil" className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white">
                <User size={18} className="mr-2" /> {t("navbar.profile")}
              </Link>

              {isAdmin && (
                <Link to="/usuarios" className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white">
                  <Shield size={18} className="mr-2" /> {t("navbar.userManagement")}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md"
              >
                <LogOut size={18} className="mr-2" /> {t("navbar.logout")}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
