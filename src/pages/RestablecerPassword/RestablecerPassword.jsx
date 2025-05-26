"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, Send, CheckCircle } from "lucide-react"
import api from "../../api/axios"

export default function RestablecerPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Enviar solicitud de restablecimiento de contraseña
      await api.post("/password/reset-request", { email })
      setSuccess(true)
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error)

      if (error.response && error.response.status === 404) {
        setError("No existe ninguna cuenta con este email")
      } else {
        setError("Error al procesar la solicitud. Por favor, inténtalo de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl">
          {/* Header */}
          <div className="space-y-3 text-center border-b border-gray-800 p-6">
            <Link to="/login" className="inline-block">
              <img src={`${import.meta.env.BASE_URL}/1-removebg-preview.png`} alt="Logo BandCoord" className="mx-auto h-16 sm:h-20 w-auto" />
            </Link>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#C0C0C0]">Restablecer contraseña</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Introduce tu email para recibir instrucciones de restablecimiento
            </p>
          </div>

          {/* Contenido */}
          <div className="p-4 sm:p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-900/30 rounded-full p-3">
                    <CheckCircle size={40} className="text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-[#C0C0C0] mb-2">Solicitud enviada</h3>
                <p className="text-gray-400 mb-6">
                  Hemos enviado un email a <span className="text-[#C0C0C0]">{email}</span> con instrucciones para
                  restablecer tu contraseña.
                </p>
                <p className="text-gray-400 mb-6">Revisa tu bandeja de entrada y sigue las instrucciones del correo.</p>
                <Link to="/login" className="inline-flex items-center text-[#C0C0C0] hover:text-white">
                  <ArrowLeft size={16} className="mr-2" /> Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="email" className="block text-[#C0C0C0] text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md text-sm mb-6">
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Procesando..."
                    ) : (
                      <>
                        <Send size={18} className="mr-2" /> Enviar instrucciones
                      </>
                    )}
                  </button>

                  <Link
                    to="/login"
                    className="text-center text-sm text-[#C0C0C0] hover:text-white underline underline-offset-4"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
