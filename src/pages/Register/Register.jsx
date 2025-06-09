/**
 * @file Register.jsx
 * @module pages/Register/Register
 * @description Página de registro de usuario. Permite crear una cuenta nueva validando datos personales, email, teléfono y contraseña segura. Incluye validaciones, mensajes de error y muestra el estado del proceso. Utiliza traducción internacionalizada.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, UserRound, Mail, Lock, Phone, Calendar, AlertCircle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTranslation } from "../../hooks/useTranslation"
import PasswordValidator from "../../components/PasswordValidator"

/**
 * Componente de registro de usuario.
 * Permite crear una cuenta nueva validando todos los campos y mostrando mensajes de error.
 * @component
 * @returns {JSX.Element} Página de registro.
 */
export default function Register() {
  /** Estado del formulario de registro */
  const [form, setForm] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    email: "",
    telefono: "",
    password: "",
    password_confirmation: "",
    fecha_nac: "",
  })
  /** Estado de carga del proceso de registro */
  const [isLoading, setIsLoading] = useState(false)
  /** Mostrar/ocultar contraseña */
  const [showPassword, setShowPassword] = useState(false)
  /** Mensaje de error */
  const [error, setError] = useState("")
  /** Estado de validación de contraseña */
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  /** Función de registro del contexto de autenticación */
  const { register } = useAuth()
  /** Hook de traducción */
  const { t } = useTranslation()

  /**
   * Maneja el cambio en los campos del formulario.
   * @param {Object} e - Evento de cambio.
   */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  /**
   * Maneja el cambio en el campo de teléfono, permitiendo solo caracteres válidos.
   * @param {Object} e - Evento de cambio.
   */
  const handlePhoneChange = (e) => {
    // Permitir números, espacios, guiones, paréntesis y el signo +
    const value = e.target.value.replace(/[^\d\s\-$$$$+]/g, "")
    setForm({ ...form, telefono: value })
  }

  /**
   * Valida el formato del email.
   * @param {string} email - Email a validar.
   * @returns {boolean} True si es válido.
   */
  const validateEmail = (email) => {
    // Validación más estricta: debe tener @ y al menos un punto después del @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valida el formato del teléfono.
   * @param {string} phone - Teléfono a validar.
   * @returns {boolean} True si es válido.
   */
  const validatePhone = (phone) => {
    // Validación más flexible para teléfonos internacionales
    // Debe tener al menos 7 dígitos y máximo 15 (estándar internacional)
    const cleanPhone = phone.replace(/[^\d]/g, "")
    return cleanPhone.length >= 7 && cleanPhone.length <= 15
  }

  /**
   * Envía el formulario de registro tras validar todos los campos.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar email
    if (!validateEmail(form.email)) {
      setError(t("register.invalidEmail", "El email debe tener un formato válido (ejemplo@dominio.com)"))
      setIsLoading(false)
      return
    }

    // Validar teléfono
    if (!validatePhone(form.telefono)) {
      setError(t("register.invalidPhone", "El teléfono debe tener entre 7 y 15 dígitos"))
      setIsLoading(false)
      return
    }

    // Validar que las contraseñas coincidan
    if (form.password !== form.password_confirmation) {
      setError(t("register.passwordMismatch", "Las contraseñas no coinciden"))
      setIsLoading(false)
      return
    }

    // Validar que la contraseña sea segura
    if (!isPasswordValid) {
      setError(t("register.passwordNotSecure", "La contraseña no cumple con los requisitos de seguridad"))
      setIsLoading(false)
      return
    }

    try {
      const userData = {
        ...form,
        fecha_nac: form.fecha_nac ? form.fecha_nac : null,
        fecha_entrada: new Date().toISOString().split("T")[0],
      }

      // console.log("Sending registration data:", userData)

      const result = await register(userData)

      if (!result.success) {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      setError(t("register.genericError", "Error al registrarse. Inténtalo de nuevo."))
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizado principal del formulario de registro
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl">
          {/* Header */}
          <div className="space-y-1 text-center border-b border-gray-800 p-6">
            <div className="flex justify-center mb-2">
              <img
                src={`${import.meta.env.BASE_URL}/1-removebg-preview.png`}
                alt="Logo BandCoord"
                className="mx-auto h-16 sm:h-20 w-auto"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#C0C0C0]">
              {t("register.title", "Crear cuenta")}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {t("register.subtitle", "Completa el formulario para solicitar acceso")}
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md text-sm mx-4 mt-4 flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Contenido del formulario */}
            <div className="space-y-4 p-4 sm:p-6">
              {/* Datos personales - Primera fila */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("register.name", "Nombre")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <UserRound size={18} />
                    </div>
                    <input
                      id="nombre"
                      name="nombre"
                      placeholder={t("register.name", "Nombre")}
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="apellido1" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("register.firstSurname", "Primer apellido")} *
                  </label>
                  <input
                    id="apellido1"
                    name="apellido1"
                    placeholder={t("register.firstSurname", "Primer apellido")}
                    value={form.apellido1}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="apellido2" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("register.secondSurname", "Segundo apellido")}
                  </label>
                  <input
                    id="apellido2"
                    name="apellido2"
                    placeholder={t("register.secondSurname", "Segundo apellido")}
                    value={form.apellido2}
                    onChange={handleChange}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="fecha_nac" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("register.birthDate", "Fecha de nacimiento")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Calendar size={18} />
                    </div>
                    <input
                      id="fecha_nac"
                      name="fecha_nac"
                      type="date"
                      value={form.fecha_nac}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>
              </div>

              {/* Contacto - Segunda fila */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("register.email", "Email")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ejemplo@dominio.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {t("register.emailHelp", "Debe incluir @ y un dominio válido")}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefono" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("register.phone", "Teléfono")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Phone size={18} />
                    </div>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="+34 123 456 789"
                      value={form.telefono}
                      onChange={handlePhoneChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {t("register.phoneHelp", "Incluye código de país si es necesario")}
                  </p>
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[#C0C0C0] text-sm font-medium">
                  {t("register.password", "Contraseña")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
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
                <PasswordValidator password={form.password} onValidationChange={setIsPasswordValid} />
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password_confirmation" className="block text-[#C0C0C0] text-sm font-medium">
                  {t("register.confirmPassword", "Confirmar contraseña")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col space-y-4 border-t border-gray-800 p-4 sm:p-6">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !isPasswordValid}
              >
                {isLoading
                  ? t("register.processing", "Procesando...")
                  : t("register.requestRegistration", "Solicitar registro")}
              </button>

              <div className="text-center text-sm text-gray-400">
                {t("register.alreadyHaveAccount", "¿Ya tienes una cuenta?")}{" "}
                <Link to="/login" className="text-[#C0C0C0] hover:text-white underline underline-offset-4">
                  {t("register.login", "Iniciar sesión")}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
