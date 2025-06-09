/**
 * @file Footer.jsx
 * @module components/Navigation/Footer
 * @description Componente Footer que muestra el pie de página de la aplicación, incluyendo enlaces rápidos, recursos, información de contacto y redes sociales.
 * @author Rafael Rodriguez Mengual
 */

import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { useTranslation } from "../../hooks/useTranslation"

/**
 * Componente Footer que muestra el pie de página de la aplicación.
 * Incluye enlaces rápidos, recursos, información de contacto y redes sociales.
 * @component
 * @returns {JSX.Element} Pie de página de la aplicación.
 */
export default function Footer() {
  /**
   * Año actual para el copyright.
   * @type {number}
   */
  const currentYear = new Date().getFullYear()
  /**
   * Hook de traducción.
   */
  const { t } = useTranslation()

  return (
    <footer className="bg-black border-t border-gray-800 w-full mt-6">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 my-2 flex flex-col items-center sm:items-start">
            <Link to="/" className="flex items-center text-[#C0C0C0] font-bold text-xl mb-4">
              <img
                src={`${import.meta.env.BASE_URL}1-removebg-preview.png`}
                alt="Logo BandCoord"
                className="mx-2 h-10 w-auto"
              />
              BandCoord
            </Link>
            {/* Descripción corta de la app */}
            <p className="text-gray-400 text-sm mb-4 text-center sm:text-left">{t("footer.description")}</p>
            {/* Iconos de redes sociales */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos de navegación */}
          <div className="col-span-1 my-4 flex flex-col items-center">
            <h3 className="text-[#C0C0C0] font-semibold mb-4 text-center">{t("footer.quickLinks")}</h3>
            <div className="flex flex-col sm:flex-row sm:justify-center mb-4 w-full">
              {/* Primera columna de enlaces */}
              <div className="flex flex-col space-y-2 mb-4 sm:mb-0 items-center sm:mr-8">
                <Link to="/" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.home")}
                </Link>
                <Link to="/eventos" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.events")}
                </Link>
                <Link to="/composiciones" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.compositions")}
                </Link>
                <Link to="/mensajes" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.messages")}
                </Link>
              </div>
              {/* Segunda columna de enlaces */}
              <div className="flex flex-col space-y-2 items-center">
                <Link to="/prestamos" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.loans")}
                </Link>
                <Link to="/entidades" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.entities")}
                </Link>
                <Link to="/calendario" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.calendar")}
                </Link>
                <Link to="/instrumentos" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.instruments")}
                </Link>
              </div>
            </div>
          </div>

          {/* Recursos adicionales */}
          <div className="col-span-1 my-4 flex flex-col items-center">
            <h3 className="text-[#C0C0C0] font-semibold mb-4 text-center">{t("footer.resources")}</h3>
            <ul className="space-y-2 flex flex-col items-center">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.userGuide")}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.faq")}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  {t("footer.termsOfService")}
                </a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="col-span-1 my-4 flex flex-col items-center sm:items-start">
            <h3 className="text-[#C0C0C0] font-semibold mb-4 text-center sm:text-left">{t("footer.contact")}</h3>
            <ul className="space-y-3 flex flex-col items-center sm:items-start">
              {/* Dirección */}
              <li className="flex items-start">
                <MapPin size={18} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">Calle Ejemplo 123, Ciudad, País</span>
              </li>
              {/* Teléfono */}
              <li className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">+34 123 456 789</span>
              </li>
              {/* Correo electrónico */}
              <li className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <a
                  href="mailto:info@bandcoord.com"
                  className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300"
                >
                  info@bandcoord.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 my-2"></div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm">
          <p>
            &copy; {currentYear} BandCoord. {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}
