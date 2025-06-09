/**
 * @file Login.jsx
 * @module pages/Login/Login
 * @description Página de inicio de sesión para usuarios de BandCoord. Permite autenticarse mediante email y contraseña, mostrando mensajes de error y enlaces a registro y recuperación de contraseña.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTranslation } from "../../hooks/useTranslation"

/**
 * Componente de formulario de inicio de sesión.
 * Permite al usuario autenticarse con email y contraseña.
 * @component
 * @returns {JSX.Element} Formulario de login.
 */
export default function Login() {
  /** Estado del formulario de login */
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  /** Estado de carga del botón */
  const [isLoading, setIsLoading] = useState(false)
  /** Mostrar u ocultar contraseña */
  const [showPassword, setShowPassword] = useState(false)
  /** Mensaje de error */
  const [error, setError] = useState("")
  /** Hook de navegación */
  const navigate = useNavigate()
  /** Función de login del contexto de autenticación */
  const { login } = useAuth()
  /** Hook de traducción */
  const { t } = useTranslation()

  /**
   * Maneja el cambio en los campos del formulario.
   * @param {Object} e - Evento de cambio.
   */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  /**
   * Envía el formulario de login.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(form.email, form.password)

      if (result.success) {
        navigate("/")
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Error al iniciar sesión. Verifica tus credenciales.")
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizado del formulario de login
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl">
          {/* Header */}
          <div className="space-y-3 text-center border-b border-gray-800 p-6">
            <Link to="/">
              <img
                src={`${import.meta.env.BASE_URL}1-removebg-preview.png`}
                alt="Logo BandCoord"
                className="mx-auto h-16 sm:h-20 w-auto"
              />
            </Link>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#C0C0C0]">
              {t("login.title", "Iniciar Sesión")}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {t("login.subtitle", "Accede a tu cuenta de BandCoord")}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 p-4 sm:p-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[#C0C0C0] text-sm font-medium">
                  {t("login.email", "Email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("login.emailPlaceholder", "tu@email.com")}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[#C0C0C0] text-sm font-medium">
                  {t("login.password", "Contraseña")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.passwordPlaceholder", "••••••••")}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#C0C0C0]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md text-sm flex items-start">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    {error === "El usuario no existe. Por favor, regístrate." && (
                      <Link to="/register" className="underline mt-1 block">
                        Ir a registro
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col space-y-4 border-t border-gray-800 p-4 sm:p-6">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? t("login.processing", "Procesando...") : t("login.loginButton", "Iniciar Sesión")}
              </button>

              <div className="text-center text-sm text-gray-400">
                {t("login.noAccount", "¿No tienes una cuenta?")}{" "}
                <Link to="/register" className="text-[#C0C0C0] hover:text-white underline underline-offset-4">
                  {t("login.register", "Registrarse")}
                </Link>
              </div>

              <div className="text-center text-sm">
                <Link
                  to="/restablecer-password"
                  className="text-[#C0C0C0] hover:text-white underline underline-offset-4"
                >
                  {t("login.forgotPassword", "¿Olvidaste tu contraseña?")}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
