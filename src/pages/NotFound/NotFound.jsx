import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col justify-center items-center px-4 py-16 text-center">
      <AlertTriangle className="h-16 w-16 text-[#C0C0C0] mb-4" />
      <h1 className="text-3xl font-bold text-[#C0C0C0] mb-2">Página no encontrada</h1>
      <p className="text-gray-400 mb-6 text-center max-w-md mx-auto">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
