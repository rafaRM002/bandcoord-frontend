import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

export default function RegistroPendiente() {
  return (
    <div className="w-full min-h-[70vh] flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl">
          {/* Header */}
          <div className="space-y-1 text-center border-b border-gray-800 p-6">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-[#C0C0C0]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#C0C0C0]">Acceso pendiente</h2>
            <p className="text-gray-400">Tu solicitud de registro ha sido recibida correctamente</p>
          </div>

          {/* Content */}
          <div className="text-center text-[#C0C0C0] p-6">
            <p className="mb-4">
              Tu cuenta está pendiente de aprobación por un administrador. Recibirás un correo electrónico cuando tu
              cuenta sea activada.
            </p>
            <p className="mb-4">
              Una vez que tu cuenta sea aprobada, podrás acceder a todas las funcionalidades de BandCoord.
            </p>
            <p className="text-sm text-gray-400">Si tienes alguna pregunta, por favor contacta con nosotros.</p>
          </div>

          {/* Footer - Cambiamos el destino del botón a la página de inicio */}
          <div className="border-t border-gray-800 p-6">
            <Link
              to="/"
              className="block w-full py-2 px-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] text-center transition-all duration-300"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
