import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-gray-800 w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 my-2 flex flex-col items-center sm:items-start">
            <Link to="/" className="flex items-center text-[#C0C0C0] font-bold text-xl mb-4">
              <img src="/1-removebg-preview.png" alt="Logo BandCoord" className="mx-2 h-10 w-auto" />
              BandCoord
            </Link>
            <p className="text-gray-400 text-sm mb-4 text-center sm:text-left">
              La plataforma integral para la gestión y coordinación de bandas musicales.
            </p>
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

          {/* Enlaces rápidos */}
          <div className="col-span-1 my-4 flex flex-col items-center">
            <h3 className="text-[#C0C0C0] font-semibold mb-4 text-center">Enlaces rápidos</h3>

            <div className="flex flex-col sm:flex-row sm:justify-center mb-4 w-full">
              <div className="flex flex-col space-y-2 mb-4 sm:mb-0 items-center sm:mr-8">
                <Link to="/" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Inicio
                </Link>
                <Link to="/eventos" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Eventos
                </Link>
                <Link to="/composiciones" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Composiciones
                </Link>
                <Link to="/mensajes" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Mensajes
                </Link>
              </div>

              <div className="flex flex-col space-y-2 items-center">
                <Link to="/prestamos" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Préstamos
                </Link>
                <Link to="/entidades" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Entidades
                </Link>
                <Link to="/calendario" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Calendario
                </Link>
                <Link to="/instrumentos" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Intrumentos
                </Link>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div className="col-span-1 my-4 flex flex-col items-center">
            <h3 className="text-[#C0C0C0] font-semibold mb-4 text-center">Recursos</h3>
            <ul className="space-y-2 flex flex-col items-center">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Guía de usuario
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#C0C0C0] transition-colors duration-300">
                  Términos de servicio
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-span-1 my-4 flex flex-col items-center sm:items-start">
            <h3 className="text-[#C0C0C0] font-semibold mb-4 text-center sm:text-left">Contacto</h3>
            <ul className="space-y-3 flex flex-col items-center sm:items-start">
              <li className="flex items-start">
                <MapPin size={18} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">Calle Ejemplo 123, Ciudad, País</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">+34 123 456 789</span>
              </li>
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
          <p>&copy; {currentYear} BandCoord. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
