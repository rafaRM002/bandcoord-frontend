"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, UserRound, Mail, Lock, Phone, Calendar, AlertCircle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export default function Register() {
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
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { register } = useAuth()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar que las contraseñas coincidan
    if (form.password !== form.password_confirmation) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      // Preparar los datos para enviar al backend
      const userData = {
        ...form,
        fecha_entrada: new Date().toISOString().split("T")[0], // Fecha actual
      }

      const result = await register(userData)

      if (!result.success) {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      setError("Error al registrarse. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl">
          {/* Header */}
          <div className="space-y-1 text-center border-b border-gray-800 p-6">
            <div className="flex justify-center mb-2">
              <img src="/1-removebg-preview.png" alt="Logo BandCoord" className="mx-auto h-16 sm:h-20 w-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#C0C0C0]">Crear cuenta</h2>
            <p className="text-gray-400 text-sm sm:text-base">Completa tus datos para solicitar acceso</p>
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
              {/* Datos personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                    Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <UserRound size={18} />
                    </div>
                    <input
                      id="nombre"
                      name="nombre"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="apellido1" className="block text-[#C0C0C0] text-sm font-medium">
                    Primer apellido
                  </label>
                  <input
                    id="apellido1"
                    name="apellido1"
                    placeholder="Primer apellido"
                    value={form.apellido1}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="apellido2" className="block text-[#C0C0C0] text-sm font-medium">
                    Segundo apellido
                  </label>
                  <input
                    id="apellido2"
                    name="apellido2"
                    placeholder="Segundo apellido"
                    value={form.apellido2}
                    onChange={handleChange}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[#C0C0C0] text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefono" className="block text-[#C0C0C0] text-sm font-medium">
                    Teléfono
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Phone size={18} />
                    </div>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="Número de teléfono"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-2">
                <label htmlFor="fecha_nac" className="block text-[#C0C0C0] text-sm font-medium">
                  Fecha de nacimiento
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

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[#C0C0C0] text-sm font-medium">
                  Contraseña
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
                <p className="text-xs text-gray-400 mt-1">La contraseña debe tener al menos 8 caracteres</p>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password_confirmation" className="block text-[#C0C0C0] text-sm font-medium">
                  Confirmar Contraseña
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
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Solicitar registro"}
              </button>

              <div className="text-center text-sm text-gray-400">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="text-[#C0C0C0] hover:text-white underline underline-offset-4">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
