/**
 * @file NuevaPassword.jsx
 * @module pages/RestablecerPassword/NuevaPassword
 * @description Página para restablecer la contraseña de un usuario mediante un enlace con token. Permite validar el token, introducir y confirmar la nueva contraseña, mostrando mensajes de éxito o error. Utiliza traducción internacionalizada.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import api from "../../api/axios"
import { useTranslation } from "../../hooks/useTranslation"

/**
 * Componente para restablecer la contraseña de usuario.
 * Permite validar el token, introducir nueva contraseña y confirmarla.
 * @component
 * @returns {JSX.Element} Página de restablecimiento de contraseña.
 */
export default function NuevaPassword() {
  /** Hook de traducción */
  const { t } = useTranslation()
  /** Hook de navegación */
  const navigate = useNavigate()
  /** Hook de localización para obtener parámetros de la URL */
  const location = useLocation()
  /** Token de restablecimiento */
  const [token, setToken] = useState("")
  /** Email asociado al token */
  const [email, setEmail] = useState("")
  /** Nueva contraseña */
  const [password, setPassword] = useState("")
  /** Confirmación de la nueva contraseña */
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  /** Mostrar/ocultar nueva contraseña */
  const [showPassword, setShowPassword] = useState(false)
  /** Mostrar/ocultar confirmación de contraseña */
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  /** Estado de carga del proceso */
  const [isLoading, setIsLoading] = useState(false)
  /** Mensaje de error */
  const [error, setError] = useState("")
  /** Estado de éxito */
  const [success, setSuccess] = useState(false)
  /** Error de token inválido */
  const [tokenError, setTokenError] = useState(false)

  /**
   * Efecto para extraer token y email de la URL y verificar el token.
   */
  useEffect(() => {
    // Extraer token y email de los parámetros de la URL
    const params = new URLSearchParams(location.search)
    const tokenParam = params.get("token")
    const emailParam = params.get("email")

    if (!tokenParam || !emailParam) {
      setTokenError(true)
      return
    }

    setToken(tokenParam)
    setEmail(emailParam)

    // Verificar validez del token
    const verifyToken = async () => {
      try {
        await api.post("/password/verify-token", {
          token: tokenParam,
          email: emailParam,
        })
      } catch (error) {
        console.error("Token inválido:", error)
        setTokenError(true)
      }
    }

    verifyToken()
  }, [location])

  /**
   * Envía el formulario para restablecer la contraseña.
   * Valida coincidencia y longitud mínima.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar que las contraseñas coincidan
    if (password !== passwordConfirmation) {
      setError(t("newPassword.passwordsDoNotMatch", "Las contraseñas no coinciden"))
      setIsLoading(false)
      return
    }

    // Validar longitud mínima
    if (password.length < 8) {
      setError(t("newPassword.passwordMinLength", "La contraseña debe tener al menos 8 caracteres"))
      setIsLoading(false)
      return
    }

    try {
      await api.post("/password/reset", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      setSuccess(true)

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error) {
      console.error("Error al restablecer contraseña:", error)

      if (error.response && error.response.status === 401) {
        setError(t("newPassword.linkExpired", "El enlace ha expirado o no es válido"))
      } else {
        setError(t("newPassword.errorResetting", "Error al restablecer la contraseña. Por favor, inténtalo de nuevo."))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizado para token inválido
  if (tokenError) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8 px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl p-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-red-900/30 rounded-full p-3">
                  <AlertCircle size={40} className="text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#C0C0C0] mb-2">
                {t("newPassword.invalidLink", "Enlace inválido")}
              </h3>
              <p className="text-gray-400 mb-6">
                {t(
                  "newPassword.invalidLinkMessage",
                  "El enlace para restablecer la contraseña no es válido o ha expirado.",
                )}
              </p>
              <Link
                to="/restablecer-password"
                className="px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 inline-block"
              >
                {t("newPassword.requestNewLink", "Solicitar nuevo enlace")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizado principal del formulario de restablecimiento
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl">
          {/* Header */}
          <div className="space-y-3 text-center border-b border-gray-800 p-6">
            <Link to="/login" className="inline-block">
              <img src="/1-removebg-preview.png" alt="Logo BandCoord" className="mx-auto h-16 sm:h-20 w-auto" />
            </Link>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#C0C0C0]">
              {t("newPassword.title", "Nueva contraseña")}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {t("newPassword.subtitle", "Establece una nueva contraseña para tu cuenta")}
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
                <h3 className="text-xl font-semibold text-[#C0C0C0] mb-2">
                  {t("newPassword.passwordUpdated", "¡Contraseña actualizada!")}
                </h3>
                <p className="text-gray-400 mb-6">
                  {t("newPassword.passwordUpdatedMessage", "Tu contraseña ha sido restablecida correctamente.")}
                </p>
                <p className="text-gray-400 mb-6">
                  {t("newPassword.redirectingMessage", "Serás redirigido al inicio de sesión en unos segundos...")}
                </p>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 inline-block"
                >
                  {t("newPassword.goToLogin", "Ir al inicio de sesión")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Email (solo lectura) */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="email" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("newPassword.email", "Email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="w-full py-2 px-3 bg-gray-800/50 border border-gray-800 rounded-md text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Nueva contraseña */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="password" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("newPassword.newPassword", "Nueva contraseña")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
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
                  <p className="text-xs text-gray-400">
                    {t("newPassword.passwordMinLength", "La contraseña debe tener al menos 8 caracteres")}
                  </p>
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="passwordConfirmation" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("newPassword.confirmPassword", "Confirmar contraseña")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Lock size={18} />
                    </div>
                    <input
                      id="passwordConfirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#C0C0C0]"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
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
                    className="w-full py-2 px-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t("newPassword.processing", "Procesando...")
                      : t("newPassword.resetPassword", "Restablecer contraseña")}
                  </button>

                  <Link
                    to="/login"
                    className="text-center text-sm text-[#C0C0C0] hover:text-white underline underline-offset-4"
                  >
                    {t("newPassword.backToLogin", "Volver al inicio de sesión")}
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
