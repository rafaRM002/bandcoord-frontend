/**
 * @file HelpButton.jsx
 * @module components/HelpButton/HelpButton
 * @description Componente de botón flotante de ayuda. Permite abrir un menú con acceso a la guía de ayuda y a la información "Acerca de". Muestra modales interactivos para ambos casos.
 * @author Rafael Rodriguez Mengual
 */

"use client";

import { useState } from "react";
import { HelpCircle, X, Book, Info } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import HelpModal from "./HelpModal";
import AboutModal from "./AboutModal";

/**
 * Componente principal del botón flotante de ayuda.
 * Muestra un menú con acceso a la guía de ayuda y a la información "Acerca de".
 * @component
 * @returns {JSX.Element} Botón flotante con menú y modales de ayuda/acerca de.
 */
export default function HelpButton() {
  /**
   * Estado para controlar si el menú está abierto.
   * @type {boolean}
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Estado para mostrar el modal de ayuda.
   * @type {boolean}
   */
  const [showHelpModal, setShowHelpModal] = useState(false);

  /**
   * Estado para mostrar el modal de acerca de.
   * @type {boolean}
   */
  const [showAboutModal, setShowAboutModal] = useState(false);
  /**
   * Hook de traducción.
   */
  const { t } = useTranslation();

  /**
   * Alterna la apertura/cierre del menú flotante.
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // console.log("Menú de ayuda abierto:", !isMenuOpen)
  };

  /**
   * Abre el modal de ayuda y cierra el menú.
   */
  const openHelpModal = () => {
    setShowHelpModal(true);
    setIsMenuOpen(false);
    // console.log("Modal de ayuda abierto")
  };

  /**
   * Abre el modal de acerca de y cierra el menú.
   */
  const openAboutModal = () => {
    setShowAboutModal(true);
    setIsMenuOpen(false);
    // console.log("Modal de acerca de abierto")
  };

  /**
   * Cierra el modal de ayuda.
   */
  const closeHelpModal = () => {
    setShowHelpModal(false);
    // console.log("Modal de ayuda cerrado")
  };

  /**
   * Cierra el modal de acerca de.
   */
  const closeAboutModal = () => {
    setShowAboutModal(false);
    // console.log("Modal de acerca de cerrado")
  };

  return (
    <>
      {/* Botón flotante principal, siempre visible en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Opciones del menú, solo visibles si el menú está abierto */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-3">
            {/* Botón de Ayuda */}
            <div className="flex items-center gap-3">
              {/* Etiqueta de texto */}
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 shadow-md whitespace-nowrap">
                {t("help.help")}
              </div>
              {/* Botón con icono de libro */}
              <button
                onClick={openHelpModal}
                className="flex items-center justify-center w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 border border-gray-700"
                title={t("help.help")}
              >
                <Book size={24} className="text-white" />
              </button>
            </div>

            {/* Botón de Acerca de */}
            <div className="flex items-center gap-3 mb-2">
              {/* Etiqueta de texto */}
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 shadow-md whitespace-nowrap">
                {t("help.about")}
              </div>
              {/* Botón con icono de información */}
              <button
                onClick={openAboutModal}
                className="flex items-center justify-center w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 border border-gray-700"
                title={t("help.about")}
              >
                <Info size={24} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Botón principal: muestra el icono de ayuda o de cerrar según el estado */}
        <button
          onClick={toggleMenu}
          className={`flex items-center justify-center w-16 h-16 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-700 ${
            isMenuOpen ? "rotate-45" : ""
          }`}
          title={t("help.helpButton")}
        >
          {/* Cambia el icono según si el menú está abierto */}
          {isMenuOpen ? (
            <X size={32} className="text-white" />
          ) : (
            <HelpCircle size={32} className="text-white" />
          )}
        </button>
      </div>

      {/* Renderiza el modal de ayuda si corresponde */}
      {showHelpModal && <HelpModal onClose={closeHelpModal} />}
      {/* Renderiza el modal de acerca de si corresponde */}
      {showAboutModal && <AboutModal onClose={closeAboutModal} />}
    </>
  );
}
