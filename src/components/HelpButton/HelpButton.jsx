"use client"

import { useState } from "react"
import { HelpCircle, X, Book, Info } from "lucide-react"
import { useTranslation } from "../../hooks/useTranslation"
import HelpModal from "./HelpModal"
import AboutModal from "./AboutModal"

export default function HelpButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const { t } = useTranslation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const openHelpModal = () => {
    setShowHelpModal(true)
    setIsMenuOpen(false)
  }

  const openAboutModal = () => {
    setShowAboutModal(true)
    setIsMenuOpen(false)
  }

  const closeHelpModal = () => {
    setShowHelpModal(false)
  }

  const closeAboutModal = () => {
    setShowAboutModal(false)
  }

  return (
    <>
      {/* Botón flotante principal */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Opciones del menú */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-3">
            {/* Botón de Ayuda */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 shadow-md whitespace-nowrap">
                {t("help.help")}
              </div>
              <button
                onClick={openHelpModal}
                className="flex items-center justify-center w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 border border-gray-700"
                title={t("help.help")}
              >
                <Book size={24} className="text-white" />
              </button>
            </div>

            {/* Botón de Acerca de */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 shadow-md whitespace-nowrap">
                {t("help.about")}
              </div>
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

        {/* Botón principal - más grande y completamente blanco */}
        <button
          onClick={toggleMenu}
          className={`flex items-center justify-center w-16 h-16 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-700 ${
            isMenuOpen ? "rotate-45" : ""
          }`}
          title={t("help.helpButton")}
        >
          {isMenuOpen ? <X size={32} className="text-white" /> : <HelpCircle size={32} className="text-white" />}
        </button>
      </div>

      {/* Modales */}
      {showHelpModal && <HelpModal onClose={closeHelpModal} />}
      {showAboutModal && <AboutModal onClose={closeAboutModal} />}
    </>
  )
}
