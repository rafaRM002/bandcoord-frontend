/**
 * @file Navbar.jsx
 * @module components/Navigation/Navbar
 * @description Componente Navbar: barra de navegación principal de la aplicación. Incluye navegación, menús desplegables, selector de idioma, gestión de usuario y soporte para móvil.
 * @author Rafael Rodriguez Mengual
 */

"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, User, LogOut, Menu, X, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * Componente Navbar que muestra la barra de navegación principal.
 * Incluye menús desplegables, enlaces, selector de idioma y menú móvil.
 * @component
 * @returns {JSX.Element} Barra de navegación.
 */
export default function Navbar() {
  /**
   * Muestra la pantalla de carga.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);

  /**
   * Nombre del menú actualmente desplegado (hover), o `null`.
   * @type {string|null}
   */
  const [hoveredMenu, setHoveredMenu] = useState(null);

  /**
   * Indica si el menú móvil está abierto.
   * @type {boolean}
   */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Hook para saber la ruta actual.
   */
  const location = useLocation();
  /**
   * Contexto de autenticación: usuario, logout y si es admin.
   */
  const { user, logout, isAdmin } = useAuth();
  /**
   * Contexto de idioma.
   */
  const { language, changeLanguage } = useLanguage();
  /**
   * Hook de traducción.
   */
  const { t } = useTranslation();

  /**
   * Clases para los botones de navegación.
   * @type {string}
   */
  const buttonClass =
    "inline-flex items-center text-[#C0C0C0] hover:text-white border border-gray-800 rounded-md px-3 py-1 transition-colors hover:bg-gray-900/50 whitespace-nowrap";
  const mobileButtonClass =
    "flex items-center w-full text-left text-[#C0C0C0] hover:text-white border border-gray-800 rounded-md px-3 py-2 transition-colors hover:bg-gray-900/50";

  /**
   * Muestra el menú correspondiente al hacer hover.
   * @param {string} menuName - Nombre del menú a mostrar.
   */
  const handleMenuHover = (menuName) => {
    setHoveredMenu(menuName);
  };

  /**
   * Oculta el menú al salir del hover.
   */
  const handleMenuLeave = () => {
    setHoveredMenu(null);
  };

  /**
   * Alterna el menú móvil.
   */
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  /**
   * Cambia el idioma.
   * @param {string} newLanguage - Nuevo idioma a establecer.
   */
  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  /**
   * Cierra menús al cambiar de ruta.
   */
  useEffect(() => {
    setHoveredMenu(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * Quita la pantalla de carga y muestra logs de usuario/admin (solo para depuración).
   */
  useEffect(() => {
    setLoading(false);
    // console.log("Navbar - isAdmin:", isAdmin)
    // console.log("Navbar - user:", user)
  }, [isAdmin, user]);

  /**
   * Lógica para cerrar sesión.
   * @async
   */
  const handleLogout = async () => {
    await logout();
  };

  /**
   * Muestra pantalla de carga si está cargando.
   */
  if (loading) {
    return (
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-[#C0C0C0] font-bold text-xl">BandCoord</div>
          <div className="text-[#C0C0C0]">{t("common.loading")}</div>
        </div>
      </header>
    );
  }

  // Render principal del Navbar
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50 overflow-visible">
      <div className="w-full px-4">
        <div className="flex items-center h-16 justify-between overflow-visible w-full">
          {/* Logo y nombre de la app */}
          <Link
            to="/"
            className="flex items-center space-x-2 min-w-[150px] whitespace-nowrap"
          >
            <img
              src={`${import.meta.env.BASE_URL}1-removebg-preview.png`}
              alt="BandCoord logo"
              className="h-8 w-auto"
            />
            <span className="text-[#C0C0C0] font-bold text-xl whitespace-nowrap">
              BandCoord
            </span>
            {/* Etiqueta ADMIN si el usuario es admin */}
            {isAdmin && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full ml-2">
                ADMIN
              </span>
            )}
          </Link>

          {/* Botón para abrir/cerrar menú móvil */}
          <button
            onClick={toggleMobileMenu}
            className="xl:hidden p-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 rounded-md"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navegación de escritorio */}
          <nav className="hidden xl:flex items-center space-x-4 flex-wrap">
            {/* Menú Instrumentos con submenú */}
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

            {/* Menú Eventos con submenú */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("eventos")}
              onMouseLeave={handleMenuLeave}
            >
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

            {/* Enlace directo a Préstamos */}
            <Link to="/prestamos" className={buttonClass}>
              {t("navbar.loans")}
            </Link>

            {/* Enlace directo a Entidades */}
            <Link to="/entidades" className={buttonClass}>
              {t("navbar.entities")}
            </Link>

            {/* Menú Composiciones con submenú */}
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

            {/* Menú Mensajes con submenú */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("mensajes")}
              onMouseLeave={handleMenuLeave}
            >
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

            {/* Enlace directo a Calendario */}
            <Link to="/calendario" className={buttonClass}>
              {t("navbar.calendar")}
            </Link>

            {/* Selector de idioma con banderas */}
            <div className="flex items-center space-x-2 ml-2">
              {/* Español */}
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
              {/* Inglés */}
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

            {/* Menú de usuario con submenú */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuHover("usuario")}
              onMouseLeave={handleMenuLeave}
            >
              <Link to="/perfil" className={buttonClass}>
                {t("navbar.user")}
                <ChevronDown size={16} className="ml-1" />
              </Link>
              {hoveredMenu === "usuario" && (
                <div className="absolute right-0 mt-1 w-60 bg-black border border-gray-800 rounded-md shadow-lg py-1 z-10">
                  {/* Perfil */}
                  <Link
                    to="/perfil"
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                  >
                    <User size={18} className="mr-2" /> {t("navbar.profile")}
                  </Link>
                  {/* Gestión de usuarios solo para admin */}
                  {isAdmin && (
                    <Link
                      to="/usuarios"
                      className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap"
                    >
                      <Shield size={18} className="mr-2" />{" "}
                      {t("navbar.userManagement")}
                    </Link>
                  )}
                  {/* Botón de cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white hover:bg-gray-900/50 transition-colors duration-300 rounded-md whitespace-nowrap w-full text-left"
                  >
                    <LogOut size={18} className="mr-2" /> {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Menú de navegación móvil */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-black border-t border-gray-800 py-4 px-2 space-y-3">
            {/* Enlaces y subenlaces para móvil */}
            <Link to="/instrumentos" className={mobileButtonClass}>
              {t("navbar.instruments")}
            </Link>
            <Link
              to="/tipos-instrumentos"
              className={`${mobileButtonClass} ml-4 text-sm`}
            >
              {t("navbar.instrumentTypes")}
            </Link>

            <Link to="/eventos" className={mobileButtonClass}>
              {t("navbar.events")}
            </Link>
            <Link
              to="/minimos-eventos"
              className={`${mobileButtonClass} ml-4 text-sm`}
            >
              {t("navbar.eventMinimums")}
            </Link>
            <Link
              to="/usuarios-eventos"
              className={`${mobileButtonClass} ml-4 text-sm`}
            >
              {t("navbar.eventAssignment")}
            </Link>
            <Link
              to="/confirmacion-eventos"
              className={`${mobileButtonClass} ml-4 text-sm`}
            >
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
            <Link
              to="/composiciones-interpretadas"
              className={`${mobileButtonClass} ml-4 text-sm`}
            >
              {t("navbar.compositionsPlayed")}
            </Link>

            <Link to="/mensajes" className={mobileButtonClass}>
              {t("navbar.messages")}
            </Link>
            <Link
              to="/mensajes-usuarios"
              className={`${mobileButtonClass} ml-4 text-sm`}
            >
              {t("navbar.receivedMessages")}
            </Link>

            <Link to="/calendario" className={mobileButtonClass}>
              {t("navbar.calendar")}
            </Link>

            {/* Selector de idioma en menú móvil */}
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

            {/* Menú de usuario en móvil */}
            <div className="border-t border-gray-800 pt-3">
              <Link
                to="/perfil"
                className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white"
              >
                <User size={18} className="mr-2" /> {t("navbar.profile")}
              </Link>
              {/* Gestión de usuarios solo para admin */}
              {isAdmin && (
                <Link
                  to="/usuarios"
                  className="flex items-center px-3 py-2 text-[#C0C0C0] hover:text-white"
                >
                  <Shield size={18} className="mr-2" />{" "}
                  {t("navbar.userManagement")}
                </Link>
              )}
              {/* Botón de cerrar sesión */}
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
  );
}
