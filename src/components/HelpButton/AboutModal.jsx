/**
 * @file AboutModal.jsx
 * @module components/HelpButton/AboutModal
 * @description Componente modal "Acerca de" que muestra información sobre la aplicación, desarrollador, instituto, año y tecnologías utilizadas.
 * @author Rafael Rodriguez Mengual
 */

"use client"; // Indica que este componente se ejecuta en el cliente (útil para Next.js u otros frameworks modernos)

import { X, User, School, Calendar, Code } from "lucide-react"; // Importa iconos de la librería lucide-react
import { useTranslation } from "../../hooks/useTranslation"; // Hook personalizado para traducciones

/**
 * Componente modal "Acerca de".
 * Muestra información sobre la app, desarrollador, instituto, año y tecnologías.
 * Permite cerrar el modal haciendo clic fuera del contenido o en el botón de cierre.
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Función para cerrar el modal.
 * @returns {JSX.Element} Modal con información "Acerca de".
 */
export default function AboutModal({ onClose }) {
  /**
   * Hook de traducción.
   */
  const { t } = useTranslation(); // Obtiene la función de traducción

  /**
   * Permite cerrar el modal haciendo clic fuera del contenido (en el fondo).
   * @param {React.MouseEvent} e - Evento de clic.
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Fondo semitransparente que cubre toda la pantalla
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      {/* Contenedor principal del modal */}
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabecera fija con título y botón de cierre */}
        <div className="flex justify-between items-center px-6 py-8 border-b border-gray-800 sticky top-0 bg-black">
          <h2 className="text-2xl font-bold text-[#C0C0C0]">
            {t("help.aboutTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <X size={24} /> {/* Icono de cierre */}
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6 text-[#C0C0C0]">
          {/* Logo y nombre de la app */}
          <div className="text-center">
            <div className="mx-auto mb-4">
              <img
                src={`${import.meta.env.BASE_URL}1-removebg-preview.png`}
                alt="Logo BandCoord"
                className="mx-auto h-16 sm:h-20 w-auto"
              />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">BandCoord</h3>
            <p className="text-gray-400">{t("help.aboutSubtitle")}</p>
          </div>

          {/* Información del desarrollador, instituto, año y tecnologías */}
          <div className="grid gap-4">
            {/* Desarrollador */}
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-[#C0C0C0]" size={20} />
                <h4 className="font-semibold text-white">
                  {t("help.developer")}
                </h4>
              </div>
              <p className="text-[#C0C0C0] font-medium">
                Rafael Rodríguez Mengual
              </p>
            </div>

            {/* Instituto */}
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <School className="text-[#C0C0C0]" size={20} />
                <h4 className="font-semibold text-white">
                  {t("help.institute")}
                </h4>
              </div>
              <p className="text-[#C0C0C0] font-medium">IES Trassierra</p>
            </div>

            {/* Año de desarrollo */}
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-[#C0C0C0]" size={20} />
                <h4 className="font-semibold text-white">
                  {t("help.developmentYear")}
                </h4>
              </div>
              <p className="text-[#C0C0C0] font-medium">2025</p>
            </div>

            {/* Tecnologías usadas */}
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Code className="text-[#C0C0C0]" size={20} />
                <h4 className="font-semibold text-white">
                  {t("help.technologies")}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Etiquetas de tecnologías */}
                <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-sm border border-blue-800">
                  React
                </span>
                <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-sm border border-orange-800">
                  Vite
                </span>
                <span className="px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded text-sm border border-cyan-800">
                  Tailwind CSS
                </span>
                <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-sm border border-purple-800">
                  Laravel
                </span>
                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-sm border border-yellow-800">
                  MySQL
                </span>
              </div>
            </div>
          </div>

          {/* Descripción del proyecto */}
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold text-white mb-2">
              {t("help.projectDescription")}
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t("help.projectDescriptionText")}
            </p>
          </div>

          {/* Lista de funcionalidades */}
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold text-white mb-2">
              {t("help.features")}
            </h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• {t("help.featureMultilang")}</li>
              <li>• {t("help.featureResponsive")}</li>
              <li>• {t("help.featureRealTime")}</li>
              <li>• {t("help.featureSecure")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
